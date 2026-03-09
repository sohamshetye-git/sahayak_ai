/**
 * Schemes Handler
 * Lambda function for retrieving scheme information
 * Uses schemes.json with DynamoDB/Redis caching support
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Scheme } from '../types';
import { getCacheService, CacheKeys, CacheTTL } from '../db/cache-service';
import { loadSchemesData } from '../utils/data-loader';
import { config } from '../config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// In-memory scheme storage (fallback cache)
let schemesMemoryCache: Scheme[] | null = null;
let dynamoClient: DynamoDBDocumentClient | null = null;

/**
 * Get DynamoDB client (lazy initialization)
 */
function getDynamoClient(): DynamoDBDocumentClient {
  if (!dynamoClient && config.environment === 'production' && config.aws) {
    const client = new DynamoDBClient({
      region: config.aws.region,
      credentials: config.aws.accessKeyId && config.aws.secretAccessKey ? {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      } : undefined,
    });
    dynamoClient = DynamoDBDocumentClient.from(client);
  }
  return dynamoClient!;
}

/**
 * Load schemes from JSON file
 */
async function loadSchemesFromJSON(): Promise<Scheme[]> {
  if (schemesMemoryCache) {
    console.log('[SCHEMES] Using memory cache');
    return schemesMemoryCache;
  }

  try {
    console.log('[SCHEMES] Loading from JSON file');
    const schemes = await loadSchemesData();
    schemesMemoryCache = schemes;
    return schemes;
  } catch (error) {
    console.error('[SCHEMES] Error loading schemes from JSON:', error);
    return [];
  }
}

/**
 * Initialize schemes in DynamoDB (production only)
 */
async function initializeDynamoDB(): Promise<void> {
  if (config.environment !== 'production' || !config.dynamodb?.schemesTable) {
    return;
  }

  try {
    const client = getDynamoClient();
    const tableName = config.dynamodb.schemesTable;

    // Check if table already has data
    const scanResult = await client.send(new ScanCommand({
      TableName: tableName,
      Limit: 1,
    }));

    if (scanResult.Items && scanResult.Items.length > 0) {
      console.log('[SCHEMES] DynamoDB already initialized');
      return;
    }

    // Load schemes from JSON
    const schemes = await loadSchemesFromJSON();
    console.log(`[SCHEMES] Batch inserting ${schemes.length} schemes into DynamoDB`);

    // Batch insert schemes
    for (const scheme of schemes) {
      await client.send(new PutCommand({
        TableName: tableName,
        Item: {
          ...scheme,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }));
    }

    console.log('[SCHEMES] DynamoDB initialization complete');
  } catch (error) {
    console.error('[SCHEMES] Error initializing DynamoDB:', error);
  }
}

/**
 * Get schemes from DynamoDB
 */
async function getSchemesFromDynamoDB(): Promise<Scheme[]> {
  const client = getDynamoClient();
  const tableName = config.dynamodb!.schemesTable!;

  const result = await client.send(new ScanCommand({
    TableName: tableName,
  }));

  return (result.Items || []) as Scheme[];
}

/**
 * Get single scheme from DynamoDB
 */
async function getSchemeFromDynamoDB(schemeId: string): Promise<Scheme | null> {
  const client = getDynamoClient();
  const tableName = config.dynamodb!.schemesTable!;

  const result = await client.send(new GetCommand({
    TableName: tableName,
    Key: { schemeId },
  }));

  return result.Item as Scheme || null;
}

/**
 * Load schemes (environment-aware)
 */
async function loadSchemes(): Promise<Scheme[]> {
  // Production: Use DynamoDB
  if (config.environment === 'production' && config.dynamodb?.schemesTable) {
    try {
      console.log('[SCHEMES] Loading from DynamoDB');
      return await getSchemesFromDynamoDB();
    } catch (error) {
      console.error('[SCHEMES] DynamoDB error, falling back to JSON:', error);
      return await loadSchemesFromJSON();
    }
  }

  // Development: Use JSON file
  return await loadSchemesFromJSON();
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Initialize DynamoDB on first request (production only)
    await initializeDynamoDB();

    const { pathParameters, queryStringParameters, path } = event;
    const schemeId = pathParameters?.schemeId;

    // Handle workflow endpoint: /api/schemes/:schemeId/workflow
    if (schemeId && path?.includes('/workflow')) {
      return await getSchemeWorkflow(schemeId, queryStringParameters?.language || 'en');
    }

    // Handle single scheme retrieval
    if (schemeId) {
      return await getSingleScheme(schemeId, queryStringParameters?.language || 'en');
    }

    // Handle scheme listing with filters
    return await getSchemes(queryStringParameters || {});
  } catch (error: any) {
    console.error('Schemes handler error:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve schemes',
          details: error?.message || 'Unknown error',
          timestamp: Date.now(),
        },
      }),
    };
  }
}

/**
 * Get single scheme by ID
 */
async function getSingleScheme(schemeId: string, language: string): Promise<APIGatewayProxyResult> {
  const cacheService = getCacheService();
  
  // Try Redis cache first
  const cacheKey = CacheKeys.scheme(schemeId);
  const cached = await cacheService.get<Scheme>(cacheKey);
  
  if (cached) {
    console.log(`[SCHEMES] Cache hit for ${schemeId}`);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        scheme: formatSchemeForLanguage(cached, language),
        cached: true,
      }),
    };
  }

  // Load from storage (DynamoDB or JSON)
  let scheme: Scheme | null = null;

  if (config.environment === 'production' && config.dynamodb?.schemesTable) {
    scheme = await getSchemeFromDynamoDB(schemeId);
  } else {
    const schemes = await loadSchemes();
    scheme = schemes.find((s) => s.schemeId === schemeId) || null;
  }

  if (!scheme) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'NOT_FOUND',
          message: `Scheme with ID ${schemeId} not found`,
          timestamp: Date.now(),
        },
      }),
    };
  }

  // Cache the result
  await cacheService.set(cacheKey, scheme, CacheTTL.SCHEMES);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      scheme: formatSchemeForLanguage(scheme, language),
      cached: false,
    }),
  };
}

/**
 * Get schemes with filtering and pagination
 */
async function getSchemes(params: Record<string, string | undefined>): Promise<APIGatewayProxyResult> {
  const {
    category,
    state,
    search,
    page = '1',
    limit = '20',
    language = 'en',
  } = params;

  const cacheService = getCacheService();
  
  // Try Redis cache first
  const cacheKey = CacheKeys.schemesFiltered({ category, state, search, page, limit });
  const cached = await cacheService.get<any>(cacheKey);
  
  if (cached) {
    console.log('[SCHEMES] Cache hit for filtered schemes');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ ...cached, cached: true }),
    };
  }

  // Load schemes from storage
  let schemes = await loadSchemes();

  // Apply filters
  if (category) {
    schemes = schemes.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  if (state) {
    schemes = schemes.filter(
      (s) => s.state?.toLowerCase() === state.toLowerCase()
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    schemes = schemes.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.nameHi?.includes(search) ||
        s.descriptionHi?.includes(search)
    );
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedSchemes = schemes.slice(startIndex, endIndex);

  const result = {
    schemes: paginatedSchemes.map((s) => formatSchemeForLanguage(s, language)),
    total: schemes.length,
    page: pageNum,
    limit: limitNum,
    hasMore: endIndex < schemes.length,
    cached: false,
  };

  // Cache the result
  await cacheService.set(cacheKey, result, CacheTTL.SCHEME_FILTERED);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result),
  };
}

/**
 * Format scheme for specific language
 */
function formatSchemeForLanguage(scheme: Scheme, language: string): any {
  if (language === 'hi') {
    return {
      ...scheme,
      name: scheme.nameHi || scheme.name,
      description: scheme.descriptionHi || scheme.description,
    };
  }
  return scheme;
}

/**
 * Get workflow steps for a scheme
 */
async function getSchemeWorkflow(schemeId: string, _language: string): Promise<APIGatewayProxyResult> {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Load workflow data from SQL file
    const workflowPath = path.resolve(__dirname, '../../../data/application-workflows.sql');
    const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
    
    // Parse workflow steps from SQL INSERT statements
    const workflow: Array<{
      stepNumber: number;
      stepName: string;
      stepNameHi: string;
      description: string;
      descriptionHi: string;
      requiredDocuments: string[];
      estimatedTimeDays: number;
    }> = [];
    
    const insertPattern = /INSERT INTO application_workflows[^(]*\([^)]*\)\s+VALUES\s*\n([^;]+);/gi;
    let match;
    
    while ((match = insertPattern.exec(workflowContent)) !== null) {
      const valuesText = match[1];
      // Match individual value rows
      const rowPattern = /\('([^']+)',\s*(\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*ARRAY\[([^\]]*)\],\s*(\d+)\)/g;
      let rowMatch;
      
      while ((rowMatch = rowPattern.exec(valuesText)) !== null) {
        const [, scheme, stepNum, stepName, stepNameHi, desc, descHi, docs, days] = rowMatch;
        
        if (scheme === schemeId) {
          // Parse documents array
          const documents = docs
            .split(',')
            .map(d => d.trim().replace(/^'|'$/g, ''))
            .filter(d => d.length > 0);
          
          workflow.push({
            stepNumber: parseInt(stepNum),
            stepName,
            stepNameHi,
            description: desc,
            descriptionHi: descHi,
            requiredDocuments: documents,
            estimatedTimeDays: parseInt(days),
          });
        }
      }
    }
    
    // Sort by step number
    workflow.sort((a, b) => a.stepNumber - b.stepNumber);
    
    if (workflow.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            code: 'NOT_FOUND',
            message: `No workflow found for scheme ${schemeId}`,
            timestamp: Date.now(),
          },
        }),
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        workflow,
        schemeId,
      }),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading workflow:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to load workflow',
          details: errorMessage,
          timestamp: Date.now(),
        },
      }),
    };
  }
}

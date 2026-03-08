/**
 * Applications Handler
 * Lambda function for managing scheme applications
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApplicationRepository } from '../db/application-repository';
import { Application } from '../types';

// Mock applications data for local development
const mockApplications: Application[] = [
  {
    applicationId: 'app-001',
    userId: 'demo-user-123',
    schemeId: 'PM-KISAN',
    schemeName: 'PM-KISAN Samman Nidhi Yojana',
    status: 'in_progress',
    progress: 60,
    currentStep: 3,
    totalSteps: 5,
    completedSteps: ['1', '2'],
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    ttl: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  },
  {
    applicationId: 'app-002',
    userId: 'demo-user-123',
    schemeId: 'PMAY',
    schemeName: 'Pradhan Mantri Awas Yojana',
    status: 'submitted',
    progress: 100,
    currentStep: 4,
    totalSteps: 4,
    completedSteps: ['1', '2', '3', '4'],
    submittedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    ttl: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  },
  {
    applicationId: 'app-003',
    userId: 'demo-user-123',
    schemeId: 'AYUSHMAN',
    schemeName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
    status: 'approved',
    progress: 100,
    currentStep: 6,
    totalSteps: 6,
    completedSteps: ['1', '2', '3', '4', '5', '6'],
    submittedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
    updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    ttl: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  },
  {
    applicationId: 'app-004',
    userId: 'demo-user-123',
    schemeId: 'SCHOLARSHIP',
    schemeName: 'National Scholarship Portal',
    status: 'draft',
    progress: 25,
    currentStep: 1,
    totalSteps: 4,
    completedSteps: [],
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    ttl: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  },
];

const USE_MOCK_DATA = !process.env.AWS_REGION || process.env.NODE_ENV === 'development';
const applicationRepo = USE_MOCK_DATA ? null : new ApplicationRepository();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const { httpMethod, pathParameters, queryStringParameters } = event;

    // GET /api/applications - List user applications
    if (httpMethod === 'GET' && !pathParameters?.applicationId) {
      return await listApplications(queryStringParameters as Record<string, string> || {});
    }

    // GET /api/applications/:applicationId - Get single application
    if (httpMethod === 'GET' && pathParameters?.applicationId) {
      return await getApplication(pathParameters.applicationId);
    }

    // POST /api/applications - Create new application
    if (httpMethod === 'POST') {
      return await createApplication(JSON.parse(event.body || '{}'));
    }

    // PUT /api/applications/:applicationId - Update application
    if (httpMethod === 'PUT' && pathParameters?.applicationId) {
      return await updateApplication(pathParameters.applicationId, JSON.parse(event.body || '{}'));
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method not allowed',
          timestamp: Date.now(),
        },
      }),
    };
  } catch (error: unknown) {
    console.error('Applications handler error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process application request',
          details: errorMessage,
          timestamp: Date.now(),
        },
      }),
    };
  }
}

/**
 * List user applications
 */
async function listApplications(params: Record<string, string>): Promise<APIGatewayProxyResult> {
  const { userId, status, limit = '20' } = params;

  if (!userId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userId is required',
          timestamp: Date.now(),
        },
      }),
    };
  }

  let applications: Application[];

  if (USE_MOCK_DATA) {
    // Use mock data for local development
    applications = mockApplications.filter(app => app.userId === userId);
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    applications = applications.slice(0, parseInt(limit));
  } else {
    // Use DynamoDB for production
    applications = await applicationRepo!.getUserApplications(
      userId,
      status as any,
      parseInt(limit)
    );
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      applications,
      total: applications.length,
    }),
  };
}

/**
 * Get single application
 */
async function getApplication(applicationId: string): Promise<APIGatewayProxyResult> {
  let application: Application | null;

  if (USE_MOCK_DATA) {
    application = mockApplications.find(app => app.applicationId === applicationId) || null;
  } else {
    application = await applicationRepo!.getApplication(applicationId);
  }

  if (!application) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'NOT_FOUND',
          message: `Application with ID ${applicationId} not found`,
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
    body: JSON.stringify({ application }),
  };
}

/**
 * Create new application
 */
async function createApplication(body: any): Promise<APIGatewayProxyResult> {
  const { userId, schemeId, schemeName, totalSteps } = body;

  if (!userId || !schemeId || !schemeName || !totalSteps) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: userId, schemeId, schemeName, totalSteps',
          timestamp: Date.now(),
        },
      }),
    };
  }

  let application: Application;

  if (USE_MOCK_DATA) {
    // Create mock application
    const now = Date.now();
    application = {
      applicationId: `app-${Date.now()}`,
      userId,
      schemeId,
      schemeName,
      status: 'draft',
      progress: 0,
      currentStep: 1,
      totalSteps,
      completedSteps: [],
      createdAt: now,
      updatedAt: now,
      ttl: Math.floor(now / 1000) + 365 * 24 * 60 * 60,
    };
    mockApplications.push(application);
  } else {
    application = await applicationRepo!.createApplication(userId, schemeId, schemeName, totalSteps);
  }

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ application }),
  };
}

/**
 * Update application
 */
async function updateApplication(applicationId: string, body: any): Promise<APIGatewayProxyResult> {
  if (USE_MOCK_DATA) {
    const appIndex = mockApplications.findIndex(app => app.applicationId === applicationId);
    if (appIndex === -1) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${applicationId} not found`,
            timestamp: Date.now(),
          },
        }),
      };
    }

    // Update mock application
    const app = mockApplications[appIndex];
    if (body.status) app.status = body.status;
    if (body.currentStep !== undefined) app.currentStep = body.currentStep;
    if (body.completedSteps) {
      app.completedSteps = body.completedSteps;
      app.progress = Math.round((body.completedSteps.length / app.totalSteps) * 100);
    }
    if (body.submittedAt) app.submittedAt = body.submittedAt;
    app.updatedAt = Date.now();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ application: app }),
    };
  } else {
    await applicationRepo!.updateApplication(applicationId, body);
    const application = await applicationRepo!.getApplication(applicationId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ application }),
    };
  }
}

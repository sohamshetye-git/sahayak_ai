/**
 * Data Loader - Dual Environment Support
 * Automatically loads JSON data from Local Filesystem or AWS S3
 * 
 * Local Development: Reads from ./data/ folder
 * AWS Production: Reads from S3 bucket
 */

import fs from 'fs/promises';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';

let s3Client: S3Client | null = null;

/**
 * Get S3 client instance (lazy initialization)
 */
function getS3Client(): S3Client {
  if (!s3Client && config.aws) {
    s3Client = new S3Client({
      region: config.aws.region,
      credentials: config.aws.accessKeyId && config.aws.secretAccessKey ? {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      } : undefined,
    });
  }
  return s3Client!;
}

/**
 * Load JSON data from local filesystem
 */
async function loadFromLocal(filename: string): Promise<any> {
  const filePath = path.join(config.dataStorage.localPath!, filename);
  console.log(`Loading data from local file: ${filePath}`);
  
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

/**
 * Load JSON data from AWS S3
 */
async function loadFromS3(filename: string): Promise<any> {
  if (!config.dataStorage.s3Bucket) {
    throw new Error('S3 bucket not configured');
  }

  console.log(`Loading data from S3: ${config.dataStorage.s3Bucket}/${filename}`);
  
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: config.dataStorage.s3Bucket,
    Key: filename,
  });

  const response = await client.send(command);
  const bodyContents = await streamToString(response.Body as any);
  return JSON.parse(bodyContents);
}

/**
 * Helper: Convert stream to string
 */
async function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

/**
 * Load JSON data (automatically switches between local and S3)
 */
export async function loadJsonData(filename: string): Promise<any> {
  try {
    if (config.dataStorage.type === 'local') {
      return await loadFromLocal(filename);
    } else {
      return await loadFromS3(filename);
    }
  } catch (error) {
    console.error(`Error loading data from ${config.dataStorage.type}:`, error);
    throw error;
  }
}

/**
 * Load schemes data
 */
export async function loadSchemesData(): Promise<any[]> {
  return loadJsonData('schemes.json');
}

/**
 * Load service centers data
 */
export async function loadServiceCentersData(): Promise<any[]> {
  return loadJsonData('service_centers.json');
}

/**
 * Cache for loaded data (optional optimization)
 */
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load JSON data with caching
 */
export async function loadJsonDataCached(filename: string): Promise<any> {
  const cached = dataCache.get(filename);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`Using cached data for: ${filename}`);
    return cached.data;
  }

  const data = await loadJsonData(filename);
  dataCache.set(filename, { data, timestamp: now });
  return data;
}

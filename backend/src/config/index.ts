/**
 * Dual-Environment Configuration System
 * Automatically switches between Local Development and AWS Production
 * 
 * Environment Detection:
 * - NODE_ENV=development → Local (PostgreSQL, Redis, Filesystem)
 * - NODE_ENV=production → AWS (RDS, ElastiCache, S3)
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
const envPath = path.resolve(process.cwd(), envFile);

console.log(`Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

// Fallback to default .env if specific file doesn't exist
dotenv.config();

export interface AppConfig {
  env: 'development' | 'production' | 'test';
  environment: 'development' | 'production' | 'test';
  port: number;
  
  // Database Configuration
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
    maxConnections: number;
  };
  
  // Redis Configuration
  redis: {
    host: string;
    port: number;
    password?: string;
    tls: boolean;
    maxRetries: number;
  };
  
  // DynamoDB Configuration (Production only)
  dynamodb?: {
    schemesTable: string;
    applicationsTable: string;
    sessionsTable: string;
    serviceCentersTable: string;
  };
  
  // Data Storage Configuration
  dataStorage: {
    type: 'local' | 's3';
    localPath?: string;
    s3Bucket?: string;
    s3Region?: string;
  };
  
  // AWS Configuration (Production only)
  aws?: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
  
  // AI Provider Configuration
  ai: {
    provider: string;
    primaryModel: string;
    routingEnabled?: boolean;
    geminiApiKey?: string;
    sarvamApiKey?: string;
    groqApiKey?: string;
    openaiApiKey?: string;
  };
}

/**
 * Build configuration based on environment
 */
function buildConfig(): AppConfig {
  const env = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const isProduction = env === 'production';

  return {
    env,
    environment: env,
    port: parseInt(process.env.PORT || '3001', 10),
    
    // Database: Local PostgreSQL or AWS RDS
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'sahayak_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: isProduction, // SSL only in production
      maxConnections: isProduction ? 20 : 5,
    },
    
    // Redis: Local Redis or AWS ElastiCache
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS_ENABLED === 'true',
      maxRetries: 3,
    },
    
    // DynamoDB: Production only
    dynamodb: isProduction ? {
      schemesTable: process.env.DYNAMODB_SCHEMES_TABLE || 'sahayak-schemes',
      applicationsTable: process.env.DYNAMODB_APPLICATIONS_TABLE || 'sahayak-applications',
      sessionsTable: process.env.DYNAMODB_CHAT_SESSIONS_TABLE || 'sahayak-chat-sessions',
      serviceCentersTable: process.env.DYNAMODB_SERVICE_CENTERS_TABLE || 'sahayak-service-centers',
    } : undefined,
    
    // Data Storage: Local filesystem or AWS S3
    dataStorage: {
      type: isProduction ? 's3' : 'local',
      localPath: process.env.DATA_PATH || path.join(process.cwd(), 'data'),
      s3Bucket: process.env.S3_DATA_BUCKET || process.env.S3_BUCKET,
      s3Region: process.env.S3_REGION || process.env.AWS_REGION,
    },
    
    // AWS Configuration (Production only)
    aws: isProduction ? {
      region: process.env.AWS_REGION || 'ap-south-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    } : undefined,
    
    // AI Provider Configuration
    ai: {
      provider: process.env.AI_PROVIDER || 'router',
      primaryModel: process.env.AI_PROVIDER_PRIMARY_MODEL || 'router',
      routingEnabled: process.env.AI_ROUTING_ENABLED !== 'false',
      geminiApiKey: process.env.GEMINI_API_KEY,
      sarvamApiKey: process.env.SARVAM_API_KEY,
      groqApiKey: process.env.GROQ_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  };
}

// Export singleton config instance
export const config = buildConfig();

// Log configuration (without sensitive data)
console.log('Configuration loaded:', {
  env: config.env,
  port: config.port,
  database: {
    host: config.database.host,
    port: config.database.port,
    name: config.database.name,
    ssl: config.database.ssl,
  },
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    tls: config.redis.tls,
  },
  dataStorage: {
    type: config.dataStorage.type,
    ...(config.dataStorage.type === 'local' ? { path: config.dataStorage.localPath } : { bucket: config.dataStorage.s3Bucket }),
  },
});

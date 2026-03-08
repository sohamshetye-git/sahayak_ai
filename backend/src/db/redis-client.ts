/**
 * Redis Client Configuration
 * Automatically connects to Local Redis or AWS ElastiCache based on environment
 * Supports TLS for production AWS ElastiCache
 */

import Redis, { RedisOptions } from 'ioredis';
import { config } from '../config';

const redisConfig: RedisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  tls: config.redis.tls ? {} : undefined,
  retryStrategy: (times: number) => {
    if (times > config.redis.maxRetries) {
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  lazyConnect: false,
  connectTimeout: 10000,
  keepAlive: 30000,
};

// Create Redis client instance
const redisClient = new Redis(redisConfig);

// Event handlers
redisClient.on('connect', () => {
  console.log(`✓ Redis client connected: ${config.redis.host}:${config.redis.port} (TLS: ${config.redis.tls})`);
});

redisClient.on('ready', () => {
  console.log('✓ Redis client ready');
});

redisClient.on('error', (error) => {
  // Redis is optional for MVP - silently handle connection errors
  // In production, use AWS ElastiCache or implement proper error handling
  if (config.env === 'development') {
    // Suppress verbose error logging in development
    // console.error('✗ Redis client error:', error);
  } else {
    console.error('✗ Redis client error:', error);
  }
});

redisClient.on('close', () => {
  console.log('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

/**
 * Graceful shutdown handler
 */
export async function closeRedisConnection(): Promise<void> {
  try {
    await redisClient.quit();
    console.log('✓ Redis connection closed gracefully');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
    redisClient.disconnect();
  }
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): Redis {
  return redisClient;
}

export default redisClient;

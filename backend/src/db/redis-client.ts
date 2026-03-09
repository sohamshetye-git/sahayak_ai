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
  retryStrategy: () => null, // Don't retry - fail fast
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  enableOfflineQueue: false, // Don't queue commands when offline
  lazyConnect: true,
  connectTimeout: 5000,
  keepAlive: 30000,
};

// Create Redis client instance with lazy connect
const redisClient = new Redis({
  ...redisConfig,
  lazyConnect: true, // Don't connect immediately
});

let isRedisAvailable = false;

// Try to connect to Redis
(async () => {
  try {
    await redisClient.connect();
    isRedisAvailable = true;
    console.log(`✓ Redis connected: ${config.redis.host}:${config.redis.port}`);
  } catch (error) {
    isRedisAvailable = false;
    console.log('⚠ Redis not available - running without cache');
    // Disconnect to prevent reconnection attempts
    redisClient.disconnect();
  }
})();

// Event handlers
redisClient.on('connect', () => {
  isRedisAvailable = true;
  console.log(`✓ Redis client connected: ${config.redis.host}:${config.redis.port} (TLS: ${config.redis.tls})`);
});

redisClient.on('ready', () => {
  isRedisAvailable = true;
  console.log('✓ Redis client ready');
});

redisClient.on('error', (error) => {
  isRedisAvailable = false;
  // Silently handle Redis errors - it's optional
  console.log('⚠ Redis error (running without cache)');
});

redisClient.on('close', () => {
  isRedisAvailable = false;
  console.log('⚠ Redis connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('⚠ Redis reconnecting...');
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
  if (!isRedisAvailable) return false;
  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    isRedisAvailable = false;
    return false;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisConnected(): boolean {
  return isRedisAvailable;
}

/**
 * Get Redis client instance (may not be connected)
 */
export function getRedisClient(): Redis {
  return redisClient;
}

export default redisClient;

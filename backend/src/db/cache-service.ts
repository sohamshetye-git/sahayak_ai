/**
 * Cache Service
 * Wrapper for Redis caching with TTL and error handling
 */

import { createRedisClient } from './redis-client';
import type { RedisClientType } from 'redis';

export class CacheService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      this.client = await createRedisClient();
      this.isConnected = true;
      console.log('Cache service initialized successfully');
    } catch (error) {
      console.warn('Cache service initialization failed, running without cache:', error.message);
      this.isConnected = false;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error.message);
      return null; // Graceful degradation
    }
  }

  /**
   * Set a value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      return; // Graceful degradation
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttlSeconds, serialized);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error.message);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error.message);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error(`Cache invalidate error for pattern ${pattern}:`, error.message);
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Close the cache connection
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.isConnected = false;
      } catch (error) {
        console.error('Error closing cache connection:', error.message);
      }
    }
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
  }
  return cacheServiceInstance;
}

// Cache key generators
export const CacheKeys = {
  /**
   * Generate cache key for AI response
   */
  aiResponse: (message: string, language: string): string => {
    const hash = Buffer.from(`${message}:${language}`).toString('base64');
    return `ai:response:${hash}`;
  },

  /**
   * Generate cache key for scheme data
   */
  schemes: (): string => {
    return 'schemes:all';
  },

  /**
   * Generate cache key for filtered schemes
   */
  schemesFiltered: (filters: Record<string, any>): string => {
    const filterStr = JSON.stringify(filters);
    const hash = Buffer.from(filterStr).toString('base64');
    return `schemes:filtered:${hash}`;
  },

  /**
   * Generate cache key for single scheme
   */
  scheme: (schemeId: string): string => {
    return `scheme:${schemeId}`;
  },

  /**
   * Generate cache key for eligibility result
   */
  eligibility: (userId: string, profileHash: string): string => {
    return `eligibility:${userId}:${profileHash}`;
  },
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  AI_RESPONSE: 3600, // 1 hour
  SCHEMES: 86400, // 24 hours
  SCHEME_FILTERED: 3600, // 1 hour
  ELIGIBILITY: 3600, // 1 hour
};

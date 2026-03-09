/**
 * Chat Cache Service
 * Caches AI responses to reduce API calls
 */

import { getRedisClient, isRedisConnected } from './redis-client';
import crypto from 'crypto';

export class ChatCacheService {
  private redis = getRedisClient();
  private readonly CACHE_PREFIX = 'chat:response:';
  private readonly DEFAULT_TTL = 3600; // 1 hour

  /**
   * Generate cache key from message and language
   */
  private generateCacheKey(message: string, language: string): string {
    const normalized = message.toLowerCase().trim();
    const hash = crypto.createHash('md5').update(`${normalized}:${language}`).digest('hex');
    return `${this.CACHE_PREFIX}${hash}`;
  }

  /**
   * Get cached response
   */
  async get(message: string, language: string): Promise<string | null> {
    if (!isRedisConnected()) return null;
    
    try {
      const key = this.generateCacheKey(message, language);
      const cached = await this.redis.get(key);
      
      if (cached) {
        console.log(`[CACHE HIT] Message: "${message.substring(0, 50)}..."`);
        return cached;
      }
      
      console.log(`[CACHE MISS] Message: "${message.substring(0, 50)}..."`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null; // Fail gracefully
    }
  }

  /**
   * Set cached response
   */
  async set(message: string, language: string, response: string, ttl: number = this.DEFAULT_TTL): Promise<void> {
    if (!isRedisConnected()) return;
    
    try {
      const key = this.generateCacheKey(message, language);
      await this.redis.set(key, response, 'EX', ttl);
      console.log(`[CACHE SET] Message: "${message.substring(0, 50)}..." | TTL: ${ttl}s`);
    } catch (error) {
      console.error('Cache set error:', error);
      // Fail gracefully - don't throw
    }
  }

  /**
   * Clear all chat cache
   */
  async clear(): Promise<void> {
    if (!isRedisConnected()) return;
    
    try {
      const keys = await this.redis.keys(`${this.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`[CACHE CLEAR] Deleted ${keys.length} cached responses`);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalCached: number; memoryUsed: string }> {
    if (!isRedisConnected()) {
      return { totalCached: 0, memoryUsed: 'N/A (Redis not connected)' };
    }
    
    try {
      const keys = await this.redis.keys(`${this.CACHE_PREFIX}*`);
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      
      return {
        totalCached: keys.length,
        memoryUsed: memoryMatch ? memoryMatch[1].trim() : 'unknown',
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { totalCached: 0, memoryUsed: 'unknown' };
    }
  }
}

export const chatCacheService = new ChatCacheService();

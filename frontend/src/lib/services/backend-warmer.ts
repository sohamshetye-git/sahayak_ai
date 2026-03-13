/**
 * Backend Warmer Service
 * Keeps Vercel functions warm to prevent cold starts
 */

import { apiClient } from '../api-client';

class BackendWarmer {
  private intervalId: NodeJS.Timeout | null = null;
  private isWarming = false;
  private lastWarmup = 0;
  private readonly WARMUP_INTERVAL = 4 * 60 * 1000; // 4 minutes
  private readonly MIN_WARMUP_GAP = 30 * 1000; // 30 seconds minimum between warmups

  /**
   * Start the warming process
   */
  start() {
    if (this.intervalId) {
      console.log('[WARMER] Already running');
      return;
    }

    console.log('[WARMER] Starting backend warmer');
    
    // Warm up immediately
    this.warmup();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.warmup();
    }, this.WARMUP_INTERVAL);
  }

  /**
   * Stop the warming process
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[WARMER] Stopped');
    }
  }

  /**
   * Perform a single warmup
   */
  async warmup() {
    const now = Date.now();
    
    // Prevent too frequent warmups
    if (this.isWarming || (now - this.lastWarmup) < this.MIN_WARMUP_GAP) {
      return;
    }

    this.isWarming = true;
    this.lastWarmup = now;

    try {
      console.log('[WARMER] Warming backend...');
      const startTime = Date.now();
      
      const response = await apiClient.get('/warmup');
      const duration = Date.now() - startTime;
      
      console.log(`[WARMER] Success in ${duration}ms:`, response);
    } catch (error: any) {
      console.warn('[WARMER] Failed:', error.message);
      
      // If warmup fails, try a simple health check
      try {
        await apiClient.get('/health');
        console.log('[WARMER] Health check succeeded');
      } catch (healthError) {
        console.warn('[WARMER] Health check also failed');
      }
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Get warmer status
   */
  getStatus() {
    return {
      isRunning: !!this.intervalId,
      isWarming: this.isWarming,
      lastWarmup: this.lastWarmup,
      nextWarmup: this.lastWarmup + this.WARMUP_INTERVAL
    };
  }
}

// Singleton instance
export const backendWarmer = new BackendWarmer();

// Auto-start in browser environment
if (typeof window !== 'undefined') {
  // Start warming when the page loads
  window.addEventListener('load', () => {
    backendWarmer.start();
  });
  
  // Stop warming when page unloads
  window.addEventListener('beforeunload', () => {
    backendWarmer.stop();
  });
  
  // Handle visibility changes (pause when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      backendWarmer.stop();
    } else {
      backendWarmer.start();
    }
  });
}
/**
 * Keep-Alive Service
 * Pings backend every 5 minutes to prevent cold starts
 */

import { apiClient } from '../api-client';

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;
  private readonly PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Start the keep-alive service
   */
  start(): void {
    if (this.isActive) {
      console.log('🔄 Keep-alive service already running');
      return;
    }

    console.log('🚀 Starting keep-alive service (ping every 5 minutes)');
    this.isActive = true;

    // Ping immediately on start
    this.ping();

    // Set up interval to ping every 5 minutes
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);
  }

  /**
   * Stop the keep-alive service
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    console.log('🛑 Stopping keep-alive service');
    this.isActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Ping the backend
   */
  private async ping(): Promise<void> {
    try {
      const result = await apiClient.ping();
      console.log('🏓 Backend ping successful:', {
        status: result.status,
        uptime: `${Math.floor(result.uptime)}s`,
        timestamp: new Date(result.timestamp).toLocaleTimeString()
      });
    } catch (error) {
      console.warn('⚠️ Backend ping failed:', error);
    }
  }

  /**
   * Get service status
   */
  getStatus(): { isActive: boolean, nextPingIn?: number } {
    return {
      isActive: this.isActive,
      nextPingIn: this.isActive ? this.PING_INTERVAL : undefined
    };
  }
}

export const keepAliveService = new KeepAliveService();
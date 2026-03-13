/**
 * API Client with Dual Backend Support
 * Supports both Render and Vercel backends with automatic failover
 */

// Primary and fallback backend URLs
const PRIMARY_BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://sahayak-ai-backend.vercel.app';
const FALLBACK_BACKEND = process.env.NEXT_PUBLIC_FALLBACK_API_URL || 'https://sahayak-ai-mvny.onrender.com';

export interface APIError {
  message: string;
  statusCode?: number;
  details?: any;
}

class APIClient {
  private primaryURL: string;
  private fallbackURL: string;
  private currentBackend: 'primary' | 'fallback' = 'primary';

  constructor(primaryURL: string = PRIMARY_BACKEND, fallbackURL: string = FALLBACK_BACKEND) {
    this.primaryURL = primaryURL;
    this.fallbackURL = fallbackURL;
    console.log(`API Client initialized - Primary: ${primaryURL}, Fallback: ${fallbackURL}`);
  }

  /**
   * Get current backend URL
   */
  private getCurrentURL(): string {
    return this.currentBackend === 'primary' ? this.primaryURL : this.fallbackURL;
  }

  /**
   * Switch to fallback backend
   */
  private switchToFallback(): void {
    if (this.currentBackend === 'primary') {
      this.currentBackend = 'fallback';
      console.log('🔄 Switched to fallback backend:', this.fallbackURL);
    }
  }

  /**
   * Make HTTP request with automatic failover
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const tryRequest = async (baseURL: string): Promise<T> => {
      const url = `${baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        timeout: 20000, // Reduced from 10s to 20s for chat requests
      });

      if (!response.ok) {
        const error: APIError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };

        try {
          const errorData = await response.json();
          error.details = errorData;
          error.message = errorData.error?.message || errorData.message || error.message;
        } catch {
          // Response body is not JSON
        }

        throw error;
      }

      return await response.json();
    };

    try {
      // Try primary backend first
      const result = await tryRequest(this.getCurrentURL());
      
      // If primary was down and we're using fallback, try to switch back to primary
      if (this.currentBackend === 'fallback') {
        console.log('✅ Primary backend is back online, switching back');
        this.currentBackend = 'primary';
      }
      
      return result;
    } catch (primaryError) {
      console.warn(`❌ ${this.currentBackend} backend failed:`, primaryError);
      
      // If primary failed, try fallback
      if (this.currentBackend === 'primary') {
        try {
          console.log('🔄 Trying fallback backend...');
          const result = await tryRequest(this.fallbackURL);
          this.switchToFallback();
          console.log('✅ Fallback backend successful');
          return result;
        } catch (fallbackError) {
          console.error('❌ Both backends failed:', { primaryError, fallbackError });
          throw new Error(`Both backends failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
        }
      } else {
        // Already using fallback, no more options
        throw primaryError;
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Get current backend status
   */
  getBackendStatus(): { current: string, primary: string, fallback: string } {
    return {
      current: this.getCurrentURL(),
      primary: this.primaryURL,
      fallback: this.fallbackURL
    };
  }

  /**
   * Health check for both backends
   */
  async checkBackendHealth(): Promise<{ primary: boolean, fallback: boolean }> {
    const checkHealth = async (url: string): Promise<boolean> => {
      try {
        const response = await fetch(`${url}/health`, { timeout: 5000 });
        return response.ok;
      } catch {
        return false;
      }
    };

    const [primaryHealth, fallbackHealth] = await Promise.all([
      checkHealth(this.primaryURL),
      checkHealth(this.fallbackURL)
    ]);

    console.log('🏥 Backend Health Check:', {
      primary: primaryHealth ? '✅' : '❌',
      fallback: fallbackHealth ? '✅' : '❌'
    });

    return { primary: primaryHealth, fallback: fallbackHealth };
  }
}

export const apiClient = new APIClient();

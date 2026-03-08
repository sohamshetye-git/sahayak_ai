/**
 * Retry Utility
 * Implements retry logic with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All attempts failed
  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (network errors, timeouts, 5xx errors)
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }

  // HTTP 5xx errors
  if (error.statusCode >= 500 && error.statusCode < 600) {
    return true;
  }

  // Timeout errors
  if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
    return true;
  }

  // Rate limit errors (429)
  if (error.statusCode === 429) {
    return true;
  }

  // AWS throttling errors
  if (error.code === 'ThrottlingException' || error.code === 'TooManyRequestsException') {
    return true;
  }

  return false;
}

/**
 * Retry configuration presets
 */
export const RetryPresets = {
  /**
   * Default retry configuration
   */
  default: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    shouldRetry: isRetryableError,
  },

  /**
   * Aggressive retry for critical operations
   */
  aggressive: {
    maxAttempts: 5,
    baseDelayMs: 500,
    maxDelayMs: 5000,
    shouldRetry: isRetryableError,
  },

  /**
   * Conservative retry for non-critical operations
   */
  conservative: {
    maxAttempts: 2,
    baseDelayMs: 2000,
    maxDelayMs: 10000,
    shouldRetry: isRetryableError,
  },

  /**
   * No retry (fail fast)
   */
  none: {
    maxAttempts: 1,
    baseDelayMs: 0,
    maxDelayMs: 0,
    shouldRetry: () => false,
  },
};

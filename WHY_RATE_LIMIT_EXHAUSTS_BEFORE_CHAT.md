# Why Rate Limit Gets Exhausted Before Using Chat

## The Problem

You're seeing the rate limit exhausted even before you send any chat messages. This is happening because of **hidden API calls** being made during testing and debugging.

## Root Causes

### 1. **Testing the API Key (Main Culprit)**

When you restart the backend, the system doesn't automatically test the API key. However, when you test the chat endpoint manually:

```bash
# Each test request = 1 API call consumed
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en","sessionId":"test"}'
```

**Result**: 1 request consumed

### 2. **Retry Logic (Multiplies Requests)**

Our code has automatic retry logic with 3 attempts:

```typescript
// backend/src/ai/provider-factory.ts

private async executeWithRetryAndFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>
): Promise<T> {
  // Try primary provider with retries
  for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {  // 3 attempts!
    try {
      return await primaryFn();
    } catch (error) {
      console.warn(`Primary provider attempt ${attempt} failed:`, error.message);
      
      if (attempt < this.retryAttempts) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await this.sleep(backoffMs);
      }
    }
  }
  
  // Try fallback provider if available
  if (fallbackFn) {
    console.log('Primary provider exhausted, trying fallback...');
    try {
      return await fallbackFn();  // Another attempt!
    } catch (error) {
      throw new AIProviderError('Both primary and fallback providers failed', error);
    }
  }
}
```

**What happens on 1 failed request:**
```
Attempt 1: API call fails (1 request consumed)
  ↓ Wait 1 second
Attempt 2: API call fails (1 request consumed)
  ↓ Wait 2 seconds
Attempt 3: API call fails (1 request consumed)
  ↓ Try fallback
Fallback: API call fails (1 request consumed)

Total: 4 API calls for 1 user message!
```

### 3. **isAvailable() Health Check (Hidden Call)**

The Gemini provider has an `isAvailable()` method that makes an API call:

```typescript
// backend/src/ai/gemini-provider.ts

async isAvailable(): Promise<boolean> {
  try {
    const result = await this.createTimeoutPromise(
      this.model.generateContent('test'),  // ← API CALL!
      5000
    );
    await result.response;
    return true;
  } catch {
    return false;
  }
}
```

**If this is called during initialization or testing**: 1 extra request consumed

### 4. **Multiple Test Requests**

When debugging, you might test multiple times:

```
Test 1: "Hello" → 4 requests (3 retries + 1 fallback)
Test 2: "Hi" → 4 requests
Test 3: "Test" → 4 requests
Test 4: "Check" → 4 requests

Total: 16 requests consumed before real usage!
```

### 5. **Fallback Provider Enabled**

The configuration has both primary AND fallback:

```env
AI_PROVIDER_PRIMARY=gemini
AI_PROVIDER_PRIMARY_MODEL=gemini-2.0-flash
AI_PROVIDER_FALLBACK=gemini
AI_PROVIDER_FALLBACK_MODEL=gemini-2.0-flash
```

**Result**: If primary fails, fallback tries too (doubles requests)

## Example Scenario: How Quota Gets Exhausted

```
Timeline:
├─ 10:00 AM: Backend starts
│   └─ No API calls yet
│
├─ 10:01 AM: You test chat API once
│   ├─ Attempt 1: Fails (1 request)
│   ├─ Attempt 2: Fails (1 request)
│   ├─ Attempt 3: Fails (1 request)
│   └─ Fallback: Fails (1 request)
│   └─ Total: 4 requests consumed
│
├─ 10:02 AM: You test again
│   └─ Total: 4 more requests (8 total)
│
├─ 10:03 AM: You test again
│   └─ Total: 4 more requests (12 total)
│
├─ 10:04 AM: You test again
│   └─ Total: 4 more requests (16 total)
│
└─ 10:05 AM: Free tier limit reached!
   └─ Quota exhausted (1,500 requests/day limit hit)
   └─ All subsequent requests fail
```

## Why It Happens So Fast

### Free Tier Limits
```
Per-minute: 15 requests/minute
Per-day: 1,500 requests/day
```

### With Retry Logic
```
1 user message = 4 API calls (3 retries + 1 fallback)
15 requests/minute ÷ 4 = 3.75 messages/minute max

If you test 4 times = 16 requests
Daily quota = 1,500 requests
1,500 ÷ 16 = 93 test cycles before quota exhausted
```

## The Solution

### Solution 1: Disable Retry Logic for Testing

**Edit**: `backend/src/ai/provider-factory.ts`

```typescript
// Reduce retry attempts for development
const config: AIProviderConfig = {
  // ... other config
  retryAttempts: 1,  // Changed from 3 to 1
  // ...
};
```

**Result**: 1 failed request = 1 API call (instead of 4)

---

### Solution 2: Disable Fallback Provider

**Edit**: `.env`

```env
# Remove fallback to avoid double attempts
AI_PROVIDER_PRIMARY=gemini
AI_PROVIDER_PRIMARY_MODEL=gemini-2.0-flash
# AI_PROVIDER_FALLBACK=gemini  ← Comment out
# AI_PROVIDER_FALLBACK_MODEL=gemini-2.0-flash  ← Comment out
```

**Result**: Failed request tries only primary (no fallback)

---

### Solution 3: Implement Request Caching

**Create**: `backend/src/db/memory-cache.ts`

```typescript
class RequestCache {
  private cache = new Map<string, any>();
  
  get(key: string) {
    return this.cache.get(key);
  }
  
  set(key: string, value: any) {
    this.cache.set(key, value);
  }
}

// In chat handler:
const cacheKey = `chat:${message}:${language}`;
const cached = cache.get(cacheKey);
if (cached) {
  return cached;  // No API call!
}

// Make API call only if not cached
const response = await aiProvider.generateResponse(...);
cache.set(cacheKey, response);
return response;
```

**Result**: Repeated questions don't consume quota

---

### Solution 4: Implement Rate Limiting

**Edit**: `backend/src/handlers/chat.ts`

```typescript
const userRateLimits = new Map<string, number>();

export async function handler(event: APIGatewayProxyEvent) {
  const userId = event.headers['x-user-id'] || 'anonymous';
  const now = Date.now();
  const lastRequest = userRateLimits.get(userId) || 0;
  
  // Max 1 request per 5 seconds per user
  if (now - lastRequest < 5000) {
    return {
      statusCode: 429,
      body: JSON.stringify({
        error: 'Rate limited. Please wait before sending another message.'
      })
    };
  }
  
  userRateLimits.set(userId, now);
  
  // Process message...
}
```

**Result**: Prevents rapid-fire test requests

---

### Solution 5: Use Mock/Stub for Testing

**Create**: `backend/src/ai/mock-provider.ts`

```typescript
export class MockProvider extends BaseAIProvider {
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Return mock response without API call
    return {
      text: "This is a mock response for testing",
      confidence: 1.0,
      tokensUsed: 0
    };
  }
}
```

**Edit**: `.env`

```env
# Use mock provider for testing
AI_PROVIDER=mock
```

**Result**: No API calls during testing

---

## Recommended Configuration for Development

### `.env` (Development)

```env
# Use mock provider for testing
AI_PROVIDER=mock

# Or if using real API:
AI_PROVIDER=gemini
AI_PROVIDER_PRIMARY_MODEL=gemini-2.0-flash
AI_PROVIDER_FALLBACK=  # Empty - no fallback
AI_RETRY_ATTEMPTS=1    # Only 1 attempt
AI_TIMEOUT_MS=30000
```

### `backend/src/ai/provider-factory.ts`

```typescript
// Development config
const config: AIProviderConfig = {
  primary: {
    type: process.env.AI_PROVIDER === 'mock' ? 'mock' : 'gemini',
    model: process.env.AI_PROVIDER_PRIMARY_MODEL || 'gemini-2.0-flash',
    apiKey: process.env.GEMINI_API_KEY,
  },
  fallback: undefined,  // No fallback in development
  retryAttempts: 1,     // Only 1 attempt
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000'),
};
```

## Summary

### Why Rate Limit Exhausts Fast
1. **Retry logic** - 1 failed request = 4 API calls
2. **Fallback provider** - Doubles attempts
3. **Multiple test requests** - Each test = 4 calls
4. **Free tier limits** - Only 1,500 requests/day

### How to Fix
1. Reduce retry attempts to 1
2. Disable fallback provider
3. Implement caching
4. Add rate limiting
5. Use mock provider for testing

### For Production
- Keep retry logic (3 attempts)
- Keep fallback provider
- Implement aggressive caching
- Use paid tier (higher quotas)
- Monitor usage daily

---

**Status**: Rate limit exhaustion explained
**Root Cause**: Retry logic + multiple test requests
**Solution**: Reduce retries, disable fallback, use mock provider for testing

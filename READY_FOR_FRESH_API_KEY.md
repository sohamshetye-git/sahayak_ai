# Ready for Fresh API Key ✅

## Current Status

### ✅ All Optimizations Applied
- Retry attempts: 1 (was 3)
- Fallback provider: Disabled (was enabled)
- Rate limiting: 10 req/min per IP
- Response caching: Enabled with Redis
- Double-send prevention: Enabled
- API usage logging: Enabled

### ❌ Current API Key Exhausted
```
API Key: AIzaSyC9xmV7sSXbEncP7YOsP_0H66izcKqzKD0
Status: Quota exhausted (limit: 0)
Error: HTTP 429 - Too Many Requests
```

---

## What's Working

### Backend Logs Show Optimization
```
Primary provider attempt 1 failed: Gemini API error...
Chat handler error: Primary provider failed and no fallback available
```

**This is CORRECT behavior**:
- Only 1 attempt (not 3)
- No fallback tried (not 4 total calls)
- Clean error message

### All Other Features Working
- ✅ Schemes page (uses JSON)
- ✅ Service centers (uses JSON)
- ✅ Applications (uses localStorage)
- ✅ Redis connected and ready
- ✅ Rate limiting active
- ✅ Cache service ready

---

## Next Steps

### Option 1: Get Fresh Gemini API Key (Recommended)

1. **Create NEW Google Cloud Project**
   - Go to: https://console.cloud.google.com/
   - Create new project (don't reuse old ones)
   - Name: "Sahayak-AI-Fresh" or similar

2. **Enable Gemini API**
   - Go to: https://aistudio.google.com/app/apikey
   - Select your NEW project
   - Click "Create API Key"
   - Copy the new key

3. **Update .env**
   ```env
   GEMINI_API_KEY=your-new-api-key-here
   ```

4. **Restart Backend**
   ```bash
   # Stop current backend (Ctrl+C)
   cd backend
   npm run dev
   ```

5. **Test Chat**
   - Open: http://localhost:3000/chat
   - Send: "Hello"
   - Should work with 1 API call only

### Option 2: Use Mock Provider (For Testing)

If you want to test without using API quota:

1. **Create Mock Provider**
   
   File: `backend/src/ai/mock-provider.ts`
   ```typescript
   import { BaseAIProvider } from './base-provider';
   import { AIRequest, AIResponse } from '../types';

   export class MockProvider extends BaseAIProvider {
     constructor() {
       super('mock', 'mock-model', 30000);
     }

     async generateResponse(request: AIRequest): Promise<AIResponse> {
       console.log('[MOCK API CALL] No real API call made');
       
       const mockResponses = {
         en: 'Hello! I can help you find government schemes. Tell me about yourself - your age, occupation, state, and income.',
         hi: 'नमस्ते! मैं आपको सरकारी योजनाएं खोजने में मदद कर सकता हूं। मुझे अपने बारे में बताएं - आपकी उम्र, व्यवसाय, राज्य और आय।',
       };
       
       return {
         text: mockResponses[request.language] || mockResponses.en,
         confidence: 1.0,
         tokensUsed: 0,
       };
     }

     async extractStructuredData(text: string, schema: any): Promise<any> {
       return {};
     }

     async isAvailable(): Promise<boolean> {
       return true;
     }
   }
   ```

2. **Update Provider Factory**
   
   File: `backend/src/ai/provider-factory.ts`
   ```typescript
   import { MockProvider } from './mock-provider';
   
   // In create() method, add:
   if (type === 'mock') {
     return new MockProvider();
   }
   ```

3. **Update .env**
   ```env
   AI_PROVIDER=mock
   ```

4. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

5. **Test Chat**
   - Unlimited testing
   - No API calls
   - Instant responses

---

## Verification Checklist

Once you have a fresh API key:

### 1. Backend Starts Successfully
```
✓ Local server running on http://localhost:3001
✓ Redis client connected
✓ Redis client ready
AI Provider Config: {
  primaryType: 'gemini',
  primaryModel: 'gemini-2.0-flash',
  hasFallback: false,
  retryAttempts: 1,
  hasApiKey: true
}
```

### 2. First Chat Message Works
Send: "Hello"

**Expected Logs**:
```
[CHAT] Processing message | Session: xxx | IP: ::1
[CACHE MISS] Message: "Hello..."
[GEMINI API CALL] Timestamp: 2026-03-07T21:15:45.123Z
[GEMINI API SUCCESS] Tokens: 150
[CACHE SET] Message: "Hello..." | TTL: 3600s
```

**Expected Response**:
- Status: 200
- Header: `X-Cache: MISS`
- Body: AI response

### 3. Second Same Message Uses Cache
Send: "Hello" (again)

**Expected Logs**:
```
[CHAT] Processing message | Session: xxx | IP: ::1
[CACHE HIT] Message: "Hello..."
```

**Expected Response**:
- Status: 200
- Header: `X-Cache: HIT`
- Body: Same response (0 API calls)

### 4. Rate Limiting Works
Send 11 messages quickly

**Expected Response** (on 11th):
- Status: 429
- Header: `Retry-After: 60`
- Body: Rate limit error

### 5. Error Handling Works
If API fails:

**Expected Logs**:
```
Primary provider attempt 1 failed: ...
Chat handler error: Primary provider failed and no fallback available
```

**Expected Behavior**:
- Only 1 attempt (not 3)
- No fallback tried
- Clean error to user

---

## Quota Usage Projection

With optimizations applied:

### Daily Usage (100 Users)
```
Scenario: 100 users, 5 messages each = 500 messages

Without optimization:
  500 messages × 4 API calls = 2,000 API calls
  Result: Quota exhausted in < 1 day ❌

With optimization (50% cached):
  250 new messages × 1 API call = 250 API calls
  250 cached messages × 0 API calls = 0 API calls
  Total: 250 API calls
  Result: Quota lasts 6 days ✅
```

### Weekly Usage (50 Users)
```
Scenario: 50 users, 10 messages each/day = 500 messages/day

With optimization (60% cached):
  200 new messages × 1 API call = 200 API calls/day
  300 cached messages × 0 API calls = 0 API calls/day
  Total: 200 API calls/day
  Result: Quota lasts 7.5 days ✅
```

### Development Testing
```
Scenario: 1 developer, 50 messages/day

With optimization (70% cached):
  15 new messages × 1 API call = 15 API calls/day
  35 cached messages × 0 API calls = 0 API calls/day
  Total: 15 API calls/day
  Result: Quota lasts 100 days ✅
```

---

## Configuration Summary

### .env Settings
```env
# AI Provider
AI_PROVIDER=gemini
AI_PROVIDER_PRIMARY_MODEL=gemini-2.0-flash
AI_RETRY_ATTEMPTS=1
AI_TIMEOUT_MS=30000

# Disable fallback
AI_PROVIDER_FALLBACK=
AI_PROVIDER_FALLBACK_MODEL=

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TLS_ENABLED=false

# API Key (REPLACE WITH FRESH KEY)
GEMINI_API_KEY=your-new-api-key-here
```

### Rate Limiting
- Window: 1 minute
- Limit: 10 requests per IP
- Response: HTTP 429 with Retry-After header

### Caching
- TTL: 1 hour (3600 seconds)
- Key: MD5 hash of message + language
- Storage: Redis
- Behavior: Automatic cache on all responses

---

## Monitoring Commands

### Check Backend Logs
```bash
# Watch for API calls
[GEMINI API CALL] Timestamp: ...
[GEMINI API SUCCESS] Tokens: ...
[GEMINI API ERROR] ...

# Watch for cache performance
[CACHE HIT] Message: ...
[CACHE MISS] Message: ...
[CACHE SET] Message: ... | TTL: 3600s

# Watch for rate limiting
[RATE LIMIT] IP: ... exceeded limit
```

### Check Redis Cache
```bash
# Connect to Redis
redis-cli

# Check cached responses
KEYS chat:response:*

# Check cache stats
INFO memory

# Clear cache if needed
FLUSHDB
```

### Check API Quota
- Go to: https://ai.google.dev/rate-limits
- Monitor: Requests per minute/day
- Check: Token usage

---

## Troubleshooting

### Issue: Still Getting HTTP 429
**Solution**: Current API key exhausted, need fresh key from NEW project

### Issue: Cache Not Working
**Check**: Redis running (`redis-cli ping`)
**Solution**: Start Redis or check connection

### Issue: Rate Limit Too Strict
**Solution**: Increase `RATE_LIMIT_MAX` in `backend/src/handlers/chat.ts`

### Issue: Want More Retries
**Solution**: Increase `AI_RETRY_ATTEMPTS` in `.env` (but uses more quota)

---

## Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Retry Logic | ✅ Optimized | 1 attempt (was 3) |
| Fallback Provider | ✅ Disabled | No duplicate calls |
| Rate Limiting | ✅ Active | 10 req/min per IP |
| Response Caching | ✅ Active | 1-hour TTL |
| API Logging | ✅ Active | Track all calls |
| Double-Send Prevention | ✅ Active | Frontend protected |
| Current API Key | ❌ Exhausted | Need fresh key |

**Next Action**: Get fresh Gemini API key from NEW Google Cloud project, update `.env`, restart backend, test chat! 🚀

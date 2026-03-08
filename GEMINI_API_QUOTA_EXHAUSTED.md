# Gemini API Quota Exhausted - Solution Guide

## Current Status
- **Backend**: ✓ Running on port 3001
- **Frontend**: ✓ Running on port 3000
- **Redis**: ✓ Connected and working
- **Chat API**: ✗ Failing with HTTP 429 (Too Many Requests)

## Problem
The Gemini API key in `.env` has exhausted its free tier quota:
```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
```

**Current API Key**: `AIzaSyC9xmV7sSXbEncP7YOsP_0H66izcKqzKD0`
- Status: ❌ Quota exhausted (limit: 0)
- Free tier limits: 15 requests/min, 1,500 requests/day

## Solutions

### Option 1: Use a Fresh Gemini API Key (Recommended)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a **NEW** Google Cloud project (don't reuse old projects)
3. Generate a new API key
4. Update `.env`:
   ```
   GEMINI_API_KEY=your-new-api-key-here
   ```
5. Restart backend:
   ```bash
   # Kill old process
   Get-Process node | Stop-Process -Force
   
   # Restart backend
   cd backend
   npm run dev
   ```

### Option 2: Use Mock Provider for Development (No API Calls)
If you want to test without using API quota:

1. Update `.env`:
   ```
   AI_PROVIDER=mock
   ```

2. Create `backend/src/ai/mock-provider.ts`:
   ```typescript
   import { BaseAIProvider } from './base-provider';
   import { AIRequest, AIResponse } from '../types';

   export class MockProvider extends BaseAIProvider {
     constructor() {
       super('mock', 'mock-model', 30000);
     }

     async generateResponse(request: AIRequest): Promise<AIResponse> {
       // Simulate AI response
       const mockResponses = [
         'Based on your profile, here are some schemes you might be eligible for...',
         'I can help you find government schemes. Tell me more about yourself.',
         'Let me check which schemes match your eligibility criteria.',
       ];
       
       return {
         text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
         confidence: 0.9,
         tokensUsed: 100,
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

3. Update `backend/src/ai/provider-factory.ts` to support mock:
   ```typescript
   if (type === 'mock') {
     return new MockProvider();
   }
   ```

### Option 3: Use Bedrock (AWS) Provider
If you have AWS credentials configured:

1. Update `.env`:
   ```
   AI_PROVIDER=bedrock
   AI_PROVIDER_PRIMARY_MODEL=amazon.nova-lite-v1:0
   AWS_REGION=us-east-1
   ```

2. Restart backend

## Verification Steps

### 1. Check API Key Status
```bash
# Test with curl
$body = @{
    message = "Hello"
    language = "en"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/chat" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 2. Check Backend Logs
```bash
# Look for success message
# ✓ AI Response received: { text: "...", confidence: 0.85, tokensUsed: 150 }
```

### 3. Test Chat in Frontend
- Open http://localhost:3000/chat
- Send a message
- Should receive AI response (not HTTP 500 error)

## Why Quota Exhausts Quickly

Free tier limits:
- **15 requests per minute** (per model)
- **1,500 requests per day** (per model)

With retry logic (3 attempts):
- 1 failed request = 3 API calls
- 10 users = 50 requests/day
- 100 users = 500 requests/day
- 1,000 users = 5,000 requests/day (exceeds limit)

## Recommendations

### For Development
- Use **Mock Provider** to avoid quota consumption
- Only test with real API when needed
- Use 1 retry attempt in development (already configured)

### For Production
- Use **Bedrock** (AWS) for reliable, scalable AI
- Or upgrade Gemini to **paid tier** with higher quotas
- Implement caching to reduce API calls
- Use rate limiting per user

## Current Configuration

**File**: `.env`
```
AI_PROVIDER=gemini
AI_PROVIDER_PRIMARY_MODEL=gemini-2.0-flash
GEMINI_API_KEY=AIzaSyC9xmV7sSXbEncP7YOsP_0H66izcKqzKD0
AI_RETRY_ATTEMPTS=3
```

**File**: `backend/src/ai/provider-factory.ts`
- Development: 1 retry attempt (conserves quota)
- Production: 3 retry attempts
- Fallback disabled in development

## Next Steps

1. **Get a fresh API key** from a new Google Cloud project
2. **Update `.env`** with the new key
3. **Restart backend** (`npm run dev` in backend folder)
4. **Test chat** by sending a message in the UI
5. **Monitor quota** at https://ai.google.dev/rate-limits

---

**Status**: Ready to proceed once new API key is provided

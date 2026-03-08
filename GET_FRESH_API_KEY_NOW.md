# Get Fresh API Key - Step by Step

## The Problem
Your current Gemini API key has **ZERO quota remaining**:
```
Current Key: AIzaSyC9xmV7sSXbEncP7YOsP_0H66izcKqzKD0
Status: Quota exhausted (limit: 0)
Error: "Failed to process chat message"
```

## The Solution
Get a **FRESH** API key from a **NEW** Google Cloud project.

---

## Step-by-Step Instructions

### Step 1: Go to Google AI Studio
```
https://aistudio.google.com/app/apikey
```

### Step 2: Create NEW Project
**IMPORTANT**: Don't reuse old projects!

1. Click on project dropdown (top of page)
2. Click "New Project"
3. Name it: "Sahayak-AI-Fresh-2026" (or any name)
4. Click "Create"

### Step 3: Generate API Key
1. Make sure your NEW project is selected
2. Click "Create API Key"
3. Click "Create API key in new project" (if asked)
4. Copy the API key (starts with "AIza...")

### Step 4: Update .env File
Open `.env` file and replace the old key:

**Before**:
```env
GEMINI_API_KEY=AIzaSyC9xmV7sSXbEncP7YOsP_0H66izcKqzKD0
```

**After**:
```env
GEMINI_API_KEY=your-new-api-key-here
```

### Step 5: Restart Backend
In your terminal:
```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

### Step 6: Test Chat
1. Open: http://localhost:3000/chat
2. Send message: "Hello"
3. Should work! ✅

---

## Expected Result

### Backend Logs (Success)
```
[CHAT] Processing message | Session: xxx | IP: ::1
[CACHE MISS] Message: "Hello..."
[GEMINI API CALL] Timestamp: 2026-03-07T21:30:00.000Z
[GEMINI API SUCCESS] Tokens: 150
[CACHE SET] Message: "Hello..." | TTL: 3600s
```

### Frontend (Success)
- Message sent: "Hello"
- Response received: AI greeting
- No errors!

---

## Why This Happens

### Free Tier Limits
```
Gemini Free Tier:
├─ 15 requests per MINUTE
├─ 1,500 requests per DAY
└─ Resets: Daily at midnight UTC
```

### Your Usage
```
You tested chat multiple times
↓
Consumed 1,500+ requests
↓
Quota exhausted
↓
Need fresh key from NEW project
```

---

## Alternative: Use Mock Provider (For Testing)

If you want to test without API quota:

### Step 1: Create Mock Provider
Create file: `backend/src/ai/mock-provider.ts`

```typescript
import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse } from '../types';

export class MockProvider extends BaseAIProvider {
  constructor() {
    super('mock', 'mock-model', 30000);
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    console.log('[MOCK API] No real API call made');
    
    const responses = {
      en: 'Hello! I can help you find government schemes. Tell me about yourself - your age, occupation, state, and income.',
      hi: 'नमस्ते! मैं आपको सरकारी योजनाएं खोजने में मदद कर सकता हूं। मुझे अपने बारे में बताएं।',
    };
    
    return {
      text: responses[request.language] || responses.en,
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

### Step 2: Update Provider Factory
Edit: `backend/src/ai/provider-factory.ts`

Add import at top:
```typescript
import { MockProvider } from './mock-provider';
```

Add in `create()` method (after line 13):
```typescript
if (type === 'mock') {
  return new MockProvider();
}
```

### Step 3: Update .env
```env
AI_PROVIDER=mock
```

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

### Step 5: Test Chat
- Unlimited testing
- No API calls
- Instant responses
- No quota usage

---

## Quick Comparison

| Option | Pros | Cons |
|--------|------|------|
| Fresh API Key | Real AI responses | Limited quota (1,500/day) |
| Mock Provider | Unlimited testing | Fake responses |

---

## Recommendation

**For Development**: Use Mock Provider
- Test UI/UX
- Test features
- No quota worries

**For Production**: Use Fresh API Key
- Real AI responses
- Better user experience
- Monitor quota usage

---

## Need Help?

### Check API Key Status
Go to: https://ai.google.dev/rate-limits

### Check Quota Usage
Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

### Monitor Backend Logs
Watch for:
```
[GEMINI API CALL] - Real API call
[MOCK API] - Mock provider (no API call)
[CACHE HIT] - Cached response (no API call)
```

---

## Summary

**Current Status**: API key exhausted, chat not working
**Solution**: Get fresh API key OR use mock provider
**Time to Fix**: 2-5 minutes

Choose your option and follow the steps above! 🚀

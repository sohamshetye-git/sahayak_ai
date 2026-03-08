# API Rate Limit Analysis & Optimization Guide

## Why Rate Limits Get Hit So Fast?

### Gemini Free Tier Quotas (Very Restrictive)

```
Per-Minute Limits:
├─ Requests: 15 requests/minute
├─ Input Tokens: 32,000 tokens/minute
└─ Output Tokens: 8,000 tokens/minute

Per-Day Limits:
├─ Requests: 1,500 requests/day
└─ Input Tokens: 1,000,000 tokens/day
```

### Why It Exhausts Quickly

1. **Testing Overhead**
   - Each test request = 1 request consumed
   - Testing 4 API keys = 4+ requests gone
   - Debugging = more requests

2. **Retry Logic**
   - Our code retries 3 times on failure
   - Each retry = another request
   - Failed requests still count toward quota

3. **Token Usage**
   - Average message = 100-500 input tokens
   - AI response = 200-1000 output tokens
   - Long conversations = many tokens

4. **Concurrent Users**
   - Multiple users = multiple simultaneous requests
   - Each user message = 1 request
   - Scales quickly with users

### Example: How Quota Gets Exhausted

```
Scenario: 10 users testing the app

User 1: Sends 1 message
  ├─ Request 1: "Hello" (100 tokens)
  ├─ Response: 300 tokens
  └─ Total: 1 request, 400 tokens

User 2-10: Each sends 1 message
  └─ Total: 10 requests, 4,000 tokens

Testing/Debugging: 5 test requests
  └─ Total: 5 requests, 2,000 tokens

TOTAL USED: 15 requests, 6,000 tokens
QUOTA REMAINING: 0 requests (daily limit hit!)
```

## Current Application Usage Pattern

### Where AI API Gets Called

```
1. Chat Page (/chat)
   ├─ User types message
   ├─ Sends to backend
   ├─ Backend calls Gemini API
   ├─ Returns response
   └─ Displays in chat

2. Eligibility Check (Future)
   ├─ User provides profile
   ├─ Backend analyzes eligibility
   ├─ Calls Gemini API
   └─ Returns matching schemes

3. Scheme Recommendations (Future)
   ├─ User asks for schemes
   ├─ Backend queries Gemini
   ├─ Returns recommendations
   └─ Displays scheme cards
```

### Current Request Count (Per User Session)

```
Minimal Usage:
├─ 1 chat message = 1 API request
├─ Average tokens: 400-600
└─ Per user per day: 10-20 requests (if active)

Heavy Usage:
├─ 10 chat messages = 10 API requests
├─ Average tokens: 5,000-8,000
└─ Per user per day: 100+ requests (if very active)

Peak Usage (100 concurrent users):
├─ 100 users × 5 messages each = 500 requests
├─ Total tokens: 200,000-300,000
└─ EXCEEDS daily quota in minutes!
```

## Production Scenarios & Request Needs

### Scenario 1: Small Pilot (10 Users)

```
Daily Usage:
├─ 10 users × 5 messages/day = 50 requests
├─ Average tokens: 20,000 tokens
├─ Quota needed: 50 requests/day
└─ Free tier: ✓ SUFFICIENT (1,500 requests/day)

Cost: FREE
Recommendation: Use free tier
```

### Scenario 2: Medium Deployment (100 Users)

```
Daily Usage:
├─ 100 users × 10 messages/day = 1,000 requests
├─ Average tokens: 400,000 tokens
├─ Quota needed: 1,000 requests/day
└─ Free tier: ✗ INSUFFICIENT (1,500 requests/day limit)

Peak Hour Usage:
├─ 100 users × 2 messages/hour = 200 requests/hour
├─ Per-minute: 3-4 requests/minute
└─ Free tier: ✗ INSUFFICIENT (15 requests/minute limit)

Cost: ~$0.50-$1.00/day (paid tier)
Recommendation: Upgrade to paid tier
```

### Scenario 3: Large Deployment (1,000 Users)

```
Daily Usage:
├─ 1,000 users × 15 messages/day = 15,000 requests
├─ Average tokens: 6,000,000 tokens
├─ Quota needed: 15,000 requests/day
└─ Free tier: ✗ COMPLETELY INSUFFICIENT

Peak Hour Usage:
├─ 1,000 users × 3 messages/hour = 3,000 requests/hour
├─ Per-minute: 50 requests/minute
└─ Free tier: ✗ COMPLETELY INSUFFICIENT

Cost: ~$5-$10/day (paid tier)
Recommendation: Paid tier + caching + optimization
```

### Scenario 4: Enterprise (10,000+ Users)

```
Daily Usage:
├─ 10,000 users × 20 messages/day = 200,000 requests
├─ Average tokens: 80,000,000 tokens
├─ Cost: ~$50-$100/day

Peak Hour Usage:
├─ 10,000 users × 4 messages/hour = 40,000 requests/hour
├─ Per-minute: 667 requests/minute

Recommendation: 
├─ Paid tier with quota increase
├─ Implement aggressive caching
├─ Use multiple API keys (load balancing)
├─ Consider self-hosted LLM
└─ Implement request queuing
```

## How Our Application Currently Uses API

### Current Implementation

```typescript
// backend/src/handlers/chat.ts

export async function handler(event: APIGatewayProxyEvent) {
  const { message, language, sessionId } = JSON.parse(event.body);
  
  // EVERY message triggers API call
  const response = await orchestrator.processMessage(
    sessionId,
    message,
    language,
    messages,
    userProfile
  );
  
  return response;
}
```

### Request Flow

```
User sends message
    ↓
Frontend sends to /api/chat
    ↓
Backend receives request
    ↓
Calls Gemini API (1 request consumed)
    ↓
Waits for response
    ↓
Returns to frontend
    ↓
User sees response
```

### Current Limitations

```
✗ No caching
✗ No request batching
✗ No rate limiting on backend
✗ No response caching
✗ No session-based optimization
✗ Retries consume quota
```

## Optimization Strategies

### Strategy 1: Implement Response Caching

```typescript
// Cache similar questions
const cache = new Map();

function getCachedResponse(message: string) {
  // Check if similar question was asked before
  const cached = cache.get(message);
  if (cached) {
    return cached; // No API call needed!
  }
}

// Result: 30-50% reduction in API calls
```

### Strategy 2: Batch Similar Requests

```typescript
// Instead of 10 individual requests
// Combine into 1 request with context

// Before: 10 API calls
user1.message("What schemes for education?")
user2.message("What schemes for education?")
user3.message("What schemes for education?")

// After: 1 API call
batchedRequest([
  "What schemes for education?",
  "What schemes for education?",
  "What schemes for education?"
])

// Result: 90% reduction in API calls
```

### Strategy 3: Use Local Data First

```typescript
// Before: Ask AI for every question
"What schemes are available?"
  → Calls Gemini API
  → Returns schemes

// After: Use JSON data first
"What schemes are available?"
  → Check schemes.json (instant, no API call)
  → Return schemes
  → Only use AI for complex questions

// Result: 70-80% reduction in API calls
```

### Strategy 4: Implement Rate Limiting

```typescript
// Limit requests per user per minute
const userRateLimits = new Map();

function checkRateLimit(userId: string) {
  const limit = userRateLimits.get(userId) || 0;
  
  if (limit > 5) { // Max 5 requests/minute per user
    return "Rate limited";
  }
  
  userRateLimits.set(userId, limit + 1);
}

// Result: Prevents quota exhaustion
```

### Strategy 5: Use Multiple API Keys

```typescript
// Distribute requests across multiple keys
const apiKeys = [
  "key1...",
  "key2...",
  "key3..."
];

function getNextKey() {
  return apiKeys[requestCount % apiKeys.length];
}

// Result: 3x quota capacity
```

## Recommended Configuration for Sahayak

### For Development/Testing

```
✓ Use free tier
✓ Implement caching
✓ Limit test requests
✓ Use local data first
✓ Single API key

Expected: 50-100 requests/day
Quota: Sufficient
Cost: FREE
```

### For Pilot (10-50 Users)

```
✓ Upgrade to paid tier
✓ Implement caching
✓ Use local data first
✓ Single API key
✓ Monitor usage

Expected: 100-500 requests/day
Quota: Sufficient
Cost: $0.50-$2/day
```

### For Production (100+ Users)

```
✓ Paid tier with quota increase
✓ Aggressive caching (Redis)
✓ Use local data first
✓ Multiple API keys (3-5)
✓ Request queuing
✓ Rate limiting per user
✓ Session-based optimization

Expected: 1,000-10,000 requests/day
Quota: Sufficient
Cost: $5-$50/day
```

## Implementation Priority

### Phase 1: Immediate (This Week)
```
1. Implement response caching
2. Use local schemes.json first
3. Add rate limiting per user
4. Upgrade to paid tier
```

### Phase 2: Short-term (Next 2 Weeks)
```
1. Implement request batching
2. Add Redis caching
3. Session-based optimization
4. Multiple API keys
```

### Phase 3: Long-term (Next Month)
```
1. Self-hosted LLM option
2. Advanced caching strategies
3. Load balancing
4. Analytics & monitoring
```

## Current Application Optimization Needed

### What to Change

```typescript
// BEFORE: Every message calls API
async function chat(message: string) {
  return await geminiAPI.call(message); // 1 API call
}

// AFTER: Smart routing
async function chat(message: string) {
  // 1. Check cache
  const cached = cache.get(message);
  if (cached) return cached; // 0 API calls
  
  // 2. Check if it's a scheme question
  if (isSchemeQuestion(message)) {
    return searchSchemes(message); // 0 API calls
  }
  
  // 3. Check if it's a service center question
  if (isServiceCenterQuestion(message)) {
    return searchCenters(message); // 0 API calls
  }
  
  // 4. Only call API for complex questions
  const response = await geminiAPI.call(message); // 1 API call
  cache.set(message, response);
  return response;
}
```

### Expected Impact

```
Before optimization:
├─ 100 users × 10 messages = 1,000 API calls/day
├─ Cost: $1-2/day
└─ Quota: Exhausted

After optimization:
├─ 100 users × 10 messages = 200 API calls/day (80% reduction)
├─ Cost: $0.20-0.40/day
└─ Quota: Comfortable
```

## Summary

### Why Rate Limits Hit Fast
1. Free tier is very restrictive (15 req/min, 1,500 req/day)
2. Every user message = 1 API request
3. Testing/debugging consumes quota
4. Retries multiply requests
5. Scales quickly with users

### How Many Requests Needed
- **Development**: 50-100/day (free tier OK)
- **Pilot (10-50 users)**: 100-500/day (paid tier needed)
- **Production (100+ users)**: 1,000-10,000/day (paid + optimization)
- **Enterprise (1,000+ users)**: 10,000-100,000/day (paid + caching + multiple keys)

### Recommendation for Sahayak
1. Upgrade to paid tier immediately
2. Implement caching (local data first)
3. Add rate limiting per user
4. Use multiple API keys
5. Monitor usage daily

---
**Status**: Application ready, needs API optimization for production
**Current Quota**: Free tier (insufficient for testing)
**Recommended**: Paid tier + caching strategy

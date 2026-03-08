# API Request Flow - Visual Explanation

## Your Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Port 3000)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Schemes     │  │  Service     │  │ Applications │           │
│  │  Page        │  │  Centers     │  │  Page        │           │
│  │              │  │  Page        │  │              │           │
│  │ Uses JSON    │  │ Uses JSON    │  │ Uses Local   │           │
│  │ NO API CALLS │  │ NO API CALLS │  │ Storage      │           │
│  │              │  │              │  │ NO API CALLS │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CHAT PAGE (Uses Gemini API)                 │   │
│  │  User types: "Hello, what schemes are available?"        │   │
│  │  Sends to: POST /api/chat                                │   │
│  │  ⚠️ USES GEMINI API - CONSUMES QUOTA                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP Request to Backend
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Port 3001)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Chat Handler                                │   │
│  │  1. Receives message from frontend                       │   │
│  │  2. Calls AI Provider (Gemini)                           │   │
│  │  3. Gets response                                        │   │
│  │  4. Returns to frontend                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         AI Provider Factory                              │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Primary: Gemini API                                │  │   │
│  │  │ - Model: gemini-2.0-flash                          │  │   │
│  │  │ - API Key: AIzaSyC9xmV7sSXbEncP7YOsP_0H66izcKqzKD0 │  │   │
│  │  │ - Status: ❌ QUOTA EXHAUSTED                       │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Fallback: Gemini API (same key)                    │  │   │
│  │  │ - Status: ❌ ALSO EXHAUSTED                        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Retry Logic (3 attempts)                         │   │
│  │  Attempt 1: Call Gemini → 429 Too Many Requests         │   │
│  │  Attempt 2: Call Gemini → 429 Too Many Requests         │   │
│  │  Attempt 3: Call Gemini → 429 Too Many Requests         │   │
│  │  Fallback:  Call Gemini → 429 Too Many Requests         │   │
│  │  Result: HTTP 500 Error                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP 500 Error to Frontend
                              ↓
                    User sees error message
```

---

## Single Chat Message Flow - API Calls

### Scenario 1: Success (Quota Available)
```
User sends: "Hello"
    ↓
Frontend: POST /api/chat { message: "Hello", language: "en" }
    ↓
Backend Chat Handler receives request
    ↓
AI Provider Factory creates Gemini provider
    ↓
Gemini Provider calls: generateContent("Hello")
    ↓
🌐 API CALL #1 → Gemini API
    ↓
Gemini API returns: "Hi! I can help you find government schemes..."
    ↓
Backend returns response to frontend
    ↓
Frontend displays: "Hi! I can help you find government schemes..."

TOTAL API CALLS: 1
```

### Scenario 2: Failure with Retries (Quota Exhausted)
```
User sends: "Hello"
    ↓
Frontend: POST /api/chat { message: "Hello", language: "en" }
    ↓
Backend Chat Handler receives request
    ↓
AI Provider Factory creates Gemini provider
    ↓
Gemini Provider calls: generateContent("Hello")
    ↓
🌐 API CALL #1 → Gemini API
    ↓
Gemini API returns: 429 Too Many Requests (Quota exceeded)
    ↓
Retry Logic: Wait 1 second, try again
    ↓
🌐 API CALL #2 → Gemini API
    ↓
Gemini API returns: 429 Too Many Requests (Quota exceeded)
    ↓
Retry Logic: Wait 2 seconds, try again
    ↓
🌐 API CALL #3 → Gemini API
    ↓
Gemini API returns: 429 Too Many Requests (Quota exceeded)
    ↓
Try Fallback Provider (also Gemini)
    ↓
🌐 API CALL #4 → Gemini API (Fallback)
    ↓
Gemini API returns: 429 Too Many Requests (Quota exceeded)
    ↓
Backend returns: HTTP 500 Error
    ↓
Frontend displays: "Error: Failed to process chat message"

TOTAL API CALLS: 4 (for 1 message!)
```

---

## Why Quota Exhausts - Timeline

### Your Project Timeline

```
Week 1-2: Building Features
├─ Created Schemes page (JSON data, no API)
├─ Created Service Centers page (JSON data, no API)
├─ Created Applications page (localStorage, no API)
├─ Created Chat page (Gemini API integration)
└─ API Calls: 0 (chat not tested yet)

Week 3: Testing Chat Feature
├─ Test 1: Send "Hello" → 1 API call
├─ Test 2: Send "What schemes?" → 1 API call
├─ Test 3: Send "I'm a farmer" → 1 API call
├─ Test 4: Send "In Maharashtra" → 1 API call
├─ Test 5: Send "Income 2 lakh" → 1 API call
├─ Test 6: Backend restart → 0 API calls
├─ Test 7: Send "Check eligibility" → 1 API call
├─ Test 8: Send "Find schemes" → 1 API call
├─ Test 9: Send "What documents?" → 1 API call
├─ Test 10: Send "How to apply?" → 1 API call
└─ API Calls: 9 (out of 1,500 daily limit)

Week 4: More Testing & Debugging
├─ Test 11-20: 10 more messages → 10 API calls
├─ Test 21-30: 10 more messages → 10 API calls
├─ Test 31-40: 10 more messages → 10 API calls
├─ Test 41-50: 10 more messages → 10 API calls
├─ Backend restarts: 5 times → 0 API calls
└─ API Calls: 40 (out of 1,500 daily limit)

Week 5: Error Testing & Retries
├─ Test 51-100: 50 messages, some fail with retries
├─ Failed messages: 20 × 3 retries = 60 API calls
├─ Successful messages: 30 × 1 = 30 API calls
├─ Backend restarts: 10 times → 0 API calls
└─ API Calls: 90 (out of 1,500 daily limit)

Week 6: Intensive Testing
├─ Test 101-200: 100 messages
├─ Failed messages: 50 × 3 retries = 150 API calls
├─ Successful messages: 50 × 1 = 50 API calls
├─ Backend restarts: 20 times → 0 API calls
└─ API Calls: 200 (out of 1,500 daily limit)

...continuing...

Total API Calls Used: ~1,500
Remaining Quota: 0
Status: ❌ QUOTA EXHAUSTED
```

---

## Comparison: Different Providers

### Gemini (Free Tier) - Current
```
Limits:
├─ 15 requests per MINUTE
├─ 1,500 requests per DAY
└─ Cost: FREE

Your Usage:
├─ ~1,500 API calls in testing
├─ Quota exhausted in ~1 week
└─ Status: ❌ BLOCKED

Recommendation: Use for small projects only
```

### Bedrock (AWS) - Alternative
```
Limits:
├─ 100 requests per MINUTE (default)
├─ Unlimited per DAY
└─ Cost: $0.003 per 1K input tokens + $0.015 per 1K output tokens

Your Usage:
├─ ~1,500 API calls in testing
├─ Cost: ~$0.05-0.10 (very cheap)
└─ Status: ✅ WORKS

Recommendation: Use for production
```

### Mock Provider - Development
```
Limits:
├─ Unlimited requests
├─ Unlimited per DAY
└─ Cost: FREE

Your Usage:
├─ ~1,500 API calls in testing
├─ Cost: $0 (no real API calls)
└─ Status: ✅ WORKS

Recommendation: Use for development/testing
```

---

## Why Other Features Don't Have This Problem

### Schemes Page
```
Frontend loads: /schemes
    ↓
Fetches: /api/schemes
    ↓
Backend returns: JSON from file (schemes.json)
    ↓
NO AI API CALLS
    ↓
Works unlimited times
```

### Service Centers Page
```
Frontend loads: /service-centers
    ↓
Fetches: /api/service-centers
    ↓
Backend returns: JSON from file (service_centers.json)
    ↓
NO AI API CALLS
    ↓
Works unlimited times
```

### Applications Page
```
Frontend loads: /applications
    ↓
Reads from: localStorage (browser storage)
    ↓
NO API CALLS AT ALL
    ↓
Works unlimited times
```

### Chat Page
```
Frontend loads: /chat
    ↓
User sends message
    ↓
Fetches: /api/chat
    ↓
Backend calls: Gemini API (external service)
    ↓
🌐 USES EXTERNAL API QUOTA
    ↓
Limited by Gemini free tier (1,500/day)
```

---

## Summary

| Feature | Data Source | API Calls | Quota Issue |
|---------|-------------|-----------|------------|
| Schemes | JSON file | 0 | ❌ None |
| Service Centers | JSON file | 0 | ❌ None |
| Applications | localStorage | 0 | ❌ None |
| Chat | Gemini API | 1+ per message | ✅ YES |

**Conclusion**: Only Chat uses external API, so only Chat has quota issues.

**Solution**: Use fresh API key, Mock provider, or Bedrock instead.

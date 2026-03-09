# Quick Reference - Free Tier Configuration

## ✅ Optimizations Applied

```
┌─────────────────────────────────────────────────────────────┐
│  GEMINI FREE TIER - OPTIMIZED FOR QUOTA CONSERVATION        │
├─────────────────────────────────────────────────────────────┤
│  ✅ Retry Attempts: 1 (was 3)                               │
│  ✅ Fallback Provider: Disabled (was enabled)               │
│  ✅ Rate Limiting: 10 req/min per IP                        │
│  ✅ Response Caching: 1-hour TTL                            │
│  ✅ API Logging: All calls tracked                          │
│  ✅ Double-Send Prevention: Frontend protected              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Get Fresh API Key

```bash
1. Go to: https://aistudio.google.com/app/apikey
2. Create NEW project (don't reuse old)
3. Generate API key
4. Copy key
```

---

## ⚙️ Update Configuration

**File**: `.env`
```env
GEMINI_API_KEY=your-new-api-key-here
AI_RETRY_ATTEMPTS=1
AI_PROVIDER_FALLBACK=
```

---

## 🚀 Restart Backend

```bash
cd backend
npm run dev
```

**Expected Output**:
```
✓ Local server running on http://localhost:3001
✓ Redis client connected
AI Provider Config: { retryAttempts: 1, hasFallback: false }
```

---

## 🧪 Test Chat

### Test 1: First Message (Cache Miss)
```
Send: "Hello"
Expected: [CACHE MISS] → [GEMINI API CALL] → [CACHE SET]
API Calls: 1
```

### Test 2: Same Message (Cache Hit)
```
Send: "Hello" (again)
Expected: [CACHE HIT]
API Calls: 0
```

### Test 3: Rate Limiting
```
Send: 11 messages quickly
Expected: HTTP 429 on 11th message
```

---

## 📊 Quota Savings

| Scenario | Before | After | Savings |
|----------|--------|-------|---------|
| New message | 4 calls | 1 call | 75% |
| Cached message | 4 calls | 0 calls | 100% |
| 100 messages (50% cached) | 400 calls | 50 calls | 87.5% |

---

## 🔍 Monitor Logs

```bash
# API calls
[GEMINI API CALL] Timestamp: ...
[GEMINI API SUCCESS] Tokens: 150

# Cache performance
[CACHE HIT] Message: "Hello..."
[CACHE MISS] Message: "New question..."

# Rate limiting
[RATE LIMIT] IP: ... exceeded limit
```

---

## 📈 Expected Results

- ✅ Chat works on free tier
- ✅ No HTTP 429 errors (with fresh key)
- ✅ Quota lasts full day
- ✅ Repeated questions from cache
- ✅ Safe for testing

---

## 🆘 Quick Fixes

### Still Getting HTTP 429?
→ Current API key exhausted, need fresh key

### Cache not working?
→ Check Redis: `redis-cli ping`

### Want more retries?
→ Increase `AI_RETRY_ATTEMPTS` in `.env`

### Rate limit too strict?
→ Increase `RATE_LIMIT_MAX` in `chat.ts`

---

## 📝 Files Changed

1. `.env` - Retry attempts, disabled fallback
2. `backend/src/ai/provider-factory.ts` - Respect env config
3. `backend/src/ai/gemini-provider.ts` - API logging
4. `backend/src/db/chat-cache-service.ts` - NEW cache service
5. `backend/src/handlers/chat.ts` - Rate limiting + caching
6. `frontend/src/app/chat/page.tsx` - Double-send prevention
7. `frontend/src/lib/api-client.ts` - Removed frontend retries

---

## 🎯 Next Action

**Get fresh API key → Update .env → Restart backend → Test chat!**

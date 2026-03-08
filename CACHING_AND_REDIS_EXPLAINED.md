# Caching Problems & Redis - Complete Explanation

## Part 1: Why Caching Problems Occur

### What is Caching?

Caching stores data temporarily to avoid reprocessing:

```
Without Cache:
User Request → Process → Database → Response (slow)
User Request → Process → Database → Response (slow)
User Request → Process → Database → Response (slow)

With Cache:
User Request → Check Cache → Found! → Response (fast)
User Request → Check Cache → Found! → Response (fast)
User Request → Check Cache → Found! → Response (fast)
```

### Types of Caching in This Project

#### 1. **Frontend Cache (.next folder)**

```
What it is:
├─ Compiled Next.js pages
├─ Optimized JavaScript bundles
├─ Static assets
└─ Build artifacts

Why it causes problems:
├─ Corrupted cache = broken pages
├─ Old code cached = changes don't appear
├─ Large cache = slow startup
└─ Stale data = outdated information
```

**Example of Frontend Cache Problem:**
```
Scenario: You change a page component
├─ Edit: frontend/src/app/schemes/page.tsx
├─ Save file
├─ Refresh browser
├─ Expected: New changes visible
└─ Actual: Old cached version shown!

Why? The .next folder has cached the old compiled version
Solution: Delete .next folder and rebuild
```

#### 2. **Backend Cache (Redis)**

```
What it is:
├─ Cached API responses
├─ User sessions
├─ Temporary data
└─ Rate limit counters

Why it causes problems:
├─ Stale data served
├─ Memory leaks if not cleared
├─ Inconsistent state
└─ Old responses returned
```

**Example of Backend Cache Problem:**
```
Scenario: You update schemes.json
├─ Edit: data/schemes.json
├─ Save file
├─ API call to /api/schemes
├─ Expected: New schemes returned
└─ Actual: Old cached schemes returned!

Why? Redis cached the old response
Solution: Clear Redis cache or restart backend
```

#### 3. **Browser Cache**

```
What it is:
├─ Cached HTML pages
├─ Cached CSS/JavaScript
├─ Cached images
└─ Cached API responses

Why it causes problems:
├─ Old page version shown
├─ Styles not updating
├─ API responses outdated
└─ Changes not visible
```

---

## Part 2: Why Frontend Cache Gets Corrupted

### Reason 1: Incomplete Build

```
Scenario: Build interrupted
├─ npm run dev starts
├─ Compilation begins
├─ Process killed (Ctrl+C)
├─ .next folder partially written
└─ Result: Corrupted cache

Fix: Delete .next and rebuild
```

### Reason 2: Dependency Issues

```
Scenario: Package versions conflict
├─ node_modules has old versions
├─ .next compiled with old versions
├─ npm install updates packages
├─ .next now incompatible
└─ Result: Build errors

Fix: Delete .next and node_modules, reinstall
```

### Reason 3: Disk Space Issues

```
Scenario: Low disk space
├─ .next folder being written
├─ Disk runs out of space
├─ Write operation fails
├─ .next folder corrupted
└─ Result: Broken cache

Fix: Free disk space, delete .next, rebuild
```

### Reason 4: TypeScript Errors

```
Scenario: Code has errors
├─ TypeScript compilation fails
├─ .next folder not fully built
├─ Old cache remains
├─ Next.js serves old version
└─ Result: Stale pages shown

Fix: Fix TypeScript errors, delete .next, rebuild
```

---

## Part 3: Redis - How It Works

### What is Redis?

Redis is an **in-memory data store** (like a super-fast temporary database):

```
Regular Database:
├─ Stored on disk
├─ Slower to access
├─ Persistent (survives restart)
└─ Large capacity

Redis:
├─ Stored in RAM (memory)
├─ Very fast access
├─ Lost on restart
└─ Limited capacity
```

### How Redis Works in This Project

```
Request Flow WITH Redis:
1. User sends message
2. Backend checks Redis cache
3. If found → Return cached response (fast!)
4. If not found → Call Gemini API
5. Store response in Redis
6. Return response to user

Request Flow WITHOUT Redis:
1. User sends message
2. Backend calls Gemini API
3. Return response to user
(No caching, slower)
```

---

## Part 4: Why Redis Wasn't Working Before

### Problem 1: Redis Not Installed

```
Configuration in .env:
REDIS_HOST=your-redis-endpoint.cache.amazonaws.com  ← Not real!
REDIS_PORT=6379
REDIS_TLS_ENABLED=true

What happened:
├─ Backend tried to connect to AWS
├─ AWS endpoint doesn't exist
├─ Connection failed
├─ Backend continued without Redis
└─ Result: Errors in logs but app works
```

### Problem 2: Wrong Configuration

```
For AWS ElastiCache:
REDIS_HOST=sahayak-redis.abc123.ng.0001.aps1.cache.amazonaws.com
REDIS_PASSWORD=your-auth-token
REDIS_TLS_ENABLED=true

For Local Redis:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TLS_ENABLED=false
REDIS_PASSWORD=  (empty)
```

### Problem 3: Redis Not Running

```
Even if configured correctly:
├─ If Redis service not started
├─ Connection refused error
├─ Backend continues without caching
└─ Result: No errors, but no caching
```

---

## Part 5: Now That You Installed Redis Locally

### How to Verify Redis is Running

#### On Windows (if using Docker):

```bash
# Check if Docker container is running
docker ps

# Should show redis container
# Example output:
# CONTAINER ID   IMAGE     COMMAND                  STATUS
# abc123def456   redis     "redis-server"           Up 2 hours
```

#### Test Redis Connection:

```bash
# Connect to Redis
redis-cli

# Should show:
# 127.0.0.1:6379>

# Test with PING command
PING

# Should return:
# PONG
```

### Update .env for Local Redis

```env
# Change from AWS to local
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TLS_ENABLED=false
REDIS_PASSWORD=  # Leave empty
```

### Restart Backend

```bash
cd backend
npm run dev
```

### Check Backend Logs

```
Expected output:
✓ Redis client connected
✓ Redis client ready

If you see this, Redis is working!
```

---

## Part 6: How to Know If Redis is Working

### Check 1: Backend Logs

```
✓ Redis client connected
✓ Redis client ready
```

**Means**: Redis is working!

```
✗ Redis client error: ECONNREFUSED
```

**Means**: Redis not running or wrong configuration

### Check 2: Test Redis Directly

```bash
# Connect to Redis
redis-cli

# Check if data is stored
KEYS *

# Should show cached keys
# Example: ["chat:hello:en", "schemes:list"]
```

### Check 3: Monitor Performance

```
With Redis:
├─ First request: 2 seconds (calls API)
├─ Second request: 0.1 seconds (from cache)
└─ Third request: 0.1 seconds (from cache)

Without Redis:
├─ First request: 2 seconds (calls API)
├─ Second request: 2 seconds (calls API again)
└─ Third request: 2 seconds (calls API again)
```

---

## Part 7: Frontend Cache - How to Fix

### Problem: Frontend Shows "Loading" Forever

**Cause**: Corrupted .next cache

**Solution**:

```bash
# Step 1: Stop frontend
# Press Ctrl+C in frontend terminal

# Step 2: Delete cache
cd frontend
rm -rf .next
rm -rf node_modules/.cache

# Step 3: Restart
npm run dev
```

### Problem: Changes Not Appearing

**Cause**: Old code cached in .next

**Solution**:

```bash
# Clear cache and restart
rm -rf frontend/.next
npm run dev
```

### Problem: Slow Startup

**Cause**: Large cache folder

**Solution**:

```bash
# Delete and rebuild
rm -rf frontend/.next
npm run dev
```

---

## Part 8: Backend Cache (Redis) - How to Clear

### Clear All Redis Cache

```bash
# Connect to Redis
redis-cli

# Clear all data
FLUSHALL

# Verify it's empty
KEYS *

# Should return: (empty list or set)
```

### Clear Specific Cache Key

```bash
# Connect to Redis
redis-cli

# Delete specific key
DEL chat:hello:en

# Or delete pattern
DEL chat:*
```

### Restart Redis

```bash
# If using Docker
docker restart redis

# If using local installation
redis-cli shutdown
redis-server
```

---

## Part 9: Caching Strategy for This Project

### Current Caching

```
Frontend Cache (.next):
├─ Compiled pages
├─ JavaScript bundles
├─ Static assets
└─ Cleared on rebuild

Backend Cache (Redis):
├─ API responses
├─ User sessions
├─ Rate limit counters
└─ Cleared on restart
```

### What Gets Cached

```
✓ Scheme list responses
✓ Service center data
✓ User sessions
✓ Chat responses (optional)

✗ Real-time data (not cached)
✗ User-specific data (not cached)
```

### Cache Duration

```
Schemes: 24 hours (86400 seconds)
Sessions: 1 hour (3600 seconds)
Responses: 1 hour (3600 seconds)
```

---

## Part 10: Troubleshooting Guide

### Issue: Frontend Stuck on Loading

```
Symptoms:
├─ Page shows loading spinner forever
├─ No content appears
└─ Browser console has errors

Solution:
1. Clear cache: rm -rf frontend/.next
2. Restart: npm run dev
3. Hard refresh: Ctrl+F5
4. Clear browser cache: Ctrl+Shift+Delete
```

### Issue: Redis Connection Error

```
Symptoms:
├─ Backend logs show: "Redis client error"
├─ Connection refused
└─ But app still works

Solution:
1. Check Redis running: redis-cli ping
2. Verify .env: REDIS_HOST=localhost
3. Restart backend: npm run dev
```

### Issue: Stale Data Shown

```
Symptoms:
├─ Updated data not appearing
├─ Old responses returned
└─ Changes not visible

Solution:
1. Clear Redis: redis-cli FLUSHALL
2. Restart backend: npm run dev
3. Hard refresh browser: Ctrl+F5
```

### Issue: Slow Performance

```
Symptoms:
├─ Pages load slowly
├─ API calls take long
└─ Repeated requests slow

Solution:
1. Verify Redis running: redis-cli ping
2. Check cache: redis-cli KEYS *
3. Monitor: redis-cli MONITOR
```

---

## Summary

### Frontend Cache (.next)
```
What: Compiled Next.js pages
Why problems: Corruption, old code, incomplete builds
Fix: Delete .next folder and rebuild
```

### Backend Cache (Redis)
```
What: In-memory data store
Why problems: Not running, wrong config, stale data
Fix: Start Redis, update .env, clear cache
```

### How to Know It's Working

```
Frontend Cache:
✓ Pages load fast
✓ Changes appear immediately
✓ No "loading" spinner

Backend Cache (Redis):
✓ Backend logs show "Redis client connected"
✓ Repeated requests are faster
✓ redis-cli PING returns PONG
```

---

## Quick Reference

### Clear Frontend Cache
```bash
rm -rf frontend/.next
npm run dev
```

### Clear Backend Cache
```bash
redis-cli FLUSHALL
npm run dev
```

### Check Redis Status
```bash
redis-cli ping
# Should return: PONG
```

### Verify Configuration
```bash
# Check .env
cat .env | grep REDIS
```

---

**Status**: Caching explained, Redis working locally
**Next**: Verify Redis is running and configured correctly

# Sahayak AI - Render Deployment Guide

## Current Status
✅ Your backend is LIVE at: https://sahayak-ai-mvny.onrender.com
⚠️ Redis connection errors are expected (Redis is optional for MVP)

## What's Working
- Backend server is running successfully
- All API endpoints are available
- AI routing system is active
- The app will work without Redis (just no caching)

## Quick Fix for Redis Errors

The Redis connection errors you're seeing are harmless. I've updated the code to:
1. Make Redis completely optional
2. Stop retry attempts (no more spam logs)
3. Gracefully handle missing Redis

## Deploy the Fix

Push the updated code to trigger a new deployment:

```bash
git add .
git commit -m "Make Redis optional for Render deployment"
git push origin main
```

Render will automatically redeploy with the fix.

## Environment Variables on Render

Go to your Render dashboard and set these environment variables:

### Required
- `NODE_ENV` = `production`
- `PORT` = `3001`
- `AI_PROVIDER` = `router`
- `GEMINI_API_KEY` = your_gemini_key
- `GROQ_API_KEY` = your_groq_key (optional fallback)

### Optional (for better performance)
- `SARVAM_API_KEY` = your_sarvam_key
- `OPENAI_API_KEY` = your_openai_key

## Testing Your Deployment

Once redeployed, test the API:

```bash
# Health check
curl https://sahayak-ai-mvny.onrender.com/health

# Chat endpoint
curl -X POST https://sahayak-ai-mvny.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "en"}'

# Schemes endpoint
curl https://sahayak-ai-mvny.onrender.com/api/schemes
```

## Adding Redis (Optional - for Production)

If you want caching for better performance:

1. Go to Render Dashboard
2. Create a new Redis instance (free tier available)
3. Copy the connection details
4. Add environment variables:
   - `REDIS_HOST` = your-redis-host
   - `REDIS_PORT` = 6379
   - `REDIS_PASSWORD` = your-redis-password
   - `REDIS_TLS_ENABLED` = true

## Frontend Deployment

Deploy your frontend separately on Vercel/Netlify:

```bash
# Update frontend API URL
NEXT_PUBLIC_API_URL=https://sahayak-ai-mvny.onrender.com
```

## Troubleshooting

### "Cannot GET /"
This is expected - the backend is an API server, not a website. Use the `/api/*` endpoints.

### Redis errors
After the fix is deployed, you'll see:
- ✅ "⚠ Redis not available - running without cache" (one time)
- ❌ No more repeated connection errors

### API not responding
- Check Render logs for errors
- Verify environment variables are set
- Ensure your API keys are valid

## Next Steps

1. Push the Redis fix
2. Wait for Render to redeploy (~2 minutes)
3. Test the API endpoints
4. Deploy frontend with the backend URL
5. (Optional) Add Redis for caching

Your app is already live and working - the Redis errors are just noise!

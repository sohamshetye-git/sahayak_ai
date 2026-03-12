# Vercel Environment Variables Setup

## Frontend Project: sahayak-two

Add these environment variables in Vercel Dashboard:

### Variable 1:
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://sahayak-ai-backend.vercel.app`
- **Environment**: Production, Preview, Development (check all)

### Variable 2:
- **Name**: `NEXT_PUBLIC_FALLBACK_API_URL`
- **Value**: `https://sahayak-ai-mvny.onrender.com`
- **Environment**: Production, Preview, Development (check all)

### Variable 3:
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Production only

## Steps in Vercel Dashboard:

1. Go to vercel.com → Your Projects
2. Click on "sahayak-two" project
3. Go to Settings → Environment Variables
4. Click "Add New" for each variable above
5. After adding all variables, click "Redeploy" to apply changes

## Verification:

After redeployment, visit https://sahayak-two.vercel.app and:
1. Check the backend status indicator (bottom-right corner)
2. It should show "Vercel" as primary backend
3. Test the chat functionality to ensure API calls work

## Troubleshooting:

If the backend doesn't work:
1. Check if both backend URLs are accessible
2. Verify environment variables are set correctly
3. Check browser console for any CORS errors
4. Use the backend status indicator to see which backend is active
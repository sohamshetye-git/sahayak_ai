# Troubleshooting Guide

## Chat Not Working

### Issue: Chat returns error or doesn't respond

**Symptoms:**
- Chat interface loads but messages don't get responses
- Error messages in browser console
- Backend shows "Cannot read properties of undefined" error

**Root Cause:**
The Gemini API key is not properly configured in the `.env` file.

**Solution:**

1. **Get a Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key (starts with `AIzaSy...`)

2. **Update .env file:**
   ```bash
   # Open .env file in your editor
   # Find this line:
   GEMINI_API_KEY=AIzaSyDummyKeyPleaseReplaceWithYourActualKey
   
   # Replace with your actual key:
   GEMINI_API_KEY=AIzaSyC_your_actual_key_here
   ```

3. **Restart the backend server:**
   ```bash
   # Stop the backend (Ctrl+C in the terminal running it)
   # Then restart:
   cd backend
   npm run dev
   ```

4. **Verify the fix:**
   ```bash
   # Run the setup check script:
   node check-setup.js
   ```

5. **Test the chat:**
   - Open http://localhost:3002 in your browser
   - Navigate to the chat page
   - Send a test message like "Hello"
   - You should get a response from the AI

---

## Backend Server Issues

### Issue: Backend won't start

**Check:**
```bash
cd backend
npm install  # Make sure dependencies are installed
npm run dev
```

**Common errors:**
- Port 3001 already in use → Change PORT in .env or kill the process using that port
- TypeScript errors → Run `npm install` to ensure all dependencies are installed

---

## Frontend Issues

### Issue: Frontend won't start

**Check:**
```bash
cd frontend
npm install  # Make sure dependencies are installed
npm run dev
```

**Common errors:**
- Port 3000 in use → Next.js will automatically try 3001, 3002, etc.
- Build errors → Delete `.next` folder and restart

---

## API Connection Issues

### Issue: Frontend can't connect to backend

**Check .env file:**
```bash
# Make sure these match:
API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Check backend is running:**
```bash
# Test the health endpoint:
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":...}
```

**Check CORS:**
- Backend has CORS enabled by default for local development
- If you're running on different ports, make sure NEXT_PUBLIC_API_URL points to the correct backend port

---

## Validation Script

Run this anytime to check your setup:

```bash
node check-setup.js
```

This will verify:
- ✅ .env file exists
- ✅ Gemini API key is configured
- ✅ API URLs are set correctly
- ✅ All required environment variables are present

---

## Quick Test

Test the chat endpoint directly:

```bash
node test-chat.js
```

This will send a test message to the backend and show the response.

**Expected output:**
```json
{
  "sessionId": "...",
  "response": "...",
  "timestamp": 1234567890
}
```

**Error output means:**
- Status 500 + "Cannot read properties" → API key issue
- Status 400 → Request format issue
- Connection refused → Backend not running

---

## Still Having Issues?

1. **Check backend logs:**
   - Look at the terminal where backend is running
   - Check for error messages

2. **Check browser console:**
   - Open DevTools (F12)
   - Look at Console tab for errors
   - Check Network tab to see API requests

3. **Verify environment:**
   ```bash
   # Backend should show:
   ✓ Local server running on http://localhost:3001
   
   # Frontend should show:
   ▲ Next.js 14.0.4
   - Local: http://localhost:3002
   ✓ Ready in X.Xs
   ```

4. **Clean restart:**
   ```bash
   # Stop both servers (Ctrl+C)
   
   # Backend:
   cd backend
   rm -rf node_modules
   npm install
   npm run dev
   
   # Frontend (in new terminal):
   cd frontend
   rm -rf node_modules .next
   npm install
   npm run dev
   ```

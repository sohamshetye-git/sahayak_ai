# Complete Project Recovery - Get Everything Working

## The Problem
Frontend won't load after our changes. Let's fix it completely.

## Step-by-Step Recovery

### Step 1: Stop Everything
Press `Ctrl+C` in both terminals (frontend and backend)

### Step 2: Clean Frontend Completely
```powershell
# Remove all caches and build artifacts
Remove-Item -Path "frontend\.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "frontend\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "frontend\.turbo" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 3: Reinstall Frontend Dependencies
```powershell
cd frontend
npm install
```

### Step 4: Start Backend First
```powershell
# In terminal 1
cd backend
npm run dev
```

Wait for:
```
✓ Redis client connected
✓ Redis client ready
Server running on http://localhost:3001
```

### Step 5: Start Frontend
```powershell
# In terminal 2
cd frontend
npm run dev
```

Wait for:
```
✓ Ready on http://localhost:3000
```

### Step 6: Test Home Page First
Open: http://localhost:3000/

If home page loads, the frontend is working!

### Step 7: Test Other Pages
- http://localhost:3000/schemes
- http://localhost:3000/chat

---

## If Frontend Still Won't Start

### Option A: Check Node Version
```powershell
node --version
```

Should be v18 or higher. If not, update Node.js.

### Option B: Check Port 3000
```powershell
netstat -ano | findstr :3000
```

If something is using port 3000, kill it or use different port:
```powershell
$env:PORT=3001
npm run dev
```

### Option C: Try Production Build
```powershell
cd frontend
npm run build
```

If build succeeds:
```powershell
npm start
```

If build fails, you'll see the actual error!

---

## If You See Actual Errors

### Error: "Cannot find module..."
```powershell
cd frontend
Remove-Item -Path "node_modules" -Recurse -Force
npm install
```

### Error: "Syntax error..."
The error will show which file and line. Share that with me.

### Error: "Port already in use"
```powershell
# Kill process on port 3000
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
npm run dev
```

---

## Nuclear Option: Fresh Start

If nothing works, let's start completely fresh:

### 1. Backup .env file
```powershell
Copy-Item .env .env.backup
```

### 2. Clean Everything
```powershell
Remove-Item -Path "frontend\node_modules" -Recurse -Force
Remove-Item -Path "frontend\.next" -Recurse -Force
Remove-Item -Path "backend\node_modules" -Recurse -Force
Remove-Item -Path "backend\dist" -Recurse -Force
```

### 3. Reinstall Everything
```powershell
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

---

## What to Share If Still Broken

If it still doesn't work, share:

1. **Frontend terminal output** (copy the error messages)
2. **Backend terminal output** (any errors?)
3. **Node version**: `node --version`
4. **NPM version**: `npm --version`

---

## Quick Test Commands

### Test Backend is Working:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/schemes?limit=1"
```

Should return scheme data.

### Test Frontend Build:
```powershell
cd frontend
npm run build
```

Should complete without errors.

---

## Expected Working State

### Backend Terminal:
```
✓ Redis client connected: localhost:6379
✓ Redis client ready
AI Provider Config: { primaryType: 'sarvam', ... }
Server running on http://localhost:3001
```

### Frontend Terminal:
```
✓ Compiled successfully
✓ Ready on http://localhost:3000
```

### Browser:
- http://localhost:3000/ → Home page loads
- http://localhost:3000/schemes → Schemes page loads
- http://localhost:3000/chat → Chat page loads

---

## The AI Context Fix

Don't worry - the AI context awareness fix is still in the code:
- `backend/src/core/conversation-orchestrator.ts` - Profile context passing
- `backend/src/ai/base-provider.ts` - Enhanced system prompt
- `backend/src/ai/sarvam-provider.ts` - Public buildSystemPrompt

Once frontend loads, the fix will work!

---

## Start Here

1. Stop both servers (Ctrl+C)
2. Run: `Remove-Item -Path "frontend\.next" -Recurse -Force`
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`
5. Open: http://localhost:3000/

If this doesn't work, try the production build or share the error messages!

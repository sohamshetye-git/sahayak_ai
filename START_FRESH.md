# Start Fresh - Simple Recovery

## The Simplest Solution

Let's get your project working in 3 commands:

### Command 1: Clean Frontend
```powershell
Remove-Item -Path "frontend\.next" -Recurse -Force
```

### Command 2: Start Backend
```powershell
cd backend
npm run dev
```

Keep this terminal open. You should see:
```
✓ Redis client ready
Server running on http://localhost:3001
```

### Command 3: Start Frontend (New Terminal)
```powershell
cd frontend
npm run dev
```

Wait for:
```
✓ Ready on http://localhost:3000
```

### Command 4: Open Browser
Go to: **http://localhost:3000/**

---

## If That Doesn't Work

### Try Production Mode Instead:
```powershell
# Stop frontend (Ctrl+C)
cd frontend
npm run build
npm start
```

Production mode is more stable than dev mode.

---

## Still Not Working?

Run this automated fix script:
```powershell
.\fix-frontend.ps1
```

Or do manual recovery:

### 1. Check What's Running
```powershell
# Check backend
Invoke-RestMethod -Uri "http://localhost:3001/schemes?limit=1"
```

If this works → Backend is fine!

### 2. Check Frontend Error
```powershell
cd frontend
npm run build
```

This will show the actual error if there is one.

### 3. Share the Error
Copy the error message and I'll help fix it specifically.

---

## Most Common Issues

### Issue 1: "Port already in use"
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Issue 2: "Cannot find module"
```powershell
cd frontend
npm install
```

### Issue 3: Node version too old
```powershell
node --version
# Should be v18+
# If not, download from nodejs.org
```

---

## The Bottom Line

The AI context awareness fix is complete in the backend. The frontend issue is just a Next.js compilation problem that we can solve.

**Try these 3 commands first:**
1. `Remove-Item -Path "frontend\.next" -Recurse -Force`
2. `cd backend && npm run dev`
3. `cd frontend && npm run dev` (in new terminal)

If you see errors, share them and I'll help fix them specifically!

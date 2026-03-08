# Fix Frontend Error - Step by Step

## The Issue
"Missing required error components, refreshing..." keeps looping.

## Solution: Complete Frontend Restart

### Step 1: Stop Frontend Server
In the frontend terminal, press `Ctrl+C` to stop the server.

### Step 2: Clear All Caches
Run these commands in PowerShell:
```powershell
Remove-Item -Path "frontend\.next" -Recurse -Force
Remove-Item -Path "frontend\node_modules\.cache" -Recurse -Force
```

### Step 3: Restart Frontend
```powershell
cd frontend
npm run dev
```

### Step 4: Wait for Compilation
Look for this message:
```
✓ Compiled /chat in XXXms
✓ Ready on http://localhost:3000
```

### Step 5: Try Different Page First
Instead of going to `/chat`, try:
- http://localhost:3000/ (home page)
- http://localhost:3000/schemes (schemes page)

If these load, then go to:
- http://localhost:3000/chat

---

## Alternative: Try Production Build

If dev mode keeps failing, try production build:

```powershell
cd frontend
npm run build
npm start
```

This will:
1. Build the app for production
2. Start production server on port 3000
3. Bypass dev mode issues

---

## If Still Not Working

### Option 1: Check for Port Conflicts
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# If something else is using it, kill that process or use different port:
$env:PORT=3001; npm run dev
```

### Option 2: Reinstall Dependencies
```powershell
cd frontend
Remove-Item -Path "node_modules" -Recurse -Force
npm install
npm run dev
```

### Option 3: Check Node Version
```powershell
node --version
# Should be v18 or higher
```

If lower than v18:
- Download from https://nodejs.org/
- Install latest LTS version
- Restart terminal
- Try again

---

## Quick Test Without Frontend

You can test the backend directly while frontend is being fixed:

### Test Backend API:
```powershell
# Test chat endpoint
$body = @{
    message = "I want schemes"
    language = "en"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/chat" -Method Post -Body $body -ContentType "application/json"
```

Expected response:
```json
{
  "sessionId": "...",
  "response": "May I know your age?",
  "userProfile": {...},
  ...
}
```

If this works, backend is fine - just frontend needs fixing.

---

## Nuclear Option: Fresh Frontend Start

If nothing works, create a minimal test page:

### Create `frontend/test.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Chat</title>
</head>
<body>
    <h1>Chat Test</h1>
    <input type="text" id="message" placeholder="Type message">
    <button onclick="sendMessage()">Send</button>
    <div id="response"></div>

    <script>
        async function sendMessage() {
            const message = document.getElementById('message').value;
            const response = await fetch('http://localhost:3001/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message, language: 'en'})
            });
            const data = await response.json();
            document.getElementById('response').innerHTML = 
                '<p><strong>AI:</strong> ' + data.response + '</p>';
        }
    </script>
</body>
</html>
```

Open `frontend/test.html` in browser to test backend directly.

---

## What I Recommend

1. **Stop frontend** (Ctrl+C)
2. **Clear caches** (commands above)
3. **Try home page first**: http://localhost:3000/
4. **If home works**, then go to `/chat`
5. **If nothing works**, try production build: `npm run build && npm start`

The backend is working fine - this is just a Next.js dev mode issue.

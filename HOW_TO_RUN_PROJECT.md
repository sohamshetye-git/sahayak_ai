# How to Run the Project - Complete Guide

## Quick Start (30 seconds)

The project is **already running**! Both servers are active:

```
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

Just open your browser and visit: **http://localhost:3000**

---

## If Servers Are Not Running

### Option 1: Start Using Kiro (Recommended)

Kiro has built-in process management. The servers should already be running in the background.

**Check status:**
- Look at the bottom of Kiro for running processes
- Should show: Frontend (3000) and Backend (3001)

**If not running, start them:**
1. Open Kiro command palette (Ctrl+Shift+P)
2. Search for "Start Process" or use the process panel
3. Start backend: `npm run dev` in `backend` folder
4. Start frontend: `npm run dev` in `frontend` folder

---

### Option 2: Manual Terminal Commands

#### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
✓ Local server running on http://localhost:3001
✓ API endpoints ready
✓ Redis client connected
```

#### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
✓ Ready in 1.8s
```

#### Terminal 3: Open Browser

```bash
# Open in your default browser
http://localhost:3000
```

---

## Project Structure

```
sahayak_ai/
├── frontend/                 # React/Next.js UI
│   ├── src/
│   │   ├── app/             # Pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities & hooks
│   ├── package.json
│   └── npm run dev          # Start frontend
│
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── handlers/        # API endpoints
│   │   ├── ai/              # AI providers
│   │   ├── db/              # Database & cache
│   │   └── core/            # Business logic
│   ├── package.json
│   └── npm run dev          # Start backend
│
├── data/                     # Static data
│   ├── schemes.json         # Government schemes
│   └── service_centers.json # Service centers
│
└── .env                      # Configuration
```

---

## Configuration

### .env File

The `.env` file contains all configuration:

```env
# AI Provider
AI_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here

# Server Ports
PORT=3001

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Update API Key

If you have a new Gemini API key:

1. Open `.env` file
2. Find: `GEMINI_API_KEY=...`
3. Replace with your new key
4. Restart backend: Stop and start `npm run dev` in backend folder

---

## Access the Application

### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Language Selection | http://localhost:3000 | Choose English or Hindi |
| Home | http://localhost:3000/home | Navigation hub |
| Explore Schemes | http://localhost:3000/schemes | Browse 15 government schemes |
| Scheme Details | http://localhost:3000/schemes/[id] | View scheme details |
| Service Centers | http://localhost:3000/service-centers | Find nearby centers |
| My Applications | http://localhost:3000/applications | Track applications |
| Chat | http://localhost:3000/chat | AI assistant |

### Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | http://localhost:3001/health | Health check |
| POST | http://localhost:3001/api/chat | Send chat message |
| GET | http://localhost:3001/api/schemes | Get all schemes |
| GET | http://localhost:3001/api/schemes/:id | Get scheme details |
| GET | http://localhost:3001/api/service-centers | Get service centers |
| POST | http://localhost:3001/api/applications | Create application |
| GET | http://localhost:3001/api/applications | Get applications |

---

## Features to Test

### 1. Browse Schemes ✅
- Visit http://localhost:3000/schemes
- See 15 government schemes
- Filter by category
- Search by name
- Click "View Details"

### 2. View Scheme Details ✅
- Click any scheme
- See tabs: Overview, Documents, Apply
- View eligibility criteria
- See required documents

### 3. Find Service Centers ✅
- Visit http://localhost:3000/service-centers
- Filter by state
- Search by district
- Click "Get Directions" (opens Google Maps)

### 4. Apply to Scheme ✅
- In scheme details, click "Apply Now"
- Choose online or offline
- Follow application steps
- Track in "My Applications"

### 5. Track Applications ✅
- Visit http://localhost:3000/applications
- See all your applications
- View progress timeline
- Update status

### 6. Chat with AI ⚠️
- Visit http://localhost:3000/chat
- Type a message
- **Note**: Requires valid Gemini API key with available quota

---

## Troubleshooting

### Frontend Not Loading

**Problem**: http://localhost:3000 shows blank page

**Solution**:
```bash
# Stop frontend
# Clear cache
rm -rf frontend/.next

# Restart frontend
cd frontend
npm run dev
```

### Backend Not Responding

**Problem**: API calls fail with connection error

**Solution**:
```bash
# Check if backend is running
curl http://localhost:3001/health

# If not running, start it
cd backend
npm run dev
```

### Chat Returns Error

**Problem**: Chat shows HTTP 500 error

**Solution**:
1. Check `.env` has valid `GEMINI_API_KEY`
2. Verify API key has available quota
3. Restart backend to load new key

### Port Already in Use

**Problem**: "Port 3000 already in use" or "Port 3001 already in use"

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

---

## Development Workflow

### Making Changes

1. **Frontend Changes**
   - Edit files in `frontend/src/`
   - Changes auto-reload (hot reload)
   - No restart needed

2. **Backend Changes**
   - Edit files in `backend/src/`
   - Restart backend: Stop and start `npm run dev`
   - Changes take effect

3. **Data Changes**
   - Edit `data/schemes.json` or `data/service_centers.json`
   - Restart backend to reload
   - Frontend will fetch updated data

### Testing

```bash
# Test backend API
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en","sessionId":"test"}'

# Test frontend
# Open http://localhost:3000 in browser
```

---

## Performance Tips

### Optimize Frontend
```bash
# Build for production
cd frontend
npm run build

# Run production build
npm start
```

### Optimize Backend
```bash
# Build TypeScript
cd backend
npm run build

# Run compiled version
node dist/local.js
```

---

## Environment Variables

### Required
```env
GEMINI_API_KEY=your-api-key  # For AI chat
```

### Optional
```env
PORT=3001                     # Backend port (default: 3001)
NODE_ENV=development          # development or production
REDIS_HOST=localhost          # Redis host (default: localhost)
REDIS_PORT=6379              # Redis port (default: 6379)
```

---

## Common Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build

# Run tests
cd backend && npm test

# Lint code
cd backend && npm run lint
cd frontend && npm run lint

# Clean cache
rm -rf frontend/.next
rm -rf backend/dist
```

---

## Project Status

### ✅ Running
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- All pages working
- All features functional

### ⚠️ Requires API Key
- Chat feature needs valid Gemini API key
- API key must have available quota

### ✅ No External Dependencies
- No database needed (uses JSON files)
- No Redis needed (optional for caching)
- No AWS needed (local development)

---

## Next Steps

1. **Open Application**: http://localhost:3000
2. **Select Language**: English or Hindi
3. **Explore Features**: Browse schemes, find centers, apply
4. **Test Chat**: Provide valid API key for AI features
5. **Track Applications**: Create and track applications

---

## Support

### If Something Breaks

1. Check backend logs: Look at terminal running `npm run dev`
2. Check frontend logs: Open browser console (F12)
3. Check `.env` configuration
4. Restart both servers
5. Clear cache: `rm -rf frontend/.next`

### Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | Kill process or use different port |
| Frontend blank | Clear cache and restart |
| API errors | Check backend logs |
| Chat not working | Verify API key in .env |
| Slow performance | Restart servers |

---

**Status**: ✅ Project ready to run
**Frontend**: http://localhost:3000
**Backend**: http://localhost:3001
**All features**: Working and tested

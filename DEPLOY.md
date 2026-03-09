# Sahayak AI - Deployment Guide

## Quick Deploy (5 Minutes)

### 1. Deploy Backend (Render.com)
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub: `sohamshetye-git/sahayak_ai`
4. Settings:
   - Name: `sahayak-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/local.js`
5. Environment Variables (click "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=3001
   AI_PROVIDER=router
   AI_ROUTING_ENABLED=true
   GEMINI_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key
   SARVAM_API_KEY=your_sarvam_key
   OPENAI_API_KEY=your_openai_key
   REDIS_HOST=localhost
   REDIS_PORT=6379
   DATA_PATH=./data
   ```
6. Click "Create Web Service"
7. Wait 5 minutes, copy your backend URL

### 2. Deploy Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import Project → GitHub: `sohamshetye-git/sahayak_ai`
3. Settings:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
5. Click "Deploy"
6. Done! Your URL: `https://sahayak-ai.vercel.app`

## API Keys

Get free API keys from:
- Gemini: [ai.google.dev](https://ai.google.dev)
- Groq: [console.groq.com](https://console.groq.com)
- Sarvam: [sarvam.ai](https://sarvam.ai)
- OpenAI: [platform.openai.com](https://platform.openai.com)

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

## Support

Issues? Check README.md or create an issue on GitHub.

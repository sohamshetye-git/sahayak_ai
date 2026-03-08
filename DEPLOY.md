# Quick Deployment Guide

## GitHub Upload + Vercel Deployment

### Step 1: Upload to GitHub

Run this command:
```powershell
.\deploy-github-vercel.ps1
```

This will:
- Initialize Git repository
- Add all files
- Commit with "Initial MVP commit"
- Push to https://github.com/sohamshetye-git/sahayak-ai

### Step 2: Deploy on Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `sahayak-ai` repository
5. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add Environment Variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `http://localhost:3001`
7. Click "Deploy"
8. Wait 2-3 minutes
9. Get your live URL: `https://sahayak-ai.vercel.app`

### Step 3: Update Later

To update your deployed site:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically rebuild and deploy!

## Notes

- Frontend will be live and publicly accessible
- Backend features (chat, recommendations) won't work until backend is deployed
- This is perfect for MVP demo/submission

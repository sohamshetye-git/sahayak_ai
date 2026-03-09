# 🎯 Deploy to Vercel NOW - Simple Steps

## ✅ Everything is Ready!

Your code is on GitHub and configured correctly. Just follow these 5 steps:

---

## Step 1: Go to Vercel
Open: https://vercel.com/new

Login with your GitHub account if needed.

---

## Step 2: Import Repository

1. Click "Import Git Repository"
2. Find and select: `sahayak-ai`
3. Click "Import"

---

## Step 3: Configure (MOST IMPORTANT!)

You'll see a configuration screen. Set these:

### Root Directory
```
frontend
```
⚠️ **CRITICAL**: Click "Edit" next to Root Directory and type `frontend`

### Framework Preset
```
Next.js
```
✅ Should auto-detect

### Environment Variables
Click "Add" and enter:
```
Name:  NEXT_PUBLIC_API_URL
Value: http://localhost:3001
```

---

## Step 4: Deploy

Click the big blue "Deploy" button.

Wait 2-3 minutes.

---

## Step 5: Get Your Live URL

After build completes, you'll get a URL like:
```
https://sahayak-ai.vercel.app
```

Click it to see your live site!

---

## ✅ What to Expect

### Build will show:
- Installing dependencies
- Compiling Next.js
- Generating pages
- ✓ Build completed successfully

### Your live site will have:
- Language selection page
- Home page with all features
- Chat interface (UI only, backend not connected yet)
- Schemes page
- Applications page
- Service centers page

---

## 🚨 If You See an Error

### "cd: frontend: No such file or directory"
You forgot to set Root Directory to `frontend`. Go back and fix it.

### Other errors
Check the build logs in Vercel dashboard. Usually it's a missing dependency or configuration issue.

---

## 📱 After Deployment

### Test your site:
1. Visit the Vercel URL
2. Try changing language
3. Navigate through pages
4. Check mobile view

### Update later:
```powershell
git add .
git commit -m "Your changes"
git push
```
Vercel will auto-deploy!

---

## 🎉 That's It!

Your frontend will be live and publicly accessible. Perfect for MVP submission!

Backend deployment comes later when you're ready.

---

**Go to https://vercel.com/new and start! 🚀**

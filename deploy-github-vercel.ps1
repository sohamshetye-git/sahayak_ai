# Sahayak AI - GitHub & Vercel Deployment Script
# This script uploads project to GitHub and provides Vercel deployment instructions

$ErrorActionPreference = "Stop"

Write-Host "🚀 Sahayak AI - GitHub & Vercel Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$GitHubRepo = "https://github.com/sohamshetye-git/sahayak-ai"
$GitHubUsername = "sohamshetye-git"
$ProjectPath = "C:\projects\sahayak_ai"

# Step 1: Check if Git is installed
Write-Host "📋 Step 1: Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win"
    exit 1
}

# Step 2: Initialize Git repository
Write-Host ""
Write-Host "📦 Step 2: Initializing Git repository..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Step 3: Configure Git user (if not configured)
Write-Host ""
Write-Host "👤 Step 3: Configuring Git user..." -ForegroundColor Yellow

$gitUserName = git config user.name 2>$null
$gitUserEmail = git config user.email 2>$null

if (-not $gitUserName) {
    Write-Host "Setting Git username..."
    git config user.name "$GitHubUsername"
}

if (-not $gitUserEmail) {
    Write-Host "Setting Git email..."
    $email = Read-Host "Enter your GitHub email"
    git config user.email "$email"
}

Write-Host "✅ Git user configured" -ForegroundColor Green

# Step 4: Add all files
Write-Host ""
Write-Host "📁 Step 4: Adding files to Git..." -ForegroundColor Yellow

git add .
Write-Host "✅ Files added to staging" -ForegroundColor Green

# Step 5: Create initial commit
Write-Host ""
Write-Host "💾 Step 5: Creating initial commit..." -ForegroundColor Yellow

try {
    git commit -m "Initial MVP commit - Sahayak AI"
    Write-Host "✅ Initial commit created" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Commit may already exist or no changes to commit" -ForegroundColor Yellow
}

# Step 6: Add remote repository
Write-Host ""
Write-Host "🔗 Step 6: Connecting to GitHub repository..." -ForegroundColor Yellow

$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $response = Read-Host "Update remote URL? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        git remote set-url origin $GitHubRepo
        Write-Host "✅ Remote URL updated" -ForegroundColor Green
    }
} else {
    git remote add origin $GitHubRepo
    Write-Host "✅ Remote repository connected" -ForegroundColor Green
}

# Step 7: Push to GitHub
Write-Host ""
Write-Host "⬆️  Step 7: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  You may be prompted for GitHub credentials" -ForegroundColor Yellow
Write-Host ""

try {
    # Check if main branch exists, if not rename master to main
    $currentBranch = git branch --show-current
    if ($currentBranch -eq "master") {
        git branch -M main
        Write-Host "✅ Renamed branch to 'main'" -ForegroundColor Green
    }
    
    git push -u origin main
    Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Push failed. This might be due to:" -ForegroundColor Yellow
    Write-Host "   1. Authentication required (use GitHub Personal Access Token)"
    Write-Host "   2. Repository not empty (force push may be needed)"
    Write-Host ""
    Write-Host "To force push (if repository has initial commit):" -ForegroundColor Yellow
    Write-Host "   git push -u origin main --force"
    Write-Host ""
}

# Step 8: Display GitHub URL
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ GITHUB UPLOAD COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 GitHub Repository:" -ForegroundColor Yellow
Write-Host "   $GitHubRepo" -ForegroundColor Green
Write-Host ""

# Step 9: Vercel Deployment Instructions
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 VERCEL DEPLOYMENT INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Follow these steps to deploy on Vercel:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Go to: https://vercel.com" -ForegroundColor Cyan
Write-Host "   • Click 'Sign Up' or 'Login'"
Write-Host "   • Choose 'Continue with GitHub'"
Write-Host "   • Authorize Vercel to access your GitHub"
Write-Host ""

Write-Host "2️⃣  Import Repository:" -ForegroundColor Cyan
Write-Host "   • Click 'Add New Project'"
Write-Host "   • Select 'Import Git Repository'"
Write-Host "   • Find and select: sahayak-ai"
Write-Host "   • Click 'Import'"
Write-Host ""

Write-Host "3️⃣  Configure Project:" -ForegroundColor Cyan
Write-Host "   • Framework Preset: Next.js (auto-detected)"
Write-Host "   • Root Directory: frontend"
Write-Host "   • Build Command: npm run build (auto-detected)"
Write-Host "   • Output Directory: .next (auto-detected)"
Write-Host "   • Install Command: npm install (auto-detected)"
Write-Host ""

Write-Host "4️⃣  Add Environment Variable:" -ForegroundColor Cyan
Write-Host "   • Click 'Environment Variables'"
Write-Host "   • Add variable:"
Write-Host "     Name:  NEXT_PUBLIC_API_URL"
Write-Host "     Value: http://localhost:3001"
Write-Host "   • Click 'Add'"
Write-Host ""

Write-Host "5️⃣  Deploy:" -ForegroundColor Cyan
Write-Host "   • Click 'Deploy'"
Write-Host "   • Wait 2-3 minutes for build to complete"
Write-Host "   • You'll get a live URL like:"
Write-Host "     https://sahayak-ai.vercel.app"
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📝 IMPORTANT NOTES" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Frontend will be deployed and publicly accessible"
Write-Host "⚠️  Backend features (chat, recommendations) won't work yet"
Write-Host "   (Backend is still running locally on localhost:3001)"
Write-Host ""
Write-Host "🔄 To update your site later:" -ForegroundColor Yellow
Write-Host "   1. Make changes to your code"
Write-Host "   2. Run these commands:"
Write-Host "      git add ."
Write-Host "      git commit -m 'Your update message'"
Write-Host "      git push"
Write-Host "   3. Vercel will automatically rebuild and deploy!"
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Optional: Open GitHub in browser
$response = Read-Host "Open GitHub repository in browser? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Start-Process $GitHubRepo
}

Write-Host ""
Write-Host "Good luck with your MVP submission! 🎉" -ForegroundColor Green
Write-Host ""

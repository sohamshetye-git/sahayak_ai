# 🌐 Start Public Demo - Automated Script
# This script starts your Next.js dev server and creates a public tunnel

Write-Host "🚀 Starting Sahayak AI Public Demo..." -ForegroundColor Cyan
Write-Host ""

# Check if LocalTunnel is installed
Write-Host "📦 Checking LocalTunnel installation..." -ForegroundColor Yellow
$ltInstalled = npm list -g localtunnel 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ LocalTunnel not found. Installing..." -ForegroundColor Red
    npm install -g localtunnel
    Write-Host "✅ LocalTunnel installed!" -ForegroundColor Green
} else {
    Write-Host "✅ LocalTunnel already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. This will start your Next.js dev server on http://localhost:3000"
Write-Host "2. Then it will create a public tunnel"
Write-Host "3. You'll get a public HTTPS URL to share"
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "- Keep this window open while demoing"
Write-Host "- Press Ctrl+C to stop the server and tunnel"
Write-Host "- If Windows Firewall prompts, click 'Allow access'"
Write-Host ""

# Navigate to frontend directory
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    Write-Host "✅ Found frontend directory" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project root" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Starting Next.js development server..." -ForegroundColor Cyan
Write-Host ""

# Start dev server in background
$devServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -PassThru -WindowStyle Normal

Write-Host "⏳ Waiting for dev server to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "🌐 Creating public tunnel..." -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  YOUR PUBLIC URL WILL APPEAR BELOW" -ForegroundColor Green
Write-Host "  Copy it and share for demo!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

# Start LocalTunnel
npx localtunnel --port 3000

# Cleanup on exit
Write-Host ""
Write-Host "🛑 Stopping dev server..." -ForegroundColor Yellow
Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue
Write-Host "✅ Stopped" -ForegroundColor Green

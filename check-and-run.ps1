# Sahayak AI - Pre-Flight Check & Run Script
# Run this script instead of manually starting servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sahayak AI - Pre-Flight Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check TypeScript errors
Write-Host "Step 1: Checking TypeScript errors..." -ForegroundColor Yellow
Set-Location frontend
npx tsc --noEmit --skipLibCheck 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ TypeScript errors found! Fix them before running." -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor White
    Write-Host "  1. Read the error messages above" -ForegroundColor Gray
    Write-Host "  2. Open the files mentioned in the errors" -ForegroundColor Gray
    Write-Host "  3. Fix the issues (duplicate keys, type mismatches, etc.)" -ForegroundColor Gray
    Write-Host "  4. Run this script again" -ForegroundColor Gray
    Set-Location ..
    exit 1
}
Write-Host "✅ TypeScript check passed!" -ForegroundColor Green
Write-Host ""

# Step 2: Clear Next.js cache
Write-Host "Step 2: Clearing Next.js cache..." -ForegroundColor Yellow
Set-Location ..
if (Test-Path "frontend/.next") {
    Remove-Item -Recurse -Force frontend/.next
    Write-Host "✅ Cache cleared!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No cache to clear." -ForegroundColor Gray
}
Write-Host ""

# Step 3: Start backend
Write-Host "Step 3: Starting backend server..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-Command", "npm run dev"
Start-Sleep -Seconds 5
Write-Host "✅ Backend started!" -ForegroundColor Green
Set-Location ..

# Step 4: Start frontend
Write-Host "Step 4: Starting frontend server..." -ForegroundColor Yellow
Set-Location frontend
Start-Process powershell -ArgumentList "-Command", "npm run dev"
Write-Host "✅ Frontend started!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers Running!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Start Frontend with Persistent Cache
# This script ensures the .next cache is preserved between runs

$frontendDir = "frontend"
$nextCache = Join-Path $frontendDir ".next"

Write-Host "Starting Frontend Server..." -ForegroundColor Cyan

# Check if .next exists, if not create it
if (-not (Test-Path $nextCache)) {
    Write-Host "Creating .next cache directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $nextCache | Out-Null
}

# Start frontend in background
Start-Process powershell -ArgumentList "-Command", "cd $frontendDir; npm run dev"

Write-Host "Frontend starting... Check http://localhost:3000 in ~10 seconds" -ForegroundColor Green
Write-Host ""

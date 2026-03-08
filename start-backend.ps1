# Start Backend Server

Write-Host "Starting Backend Server..." -ForegroundColor Cyan

# Start backend in background
Start-Process powershell -ArgumentList "-Command", "cd backend; npm run dev"

Write-Host "Backend starting... Check http://localhost:3001 in ~5 seconds" -ForegroundColor Green
Write-Host ""

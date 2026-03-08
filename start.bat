@echo off
REM Sahayak AI - Quick Start Script for Windows

echo.
echo 🚀 Sahayak AI - Quick Start
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js ^>= 20.0.0
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node -v
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ✅ Created .env file
    echo.
    echo ⚠️  IMPORTANT: Please edit .env and add your Gemini API key:
    echo    GEMINI_API_KEY=your_api_key_here
    echo.
    echo    Get your API key from: https://makersuite.google.com/app/apikey
    echo.
    pause
)

REM Install dependencies
if not exist node_modules (
    echo 📦 Installing root dependencies...
    call npm install
)

if not exist backend\node_modules (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist frontend\node_modules (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ✅ All dependencies installed!
echo.
echo 🎯 Starting Sahayak AI...
echo.
echo Backend will start on: http://localhost:3001
echo Frontend will start on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

REM Start backend and frontend in separate windows
start "Sahayak Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Sahayak Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Servers started in separate windows
echo.
echo Open your browser and go to: http://localhost:3000
echo.
pause

@echo off
REM SafeGuard React App Quick Start - Windows

echo ================================
echo SafeGuard React Application
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js 14 or higher from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node --version

echo npm version:
npm --version
echo.

REM Navigate to app directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed
    echo.
)

REM Start the development server
echo Starting development server...
echo.
echo The application will open at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm start
pause

@echo off
REM MEDIVISION Hospital Finder Map - Quick Start for Windows
REM This script helps you get the map running locally on Windows

echo.
echo 🏥 MEDIVISION - Hospital Finder Map
echo ====================================
echo.

REM Check if we're in the correct directory
if not exist "index.html" (
    echo ❌ Error: index.html not found!
    echo Please run this script from the map-module directory
    pause
    exit /b 1
)

echo ✅ Found map files
echo.

REM Try Python first
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo 🐍 Starting server with Python...
    echo.
    echo 📍 Server running at: http://localhost:8000
    echo 🌐 Open this URL in your browser: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
    goto end
)

REM Try Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo 🚀 Starting server with Node.js http-server...
    echo.
    echo First, let me check if http-server is installed...
    npm list -g http-server >nul 2>nul
    if %errorlevel% neq 0 (
        echo Installing http-server...
        call npm install -g http-server
    )
    echo.
    echo 📍 Server running at: http://localhost:8080
    echo 🌐 Open this URL in your browser: http://localhost:8080
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    call http-server -p 8080
    goto end
)

REM No Python or Node found
echo ❌ Error: No Python or Node.js found!
echo.
echo Please install one of the following:
echo 1. Python 3: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo.
echo Or use the manual method:
echo 1. Right-click index.html
echo 2. Select "Open with"
echo 3. Choose Python or any browser
echo.
pause
exit /b 1

:end
pause
exit /b 0

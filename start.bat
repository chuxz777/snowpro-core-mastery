@echo off
REM Certification Mastery Suite - Easy Start Script for Windows
REM This script sets up and runs the application automatically

echo.
echo 🚀 Starting Certification Mastery Suite...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed!
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

REM Check if uv is installed
uv --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing uv (Python package manager)...
    powershell -Command "irm https://astral.sh/uv/install.ps1 | iex"
)

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo 🔧 Creating Python virtual environment...
    uv venv
)

REM Activate virtual environment
echo ✅ Activating virtual environment...
call .venv\Scripts\activate.bat

REM Install/sync dependencies
echo 📚 Installing dependencies...
uv pip install --upgrade pip

REM Find available port
set PORT=8080
:check_port
netstat -an | find ":%PORT%" | find "LISTENING" >nul
if not errorlevel 1 (
    echo ⚠️  Port %PORT% is in use, trying next port...
    set /a PORT+=1
    goto check_port
)

echo.
echo ✨ Setup complete!
echo.
echo 🌐 Starting web server on port %PORT%...
echo 📱 Open your browser to: http://localhost:%PORT%
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python -m http.server %PORT%

pause

@REM Made with Bob

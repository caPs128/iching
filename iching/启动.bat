@echo off
chcp 65001 >nul
echo ================================
echo   六爻占卜 - 增删卜易
echo ================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python found
echo [RUN] Starting server at http://localhost:8080
echo.
echo Press Ctrl+C to stop
echo ================================
start http://localhost:8080
python -m http.server 8080
pause

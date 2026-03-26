@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo    Medicine Admin System - Startup
echo ========================================
echo.

echo [1/4] Checking database...
mysql -uroot -p123456 -e "CREATE DATABASE IF NOT EXISTS medicine_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %errorlevel% neq 0 (
    echo [Warning] Cannot connect to MySQL
    echo Please make sure MySQL is running
    echo Database: medicine_admin
    echo Username: root
    echo Password: 123456
    echo.
)

echo.
echo [2/4] Starting backend service...
start "Backend" cmd /k "cd /d %~dp0backend && call conda activate medicine-admin && python -m app.core.init_db && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [3/4] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting frontend service...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo    Startup Complete!
echo ========================================
echo.
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:5173
echo    API Docs: http://localhost:8000/docs
echo.
echo    Admin Account: admin / admin123
echo.
echo ========================================
pause

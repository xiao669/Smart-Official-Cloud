@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo   Medicine Admin - Backend Startup
echo ========================================
echo.

call conda activate medicine-admin

echo Checking Python environment...
python --version
echo.

echo Checking required modules...
python -c "import requests" 2>nul
if %errorlevel% neq 0 (
    echo [Warning] requests module not found, installing...
    pip install requests pymysql python-dotenv
    echo.
)

echo Initializing database...
python -m app.core.init_db

if %errorlevel% neq 0 (
    echo.
    echo [Error] Database initialization failed!
    pause
    exit /b 1
)

echo.
echo Starting FastAPI server...
echo URL: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Admin: admin / admin123
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

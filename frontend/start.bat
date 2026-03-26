@echo off
chcp 65001 >nul 2>&1
echo Starting frontend service...
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting Vue dev server...
echo URL: http://localhost:5173
echo.
npm run dev

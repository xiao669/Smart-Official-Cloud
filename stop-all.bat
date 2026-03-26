@echo off
echo Stopping all services...
echo.

taskkill /f /im node.exe 2>nul
taskkill /f /im python.exe 2>nul

echo.
echo All services stopped.
pause

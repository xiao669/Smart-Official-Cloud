@echo off
echo ========================================
echo 安装缺失的Python模块
echo ========================================
echo.

call conda activate medicine-admin
if errorlevel 1 (
    echo 错误: 无法激活 conda 环境 medicine-admin
    pause
    exit /b 1
)

echo 当前环境:
call conda info --envs
echo.

echo 安装缺失的模块...
pip install requests pymysql python-dotenv

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 验证安装...
python -c "import requests; print('✓ requests:', requests.__version__)"
python -c "import pymysql; print('✓ pymysql:', pymysql.__version__)"
python -c "import dotenv; print('✓ python-dotenv 已安装')"

echo.
echo 请重启后端服务
pause

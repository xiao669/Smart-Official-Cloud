@echo off
chcp 65001 >nul
echo ============================================
echo 药品管理系统 - Windows自动备份配置
echo ============================================
echo.

set SCRIPT_DIR=%~dp0
set BACKUP_SCRIPT=%SCRIPT_DIR%backup_database.py

echo 备份脚本路径: %BACKUP_SCRIPT%
echo.

:: 检查Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请先安装Python
    pause
    exit /b 1
)

:: 创建备份目录
if not exist "%SCRIPT_DIR%backups\daily" mkdir "%SCRIPT_DIR%backups\daily"
if not exist "%SCRIPT_DIR%backups\weekly" mkdir "%SCRIPT_DIR%backups\weekly"
if not exist "%SCRIPT_DIR%backups\monthly" mkdir "%SCRIPT_DIR%backups\monthly"

echo 备份目录已创建
echo.

echo 选择要配置的定时任务:
echo [1] 每日备份 (每天凌晨2点)
echo [2] 每周备份 (每周日凌晨3点)
echo [3] 每月备份 (每月1号凌晨4点)
echo [4] 全部配置
echo [5] 删除所有备份任务
echo [6] 退出
echo.

set /p choice=请输入选项 (1-6): 

if "%choice%"=="1" goto daily
if "%choice%"=="2" goto weekly
if "%choice%"=="3" goto monthly
if "%choice%"=="4" goto all
if "%choice%"=="5" goto delete
if "%choice%"=="6" goto end

:daily
echo 正在配置每日备份任务...
schtasks /create /tn "MedicineAdmin_DailyBackup" /tr "python \"%BACKUP_SCRIPT%\" backup --type daily" /sc daily /st 02:00 /f
echo 每日备份任务已创建
goto end

:weekly
echo 正在配置每周备份任务...
schtasks /create /tn "MedicineAdmin_WeeklyBackup" /tr "python \"%BACKUP_SCRIPT%\" backup --type weekly" /sc weekly /d SUN /st 03:00 /f
echo 每周备份任务已创建
goto end

:monthly
echo 正在配置每月备份任务...
schtasks /create /tn "MedicineAdmin_MonthlyBackup" /tr "python \"%BACKUP_SCRIPT%\" backup --type monthly" /sc monthly /d 1 /st 04:00 /f
echo 每月备份任务已创建
goto end

:all
echo 正在配置所有备份任务...
schtasks /create /tn "MedicineAdmin_DailyBackup" /tr "python \"%BACKUP_SCRIPT%\" backup --type daily" /sc daily /st 02:00 /f
schtasks /create /tn "MedicineAdmin_WeeklyBackup" /tr "python \"%BACKUP_SCRIPT%\" backup --type weekly" /sc weekly /d SUN /st 03:00 /f
schtasks /create /tn "MedicineAdmin_MonthlyBackup" /tr "python \"%BACKUP_SCRIPT%\" backup --type monthly" /sc monthly /d 1 /st 04:00 /f
echo 所有备份任务已创建
goto end

:delete
echo 正在删除备份任务...
schtasks /delete /tn "MedicineAdmin_DailyBackup" /f 2>nul
schtasks /delete /tn "MedicineAdmin_WeeklyBackup" /f 2>nul
schtasks /delete /tn "MedicineAdmin_MonthlyBackup" /f 2>nul
echo 备份任务已删除
goto end

:end
echo.
echo ============================================
echo 手动执行命令:
echo --------------------------------------------
echo 每日备份: python %BACKUP_SCRIPT% backup --type daily
echo 每周备份: python %BACKUP_SCRIPT% backup --type weekly
echo 每月备份: python %BACKUP_SCRIPT% backup --type monthly
echo 查看统计: python %BACKUP_SCRIPT% stats
echo 清理备份: python %BACKUP_SCRIPT% cleanup
echo 恢复备份: python %BACKUP_SCRIPT% restore --file 备份文件路径
echo ============================================
echo.
pause

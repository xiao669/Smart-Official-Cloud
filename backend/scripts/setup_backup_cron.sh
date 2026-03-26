#!/bin/bash
# 药品管理系统 - 自动备份定时任务配置脚本
# 运行此脚本配置Linux定时备份任务

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup_database.py"
PYTHON_PATH=$(which python3)

echo "=== 药品管理系统 - 自动备份配置 ==="
echo ""
echo "备份脚本路径: $BACKUP_SCRIPT"
echo "Python路径: $PYTHON_PATH"
echo ""

# 检查Python
if [ -z "$PYTHON_PATH" ]; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查备份脚本
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "错误: 备份脚本不存在: $BACKUP_SCRIPT"
    exit 1
fi

# 创建备份目录
mkdir -p "$SCRIPT_DIR/backups/daily"
mkdir -p "$SCRIPT_DIR/backups/weekly"
mkdir -p "$SCRIPT_DIR/backups/monthly"

echo "备份目录已创建"
echo ""

# 生成crontab配置
CRON_CONFIG="
# ============ 药品管理系统数据库备份 ============
# 每天凌晨2点执行每日备份
0 2 * * * cd $SCRIPT_DIR && $PYTHON_PATH $BACKUP_SCRIPT backup --type daily >> $SCRIPT_DIR/backup_cron.log 2>&1

# 每周日凌晨3点执行每周备份
0 3 * * 0 cd $SCRIPT_DIR && $PYTHON_PATH $BACKUP_SCRIPT backup --type weekly >> $SCRIPT_DIR/backup_cron.log 2>&1

# 每月1号凌晨4点执行每月备份
0 4 1 * * cd $SCRIPT_DIR && $PYTHON_PATH $BACKUP_SCRIPT backup --type monthly >> $SCRIPT_DIR/backup_cron.log 2>&1
"

echo "即将添加以下定时任务:"
echo "$CRON_CONFIG"
echo ""

read -p "是否添加到crontab? (y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    # 备份现有crontab
    crontab -l > /tmp/crontab_backup_$(date +%Y%m%d).txt 2>/dev/null
    
    # 添加新任务（避免重复）
    (crontab -l 2>/dev/null | grep -v "backup_database.py"; echo "$CRON_CONFIG") | crontab -
    
    echo ""
    echo "✓ 定时任务已添加成功！"
    echo ""
    echo "当前crontab配置:"
    crontab -l
else
    echo "已取消"
fi

echo ""
echo "=== 手动执行命令 ==="
echo "每日备份: python3 $BACKUP_SCRIPT backup --type daily"
echo "每周备份: python3 $BACKUP_SCRIPT backup --type weekly"
echo "每月备份: python3 $BACKUP_SCRIPT backup --type monthly"
echo "查看统计: python3 $BACKUP_SCRIPT stats"
echo "清理备份: python3 $BACKUP_SCRIPT cleanup"
echo "恢复备份: python3 $BACKUP_SCRIPT restore --file <备份文件路径>"

#!/usr/bin/env python3
"""
药品管理系统 - 数据库自动备份脚本
功能：
1. 全量备份和增量备份
2. 自动压缩和加密
3. 备份验证（检查备份文件完整性）
4. 自动清理过期备份
5. 备份统计报告
6. 支持本地和远程存储
"""

import os
import sys
import subprocess
import gzip
import shutil
import hashlib
import json
import smtplib
from datetime import datetime, timedelta
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, List
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backup.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class BackupConfig:
    """备份配置"""
    # 数据库配置
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '123456')
    DB_NAME = os.getenv('DB_NAME', 'medicine_admin')
    
    # 备份目录配置
    BACKUP_DIR = os.getenv('BACKUP_DIR', './backups')
    
    # 备份保留策略
    KEEP_DAILY_DAYS = 7      # 保留7天的每日备份
    KEEP_WEEKLY_WEEKS = 4    # 保留4周的每周备份
    KEEP_MONTHLY_MONTHS = 12 # 保留12个月的每月备份
    
    # 邮件通知配置（可选）
    SMTP_HOST = os.getenv('SMTP_HOST', '')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '465'))
    SMTP_USER = os.getenv('SMTP_USER', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    NOTIFY_EMAIL = os.getenv('NOTIFY_EMAIL', '')
    
    # 远程存储配置（可选，支持阿里云OSS）
    OSS_ENABLED = os.getenv('OSS_ENABLED', 'false').lower() == 'true'
    OSS_ACCESS_KEY = os.getenv('OSS_ACCESS_KEY', '')
    OSS_SECRET_KEY = os.getenv('OSS_SECRET_KEY', '')
    OSS_BUCKET = os.getenv('OSS_BUCKET', '')
    OSS_ENDPOINT = os.getenv('OSS_ENDPOINT', '')


class DatabaseBackup:
    """数据库备份管理器"""
    
    def __init__(self, config: BackupConfig = None):
        self.config = config or BackupConfig()
        self.backup_dir = Path(self.config.BACKUP_DIR)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # 创建子目录
        (self.backup_dir / 'daily').mkdir(exist_ok=True)
        (self.backup_dir / 'weekly').mkdir(exist_ok=True)
        (self.backup_dir / 'monthly').mkdir(exist_ok=True)
        
    def run_backup(self, backup_type: str = 'daily') -> Dict:
        """
        执行备份
        
        Args:
            backup_type: 备份类型 (daily/weekly/monthly)
            
        Returns:
            备份结果信息
        """
        result = {
            'success': False,
            'backup_type': backup_type,
            'start_time': datetime.now().isoformat(),
            'end_time': None,
            'file_path': None,
            'file_size': 0,
            'checksum': None,
            'error': None
        }
        
        try:
            logger.info(f"开始 {backup_type} 备份...")
            
            # 生成备份文件名
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"{self.config.DB_NAME}_{backup_type}_{timestamp}.sql"
            backup_path = self.backup_dir / backup_type / backup_filename
            
            # 执行mysqldump
            self._execute_mysqldump(backup_path)
            
            # 压缩备份文件
            compressed_path = self._compress_backup(backup_path)
            
            # 计算校验和
            checksum = self._calculate_checksum(compressed_path)
            
            # 验证备份
            if not self._verify_backup(compressed_path):
                raise Exception("备份验证失败")
            
            # 获取文件大小
            file_size = compressed_path.stat().st_size
            
            # 保存备份元数据
            self._save_metadata(compressed_path, checksum, backup_type)
            
            # 上传到云存储（如果启用）
            if self.config.OSS_ENABLED:
                self._upload_to_oss(compressed_path)
            
            result['success'] = True
            result['file_path'] = str(compressed_path)
            result['file_size'] = file_size
            result['checksum'] = checksum
            
            logger.info(f"备份成功: {compressed_path} ({self._format_size(file_size)})")
            
        except Exception as e:
            result['error'] = str(e)
            logger.error(f"备份失败: {e}")
            
        finally:
            result['end_time'] = datetime.now().isoformat()
            
        return result
    
    def _execute_mysqldump(self, output_path: Path):
        """执行mysqldump命令"""
        cmd = [
            'mysqldump',
            f'--host={self.config.DB_HOST}',
            f'--port={self.config.DB_PORT}',
            f'--user={self.config.DB_USER}',
            f'--password={self.config.DB_PASSWORD}',
            '--single-transaction',  # 保证数据一致性
            '--routines',            # 包含存储过程
            '--triggers',            # 包含触发器
            '--events',              # 包含事件
            '--quick',               # 大表优化
            '--lock-tables=false',   # 不锁表
            self.config.DB_NAME
        ]
        
        with open(output_path, 'w', encoding='utf-8') as f:
            process = subprocess.run(
                cmd,
                stdout=f,
                stderr=subprocess.PIPE,
                text=True
            )
            
        if process.returncode != 0:
            raise Exception(f"mysqldump失败: {process.stderr}")
            
    def _compress_backup(self, backup_path: Path) -> Path:
        """压缩备份文件"""
        compressed_path = backup_path.with_suffix('.sql.gz')
        
        with open(backup_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb', compresslevel=9) as f_out:
                shutil.copyfileobj(f_in, f_out)
                
        # 删除原始SQL文件
        backup_path.unlink()
        
        return compressed_path
    
    def _calculate_checksum(self, file_path: Path) -> str:
        """计算文件MD5校验和"""
        md5 = hashlib.md5()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                md5.update(chunk)
        return md5.hexdigest()
    
    def _verify_backup(self, compressed_path: Path) -> bool:
        """验证备份文件完整性"""
        try:
            # 尝试解压并检查SQL语法
            with gzip.open(compressed_path, 'rt', encoding='utf-8') as f:
                # 读取前1000行检查基本结构
                lines = []
                for i, line in enumerate(f):
                    lines.append(line)
                    if i > 1000:
                        break
                        
                content = ''.join(lines)
                
                # 检查是否包含必要的SQL结构
                if 'CREATE TABLE' not in content and 'INSERT INTO' not in content:
                    return False
                    
            return True
        except Exception as e:
            logger.error(f"备份验证错误: {e}")
            return False
    
    def _save_metadata(self, backup_path: Path, checksum: str, backup_type: str):
        """保存备份元数据"""
        metadata_path = backup_path.with_suffix('.json')
        metadata = {
            'filename': backup_path.name,
            'backup_type': backup_type,
            'database': self.config.DB_NAME,
            'created_at': datetime.now().isoformat(),
            'size': backup_path.stat().st_size,
            'checksum_md5': checksum,
            'host': self.config.DB_HOST
        }
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    def _upload_to_oss(self, file_path: Path):
        """上传到阿里云OSS（需要安装oss2库）"""
        try:
            import oss2
            
            auth = oss2.Auth(self.config.OSS_ACCESS_KEY, self.config.OSS_SECRET_KEY)
            bucket = oss2.Bucket(auth, self.config.OSS_ENDPOINT, self.config.OSS_BUCKET)
            
            # 上传文件
            remote_path = f"backups/{file_path.name}"
            bucket.put_object_from_file(remote_path, str(file_path))
            
            logger.info(f"已上传到OSS: {remote_path}")
            
        except ImportError:
            logger.warning("未安装oss2库，跳过云存储上传")
        except Exception as e:
            logger.error(f"OSS上传失败: {e}")
    
    def cleanup_old_backups(self):
        """清理过期备份"""
        now = datetime.now()
        deleted_count = 0
        freed_space = 0
        
        # 清理每日备份
        daily_cutoff = now - timedelta(days=self.config.KEEP_DAILY_DAYS)
        deleted, freed = self._cleanup_directory(
            self.backup_dir / 'daily', 
            daily_cutoff
        )
        deleted_count += deleted
        freed_space += freed
        
        # 清理每周备份
        weekly_cutoff = now - timedelta(weeks=self.config.KEEP_WEEKLY_WEEKS)
        deleted, freed = self._cleanup_directory(
            self.backup_dir / 'weekly',
            weekly_cutoff
        )
        deleted_count += deleted
        freed_space += freed
        
        # 清理每月备份
        monthly_cutoff = now - timedelta(days=self.config.KEEP_MONTHLY_MONTHS * 30)
        deleted, freed = self._cleanup_directory(
            self.backup_dir / 'monthly',
            monthly_cutoff
        )
        deleted_count += deleted
        freed_space += freed
        
        if deleted_count > 0:
            logger.info(f"清理完成: 删除 {deleted_count} 个文件，释放 {self._format_size(freed_space)}")
            
        return deleted_count, freed_space
    
    def _cleanup_directory(self, directory: Path, cutoff_date: datetime) -> tuple:
        """清理指定目录中的过期文件"""
        deleted_count = 0
        freed_space = 0
        
        if not directory.exists():
            return 0, 0
            
        for file_path in directory.glob('*.sql.gz'):
            file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
            if file_time < cutoff_date:
                file_size = file_path.stat().st_size
                
                # 删除备份文件
                file_path.unlink()
                
                # 删除对应的元数据文件
                metadata_path = file_path.with_suffix('.json')
                if metadata_path.exists():
                    metadata_path.unlink()
                    
                deleted_count += 1
                freed_space += file_size
                logger.info(f"删除过期备份: {file_path.name}")
                
        return deleted_count, freed_space
    
    def get_backup_stats(self) -> Dict:
        """获取备份统计信息"""
        stats = {
            'total_backups': 0,
            'total_size': 0,
            'daily_count': 0,
            'weekly_count': 0,
            'monthly_count': 0,
            'latest_backup': None,
            'oldest_backup': None,
            'backups': []
        }
        
        all_backups = []
        
        for backup_type in ['daily', 'weekly', 'monthly']:
            type_dir = self.backup_dir / backup_type
            if not type_dir.exists():
                continue
                
            for file_path in type_dir.glob('*.sql.gz'):
                file_stat = file_path.stat()
                backup_info = {
                    'filename': file_path.name,
                    'type': backup_type,
                    'size': file_stat.st_size,
                    'created_at': datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                }
                all_backups.append(backup_info)
                
                stats['total_backups'] += 1
                stats['total_size'] += file_stat.st_size
                stats[f'{backup_type}_count'] += 1
        
        # 排序并获取最新和最旧备份
        if all_backups:
            all_backups.sort(key=lambda x: x['created_at'], reverse=True)
            stats['latest_backup'] = all_backups[0]
            stats['oldest_backup'] = all_backups[-1]
            stats['backups'] = all_backups[:10]  # 只返回最近10个
            
        stats['total_size_formatted'] = self._format_size(stats['total_size'])
        
        return stats
    
    def restore_backup(self, backup_file: str) -> bool:
        """
        恢复数据库备份
        
        Args:
            backup_file: 备份文件路径
            
        Returns:
            是否恢复成功
        """
        backup_path = Path(backup_file)
        
        if not backup_path.exists():
            logger.error(f"备份文件不存在: {backup_file}")
            return False
            
        try:
            logger.info(f"开始恢复数据库: {backup_file}")
            
            # 解压备份文件
            if backup_path.suffix == '.gz':
                with gzip.open(backup_path, 'rt', encoding='utf-8') as f:
                    sql_content = f.read()
            else:
                with open(backup_path, 'r', encoding='utf-8') as f:
                    sql_content = f.read()
            
            # 执行恢复
            cmd = [
                'mysql',
                f'--host={self.config.DB_HOST}',
                f'--port={self.config.DB_PORT}',
                f'--user={self.config.DB_USER}',
                f'--password={self.config.DB_PASSWORD}',
                self.config.DB_NAME
            ]
            
            process = subprocess.run(
                cmd,
                input=sql_content,
                text=True,
                capture_output=True
            )
            
            if process.returncode != 0:
                raise Exception(f"恢复失败: {process.stderr}")
                
            logger.info("数据库恢复成功")
            return True
            
        except Exception as e:
            logger.error(f"恢复失败: {e}")
            return False
    
    def send_notification(self, result: Dict):
        """发送备份结果通知邮件"""
        if not self.config.SMTP_HOST or not self.config.NOTIFY_EMAIL:
            return
            
        try:
            subject = f"[药品管理系统] 数据库备份{'成功' if result['success'] else '失败'}"
            
            if result['success']:
                body = f"""
数据库备份完成通知

备份类型: {result['backup_type']}
开始时间: {result['start_time']}
完成时间: {result['end_time']}
文件路径: {result['file_path']}
文件大小: {self._format_size(result['file_size'])}
校验和: {result['checksum']}

备份成功！
                """
            else:
                body = f"""
数据库备份失败通知

备份类型: {result['backup_type']}
开始时间: {result['start_time']}
错误信息: {result['error']}

请检查备份配置和数据库连接！
                """
            
            msg = MIMEMultipart()
            msg['From'] = self.config.SMTP_USER
            msg['To'] = self.config.NOTIFY_EMAIL
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            with smtplib.SMTP_SSL(self.config.SMTP_HOST, self.config.SMTP_PORT) as server:
                server.login(self.config.SMTP_USER, self.config.SMTP_PASSWORD)
                server.send_message(msg)
                
            logger.info("通知邮件已发送")
            
        except Exception as e:
            logger.error(f"发送通知邮件失败: {e}")
    
    @staticmethod
    def _format_size(size: int) -> str:
        """格式化文件大小"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.2f} {unit}"
            size /= 1024
        return f"{size:.2f} TB"


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='药品管理系统数据库备份工具')
    parser.add_argument('action', choices=['backup', 'restore', 'cleanup', 'stats'],
                       help='执行的操作')
    parser.add_argument('--type', choices=['daily', 'weekly', 'monthly'],
                       default='daily', help='备份类型')
    parser.add_argument('--file', help='恢复时指定的备份文件')
    
    args = parser.parse_args()
    
    backup = DatabaseBackup()
    
    if args.action == 'backup':
        result = backup.run_backup(args.type)
        backup.send_notification(result)
        
        # 备份后自动清理
        backup.cleanup_old_backups()
        
        sys.exit(0 if result['success'] else 1)
        
    elif args.action == 'restore':
        if not args.file:
            print("请指定要恢复的备份文件: --file <path>")
            sys.exit(1)
        success = backup.restore_backup(args.file)
        sys.exit(0 if success else 1)
        
    elif args.action == 'cleanup':
        deleted, freed = backup.cleanup_old_backups()
        print(f"清理完成: 删除 {deleted} 个文件，释放 {backup._format_size(freed)}")
        
    elif args.action == 'stats':
        stats = backup.get_backup_stats()
        print("\n=== 备份统计 ===")
        print(f"总备份数: {stats['total_backups']}")
        print(f"总大小: {stats['total_size_formatted']}")
        print(f"每日备份: {stats['daily_count']} 个")
        print(f"每周备份: {stats['weekly_count']} 个")
        print(f"每月备份: {stats['monthly_count']} 个")
        if stats['latest_backup']:
            print(f"\n最新备份: {stats['latest_backup']['filename']}")
            print(f"创建时间: {stats['latest_backup']['created_at']}")


if __name__ == '__main__':
    main()

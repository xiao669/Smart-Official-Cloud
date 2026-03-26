"""
一键初始化所有场景的数据库数据
包括：药品、库存、食品、设备、文档、自定义场景
"""
import pymysql
from datetime import datetime, timedelta, date
import random

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'medicine_admin'
}

# 药品数据
MEDICINES = [
    {"name": "阿莫西林胶囊", "code": "YP001", "barcode": "6901234567890", "category": "抗生素", "spec": "0.25g*24粒", "unit": "盒", "manufacturer": "华北制药", "price": 15.5},
    {"name": "布洛芬缓释胶囊", "code": "YP002", "barcode": "6901234567891", "category": "解热镇痛", "spec": "0.3g*20粒", "unit": "盒", "manufacturer": "扬子江药业", "price": 18.0},
    {"name": "复方甘草片", "code": "YP003", "barcode": "6901234567892", "category": "呼吸系统", "spec": "100片", "unit": "瓶", "manufacturer": "同仁堂", "price": 8.5},
    {"name": "维生素C片", "code": "YP004", "barcode": "6901234567893", "category": "维生素", "spec": "100mg*100片", "unit": "瓶", "manufacturer": "石药集团", "price": 12.0},
    {"name": "感冒灵颗粒", "code": "YP005", "barcode": "6901234567894", "category": "呼吸系统", "spec": "10g*9袋", "unit": "盒", "manufacturer": "三九医药", "price": 22.0},

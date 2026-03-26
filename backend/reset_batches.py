"""
重置批次数据 - 清空并重新生成包含过期和临期药品的批次
"""
import pymysql
from datetime import datetime, timedelta
import random

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'medicine_admin'
}

def main():
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        print("=" * 60)
        print("重置批次数据")
        print("=" * 60)
        
        # 1. 清空相关表
        print("\n1. 清空现有数据...")
        cursor.execute("DELETE FROM warnings")
        cursor.execute("DELETE FROM transactions")
        cursor.execute("DELETE FROM batches")
        conn.commit()
        print("   ✓ 已清空批次、交易和预警数据")
        
        # 2. 获取所有药品
        cursor.execute("SELECT id FROM medicines")
        medicine_ids = [row[0] for row in cursor.fetchall()]
        print(f"\n2. 找到 {len(medicine_ids)} 种药品")
        
        # 3. 生成新批次
        print("\n3. 生成新批次...")
        count = 0
        expired_count = 0
        near_expiry_count = 0
        
        for idx, med_id in enumerate(medicine_ids):
            # 每种药品添加2-4个批次
            num_batches = random.randint(2, 4)
            for i in range(num_batches):
                batch_number = f"PH{datetime.now().year}{med_id:03d}{i+1:02d}"
                production_date = datetime.now() - timedelta(days=random.randint(30, 365))
                inbound_date = production_date + timedelta(days=random.randint(1, 30))
                
                # 前3种药品的第一个批次设置为已过期
                if idx < 3 and i == 0:
                    # 已过期药品：1-60天前过期
                    expiry_date = datetime.now() - timedelta(days=random.randint(1, 60))
                    expired_count += 1
                    quantity = random.randint(20, 80)
                # 第4-8种药品的第一个批次设置为临期（90天内过期）
                elif idx >= 3 and idx < 8 and i == 0:
                    # 临期药品：15-89天后过期
                    expiry_date = datetime.now() + timedelta(days=random.randint(15, 89))
                    near_expiry_count += 1
                    quantity = random.randint(50, 150)
                else:
                    # 正常药品：6个月-2年后过期
                    expiry_date = production_date + timedelta(days=random.randint(180, 730))
                    quantity = random.randint(100, 300)
                
                cursor.execute("""
                    INSERT INTO batches (medicine_id, batch_number, quantity,
                        production_date, expiry_date, inbound_date, remark, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    med_id, 
                    batch_number, 
                    quantity,
                    production_date.date(),
                    expiry_date.date(), 
                    inbound_date.date(),
                    f"供应商: {random.choice(['国药控股', '华润医药', '上海医药', '九州通'])}",
                    datetime.now()
                ))
                count += 1
        
        conn.commit()
        print(f"   ✓ 添加了 {count} 个批次")
        print(f"     - 已过期: {expired_count} 个")
        print(f"     - 临期(90天内): {near_expiry_count} 个")
        print(f"     - 正常: {count - expired_count - near_expiry_count} 个")
        
        # 4. 生成一些交易记录
        print("\n4. 生成交易记录...")
        cursor.execute("SELECT id FROM batches")
        batch_ids = [row[0] for row in cursor.fetchall()]
        cursor.execute("SELECT id FROM users WHERE user_type IN ('operator', 'manager')")
        operator_ids = [row[0] for row in cursor.fetchall()]
        
        if operator_ids:
            transaction_count = 0
            for _ in range(random.randint(30, 50)):
                batch_id = random.choice(batch_ids)
                trans_type = random.choice(['inbound', 'outbound', 'outbound'])
                quantity = random.randint(5, 50)
                
                cursor.execute("""
                    INSERT INTO transactions (batch_id, type, quantity, reason, 
                        recipient, operator_id, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    batch_id,
                    trans_type,
                    quantity,
                    random.choice(['销售', '报损', '调拨', '盘点']) if trans_type == 'outbound' else '采购',
                    f"客户{random.randint(1, 20)}" if trans_type == 'outbound' else None,
                    random.choice(operator_ids),
                    datetime.now() - timedelta(days=random.randint(0, 30))
                ))
                transaction_count += 1
            
            conn.commit()
            print(f"   ✓ 添加了 {transaction_count} 条交易记录")
        
        print("\n" + "=" * 60)
        print("重置完成！")
        print("=" * 60)
        print("\n提示：")
        print("1. 重启后端服务")
        print("2. 在预警管理页面点击'检查预警'按钮生成预警信息")
        
    except Exception as e:
        conn.rollback()
        print(f"\n✗ 错误: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()

"""执行多场景数据表创建脚本"""
import asyncio
import aiomysql
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings


async def execute_sql_file():
    """执行SQL文件创建多场景数据表"""
    
    # 读取SQL文件
    with open('create_mode_tables.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # 分割SQL语句（按分号分割，但要注意注释和空行）
    sql_statements = []
    current_statement = []
    
    for line in sql_content.split('\n'):
        # 跳过注释行
        if line.strip().startswith('--') or line.strip().startswith('/*') or not line.strip():
            continue
        
        current_statement.append(line)
        
        # 如果行以分号结尾，表示一条SQL语句结束
        if line.strip().endswith(';'):
            sql_statements.append('\n'.join(current_statement))
            current_statement = []
    
    # 创建数据库连接
    print("正在连接数据库...")
    connection = await aiomysql.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        db=settings.DB_NAME,
        charset='utf8mb4'
    )
    
    try:
        cursor = await connection.cursor()
        
        print(f"开始执行SQL语句，共 {len(sql_statements)} 条...")
        
        success_count = 0
        error_count = 0
        
        for i, sql in enumerate(sql_statements, 1):
            sql = sql.strip()
            if not sql or sql == 'USE medicine_admin;':
                continue
            
            try:
                # 执行SQL语句
                await cursor.execute(sql)
                await connection.commit()
                
                # 提取表名或操作类型
                if 'CREATE TABLE' in sql.upper():
                    table_name = sql.split('CREATE TABLE')[1].split('(')[0].strip().split()[0]
                    print(f"✓ [{i}/{len(sql_statements)}] 创建表: {table_name}")
                elif 'INSERT INTO' in sql.upper():
                    table_name = sql.split('INSERT INTO')[1].split('(')[0].strip().split()[0]
                    print(f"✓ [{i}/{len(sql_statements)}] 插入数据到: {table_name}")
                elif 'ALTER TABLE' in sql.upper():
                    table_name = sql.split('ALTER TABLE')[1].split()[0].strip()
                    print(f"✓ [{i}/{len(sql_statements)}] 修改表: {table_name}")
                else:
                    print(f"✓ [{i}/{len(sql_statements)}] 执行成功")
                
                success_count += 1
                
            except Exception as e:
                error_msg = str(e)
                
                # 如果是表已存在或字段已存在的错误，视为成功
                if 'already exists' in error_msg or 'Duplicate' in error_msg:
                    if 'CREATE TABLE' in sql.upper():
                        table_name = sql.split('CREATE TABLE')[1].split('(')[0].strip().split()[0]
                        print(f"⊙ [{i}/{len(sql_statements)}] 表已存在: {table_name}")
                    elif 'ALTER TABLE' in sql.upper():
                        print(f"⊙ [{i}/{len(sql_statements)}] 字段已存在，跳过")
                    else:
                        print(f"⊙ [{i}/{len(sql_statements)}] 已存在，跳过")
                    success_count += 1
                else:
                    print(f"✗ [{i}/{len(sql_statements)}] 执行失败: {error_msg}")
                    error_count += 1
        
        await cursor.close()
        
        print("\n" + "="*60)
        print(f"执行完成！")
        print(f"成功: {success_count} 条")
        print(f"失败: {error_count} 条")
        print("="*60)
        
        if error_count == 0:
            print("\n✓ 多场景数据表创建成功！")
            print("\n已创建的场景表：")
            print("  - medicine (药品管理)")
            print("  - inventory (库存管理)")
            print("  - food (食品管理)")
            print("  - equipment (设备管理)")
            print("  - document (文档管理)")
            print("  - custom (自定义场景)")
            print("\n每个场景包含3个表：")
            print("  - {mode}_categories (分类表)")
            print("  - {mode}_items (物品表)")
            print("  - {mode}_batches (批次表)")
        else:
            print(f"\n⚠ 有 {error_count} 条SQL执行失败，请检查错误信息")
        
    finally:
        connection.close()
        print("\n数据库连接已关闭")


if __name__ == '__main__':
    print("="*60)
    print("多场景数据表创建脚本")
    print("="*60)
    print()
    
    try:
        asyncio.run(execute_sql_file())
    except Exception as e:
        print(f"\n✗ 执行失败: {e}")
        import traceback
        traceback.print_exc()

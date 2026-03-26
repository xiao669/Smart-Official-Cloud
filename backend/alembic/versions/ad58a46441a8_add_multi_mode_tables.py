"""add_multi_mode_tables

Revision ID: ad58a46441a8
Revises: 
Create Date: 2025-12-21 13:37:41.103305

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ad58a46441a8'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. 添加 current_mode 字段到 users 表（如果不存在）
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # 检查 current_mode 字段是否已存在
    columns = [col['name'] for col in inspector.get_columns('users')]
    if 'current_mode' not in columns:
        op.add_column('users', sa.Column('current_mode', sa.String(20), nullable=False, server_default='medicine', comment='当前使用场景'))
    
    # 定义所有场景
    modes = ['medicine', 'inventory', 'food', 'equipment', 'document', 'custom']
    
    # 获取现有表列表
    existing_tables = inspector.get_table_names()
    
    # 2. 为每个场景创建分类表（如果不存在）
    for mode in modes:
        table_name = f'{mode}_categories'
        if table_name not in existing_tables:
            op.create_table(
                table_name,
                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                sa.Column('name', sa.String(50), nullable=False),
                sa.Column('description', sa.String(200), nullable=True),
                sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
                sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
                sa.PrimaryKeyConstraint('id')
            )
    
    # 3. 为每个场景创建物品表（如果不存在）
    for mode in modes:
        table_name = f'{mode}_items'
        category_table = f'{mode}_categories'
        if table_name not in existing_tables:
            op.create_table(
                table_name,
                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                sa.Column('name', sa.String(100), nullable=False),
                sa.Column('code', sa.String(50), nullable=False),
                sa.Column('barcode', sa.String(50), nullable=True, comment='条形码'),
                sa.Column('category_id', sa.Integer(), nullable=False),
                sa.Column('specification', sa.String(100), nullable=True),
                sa.Column('unit', sa.String(20), nullable=False),
                sa.Column('manufacturer', sa.String(100), nullable=True),
                sa.Column('price', sa.Float(), nullable=True, comment='单价'),
                sa.Column('description', sa.Text(), nullable=True),
                sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
                sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
                sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
                sa.PrimaryKeyConstraint('id'),
                sa.ForeignKeyConstraint(['category_id'], [f'{category_table}.id']),
                sa.UniqueConstraint('code')
            )
            op.create_index(f'ix_{table_name}_name', table_name, ['name'])
            op.create_index(f'ix_{table_name}_code', table_name, ['code'])
            op.create_index(f'ix_{table_name}_barcode', table_name, ['barcode'])
    
    # 4. 为每个场景创建批次表（如果不存在）
    for mode in modes:
        table_name = f'{mode}_batches'
        item_table = f'{mode}_items'
        if table_name not in existing_tables:
            op.create_table(
                table_name,
                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                sa.Column('item_id', sa.Integer(), nullable=False),
                sa.Column('batch_number', sa.String(50), nullable=True),
                sa.Column('quantity', sa.Integer(), nullable=False, server_default='0'),
                sa.Column('production_date', sa.Date(), nullable=True),
                sa.Column('expiry_date', sa.Date(), nullable=False),
                sa.Column('inbound_date', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
                sa.Column('zero_stock_date', sa.DateTime(), nullable=True, comment='库存变为0的时间'),
                sa.Column('remark', sa.String(200), nullable=True),
                sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
                sa.PrimaryKeyConstraint('id'),
                sa.ForeignKeyConstraint(['item_id'], [f'{item_table}.id'])
            )
            op.create_index(f'ix_{table_name}_item_id', table_name, ['item_id'])
            op.create_index(f'ix_{table_name}_batch_number', table_name, ['batch_number'])
    
    # 5. 迁移现有数据到 medicine_* 表（如果存在旧表且新表为空）
    if 'medicine_categories' in existing_tables and 'medicines' in existing_tables:
        # 检查 medicine_categories 是否有数据
        result = conn.execute(sa.text("SELECT COUNT(*) FROM medicine_categories"))
        count = result.scalar()
        
        # 如果 medicine_categories 已有数据，说明已经迁移过，跳过
        if count == 0:
            # 迁移分类数据（从旧的 medicine_categories 到新的 medicine_categories）
            # 注意：这里假设旧表和新表名称相同，实际上它们是同一个表
            pass
        
        # 检查是否需要从 medicines 迁移到 medicine_items
        if 'medicine_items' not in existing_tables:
            # 如果 medicine_items 不存在，说明需要重命名
            op.rename_table('medicines', 'medicine_items')
            
            # 重命名批次表
            if 'batches' in existing_tables:
                op.rename_table('batches', 'medicine_batches')
                # 更新外键列名
                op.alter_column('medicine_batches', 'medicine_id', new_column_name='item_id')
    
    # 6. 为其他场景初始化默认分类
    default_categories = {
        'inventory': [
            ('日用品', '日常生活用品', 1),
            ('食品饮料', '食品和饮料类', 2),
            ('办公用品', '办公文具用品', 3),
            ('电子产品', '电子设备类', 4),
            ('其他', '其他类别', 99)
        ],
        'food': [
            ('主食', '米面粮油等主食', 1),
            ('蔬菜', '新鲜蔬菜', 2),
            ('水果', '新鲜水果', 3),
            ('肉类', '肉类食品', 4),
            ('调味品', '调味料', 5),
            ('其他', '其他食品', 99)
        ],
        'equipment': [
            ('办公设备', '办公用设备', 1),
            ('生产设备', '生产用设备', 2),
            ('检测设备', '检测仪器', 3),
            ('运输设备', '运输工具', 4),
            ('其他设备', '其他类设备', 99)
        ],
        'document': [
            ('合同文件', '合同类文档', 1),
            ('技术文档', '技术资料', 2),
            ('财务文件', '财务相关文档', 3),
            ('人事文件', '人事档案', 4),
            ('其他文档', '其他类文档', 99)
        ],
        'custom': [
            ('分类一', '自定义分类1', 1),
            ('分类二', '自定义分类2', 2),
            ('分类三', '自定义分类3', 3),
            ('其他', '其他类别', 99)
        ]
    }
    
    for mode, categories in default_categories.items():
        table_name = f'{mode}_categories'
        # 检查表是否有数据
        result = conn.execute(sa.text(f"SELECT COUNT(*) FROM {table_name}"))
        count = result.scalar()
        
        # 只在表为空时插入默认数据
        if count == 0:
            for name, desc, sort_order in categories:
                conn.execute(sa.text(f"""
                    INSERT INTO {table_name} (name, description, sort_order)
                    VALUES (:name, :desc, :sort_order)
                """), {"name": name, "desc": desc, "sort_order": sort_order})
            conn.commit()


def downgrade() -> None:
    # 删除 current_mode 字段
    op.drop_column('users', 'current_mode')
    
    # 删除所有场景的表
    modes = ['medicine', 'inventory', 'food', 'equipment', 'document', 'custom']
    
    for mode in modes:
        op.drop_table(f'{mode}_batches')
        op.drop_table(f'{mode}_items')
        op.drop_table(f'{mode}_categories')

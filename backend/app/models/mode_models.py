"""多场景动态模型"""
from datetime import datetime, date
from typing import Type
from sqlalchemy import String, Boolean, Text, ForeignKey, func, Date, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.utils.mode_tables import get_table_name


def create_category_model(mode: str) -> Type:
    """动态创建分类模型"""
    table_name = get_table_name(mode, 'categories')
    
    class CategoryModel(Base):
        __tablename__ = table_name
        __table_args__ = {'extend_existing': True}
        
        id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
        name: Mapped[str] = mapped_column(String(50), nullable=False)
        description: Mapped[str | None] = mapped_column(String(200))
        sort_order: Mapped[int] = mapped_column(default=0)
        created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    return CategoryModel


def create_item_model(mode: str) -> Type:
    """动态创建物品模型"""
    table_name = get_table_name(mode, 'items')
    
    class ItemModel(Base):
        __tablename__ = table_name
        __table_args__ = {'extend_existing': True}
        
        id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
        name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
        code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
        barcode: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True)
        category_id: Mapped[int] = mapped_column(Integer, nullable=False)
        specification: Mapped[str | None] = mapped_column(String(100))
        unit: Mapped[str] = mapped_column(String(20), nullable=False)
        manufacturer: Mapped[str | None] = mapped_column(String(100))
        price: Mapped[float | None] = mapped_column(Float, nullable=True)
        description: Mapped[str | None] = mapped_column(Text)
        is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
        created_at: Mapped[datetime] = mapped_column(default=func.now())
        updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())
    
    return ItemModel


def create_batch_model(mode: str) -> Type:
    """动态创建批次模型"""
    table_name = get_table_name(mode, 'batches')
    
    # 药品场景使用 medicine_id 字段（兼容原有表结构）
    if mode == 'medicine':
        class BatchModel(Base):
            __tablename__ = table_name
            __table_args__ = {'extend_existing': True}
            
            id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
            medicine_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
            batch_number: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True)
            quantity: Mapped[int] = mapped_column(default=0)
            production_date: Mapped[date | None] = mapped_column(Date, nullable=True)
            expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
            inbound_date: Mapped[datetime] = mapped_column(default=func.now())
            zero_stock_date: Mapped[datetime | None] = mapped_column(nullable=True)
            remark: Mapped[str | None] = mapped_column(String(200))
            created_at: Mapped[datetime] = mapped_column(default=func.now())
            
            @property
            def item_id(self):
                """别名，方便统一访问"""
                return self.medicine_id
    else:
        class BatchModel(Base):
            __tablename__ = table_name
            __table_args__ = {'extend_existing': True}
            
            id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
            item_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
            batch_number: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True)
            quantity: Mapped[int] = mapped_column(default=0)
            production_date: Mapped[date | None] = mapped_column(Date, nullable=True)
            expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
            inbound_date: Mapped[datetime] = mapped_column(default=func.now())
            zero_stock_date: Mapped[datetime | None] = mapped_column(nullable=True)
            remark: Mapped[str | None] = mapped_column(String(200))
            created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    return BatchModel


# 模型缓存
_model_cache: dict[str, dict[str, Type]] = {}


def get_models(mode: str) -> dict[str, Type]:
    """获取指定场景的所有模型"""
    if mode not in _model_cache:
        _model_cache[mode] = {
            'category': create_category_model(mode),
            'item': create_item_model(mode),
            'batch': create_batch_model(mode)
        }
    return _model_cache[mode]


def get_category_model(mode: str) -> Type:
    """获取分类模型"""
    return get_models(mode)['category']


def get_item_model(mode: str) -> Type:
    """获取物品模型"""
    return get_models(mode)['item']


def get_batch_model(mode: str) -> Type:
    """获取批次模型"""
    return get_models(mode)['batch']

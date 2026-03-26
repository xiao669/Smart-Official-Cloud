"""药品模型"""
from datetime import datetime
from sqlalchemy import String, Boolean, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class MedicineCategory(Base):
    """药品分类表"""
    __tablename__ = "medicine_categories"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(String(200))
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    # 关系
    medicines: Mapped[list["Medicine"]] = relationship(back_populates="category")


class Medicine(Base):
    """药品表"""
    __tablename__ = "medicines"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    barcode: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True, comment="药品条形码")
    category_id: Mapped[int] = mapped_column(ForeignKey("medicine_categories.id"), nullable=False)
    specification: Mapped[str | None] = mapped_column(String(100))
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    manufacturer: Mapped[str | None] = mapped_column(String(100))
    price: Mapped[float | None] = mapped_column(nullable=True, comment="药品单价")
    description: Mapped[str | None] = mapped_column(Text)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())
    
    # 关系
    category: Mapped["MedicineCategory"] = relationship(back_populates="medicines")
    batches: Mapped[list["Batch"]] = relationship(back_populates="medicine")


# 避免循环导入
from app.models.inventory import Batch

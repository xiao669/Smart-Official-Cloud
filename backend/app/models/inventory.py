"""库存模型"""
from datetime import datetime, date
from sqlalchemy import String, ForeignKey, func, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Batch(Base):
    """批次表"""
    __tablename__ = "batches"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    medicine_id: Mapped[int] = mapped_column(ForeignKey("medicines.id"), index=True, nullable=False)
    batch_number: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True)  # 改为可空
    quantity: Mapped[int] = mapped_column(default=0)
    production_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    inbound_date: Mapped[datetime] = mapped_column(default=func.now())
    zero_stock_date: Mapped[datetime | None] = mapped_column(nullable=True)  # 库存变为0的时间
    remark: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    # 关系
    medicine: Mapped["Medicine"] = relationship(back_populates="batches")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="batch")


class Transaction(Base):
    """库存交易记录表"""
    __tablename__ = "transactions"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"), index=True, nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # inbound/outbound
    quantity: Mapped[int] = mapped_column(nullable=False)
    reason: Mapped[str | None] = mapped_column(String(200))
    recipient: Mapped[str | None] = mapped_column(String(100))
    operator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    # 关系
    batch: Mapped["Batch"] = relationship(back_populates="transactions")
    operator: Mapped["User"] = relationship()


class Stocktake(Base):
    """盘点任务表"""
    __tablename__ = "stocktakes"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/in_progress/completed
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    # 关系
    items: Mapped[list["StocktakeItem"]] = relationship(back_populates="stocktake")
    creator: Mapped["User"] = relationship()


class StocktakeItem(Base):
    """盘点明细表"""
    __tablename__ = "stocktake_items"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    stocktake_id: Mapped[int] = mapped_column(ForeignKey("stocktakes.id"), index=True, nullable=False)
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"), nullable=False)
    expected_quantity: Mapped[int] = mapped_column(nullable=False)
    actual_quantity: Mapped[int | None] = mapped_column(nullable=True)
    discrepancy: Mapped[int | None] = mapped_column(nullable=True)
    remark: Mapped[str | None] = mapped_column(String(200))
    
    # 关系
    stocktake: Mapped["Stocktake"] = relationship(back_populates="items")
    batch: Mapped["Batch"] = relationship()


# 避免循环导入
from app.models.medicine import Medicine
from app.models.user import User

"""预警模型"""
from datetime import datetime
from sqlalchemy import String, Boolean, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Warning(Base):
    """预警记录表"""
    __tablename__ = "warnings"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # expiry/expired/low_stock
    mode: Mapped[str] = mapped_column(String(20), index=True, default="medicine")  # 场景：medicine/inventory/food
    medicine_id: Mapped[int | None] = mapped_column(ForeignKey("medicines.id"), nullable=True)  # 药品场景
    item_id: Mapped[int | None] = mapped_column(nullable=True)  # 其他场景的物品ID
    batch_id: Mapped[int | None] = mapped_column(ForeignKey("batches.id"), nullable=True)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[datetime | None] = mapped_column(nullable=True)  # 已读时间，用于重新提醒
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)  # 是否被用户忽略（不再提醒）
    dismissed_at: Mapped[datetime | None] = mapped_column(nullable=True)  # 忽略时间
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    # 关系
    medicine: Mapped["Medicine"] = relationship()
    batch: Mapped["Batch"] = relationship()


class WarningConfig(Base):
    """预警配置表"""
    __tablename__ = "warning_configs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    config_key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    config_value: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(200))
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())


class ReplenishSuggestion(Base):
    """补货建议表"""
    __tablename__ = "replenish_suggestions"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    medicine_id: Mapped[int] = mapped_column(ForeignKey("medicines.id"), nullable=False)
    current_stock: Mapped[int] = mapped_column(nullable=False)  # 当前库存
    avg_daily_consumption: Mapped[float] = mapped_column(nullable=False)  # 日均消耗
    days_until_stockout: Mapped[int] = mapped_column(nullable=False)  # 预计断货天数
    suggested_quantity: Mapped[int] = mapped_column(nullable=False)  # 建议补货数量
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=False)  # 是否紧急
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    # 关系
    medicine: Mapped["Medicine"] = relationship()


from app.models.medicine import Medicine
from app.models.inventory import Batch

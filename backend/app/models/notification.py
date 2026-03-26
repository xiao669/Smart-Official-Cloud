"""推送通知模型"""
from datetime import datetime, date
from sqlalchemy import String, Boolean, ForeignKey, func, Date, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Notification(Base):
    """推送通知记录表"""
    __tablename__ = "notifications"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    warning_id: Mapped[int] = mapped_column(ForeignKey("warnings.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(String(500), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # expired/expiry/low_stock
    is_pushed: Mapped[bool] = mapped_column(Boolean, default=False)  # 是否已推送到客户端
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)  # 是否已读
    push_date: Mapped[date] = mapped_column(Date, nullable=False)  # 推送日期
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    pushed_at: Mapped[datetime | None] = mapped_column(nullable=True)  # 实际推送时间
    
    # 关系
    user: Mapped["User"] = relationship()
    warning: Mapped["Warning"] = relationship()


class DailyPushCount(Base):
    """每日推送计数表"""
    __tablename__ = "daily_push_counts"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    push_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    push_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # 联合唯一索引
    __table_args__ = (
        {'mysql_charset': 'utf8mb4'},
    )


from app.models.user import User
from app.models.warning import Warning

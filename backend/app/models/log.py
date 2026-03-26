"""操作日志模型"""
from datetime import datetime
from sqlalchemy import String, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class OperationLog(Base):
    """操作日志表"""
    __tablename__ = "operation_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    operation: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    target_type: Mapped[str | None] = mapped_column(String(50))
    target_id: Mapped[int | None] = mapped_column(nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    # 关系
    user: Mapped["User"] = relationship()


from app.models.user import User

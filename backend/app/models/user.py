"""用户模型"""
from datetime import datetime
from sqlalchemy import String, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    realname: Mapped[str | None] = mapped_column(String(50))
    user_type: Mapped[str] = mapped_column(String(20), default="operator")  # admin/manager/operator
    department: Mapped[str | None] = mapped_column(String(50))
    phone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login: Mapped[datetime | None] = mapped_column(nullable=True)
    push_cid: Mapped[str | None] = mapped_column(String(100), nullable=True)  # 推送客户端ID
    current_mode: Mapped[str] = mapped_column(String(20), default="medicine", nullable=False)  # 当前使用场景
    created_at: Mapped[datetime] = mapped_column(default=func.now())

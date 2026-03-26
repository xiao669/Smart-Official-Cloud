"""短信通知模型"""
from datetime import datetime, date
from sqlalchemy import String, Boolean, Integer, Text, Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class SmsApiConfig(Base):
    """短信API配置表（全局配置，存储阿里云API密钥等）"""
    __tablename__ = "sms_api_configs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    config_key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    config_value: Mapped[str] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())


class SmsLog(Base):
    """短信发送记录表"""
    __tablename__ = "sms_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)  # 接收手机号
    content: Mapped[str] = mapped_column(Text, nullable=False)  # 短信内容摘要
    sms_type: Mapped[str] = mapped_column(String(20), nullable=False)  # expiry/expired/low_stock
    warning_id: Mapped[int | None] = mapped_column(ForeignKey("warnings.id"), nullable=True)
    
    # 发送状态
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/success/failed
    error_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(255), nullable=True)
    biz_id: Mapped[str | None] = mapped_column(String(100), nullable=True)  # 阿里云返回的业务ID
    
    # 时间
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    sent_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    # 关联
    user = relationship("User", backref="sms_logs")
    warning = relationship("Warning", backref="sms_logs")


class SmsDailyCount(Base):
    """每日短信发送计数表"""
    __tablename__ = "sms_daily_counts"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    send_date: Mapped[date] = mapped_column(Date, nullable=False)
    send_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # 关联
    user = relationship("User", backref="sms_daily_counts")


class SmsConfig(Base):
    """短信通知配置表"""
    __tablename__ = "sms_configs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, unique=True)
    
    # 通知开关
    sms_enabled: Mapped[bool] = mapped_column(Boolean, default=False)  # 是否启用短信通知
    expiry_sms_enabled: Mapped[bool] = mapped_column(Boolean, default=True)  # 临期预警短信
    expired_sms_enabled: Mapped[bool] = mapped_column(Boolean, default=True)  # 已过期短信
    low_stock_sms_enabled: Mapped[bool] = mapped_column(Boolean, default=False)  # 低库存短信
    
    # 通知时间设置
    notify_time: Mapped[str] = mapped_column(String(10), default="09:00")  # 每日通知时间
    
    # 通知手机号（可以和用户手机号不同）
    notify_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())
    
    # 关联
    user = relationship("User", backref="sms_config")

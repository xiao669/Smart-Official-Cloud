"""OCR审核模型"""
from datetime import datetime
from sqlalchemy import String, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class OcrRecord(Base):
    """OCR审核记录表"""
    __tablename__ = "ocr_records"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    ocr_result: Mapped[dict] = mapped_column(JSON, nullable=True)
    corrected_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/approved/rejected
    reviewer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reject_reason: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    reviewed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    # 关系
    reviewer: Mapped["User"] = relationship()


from app.models.user import User

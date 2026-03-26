"""库存相关的 Pydantic 模型"""
from datetime import datetime, date
from pydantic import BaseModel, Field


class InboundCreate(BaseModel):
    """入库请求"""
    medicine_id: int
    batch_number: str | None = Field(None, max_length=50)  # 改为选填
    quantity: int = Field(..., gt=0)
    production_date: date | None = None
    expiry_date: date
    remark: str | None = None


class OutboundCreate(BaseModel):
    """出库请求"""
    batch_id: int
    quantity: int = Field(..., gt=0)
    reason: str = Field(..., min_length=1, max_length=200)
    recipient: str | None = None


class BatchResponse(BaseModel):
    """批次响应"""
    id: int
    medicine_id: int
    medicine_name: str | None = None
    medicine_price: float | None = None
    medicine_unit: str | None = None
    batch_number: str | None = None  # 批次号可为空
    quantity: int
    production_date: date | None = None
    expiry_date: date
    inbound_date: datetime
    remark: str | None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    """交易记录响应"""
    id: int
    batch_id: int
    type: str
    quantity: int
    reason: str | None
    recipient: str | None
    operator_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class StocktakeCreate(BaseModel):
    """创建盘点任务"""
    name: str = Field(..., min_length=1, max_length=100)


class StocktakeItemResult(BaseModel):
    """盘点结果"""
    batch_id: int
    actual_quantity: int
    remark: str | None = None


class StocktakeResponse(BaseModel):
    """盘点任务响应"""
    id: int
    name: str
    status: str
    creator_name: str | None = None
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True

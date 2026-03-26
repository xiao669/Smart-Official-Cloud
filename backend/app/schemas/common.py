"""通用响应模型"""
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应模型"""
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class SuccessResponse(BaseModel):
    """成功响应模型"""
    success: bool = True
    message: str = "Operation successful"


class MessageResponse(BaseModel):
    """消息响应模型"""
    message: str

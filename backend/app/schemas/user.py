"""用户管理相关的 Pydantic 模型"""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field, field_validator
import re


class UserCreate(BaseModel):
    """创建用户请求"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, description="密码")
    realname: str | None = Field(None, max_length=50, description="真实姓名")
    user_type: str = Field(..., description="用户类型：admin/manager/operator")
    department: str | None = Field(None, max_length=50, description="部门")
    phone: str | None = Field(None, max_length=20, description="手机号")
    email: str | None = Field(None, max_length=100, description="邮箱")

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('用户名只能包含字母、数字、下划线和连字符')
        return v

    @field_validator('user_type')
    @classmethod
    def validate_user_type(cls, v: str) -> str:
        if v not in ['admin', 'manager', 'operator']:
            raise ValueError('用户类型必须是 admin、manager 或 operator')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v and not re.match(r'^\d{11}$', v):
            raise ValueError('手机号格式不正确，应为11位数字')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str | None) -> str | None:
        if v and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('邮箱格式不正确')
        return v


class UserUpdate(BaseModel):
    """更新用户请求"""
    realname: str | None = Field(None, max_length=50, description="真实姓名")
    user_type: str | None = Field(None, description="用户类型：admin/manager/operator")
    department: str | None = Field(None, max_length=50, description="部门")
    phone: str | None = Field(None, max_length=20, description="手机号")
    email: str | None = Field(None, max_length=100, description="邮箱")
    password: str | None = Field(None, min_length=6, description="密码（可选）")

    @field_validator('user_type')
    @classmethod
    def validate_user_type(cls, v: str | None) -> str | None:
        if v and v not in ['admin', 'manager', 'operator']:
            raise ValueError('用户类型必须是 admin、manager 或 operator')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v and not re.match(r'^\d{11}$', v):
            raise ValueError('手机号格式不正确，应为11位数字')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str | None) -> str | None:
        if v and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('邮箱格式不正确')
        return v


class UserDetailResponse(BaseModel):
    """用户详情响应"""
    id: int
    username: str
    realname: str | None
    user_type: str
    department: str | None
    phone: str | None
    email: str | None
    is_active: bool
    last_login: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class UserListItem(BaseModel):
    """用户列表项"""
    id: int
    username: str
    realname: str | None
    user_type: str
    department: str | None
    phone: str | None
    email: str | None
    is_active: bool
    last_login: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """用户列表响应"""
    items: list[UserListItem]
    total: int
    page: int
    page_size: int


class PasswordResetRequest(BaseModel):
    """密码重置请求"""
    new_password: str = Field(..., min_length=6, description="新密码")
    confirm_password: str = Field(..., min_length=6, description="确认密码")

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('两次密码输入不一致')
        return v


class BatchStatusRequest(BaseModel):
    """批量状态更新请求"""
    user_ids: list[int] = Field(..., min_length=1, description="用户ID列表")
    is_active: bool = Field(..., description="是否激活")


class BatchStatusResponse(BaseModel):
    """批量状态更新响应"""
    success_count: int
    fail_count: int
    skipped_count: int
    message: str

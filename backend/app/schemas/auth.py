"""认证相关的 Pydantic 模型"""
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """登录请求"""
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


class SmsCodeRequest(BaseModel):
    """发送验证码请求"""
    phone: str = Field(..., min_length=11, max_length=11, pattern=r"^1[3-9]\d{9}$")


class SmsLoginRequest(BaseModel):
    """短信验证码登录请求"""
    phone: str = Field(..., min_length=11, max_length=11, pattern=r"^1[3-9]\d{9}$")
    code: str = Field(..., min_length=4, max_length=6)


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    realname: str | None
    user_type: str
    department: str | None
    phone: str | None
    email: str | None
    is_active: bool
    current_mode: str = "medicine"  # 当前使用场景

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """登录响应"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """Token 载荷"""
    sub: str  # user_id
    username: str
    user_type: str
    exp: int


class SmsCodeResponse(BaseModel):
    """发送验证码响应"""
    success: bool
    message: str
    # 开发模式下返回验证码（生产环境不返回）
    code: str | None = None

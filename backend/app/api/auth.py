"""认证路由"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.auth import AuthService
from app.schemas.auth import (
    LoginRequest, LoginResponse, UserResponse,
    SmsCodeRequest, SmsLoginRequest, SmsCodeResponse
)
from app.api.deps import CurrentUser

router = APIRouter()


def get_client_ip(request: Request) -> str:
    """获取客户端真实IP"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    if request.client:
        return request.client.host
    return "unknown"


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    req: Request,
    db: AsyncSession = Depends(get_db)
):
    """用户名密码登录"""
    client_ip = get_client_ip(req)
    auth_service = AuthService(db, client_ip)
    return await auth_service.authenticate(request.username, request.password)


@router.post("/sms/send", response_model=SmsCodeResponse)
async def send_sms_code(
    request: SmsCodeRequest,
    req: Request,
    db: AsyncSession = Depends(get_db)
):
    """发送短信验证码
    
    手机号必须已在系统中注册才能发送验证码
    """
    client_ip = get_client_ip(req)
    auth_service = AuthService(db, client_ip)
    return await auth_service.send_sms_code(request.phone)


@router.post("/sms/login", response_model=LoginResponse)
async def sms_login(
    request: SmsLoginRequest,
    req: Request,
    db: AsyncSession = Depends(get_db)
):
    """短信验证码登录"""
    client_ip = get_client_ip(req)
    auth_service = AuthService(db, client_ip)
    return await auth_service.authenticate_by_sms(request.phone, request.code)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: CurrentUser):
    """获取当前用户信息"""
    return UserResponse.model_validate(current_user)


@router.put("/mode", response_model=UserResponse)
async def update_user_mode(
    mode: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """更新用户的使用场景"""
    auth_service = AuthService(db, "")
    return await auth_service.update_user_mode(current_user.id, mode)

"""短信通知API"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.sms_notification import SmsNotificationService
from app.services.warning import WarningService

router = APIRouter(prefix="/sms", tags=["短信通知"])


class SmsConfigUpdate(BaseModel):
    """用户短信配置更新"""
    sms_enabled: Optional[bool] = None
    expiry_sms_enabled: Optional[bool] = None
    expired_sms_enabled: Optional[bool] = None
    low_stock_sms_enabled: Optional[bool] = None
    notify_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    notify_phone: Optional[str] = Field(None, max_length=20)


class SmsApiConfigUpdate(BaseModel):
    """短信API配置更新（管理员）"""
    access_key_id: Optional[str] = Field(None, max_length=100)
    access_key_secret: Optional[str] = Field(None, max_length=100)
    sign_name: Optional[str] = Field(None, max_length=50)
    template_code: Optional[str] = Field(None, max_length=50)
    expired_template_code: Optional[str] = Field(None, max_length=50)
    low_stock_template_code: Optional[str] = Field(None, max_length=50)
    sms_enabled: Optional[bool] = None
    daily_limit: Optional[int] = Field(None, ge=0)  # 0表示不限制


class SendSmsRequest(BaseModel):
    """发送短信请求"""
    warning_id: int
    phone: Optional[str] = None


class TestSmsRequest(BaseModel):
    """测试短信请求"""
    phone: str = Field(..., min_length=11, max_length=11)


@router.get("/api-config")
async def get_api_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取短信API配置（管理员）"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以查看API配置")
    
    service = SmsNotificationService(db)
    config = await service.get_api_config()
    
    # 隐藏敏感信息的部分内容
    if config.get("access_key_id"):
        key = config["access_key_id"]
        config["access_key_id_masked"] = key[:4] + "****" + key[-4:] if len(key) > 8 else "****"
    if config.get("access_key_secret"):
        config["access_key_secret_masked"] = "********"
    
    return config


@router.put("/api-config")
async def update_api_config(
    data: SmsApiConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新短信API配置（管理员）"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以修改API配置")
    
    service = SmsNotificationService(db)
    
    config = await service.update_api_config(
        access_key_id=data.access_key_id,
        access_key_secret=data.access_key_secret,
        sign_name=data.sign_name,
        template_code=data.template_code,
        expired_template_code=data.expired_template_code,
        low_stock_template_code=data.low_stock_template_code,
        sms_enabled=data.sms_enabled,
        daily_limit=data.daily_limit
    )
    
    return {"message": "API配置更新成功", "config": config}


@router.get("/config")
async def get_sms_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的短信配置"""
    service = SmsNotificationService(db)
    config = await service.get_user_sms_config(current_user.id)
    
    # 添加用户手机号信息
    config["user_phone"] = current_user.phone
    
    return config


@router.put("/config")
async def update_sms_config(
    data: SmsConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新短信配置"""
    service = SmsNotificationService(db)
    
    config = await service.update_user_sms_config(
        user_id=current_user.id,
        sms_enabled=data.sms_enabled,
        expiry_sms_enabled=data.expiry_sms_enabled,
        expired_sms_enabled=data.expired_sms_enabled,
        low_stock_sms_enabled=data.low_stock_sms_enabled,
        notify_time=data.notify_time,
        notify_phone=data.notify_phone
    )
    
    return {"message": "配置更新成功", "config": config}


@router.post("/send")
async def send_warning_sms(
    data: SendSmsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """发送预警短信"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.warning import Warning
    
    # 获取预警
    result = await db.execute(
        select(Warning)
        .where(Warning.id == data.warning_id)
        .options(selectinload(Warning.medicine))
    )
    warning = result.scalar_one_or_none()
    
    if not warning:
        raise HTTPException(status_code=404, detail="预警不存在")
    
    service = SmsNotificationService(db)
    send_result = await service.send_warning_sms(
        user_id=current_user.id,
        warning=warning,
        phone=data.phone
    )
    
    if not send_result["success"]:
        raise HTTPException(status_code=400, detail=send_result["message"])
    
    return send_result


@router.post("/send-batch")
async def send_batch_sms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """批量发送预警短信"""
    service = SmsNotificationService(db)
    result = await service.send_batch_warnings_sms(current_user.id)
    return result


@router.post("/test")
async def test_sms(
    data: TestSmsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """发送测试短信"""
    # 只有管理员可以发送测试短信
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以发送测试短信")
    
    from app.services.sms import get_sms_service_from_db
    
    sms_service = await get_sms_service_from_db(db)
    
    result = await sms_service.send_sms(
        phone_number=data.phone,
        template_param={
            "name": "测试药品",
            "days": "7",
            "batch": "TEST001"
        }
    )
    
    return result


@router.get("/logs")
async def get_sms_logs(
    status: Optional[str] = Query(None, description="状态: pending/success/failed"),
    sms_type: Optional[str] = Query(None, description="类型: expiry/expired/low_stock"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取短信发送记录"""
    service = SmsNotificationService(db)
    
    # 管理员可以看所有记录，普通用户只能看自己的
    user_id = None if current_user.user_type == "admin" else current_user.id
    
    return await service.get_sms_logs(
        user_id=user_id,
        status=status,
        sms_type=sms_type,
        page=page,
        page_size=page_size
    )


@router.get("/stats")
async def get_sms_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取短信统计"""
    service = SmsNotificationService(db)
    
    # 管理员看全局统计，普通用户看自己的
    user_id = None if current_user.user_type == "admin" else current_user.id
    
    return await service.get_sms_stats(user_id)


@router.get("/status")
async def get_sms_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取短信服务状态"""
    service = SmsNotificationService(db)
    api_config = await service.get_api_config()
    user_config = await service.get_user_sms_config(current_user.id)
    stats = await service.get_sms_stats(current_user.id)
    
    return {
        "service_enabled": api_config.get("sms_enabled", False),
        "user_enabled": user_config["sms_enabled"],
        "has_api_key": bool(api_config.get("access_key_id")),
        "has_template": bool(api_config.get("template_code")),
        "daily_limit": api_config.get("daily_limit", 10),
        "remaining_today": stats["remaining_today"],
        "notify_phone": user_config["notify_phone"] or current_user.phone
    }

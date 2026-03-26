"""系统管理路由"""
from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from datetime import date

from app.api.deps import DbSession, CurrentUser, require_roles
from app.services.user import UserService
from app.schemas.auth import UserResponse
from app.schemas.common import PaginatedResponse

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str
    realname: str | None = None
    user_type: str = "operator"
    department: str | None = None
    phone: str | None = None
    email: str | None = None


class UserUpdate(BaseModel):
    realname: str | None = None
    user_type: str | None = None
    department: str | None = None
    phone: str | None = None
    email: str | None = None
    password: str | None = None


@router.get("/users", response_model=PaginatedResponse[UserResponse])
async def list_users(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _: None = Depends(require_roles("admin"))
):
    """获取用户列表"""
    service = UserService(db)
    return await service.list_users(page, page_size)


@router.post("/users", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    db: DbSession,
    current_user: CurrentUser,
    _: None = Depends(require_roles("admin"))
):
    """创建用户"""
    service = UserService(db)
    return await service.create_user(
        username=data.username,
        password=data.password,
        realname=data.realname,
        user_type=data.user_type,
        department=data.department,
        phone=data.phone,
        email=data.email,
    )


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: DbSession,
    current_user: CurrentUser,
    _: None = Depends(require_roles("admin"))
):
    """更新用户"""
    service = UserService(db)
    return await service.update_user(
        user_id=user_id,
        realname=data.realname,
        user_type=data.user_type,
        department=data.department,
        phone=data.phone,
        email=data.email,
        password=data.password,
    )


@router.put("/users/{user_id}/toggle-status", response_model=UserResponse)
async def toggle_user_status(
    user_id: int,
    db: DbSession,
    current_user: CurrentUser,
    _: None = Depends(require_roles("admin"))
):
    """切换用户状态"""
    service = UserService(db)
    return await service.toggle_user_status(user_id)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: DbSession,
    current_user: CurrentUser,
    _: None = Depends(require_roles("admin"))
):
    """删除用户"""
    service = UserService(db)
    await service.delete_user(user_id)
    return {"message": "删除成功"}


@router.get("/logs")
async def list_logs(
    db: DbSession,
    current_user: CurrentUser,
    operation: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _: None = Depends(require_roles("admin"))
):
    """获取操作日志"""
    # TODO: 实现操作日志查询
    return {"items": [], "total": 0, "page": page, "page_size": page_size, "pages": 0}


class SystemSettings(BaseModel):
    """系统配置"""
    site_name: str | None = None
    # 预警配置
    expiry_warning_days: int | None = None
    low_stock_threshold: int | None = None
    re_remind_enabled: bool | None = None
    re_remind_days: int | None = None
    # 库存配置
    expiry_threshold_days: int | None = None  # 临期阈值天数
    auto_cleanup_days: int | None = None  # 自动清理天数
    # 安全配置
    token_expire_days: int | None = None  # Token有效期
    sms_code_expire_minutes: int | None = None  # 验证码有效期
    sms_code_max_attempts: int | None = None  # 验证码最大尝试次数


@router.get("/settings")
async def get_settings(db: DbSession, current_user: CurrentUser):
    """获取系统配置"""
    from app.services.warning import WarningService
    from sqlalchemy import select
    from app.models.warning import WarningConfig
    
    warning_service = WarningService(db)
    config = await warning_service.get_config()
    
    # 获取所有配置
    result = await db.execute(select(WarningConfig))
    all_configs = {c.config_key: c.config_value for c in result.scalars().all()}
    
    return {
        "site_name": all_configs.get("site_name", "医药管理系统"),
        # 预警配置
        "expiry_warning_days": config.get("expiry_warning_days", 30),
        "low_stock_threshold": config.get("low_stock_threshold", 10),
        "re_remind_enabled": config.get("re_remind_enabled", True),
        "re_remind_days": config.get("re_remind_days", 3),
        # 库存配置
        "expiry_threshold_days": int(all_configs.get("expiry_threshold_days", "90")),
        "auto_cleanup_days": int(all_configs.get("auto_cleanup_days", "30")),
        # 安全配置
        "token_expire_days": int(all_configs.get("token_expire_days", "7")),
        "sms_code_expire_minutes": int(all_configs.get("sms_code_expire_minutes", "5")),
        "sms_code_max_attempts": int(all_configs.get("sms_code_max_attempts", "5")),
    }


@router.put("/settings")
async def update_settings(
    data: SystemSettings,
    db: DbSession,
    current_user: CurrentUser,
    _: None = Depends(require_roles("admin"))
):
    """更新系统配置"""
    from app.services.warning import WarningService
    from sqlalchemy import select
    from app.models.warning import WarningConfig
    
    warning_service = WarningService(db)
    
    # 更新预警配置
    await warning_service.update_config(
        expiry_warning_days=data.expiry_warning_days or 30,
        low_stock_threshold=data.low_stock_threshold or 10,
        re_remind_enabled=data.re_remind_enabled,
        re_remind_days=data.re_remind_days
    )
    
    # 更新其他配置
    configs_to_update = []
    if data.site_name is not None:
        configs_to_update.append(("site_name", data.site_name))
    if data.expiry_threshold_days is not None:
        configs_to_update.append(("expiry_threshold_days", str(data.expiry_threshold_days)))
    if data.auto_cleanup_days is not None:
        configs_to_update.append(("auto_cleanup_days", str(data.auto_cleanup_days)))
    if data.token_expire_days is not None:
        configs_to_update.append(("token_expire_days", str(data.token_expire_days)))
    if data.sms_code_expire_minutes is not None:
        configs_to_update.append(("sms_code_expire_minutes", str(data.sms_code_expire_minutes)))
    if data.sms_code_max_attempts is not None:
        configs_to_update.append(("sms_code_max_attempts", str(data.sms_code_max_attempts)))
    
    for key, value in configs_to_update:
        result = await db.execute(
            select(WarningConfig).where(WarningConfig.config_key == key)
        )
        config = result.scalar_one_or_none()
        if config:
            config.config_value = value
        else:
            config = WarningConfig(config_key=key, config_value=value)
            db.add(config)
    
    await db.commit()
    
    return await get_settings(db, current_user)

"""预警管理路由"""
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.api.deps import DbSession, CurrentUser
from app.services.warning import WarningService
from app.schemas.common import PaginatedResponse, SuccessResponse

router = APIRouter()


class WarningConfigUpdate(BaseModel):
    expiry_warning_days: int
    low_stock_threshold: int
    reminder_start_time: str | None = None  # 提醒开始时间，如 "08:00"
    reminder_end_time: str | None = None    # 提醒结束时间，如 "20:00"
    reminder_enabled: bool | None = None    # 是否开启提醒
    re_remind_enabled: bool | None = None   # 是否开启重新提醒
    re_remind_days: int | None = None       # 已读N天后重新提醒


@router.get("")
async def list_warnings(
    db: DbSession,
    current_user: CurrentUser,
    type: str | None = None,
    is_read: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """获取预警列表"""
    service = WarningService(db, current_user.current_mode)
    return await service.list_warnings(type, is_read, page, page_size)


@router.get("/config")
async def get_config(db: DbSession, current_user: CurrentUser):
    """获取预警配置"""
    service = WarningService(db, current_user.current_mode)
    return await service.get_config()


@router.put("/config")
async def update_config(data: WarningConfigUpdate, db: DbSession, current_user: CurrentUser):
    """更新预警配置"""
    service = WarningService(db, current_user.current_mode)
    return await service.update_config(
        data.expiry_warning_days, 
        data.low_stock_threshold,
        data.reminder_start_time,
        data.reminder_end_time,
        data.reminder_enabled,
        data.re_remind_enabled,
        data.re_remind_days
    )


@router.put("/{warning_id}/read", response_model=SuccessResponse)
async def mark_as_read(warning_id: int, db: DbSession, current_user: CurrentUser):
    """标记预警为已读"""
    service = WarningService(db, current_user.current_mode)
    await service.mark_as_read(warning_id)
    return SuccessResponse(message="已标记为已读")


@router.put("/read-all", response_model=SuccessResponse)
async def mark_all_as_read(db: DbSession, current_user: CurrentUser):
    """一键标记所有未读预警为已读"""
    service = WarningService(db, current_user.current_mode)
    count = await service.mark_all_as_read()
    return SuccessResponse(message=f"已标记 {count} 条预警为已读")


@router.post("/check", response_model=dict)
async def check_warnings(db: DbSession, current_user: CurrentUser):
    """检查并生成预警"""
    service = WarningService(db, current_user.current_mode)
    count = await service.check_and_generate_warnings()
    return {"generated_count": count}


@router.delete("/{warning_id}", response_model=SuccessResponse)
async def delete_warning(warning_id: int, db: DbSession, current_user: CurrentUser):
    """删除单条预警"""
    service = WarningService(db, current_user.current_mode)
    success = await service.delete_warning(warning_id)
    if success:
        return SuccessResponse(message="删除成功")
    return SuccessResponse(message="预警不存在")


@router.delete("/batch/all", response_model=SuccessResponse)
async def delete_all_warnings(db: DbSession, current_user: CurrentUser):
    """删除所有预警"""
    service = WarningService(db, current_user.current_mode)
    count = await service.delete_all_warnings()
    return SuccessResponse(message=f"已删除 {count} 条预警")


@router.delete("/batch/read", response_model=SuccessResponse)
async def delete_read_warnings(db: DbSession, current_user: CurrentUser):
    """删除所有已读预警"""
    service = WarningService(db, current_user.current_mode)
    count = await service.delete_read_warnings()
    return SuccessResponse(message=f"已删除 {count} 条已读预警")


@router.delete("/batch/old", response_model=SuccessResponse)
async def cleanup_old_warnings(
    db: DbSession, 
    current_user: CurrentUser,
    days: int = Query(30, ge=1, le=365, description="清理多少天前的已读预警")
):
    """清理旧的已读预警（默认30天前）"""
    service = WarningService(db, current_user.current_mode)
    count = await service.cleanup_old_warnings(days)
    return SuccessResponse(message=f"已清理 {count} 条 {days} 天前的已读预警")


@router.get("/stats")
async def get_warning_stats(db: DbSession, current_user: CurrentUser):
    """获取预警统计信息"""
    service = WarningService(db, current_user.current_mode)
    return await service.get_warning_stats()


@router.get("/replenish-suggestions")
async def get_replenish_suggestions(db: DbSession, current_user: CurrentUser):
    """获取补货建议"""
    service = WarningService(db, current_user.current_mode)
    return await service.get_replenish_suggestions()


@router.post("/replenish-suggestions/calculate")
async def calculate_replenish_suggestions(db: DbSession, current_user: CurrentUser):
    """计算补货建议（根据出库记录分析）"""
    service = WarningService(db, current_user.current_mode)
    suggestions = await service.calculate_replenish_suggestions()
    return {"suggestions": suggestions, "count": len(suggestions)}

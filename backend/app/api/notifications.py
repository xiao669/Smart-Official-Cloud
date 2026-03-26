"""推送通知路由"""
from fastapi import APIRouter, Query

from app.api.deps import DbSession, CurrentUser
from app.services.notification import NotificationService
from app.schemas.common import SuccessResponse

router = APIRouter()


@router.get("/pending")
async def get_pending_notifications(
    db: DbSession,
    current_user: CurrentUser,
    limit: int = Query(1, ge=1, le=10, description="获取数量，默认1条（分别推送）")
):
    """
    获取待推送的通知
    - 每次默认返回1条（分别推送）
    - 每天最多推送10条
    """
    service = NotificationService(db)
    # 先生成新通知
    await service.generate_notifications_for_user(current_user.id)
    # 获取待推送通知
    notifications = await service.get_pending_notifications(current_user.id, limit)
    return {"items": notifications, "count": len(notifications)}


@router.post("/{notification_id}/pushed", response_model=SuccessResponse)
async def mark_notification_pushed(
    notification_id: int,
    db: DbSession,
    current_user: CurrentUser
):
    """标记通知为已推送"""
    service = NotificationService(db)
    await service.mark_as_pushed(notification_id)
    return SuccessResponse(message="已标记为已推送")


@router.post("/{notification_id}/read", response_model=SuccessResponse)
async def mark_notification_read(
    notification_id: int,
    db: DbSession,
    current_user: CurrentUser
):
    """标记通知为已读"""
    service = NotificationService(db)
    await service.mark_as_read(notification_id)
    return SuccessResponse(message="已标记为已读")


@router.get("")
async def get_notifications(
    db: DbSession,
    current_user: CurrentUser,
    is_read: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """获取通知列表"""
    service = NotificationService(db)
    return await service.get_user_notifications(
        current_user.id, is_read, page, page_size
    )


@router.get("/unread-count")
async def get_unread_count(
    db: DbSession,
    current_user: CurrentUser
):
    """获取未读通知数量"""
    service = NotificationService(db)
    count = await service.get_unread_count(current_user.id)
    return {"count": count}


@router.get("/status")
async def get_push_status(
    db: DbSession,
    current_user: CurrentUser
):
    """
    获取推送状态
    - daily_limit: 每日推送上限
    - pushed_today: 今日已推送数量
    - remaining_today: 今日剩余推送次数
    - pending_count: 待推送数量
    """
    service = NotificationService(db)
    return await service.get_push_status(current_user.id)

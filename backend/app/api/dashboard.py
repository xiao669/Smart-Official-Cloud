"""仪表盘路由"""
from fastapi import APIRouter, Query

from app.api.deps import DbSession, CurrentUser
from app.services.dashboard import DashboardService

router = APIRouter()


@router.get("/summary")
async def get_summary(db: DbSession, current_user: CurrentUser):
    """获取仪表盘概要数据"""
    service = DashboardService(db, current_user.current_mode)
    return await service.get_summary()


@router.get("/stats")
async def get_stats(db: DbSession, current_user: CurrentUser):
    """获取统计数据（移动端）"""
    service = DashboardService(db, current_user.current_mode)
    return await service.get_summary()


@router.get("/charts")
async def get_charts(
    db: DbSession,
    current_user: CurrentUser,
    chart_type: str = Query(..., alias="type", description="图表类型: inventory_trend, expiry_distribution, category_distribution, transaction_stats"),
    time_range: str = Query("30d", alias="range")
):
    """获取图表数据"""
    service = DashboardService(db, current_user.current_mode)

    if chart_type == "inventory_trend":
        days = int(time_range.replace("d", "")) if time_range.endswith("d") else 30
        return await service.get_inventory_trend(days)
    elif chart_type == "expiry_distribution":
        return await service.get_expiry_distribution()
    elif chart_type == "category_distribution":
        return await service.get_category_distribution()
    elif chart_type == "transaction_stats":
        days = int(time_range.replace("d", "")) if time_range.endswith("d") else 7
        return await service.get_transaction_stats(days)

    return {"labels": [], "values": []}


@router.get("/warnings")
async def get_recent_warnings(db: DbSession, current_user: CurrentUser):
    """获取最近预警"""
    service = DashboardService(db, current_user.current_mode)
    return await service.get_recent_warnings(10)

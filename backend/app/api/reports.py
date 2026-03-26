"""报表路由"""
from datetime import date
from io import BytesIO
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.api.deps import DbSession, CurrentUser
from app.services.report import ReportService

router = APIRouter()


@router.get("/inventory")
async def inventory_report(
    db: DbSession,
    current_user: CurrentUser,
    format: str = Query("json", description="输出格式: json, excel")
):
    """库存报表"""
    service = ReportService(db)
    data = await service.get_inventory_report()

    if format == "excel":
        content = await service.export_inventory_report()
        return StreamingResponse(
            BytesIO(content),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=inventory_report.xlsx"}
        )

    return data


@router.get("/expiry")
async def expiry_report(
    db: DbSession,
    current_user: CurrentUser,
    status: str = Query("expiring", description="状态: expiring, expired"),
    format: str = "json"
):
    """效期报表"""
    service = ReportService(db)
    data = await service.get_expiry_report(status)

    if format == "excel":
        content = await service.export_expiry_report(status)
        return StreamingResponse(
            BytesIO(content),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=expiry_report_{status}.xlsx"}
        )

    return data


@router.get("/transactions")
async def transactions_report(
    db: DbSession,
    current_user: CurrentUser,
    start_date: date | None = None,
    end_date: date | None = None,
    format: str = "json"
):
    """出入库报表"""
    service = ReportService(db)
    data = await service.get_transaction_report(start_date, end_date)

    if format == "excel":
        content = await service.export_transaction_report(start_date, end_date)
        return StreamingResponse(
            BytesIO(content),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=transaction_report.xlsx"}
        )

    return data


@router.get("/stocktake")
async def stocktake_report(db: DbSession, current_user: CurrentUser):
    """盘点报表"""
    service = ReportService(db)
    return await service.get_stocktake_report()

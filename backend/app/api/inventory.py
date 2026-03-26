"""库存管理路由"""
from fastapi import APIRouter, Query

from app.api.deps import DbSession, CurrentUser
from app.services.inventory_mode import InventoryService
from app.schemas.inventory import (
    InboundCreate, OutboundCreate, BatchResponse, TransactionResponse,
    StocktakeCreate, StocktakeItemResult, StocktakeResponse
)
from app.schemas.common import PaginatedResponse, SuccessResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[BatchResponse])
async def list_inventory(
    db: DbSession,
    current_user: CurrentUser,
    medicine_id: int | None = None,
    keyword: str | None = Query(None, description="搜索关键词（药品名称或批次号）"),
    status: str | None = Query(None, description="库存状态筛选：normal/expiring/expired"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    show_zero_stock: bool = Query(True, description="是否显示零库存批次（PC端=True，移动端=False）")
):
    """获取库存列表"""
    service = InventoryService(db, current_user.current_mode)
    return await service.list_inventory(medicine_id, keyword, status, page, page_size, show_zero_stock)


@router.post("/inbound", response_model=BatchResponse)
async def inbound(data: InboundCreate, db: DbSession, current_user: CurrentUser):
    """入库操作"""
    service = InventoryService(db, current_user.current_mode)
    return await service.inbound(data, current_user.id)


@router.post("/outbound", response_model=TransactionResponse)
async def outbound(data: OutboundCreate, db: DbSession, current_user: CurrentUser):
    """出库操作"""
    service = InventoryService(db, current_user.current_mode)
    return await service.outbound(data, current_user.id)


@router.get("/batches/{batch_id}", response_model=BatchResponse)
async def get_batch_detail(batch_id: int, db: DbSession, current_user: CurrentUser):
    """获取批次详情"""
    service = InventoryService(db, current_user.current_mode)
    return await service.get_batch_detail(batch_id)


@router.put("/batches/{batch_id}", response_model=BatchResponse)
async def update_batch(batch_id: int, data: InboundCreate, db: DbSession, current_user: CurrentUser):
    """更新批次信息"""
    service = InventoryService(db, current_user.current_mode)
    return await service.update_batch(batch_id, data, current_user.id)


@router.delete("/batches/{batch_id}", response_model=SuccessResponse)
async def delete_batch(batch_id: int, db: DbSession, current_user: CurrentUser):
    """删除批次"""
    service = InventoryService(db, current_user.current_mode)
    await service.delete_batch(batch_id, current_user.id)
    return SuccessResponse(message="删除成功")


@router.get("/batches/{batch_id}/transactions", response_model=list[TransactionResponse])
async def get_batch_transactions(batch_id: int, db: DbSession, current_user: CurrentUser):
    """获取批次交易记录"""
    service = InventoryService(db, current_user.current_mode)
    return await service.get_batch_transactions(batch_id)


@router.post("/stocktake", response_model=StocktakeResponse)
async def create_stocktake(data: StocktakeCreate, db: DbSession, current_user: CurrentUser):
    """创建盘点任务"""
    service = InventoryService(db, current_user.current_mode)
    return await service.create_stocktake(data, current_user.id)


@router.post("/stocktake/{stocktake_id}/submit", response_model=StocktakeResponse)
async def submit_stocktake(
    stocktake_id: int,
    results: list[StocktakeItemResult],
    db: DbSession,
    current_user: CurrentUser
):
    """提交盘点结果"""
    service = InventoryService(db, current_user.current_mode)
    return await service.submit_stocktake(stocktake_id, results)

"""库存服务（支持多场景）"""
from datetime import datetime, date, timedelta
from sqlalchemy import select, func, delete, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.mode_service import ModeService
from app.schemas.inventory import (
    InboundCreate, OutboundCreate, BatchResponse, TransactionResponse,
    StocktakeCreate, StocktakeItemResult, StocktakeResponse
)
from app.schemas.common import PaginatedResponse
from app.core.exceptions import NotFoundError, BusinessError


class InventoryService(ModeService):
    """库存服务类（支持多场景）"""

    def __init__(self, db: AsyncSession, mode: str = "medicine"):
        super().__init__(db, mode)

    async def list_inventory(
        self, medicine_id: int | None = None, keyword: str | None = None, status: str | None = None, page: int = 1, page_size: int = 20, show_zero_stock: bool = True
    ) -> PaginatedResponse[BatchResponse]:
        """获取库存列表"""
        ItemModel = self.ItemModel
        BatchModel = self.BatchModel
        
        # 药品场景使用 medicine_id 字段，其他场景使用 item_id 字段
        if self.mode == 'medicine':
            batch_item_id_col = BatchModel.medicine_id
        else:
            batch_item_id_col = BatchModel.item_id
        
        query = select(BatchModel).join(ItemModel, batch_item_id_col == ItemModel.id)
        
        # 根据参数决定是否显示零库存批次
        if not show_zero_stock:
            query = query.where(BatchModel.quantity > 0)

        if medicine_id:
            query = query.where(batch_item_id_col == medicine_id)
        
        # 关键词搜索（物品名称或批次号）
        if keyword:
            keyword_pattern = f"%{keyword}%"
            query = query.where(
                or_(
                    ItemModel.name.ilike(keyword_pattern),
                    BatchModel.batch_number.ilike(keyword_pattern)
                )
            )
        
        # 状态筛选
        if status:
            today = date.today()
            expiry_threshold = today + timedelta(days=90)  # 90天内为临期
            
            if status == "normal":
                # 正常：有效期 > 90天
                query = query.where(BatchModel.expiry_date > expiry_threshold)
            elif status == "expiring":
                # 临期：0 < 有效期 <= 90天
                query = query.where(
                    and_(
                        BatchModel.expiry_date > today,
                        BatchModel.expiry_date <= expiry_threshold
                    )
                )
            elif status == "expired":
                # 已过期：有效期 <= 今天
                query = query.where(BatchModel.expiry_date <= today)

        # 统计总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(BatchModel.created_at.desc())

        result = await self.db.execute(query)
        batches = list(result.scalars().all())

        # 获取物品信息（药品场景使用 medicine_id，其他场景使用 item_id）
        if self.mode == 'medicine':
            item_ids = [b.medicine_id for b in batches]
        else:
            item_ids = [b.item_id for b in batches]
        
        items_result = await self.db.execute(
            select(ItemModel).where(ItemModel.id.in_(item_ids))
        )
        items = {item.id: item for item in items_result.scalars().all()}

        items_list = []
        for b in batches:
            # 获取物品ID（药品场景使用 medicine_id，其他场景使用 item_id）
            batch_item_id = b.medicine_id if self.mode == 'medicine' else b.item_id
            item = items.get(batch_item_id)
            response = BatchResponse(
                id=b.id,
                medicine_id=batch_item_id,
                medicine_name=item.name if item else None,
                medicine_price=item.price if item else None,
                medicine_unit=item.unit if item else None,
                batch_number=b.batch_number,
                quantity=b.quantity,
                production_date=b.production_date,
                expiry_date=b.expiry_date,
                inbound_date=b.inbound_date,
                remark=b.remark
            )
            items_list.append(response)

        pages = (total + page_size - 1) // page_size

        return PaginatedResponse(
            items=items_list, total=total, page=page, page_size=page_size, pages=pages
        )

    async def inbound(self, data: InboundCreate, operator_id: int) -> BatchResponse:
        """入库操作"""
        ItemModel = self.ItemModel
        BatchModel = self.BatchModel
        
        # 药品场景使用 medicine_id 字段，其他场景使用 item_id 字段
        if self.mode == 'medicine':
            batch_item_id_col = BatchModel.medicine_id
        else:
            batch_item_id_col = BatchModel.item_id
        
        # 检查物品是否存在
        item_result = await self.db.execute(
            select(ItemModel).where(ItemModel.id == data.medicine_id, ItemModel.is_deleted == False)
        )
        item = item_result.scalar_one_or_none()
        if not item:
            raise NotFoundError("物品", data.medicine_id)

        # 检查是否存在相同物品+生产日期+有效期的批次（防止重复添加）
        existing_batch_result = await self.db.execute(
            select(BatchModel).where(
                and_(
                    batch_item_id_col == data.medicine_id,
                    BatchModel.production_date == data.production_date,
                    BatchModel.expiry_date == data.expiry_date,
                    BatchModel.quantity > 0  # 只检查有库存的批次
                )
            )
        )
        existing_batch = existing_batch_result.scalar_one_or_none()
        if existing_batch:
            raise BusinessError(
                "DUPLICATE_BATCH",
                f"已存在相同物品「{item.name}」的相同批次（生产日期: {data.production_date}, 有效期: {data.expiry_date}），请直接在库存中增加数量"
            )

        # 创建批次（入库时清除零库存时间）
        if self.mode == 'medicine':
            batch = BatchModel(
                medicine_id=data.medicine_id,
                batch_number=data.batch_number,
                quantity=data.quantity,
                production_date=data.production_date,
                expiry_date=data.expiry_date,
                remark=data.remark,
                zero_stock_date=None,
            )
        else:
            batch = BatchModel(
                item_id=data.medicine_id,
                batch_number=data.batch_number,
                quantity=data.quantity,
                production_date=data.production_date,
                expiry_date=data.expiry_date,
                remark=data.remark,
                zero_stock_date=None,
            )
        self.db.add(batch)
        await self.db.commit()
        await self.db.refresh(batch)
        
        # 获取物品ID
        batch_item_id = batch.medicine_id if self.mode == 'medicine' else batch.item_id

        response = BatchResponse(
            id=batch.id,
            medicine_id=batch_item_id,
            medicine_name=item.name,
            medicine_price=item.price,
            medicine_unit=item.unit,
            batch_number=batch.batch_number,
            quantity=batch.quantity,
            production_date=batch.production_date,
            expiry_date=batch.expiry_date,
            inbound_date=batch.inbound_date,
            remark=batch.remark
        )
        return response

    async def outbound(self, data: OutboundCreate, operator_id: int) -> TransactionResponse:
        """出库操作"""
        BatchModel = self.BatchModel
        
        # 检查批次是否存在
        batch_result = await self.db.execute(
            select(BatchModel).where(BatchModel.id == data.batch_id)
        )
        batch = batch_result.scalar_one_or_none()
        if not batch:
            raise NotFoundError("批次", data.batch_id)

        # 检查库存是否足够
        if batch.quantity < data.quantity:
            raise BusinessError(
                "INSUFFICIENT_STOCK",
                f"库存不足，当前库存 {batch.quantity}，请求出库 {data.quantity}",
            )

        # 扣减库存
        batch.quantity -= data.quantity
        
        # 如果库存变为0，记录零库存时间
        if batch.quantity == 0:
            batch.production_date = date(1, 1, 1)  # 0001-01-01（MySQL最小日期）
            batch.expiry_date = date(1, 1, 1)  # 0001-01-01（MySQL最小日期）
            batch.zero_stock_date = datetime.utcnow()  # 记录库存变为0的时间

        await self.db.commit()
        await self.db.refresh(batch)

        # 返回交易响应（简化版，不记录交易表）
        return TransactionResponse(
            id=batch.id,
            batch_id=batch.id,
            type="outbound",
            quantity=data.quantity,
            reason=data.reason,
            recipient=data.recipient,
            operator_id=operator_id,
            created_at=datetime.utcnow()
        )

    async def get_batch_detail(self, batch_id: int) -> BatchResponse:
        """获取批次详情"""
        ItemModel = self.ItemModel
        BatchModel = self.BatchModel
        
        result = await self.db.execute(
            select(BatchModel).where(BatchModel.id == batch_id)
        )
        batch = result.scalar_one_or_none()
        if not batch:
            raise NotFoundError("批次", batch_id)

        # 获取物品ID（药品场景使用 medicine_id，其他场景使用 item_id）
        batch_item_id = batch.medicine_id if self.mode == 'medicine' else batch.item_id
        
        # 获取物品信息
        item_result = await self.db.execute(
            select(ItemModel).where(ItemModel.id == batch_item_id)
        )
        item = item_result.scalar_one_or_none()

        response = BatchResponse(
            id=batch.id,
            medicine_id=batch_item_id,
            medicine_name=item.name if item else None,
            medicine_price=item.price if item else None,
            medicine_unit=item.unit if item else None,
            batch_number=batch.batch_number,
            quantity=batch.quantity,
            production_date=batch.production_date,
            expiry_date=batch.expiry_date,
            inbound_date=batch.inbound_date,
            remark=batch.remark
        )
        return response

    async def get_batch_transactions(self, batch_id: int) -> list[TransactionResponse]:
        """获取批次交易记录"""
        # 简化版：返回空列表
        return []

    async def update_batch(self, batch_id: int, data: InboundCreate, operator_id: int) -> BatchResponse:
        """更新批次信息"""
        ItemModel = self.ItemModel
        BatchModel = self.BatchModel
        
        result = await self.db.execute(
            select(BatchModel).where(BatchModel.id == batch_id)
        )
        batch = result.scalar_one_or_none()
        if not batch:
            raise NotFoundError("批次", batch_id)

        # 更新批次信息
        if data.batch_number is not None:
            batch.batch_number = data.batch_number
        if data.quantity is not None:
            batch.quantity = data.quantity
        if data.production_date is not None:
            batch.production_date = data.production_date
        if data.expiry_date is not None:
            batch.expiry_date = data.expiry_date
        if data.remark is not None:
            batch.remark = data.remark

        await self.db.commit()
        await self.db.refresh(batch)

        # 获取物品ID（药品场景使用 medicine_id，其他场景使用 item_id）
        batch_item_id = batch.medicine_id if self.mode == 'medicine' else batch.item_id
        
        # 获取物品信息
        item_result = await self.db.execute(
            select(ItemModel).where(ItemModel.id == batch_item_id)
        )
        item = item_result.scalar_one_or_none()

        response = BatchResponse(
            id=batch.id,
            medicine_id=batch_item_id,
            medicine_name=item.name if item else None,
            medicine_price=item.price if item else None,
            medicine_unit=item.unit if item else None,
            batch_number=batch.batch_number,
            quantity=batch.quantity,
            production_date=batch.production_date,
            expiry_date=batch.expiry_date,
            inbound_date=batch.inbound_date,
            remark=batch.remark
        )
        return response

    async def delete_batch(self, batch_id: int, operator_id: int) -> None:
        """删除批次"""
        BatchModel = self.BatchModel
        
        result = await self.db.execute(
            select(BatchModel).where(BatchModel.id == batch_id)
        )
        batch = result.scalar_one_or_none()
        if not batch:
            raise NotFoundError("批次", batch_id)

        # 删除批次
        await self.db.delete(batch)
        await self.db.commit()

    async def create_stocktake(
        self, data: StocktakeCreate, creator_id: int
    ) -> StocktakeResponse:
        """创建盘点任务"""
        # 简化版：暂不实现
        raise BusinessError("NOT_IMPLEMENTED", "盘点功能暂未实现")

    async def submit_stocktake(
        self, stocktake_id: int, results: list[StocktakeItemResult]
    ) -> StocktakeResponse:
        """提交盘点结果"""
        # 简化版：暂不实现
        raise BusinessError("NOT_IMPLEMENTED", "盘点功能暂未实现")

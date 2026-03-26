"""库存服务"""
from datetime import datetime
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
        """获取库存列表
        
        Args:
            medicine_id: 药品ID过滤
            keyword: 搜索关键词（药品名称或批次号）
            status: 库存状态筛选（normal/expiring/expired）
            page: 页码
            page_size: 每页数量
            show_zero_stock: 是否显示零库存批次（PC端=True，移动端=False）
        """
        from datetime import date, timedelta
        from sqlalchemy import and_, or_
        
        # 使用动态模型
        BatchModel = self.BatchModel
        ItemModel = self.ItemModel
        
        query = select(BatchModel).join(ItemModel, BatchModel.item_id == ItemModel.id)
        
        # 根据参数决定是否显示零库存批次
        if not show_zero_stock:
            query = query.where(BatchModel.quantity > 0)

        if medicine_id:
            query = query.where(BatchModel.item_id == medicine_id)
        
        # 关键词搜索（药品名称或批次号）
        if keyword:
            keyword_pattern = f"%{keyword}%"
            query = query.where(
                (ItemModel.name.ilike(keyword_pattern)) | 
                (BatchModel.batch_number.ilike(keyword_pattern))
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
        
        # 获取物品信息
        item_ids = [b.item_id for b in batches]
        items_result = await self.db.execute(
            select(ItemModel).where(ItemModel.id.in_(item_ids))
        )
        items_dict = {item.id: item for item in items_result.scalars().all()}

        items = []
        for b in batches:
            item = items_dict.get(b.item_id)
            response = BatchResponse(
                id=b.id,
                medicine_id=b.item_id,
                medicine_name=item.name if item else None,
                medicine_price=item.price if item else None,
                batch_number=b.batch_number,
                quantity=b.quantity,
                production_date=b.production_date,
                expiry_date=b.expiry_date,
                inbound_date=b.inbound_date,
                remark=b.remark
            )
            items.append(response)

        pages = (total + page_size - 1) // page_size

        return PaginatedResponse(
            items=items, total=total, page=page, page_size=page_size, pages=pages
        )

    async def inbound(self, data: InboundCreate, operator_id: int) -> BatchResponse:
        """入库操作"""
        from sqlalchemy import and_
        
        # 使用动态模型
        ItemModel = self.ItemModel
        BatchModel = self.BatchModel
        
        # 检查药品是否存在
        medicine_result = await self.db.execute(
            select(ItemModel).where(ItemModel.id == data.medicine_id, ItemModel.is_deleted == False)
        )
        medicine = medicine_result.scalar_one_or_none()
        if not medicine:
            raise NotFoundError("物品", data.medicine_id)

        # 检查是否存在相同药品+生产日期+有效期的批次（防止重复添加）
        existing_batch_result = await self.db.execute(
            select(BatchModel).where(
                and_(
                    BatchModel.item_id == data.medicine_id,
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
                f"已存在相同物品「{medicine.name}」的相同批次（生产日期: {data.production_date}, 有效期: {data.expiry_date}），请直接在库存中增加数量"
            )

        # 如果药品有条形码，检查是否有其他药品使用相同条形码
        if medicine.barcode:
            duplicate_barcode_result = await self.db.execute(
                select(ItemModel).where(
                    and_(
                        ItemModel.barcode == medicine.barcode,
                        ItemModel.id != medicine.id,
                        ItemModel.is_deleted == False
                    )
                )
            )
            duplicate_medicine = duplicate_barcode_result.scalar_one_or_none()
            if duplicate_medicine:
                raise BusinessError(
                    "DUPLICATE_BARCODE",
                    f"条形码「{medicine.barcode}」已被物品「{duplicate_medicine.name}」使用，请检查"
                )

        # 创建批次（入库时清除零库存时间）
        batch = BatchModel(
            item_id=data.medicine_id,
            batch_number=data.batch_number,
            quantity=data.quantity,
            production_date=data.production_date,
            expiry_date=data.expiry_date,
            remark=data.remark,
            zero_stock_date=None,  # 入库时清除零库存时间
        )
        self.db.add(batch)
        await self.db.flush()

        # 创建入库记录（暂时不创建Transaction，因为它还在使用旧表）
        # TODO: 需要为Transaction也创建多场景表
        
        await self.db.commit()
        await self.db.refresh(batch)

        response = BatchResponse(
            id=batch.id,
            medicine_id=batch.item_id,
            medicine_name=medicine.name,
            medicine_price=medicine.price,
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
        # 检查批次是否存在
        batch_result = await self.db.execute(
            select(Batch).where(Batch.id == data.batch_id)
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

        # 记录药品ID，用于后续检查
        medicine_id = batch.medicine_id

        # 扣减库存
        batch.quantity -= data.quantity
        
        # 如果库存变为0，记录零库存时间
        if batch.quantity == 0:
            from datetime import date
            batch.production_date = date(1, 1, 1)  # 0001-01-01（MySQL最小日期）
            batch.expiry_date = date(1, 1, 1)  # 0001-01-01（MySQL最小日期）
            batch.zero_stock_date = datetime.utcnow()  # 记录库存变为0的时间
            print(f"批次 ID {batch.id} 库存变为0，记录时间: {batch.zero_stock_date}")

        # 创建出库记录
        transaction = Transaction(
            batch_id=batch.id,
            type="outbound",
            quantity=data.quantity,
            reason=data.reason,
            recipient=data.recipient,
            operator_id=operator_id,
        )
        self.db.add(transaction)
        
        await self.db.commit()
        await self.db.refresh(transaction)

        return TransactionResponse.model_validate(transaction)

    async def get_batch_detail(self, batch_id: int) -> BatchResponse:
        """获取批次详情"""
        result = await self.db.execute(
            select(Batch)
            .where(Batch.id == batch_id)
            .options(selectinload(Batch.medicine))
        )
        batch = result.scalar_one_or_none()
        if not batch:
            raise NotFoundError("批次", batch_id)

        response = BatchResponse.model_validate(batch)
        response.medicine_name = batch.medicine.name if batch.medicine else None
        response.medicine_price = batch.medicine.price if batch.medicine else None
        return response

    async def get_batch_transactions(self, batch_id: int) -> list[TransactionResponse]:
        """获取批次交易记录"""
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.batch_id == batch_id)
            .options(selectinload(Transaction.operator))
            .order_by(Transaction.created_at.desc())
        )
        transactions = list(result.scalars().all())

        items = []
        for t in transactions:
            response = TransactionResponse.model_validate(t)
            response.operator_name = t.operator.realname if t.operator else None
            items.append(response)

        return items

    async def update_batch(self, batch_id: int, data: InboundCreate, operator_id: int) -> BatchResponse:
        """更新批次信息"""
        result = await self.db.execute(
            select(Batch)
            .where(Batch.id == batch_id)
            .options(selectinload(Batch.medicine))
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

        response = BatchResponse.model_validate(batch)
        response.medicine_name = batch.medicine.name if batch.medicine else None
        response.medicine_price = batch.medicine.price if batch.medicine else None
        return response

    async def delete_batch(self, batch_id: int, operator_id: int) -> None:
        """删除批次"""
        result = await self.db.execute(
            select(Batch).where(Batch.id == batch_id)
        )
        batch = result.scalar_one_or_none()
        if not batch:
            raise NotFoundError("批次", batch_id)

        # 删除关联的交易记录
        await self.db.execute(
            delete(Transaction).where(Transaction.batch_id == batch_id)
        )

        # 删除批次
        await self.db.delete(batch)
        await self.db.commit()

    async def create_stocktake(
        self, data: StocktakeCreate, creator_id: int
    ) -> StocktakeResponse:
        """创建盘点任务"""
        stocktake = Stocktake(name=data.name, creator_id=creator_id)
        self.db.add(stocktake)
        await self.db.flush()

        # 获取所有批次，创建盘点明细
        batches_result = await self.db.execute(select(Batch).where(Batch.quantity > 0))
        batches = list(batches_result.scalars().all())

        for batch in batches:
            item = StocktakeItem(
                stocktake_id=stocktake.id,
                batch_id=batch.id,
                expected_quantity=batch.quantity,
            )
            self.db.add(item)

        await self.db.commit()
        await self.db.refresh(stocktake)

        return StocktakeResponse.model_validate(stocktake)

    async def submit_stocktake(
        self, stocktake_id: int, results: list[StocktakeItemResult]
    ) -> StocktakeResponse:
        """提交盘点结果"""
        stocktake_result = await self.db.execute(
            select(Stocktake).where(Stocktake.id == stocktake_id)
        )
        stocktake = stocktake_result.scalar_one_or_none()
        if not stocktake:
            raise NotFoundError("盘点任务", stocktake_id)

        # 更新盘点明细
        for result in results:
            item_result = await self.db.execute(
                select(StocktakeItem).where(
                    StocktakeItem.stocktake_id == stocktake_id,
                    StocktakeItem.batch_id == result.batch_id,
                )
            )
            item = item_result.scalar_one_or_none()
            if item:
                item.actual_quantity = result.actual_quantity
                item.discrepancy = result.actual_quantity - item.expected_quantity
                item.remark = result.remark

        # 更新盘点状态
        stocktake.status = "completed"
        stocktake.completed_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(stocktake)

        return StocktakeResponse.model_validate(stocktake)

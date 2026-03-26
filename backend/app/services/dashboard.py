"""仪表盘服务"""
from datetime import date, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.mode_service import ModeService
from app.models.warning import Warning
from app.services.warning import WarningService


class DashboardService(ModeService):
    """仪表盘服务类 - 支持多场景数据隔离"""

    def __init__(self, db: AsyncSession, mode: str = "medicine"):
        """
        初始化仪表盘服务
        
        Args:
            db: 数据库会话
            mode: 用户当前场景
        """
        super().__init__(db, mode)

    async def get_summary(self) -> dict:
        """获取仪表盘概要数据"""
        # 使用动态模型
        ItemModel = self.ItemModel
        BatchModel = self.BatchModel
        
        # 物品总数（分类数）
        category_count_result = await self.db.execute(
            select(func.count()).select_from(self.CategoryModel)
        )
        category_count = category_count_result.scalar() or 0
        
        # 物品总数
        item_count_result = await self.db.execute(
            select(func.count()).select_from(ItemModel).where(ItemModel.is_deleted == False)
        )
        item_count = item_count_result.scalar() or 0

        # 库存总量
        inventory_result = await self.db.execute(
            select(func.sum(BatchModel.quantity))
        )
        inventory_total = inventory_result.scalar() or 0

        # 获取预警配置
        warning_service = WarningService(self.db)
        config = await warning_service.get_config()
        warning_days = config["expiry_warning_days"]

        # 临期物品数（批次数）
        expiry_threshold = date.today() + timedelta(days=warning_days)
        expiring_result = await self.db.execute(
            select(func.count()).select_from(BatchModel).where(
                BatchModel.expiry_date <= expiry_threshold,
                BatchModel.expiry_date > date.today(),
                BatchModel.quantity > 0
            )
        )
        expiring_count = expiring_result.scalar() or 0

        # 过期物品数（批次数）
        expired_result = await self.db.execute(
            select(func.count()).select_from(BatchModel).where(
                BatchModel.expiry_date < date.today(),
                BatchModel.quantity > 0
            )
        )
        expired_count = expired_result.scalar() or 0

        # 低库存物品数（库存小于10的批次）
        low_stock_result = await self.db.execute(
            select(func.count()).select_from(BatchModel).where(
                BatchModel.quantity < 10,
                BatchModel.quantity > 0
            )
        )
        low_stock_count = low_stock_result.scalar() or 0

        return {
            # 兼容 PC 端
            "medicine_count": item_count,
            "inventory_total": inventory_total,
            "expiring_count": expiring_count,
            # 兼容移动端
            "total_medicines": item_count,
            "total_inventory": inventory_total,
            "expiry_count": expiring_count,
            # 通用字段
            "expired_count": expired_count,
            "low_stock_count": low_stock_count,
            "item_count": item_count,
            "category_count": category_count,
        }

    async def get_inventory_trend(self, days: int = 30) -> dict:
        """获取库存趋势数据"""
        BatchModel = self.BatchModel
        
        labels = []
        values = []

        # 获取当前总库存
        current_inventory_result = await self.db.execute(
            select(func.sum(BatchModel.quantity))
        )
        current_inventory = current_inventory_result.scalar() or 0

        # 简化实现：显示当前库存趋势
        for i in range(days - 1, -1, -1):
            target_date = date.today() - timedelta(days=i)
            labels.append(target_date.strftime("%m-%d"))
            # 简化：使用当前库存作为基准
            values.append(max(0, current_inventory))

        return {"labels": labels, "values": values}

    async def get_expiry_distribution(self) -> dict:
        """获取效期分布数据"""
        BatchModel = self.BatchModel
        today = date.today()

        # 已过期
        expired_result = await self.db.execute(
            select(func.count()).select_from(BatchModel).where(
                BatchModel.expiry_date < today,
                BatchModel.quantity > 0
            )
        )
        expired = expired_result.scalar() or 0

        # 30天内过期
        expiring_30_result = await self.db.execute(
            select(func.count()).select_from(BatchModel).where(
                BatchModel.expiry_date >= today,
                BatchModel.expiry_date < today + timedelta(days=30),
                BatchModel.quantity > 0
            )
        )
        expiring_30 = expiring_30_result.scalar() or 0

        # 30-90天过期
        expiring_90_result = await self.db.execute(
            select(func.count()).select_from(BatchModel).where(
                BatchModel.expiry_date >= today + timedelta(days=30),
                BatchModel.expiry_date < today + timedelta(days=90),
                BatchModel.quantity > 0
            )
        )
        expiring_90 = expiring_90_result.scalar() or 0

        # 90天以上
        normal_result = await self.db.execute(
            select(func.count()).select_from(BatchModel).where(
                BatchModel.expiry_date >= today + timedelta(days=90),
                BatchModel.quantity > 0
            )
        )
        normal = normal_result.scalar() or 0

        return {
            "labels": ["已过期", "30天内", "30-90天", "90天以上"],
            "values": [expired, expiring_30, expiring_90, normal],
        }

    async def get_recent_warnings(self, limit: int = 10) -> list:
        """获取最近预警"""
        warning_service = WarningService(self.db)
        return await warning_service.get_recent_warnings(limit)

    async def get_category_distribution(self) -> dict:
        """获取分类统计"""
        CategoryModel = self.CategoryModel
        ItemModel = self.ItemModel
        
        # 获取所有分类
        categories_result = await self.db.execute(
            select(CategoryModel).order_by(CategoryModel.sort_order)
        )
        categories = categories_result.scalars().all()
        
        labels = []
        values = []
        
        for category in categories:
            # 统计每个分类的物品数量
            count_result = await self.db.execute(
                select(func.count()).select_from(ItemModel).where(
                    ItemModel.category_id == category.id,
                    ItemModel.is_deleted == False
                )
            )
            count = count_result.scalar() or 0
            labels.append(category.name)
            values.append(count)
        
        return {"labels": labels, "values": values}

    async def get_transaction_stats(self, days: int = 7) -> dict:
        """获取出入库统计"""
        # 由于Transaction表是全局的，暂时返回空数据
        # 后续可以扩展为按场景隔离
        labels = []
        inbound_data = []
        outbound_data = []
        
        for i in range(days - 1, -1, -1):
            target_date = date.today() - timedelta(days=i)
            labels.append(target_date.strftime("%m-%d"))
            inbound_data.append(0)
            outbound_data.append(0)
        
        return {
            "labels": labels,
            "inbound": inbound_data,
            "outbound": outbound_data
        }

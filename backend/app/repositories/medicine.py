"""药品数据仓库"""
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.medicine import Medicine, MedicineCategory
from app.models.inventory import Batch
from app.schemas.medicine import MedicineListParams


class MedicineRepository:
    """药品数据仓库"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def find_all(self, params: MedicineListParams) -> tuple[list[Medicine], int]:
        """查询药品列表（分页、搜索、排序）- 只显示有库存的药品"""
        # 子查询：计算每个药品的总库存
        stock_subquery = (
            select(
                Batch.medicine_id,
                func.sum(Batch.quantity).label('total_stock')
            )
            .group_by(Batch.medicine_id)
            .subquery()
        )
        
        # 主查询：关联库存子查询，只显示有库存的药品
        query = (
            select(Medicine)
            .join(stock_subquery, Medicine.id == stock_subquery.c.medicine_id)
            .where(
                Medicine.is_deleted == False,
                stock_subquery.c.total_stock > 0  # 只显示库存大于0的药品
            )
        )
        
        # 关键词搜索
        if params.keyword:
            keyword = f"%{params.keyword}%"
            query = query.where(
                or_(
                    Medicine.name.like(keyword),
                    Medicine.code.like(keyword)
                )
            )
        
        # 分类过滤
        if params.category_id:
            query = query.where(Medicine.category_id == params.category_id)
        
        # 统计总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # 排序
        sort_column = getattr(Medicine, params.sort_by, Medicine.id)
        if params.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # 分页
        offset = (params.page - 1) * params.page_size
        query = query.offset(offset).limit(params.page_size)
        
        # 加载关联
        query = query.options(selectinload(Medicine.category))
        
        result = await self.db.execute(query)
        medicines = list(result.scalars().all())
        
        return medicines, total
    
    async def find_by_id(self, id: int) -> Medicine | None:
        """根据 ID 查询药品"""
        result = await self.db.execute(
            select(Medicine)
            .where(Medicine.id == id, Medicine.is_deleted == False)
            .options(selectinload(Medicine.category))
        )
        return result.scalar_one_or_none()
    
    async def find_by_code(self, code: str) -> Medicine | None:
        """根据编码查询药品"""
        result = await self.db.execute(
            select(Medicine).where(Medicine.code == code, Medicine.is_deleted == False)
        )
        return result.scalar_one_or_none()
    
    async def find_by_barcode(self, barcode: str) -> Medicine | None:
        """根据条形码查询药品"""
        result = await self.db.execute(
            select(Medicine)
            .where(Medicine.barcode == barcode, Medicine.is_deleted == False)
            .options(selectinload(Medicine.category))
        )
        return result.scalar_one_or_none()
    
    async def create(self, data: dict) -> Medicine:
        """创建药品"""
        medicine = Medicine(**data)
        self.db.add(medicine)
        await self.db.commit()
        await self.db.refresh(medicine)
        return medicine
    
    async def update(self, id: int, data: dict) -> Medicine | None:
        """更新药品"""
        medicine = await self.find_by_id(id)
        if not medicine:
            return None
        
        for key, value in data.items():
            if value is not None:
                setattr(medicine, key, value)
        
        await self.db.commit()
        await self.db.refresh(medicine)
        return medicine
    
    async def soft_delete(self, id: int) -> bool:
        """软删除药品"""
        medicine = await self.find_by_id(id)
        if not medicine:
            return False
        
        medicine.is_deleted = True
        await self.db.commit()
        return True


class CategoryRepository:
    """药品分类数据仓库"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def find_all(self) -> list[MedicineCategory]:
        """查询所有分类"""
        result = await self.db.execute(
            select(MedicineCategory).order_by(MedicineCategory.sort_order)
        )
        return list(result.scalars().all())
    
    async def find_by_id(self, id: int) -> MedicineCategory | None:
        """根据 ID 查询分类"""
        result = await self.db.execute(
            select(MedicineCategory).where(MedicineCategory.id == id)
        )
        return result.scalar_one_or_none()
    
    async def create(self, data: dict) -> MedicineCategory:
        """创建分类"""
        category = MedicineCategory(**data)
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

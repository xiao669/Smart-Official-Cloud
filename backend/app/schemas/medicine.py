"""药品相关的 Pydantic 模型"""
from datetime import datetime
from pydantic import BaseModel, Field


class MedicineCategoryBase(BaseModel):
    """药品分类基础模型"""
    name: str = Field(..., min_length=1, max_length=50)
    description: str | None = None
    sort_order: int = 0


class MedicineCategoryCreate(MedicineCategoryBase):
    """创建药品分类"""
    pass


class MedicineCategoryResponse(MedicineCategoryBase):
    """药品分类响应"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MedicineBase(BaseModel):
    """药品基础模型"""
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=50)
    barcode: str | None = Field(None, max_length=50, description="药品条形码")
    category_id: int
    specification: str | None = None
    unit: str = Field(..., min_length=1, max_length=20)
    manufacturer: str | None = None
    price: float | None = Field(None, ge=0, description="药品单价")
    description: str | None = None


class MedicineCreate(MedicineBase):
    """创建药品"""
    pass


class MedicineUpdate(BaseModel):
    """更新药品"""
    name: str | None = Field(None, min_length=1, max_length=100)
    barcode: str | None = Field(None, max_length=50, description="药品条形码")
    category_id: int | None = None
    specification: str | None = None
    unit: str | None = Field(None, min_length=1, max_length=20)
    manufacturer: str | None = None
    price: float | None = Field(None, ge=0, description="药品单价")
    description: str | None = None


class MedicineResponse(MedicineBase):
    """药品响应"""
    id: int
    barcode: str | None = None
    category_name: str | None = None
    price: float | None = None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MedicineListParams(BaseModel):
    """药品列表查询参数"""
    page: int = 1
    page_size: int = 20
    keyword: str | None = None
    category_id: int | None = None
    sort_by: str = "id"
    sort_order: str = "desc"


class ImportResult(BaseModel):
    """导入结果"""
    success_count: int
    fail_count: int
    errors: list[str] = []

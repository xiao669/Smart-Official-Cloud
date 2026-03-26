"""药品管理路由"""
from fastapi import APIRouter, Depends, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from io import BytesIO

from app.api.deps import DbSession, CurrentUser, RequireManager
from app.services.medicine import MedicineService
from app.schemas.medicine import (
    MedicineCreate, MedicineUpdate, MedicineResponse,
    MedicineListParams, MedicineCategoryResponse, ImportResult
)
from app.schemas.common import PaginatedResponse, SuccessResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[MedicineResponse])
async def list_medicines(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: str | None = None,
    category_id: int | None = None,
    sort_by: str = "id",
    sort_order: str = "desc"
):
    """获取药品列表"""
    params = MedicineListParams(
        page=page,
        page_size=page_size,
        keyword=keyword,
        category_id=category_id,
        sort_by=sort_by,
        sort_order=sort_order
    )
    # 使用用户的当前场景
    service = MedicineService(db, current_user.current_mode)
    return await service.list_medicines(params)


@router.post("", response_model=MedicineResponse)
async def create_medicine(
    data: MedicineCreate,
    db: DbSession,
    current_user: CurrentUser
):
    """创建药品"""
    service = MedicineService(db, current_user.current_mode)
    return await service.create_medicine(data)


@router.get("/categories", response_model=list[MedicineCategoryResponse])
async def list_categories(db: DbSession, current_user: CurrentUser):
    """获取药品分类列表"""
    service = MedicineService(db, current_user.current_mode)
    return await service.list_categories()


@router.get("/export")
async def export_medicines(
    db: DbSession,
    current_user: CurrentUser,
    keyword: str | None = None,
    category_id: int | None = None
):
    """导出药品到 Excel"""
    params = MedicineListParams(keyword=keyword, category_id=category_id)
    service = MedicineService(db, current_user.current_mode)
    content = await service.export_to_excel(params)
    
    return StreamingResponse(
        BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=medicines.xlsx"}
    )


@router.get("/import/template")
async def download_import_template(
    db: DbSession,
    current_user: CurrentUser
):
    """下载导入模板"""
    service = MedicineService(db, current_user.current_mode)
    content = await service.generate_import_template()
    
    return StreamingResponse(
        BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=medicine_import_template.xlsx"}
    )


@router.post("/import", response_model=ImportResult)
async def import_medicines(
    db: DbSession,
    current_user: CurrentUser,
    file: UploadFile = File(...)
):
    """从 Excel 导入药品"""
    content = await file.read()
    service = MedicineService(db, current_user.current_mode)
    return await service.import_from_excel(content)


@router.get("/barcode/{barcode}", response_model=MedicineResponse)
async def get_medicine_by_barcode(barcode: str, db: DbSession, current_user: CurrentUser):
    """通过条形码获取药品"""
    service = MedicineService(db, current_user.current_mode)
    return await service.get_medicine_by_barcode(barcode)


@router.get("/{medicine_id}", response_model=MedicineResponse)
async def get_medicine(medicine_id: int, db: DbSession, current_user: CurrentUser):
    """获取药品详情"""
    service = MedicineService(db, current_user.current_mode)
    return await service.get_medicine(medicine_id)


@router.put("/{medicine_id}", response_model=MedicineResponse)
async def update_medicine(
    medicine_id: int,
    data: MedicineUpdate,
    db: DbSession,
    current_user: CurrentUser
):
    """更新药品"""
    service = MedicineService(db, current_user.current_mode)
    return await service.update_medicine(medicine_id, data)


@router.delete("/{medicine_id}", response_model=SuccessResponse)
async def delete_medicine(medicine_id: int, db: DbSession, current_user: CurrentUser):
    """删除药品"""
    service = MedicineService(db, current_user.current_mode)
    await service.delete_medicine(medicine_id)
    return SuccessResponse(message="删除成功")

"""用户管理路由"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.user import UserService
from app.schemas.user import (
    UserCreate, UserUpdate, UserListResponse, UserDetailResponse,
    PasswordResetRequest, BatchStatusRequest, BatchStatusResponse
)
from app.api.deps import CurrentUser

router = APIRouter()


@router.get("", response_model=UserListResponse)
async def get_user_list(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    keyword: str | None = Query(None, description="搜索关键词"),
    user_type: str | None = Query(None, description="用户类型筛选")
):
    """获取用户列表"""
    service = UserService(db)
    return await service.get_user_list(page, page_size, keyword, user_type)


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user_detail(
    user_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """获取用户详情"""
    service = UserService(db)
    return await service.get_user_by_id(user_id)


@router.post("", response_model=UserDetailResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """创建新用户"""
    service = UserService(db)
    return await service.create_user(user_data, current_user)


@router.put("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """更新用户信息"""
    service = UserService(db)
    return await service.update_user(user_id, user_data, current_user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """删除用户"""
    service = UserService(db)
    await service.delete_user(user_id, current_user)
    return Response(status_code=204)


@router.post("/{user_id}/reset-password")
async def reset_password(
    user_id: int,
    password_data: PasswordResetRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """重置用户密码"""
    service = UserService(db)
    await service.reset_password(user_id, password_data, current_user)
    return Response(status_code=204)


@router.patch("/{user_id}/status")
async def toggle_user_status(
    user_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    is_active: bool = Query(..., description="是否激活")
):
    """切换用户状态"""
    service = UserService(db)
    await service.toggle_user_status(user_id, is_active, current_user)
    return Response(status_code=204)


@router.post("/batch-status", response_model=BatchStatusResponse)
async def batch_toggle_status(
    batch_data: BatchStatusRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """批量切换用户状态"""
    service = UserService(db)
    return await service.batch_toggle_status(batch_data, current_user)


@router.post("/push-cid")
async def save_push_cid(
    cid_data: dict,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """保存用户的推送客户端ID"""
    service = UserService(db)
    cid = cid_data.get("cid")
    if cid:
        await service.update_push_cid(current_user.id, cid)
    return {"success": True}


@router.put("/profile", response_model=UserDetailResponse)
async def update_profile(
    profile_data: dict,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """更新当前用户的个人资料（用户名、真实姓名）"""
    service = UserService(db)
    return await service.update_profile(current_user.id, profile_data)


@router.post("/change-password")
async def change_password(
    password_data: dict,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """修改当前用户密码"""
    service = UserService(db)
    await service.change_password(
        current_user.id, 
        password_data.get("old_password", ""),
        password_data.get("new_password", "")
    )
    return {"success": True, "message": "密码修改成功"}

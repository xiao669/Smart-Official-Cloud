"""用户业务逻辑层"""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.repositories.user import UserRepository
from app.models.user import User
from app.core.security import get_password_hash
from app.schemas.user import (
    UserCreate, UserUpdate, UserListResponse, UserDetailResponse,
    PasswordResetRequest, BatchStatusRequest, BatchStatusResponse,
    UserListItem
)


class UserService:
    """用户服务类"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)
    
    async def get_user_list(
        self,
        page: int = 1,
        page_size: int = 10,
        keyword: str | None = None,
        user_type: str | None = None
    ) -> UserListResponse:
        """获取用户列表"""
        skip = (page - 1) * page_size
        users, total = await self.repo.list(skip, page_size, keyword, user_type)
        
        return UserListResponse(
            items=[UserListItem.model_validate(user) for user in users],
            total=total,
            page=page,
            page_size=page_size
        )
    
    async def get_user_by_id(self, user_id: int) -> UserDetailResponse:
        """获取用户详情"""
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        return UserDetailResponse.model_validate(user)
    
    async def create_user(self, user_data: UserCreate, current_user: User) -> UserDetailResponse:
        """创建用户"""
        # 权限检查
        if current_user.user_type != "admin":
            raise HTTPException(status_code=403, detail="权限不足，仅管理员可创建用户")
        
        # 检查用户名是否已存在
        existing_user = await self.repo.get_by_username(user_data.username)
        if existing_user:
            raise HTTPException(status_code=409, detail="用户名已存在")
        
        # 创建用户
        user_dict = user_data.model_dump()
        user_dict['password_hash'] = get_password_hash(user_dict.pop('password'))
        
        user = await self.repo.create(user_dict)
        return UserDetailResponse.model_validate(user)
    
    async def update_user(
        self,
        user_id: int,
        user_data: UserUpdate,
        current_user: User
    ) -> UserDetailResponse:
        """更新用户信息"""
        # 权限检查
        if current_user.user_type != "admin":
            raise HTTPException(status_code=403, detail="权限不足，仅管理员可更新用户")
        
        # 检查用户是否存在
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 更新用户信息
        update_dict = user_data.model_dump(exclude_unset=True)
        
        # 如果包含密码，进行加密
        if 'password' in update_dict and update_dict['password']:
            update_dict['password_hash'] = get_password_hash(update_dict.pop('password'))
        elif 'password' in update_dict:
            update_dict.pop('password')
        
        updated_user = await self.repo.update(user_id, update_dict)
        return UserDetailResponse.model_validate(updated_user)
    
    async def delete_user(self, user_id: int, current_user: User) -> bool:
        """删除用户"""
        # 权限检查
        if current_user.user_type != "admin":
            raise HTTPException(status_code=403, detail="权限不足，仅管理员可删除用户")
        
        # 不能删除自己
        if user_id == current_user.id:
            raise HTTPException(status_code=422, detail="不能删除当前登录的用户")
        
        # 检查用户是否存在
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 删除用户
        return await self.repo.delete(user_id)
    
    async def reset_password(
        self,
        user_id: int,
        password_data: PasswordResetRequest,
        current_user: User
    ) -> bool:
        """重置用户密码"""
        # 权限检查
        if current_user.user_type != "admin":
            raise HTTPException(status_code=403, detail="权限不足，仅管理员可重置密码")
        
        # 检查用户是否存在
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 更新密码
        password_hash = get_password_hash(password_data.new_password)
        return await self.repo.update_password(user_id, password_hash)
    
    async def toggle_user_status(
        self,
        user_id: int,
        is_active: bool,
        current_user: User
    ) -> bool:
        """切换用户状态"""
        # 权限检查
        if current_user.user_type != "admin":
            raise HTTPException(status_code=403, detail="权限不足，仅管理员可更改用户状态")
        
        # 不能禁用自己
        if user_id == current_user.id and not is_active:
            raise HTTPException(status_code=422, detail="不能禁用当前登录的用户")
        
        # 检查用户是否存在
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 切换状态
        return await self.repo.toggle_status(user_id, is_active)
    
    async def batch_toggle_status(
        self,
        batch_data: BatchStatusRequest,
        current_user: User
    ) -> BatchStatusResponse:
        """批量切换用户状态"""
        # 权限检查
        if current_user.user_type != "admin":
            raise HTTPException(status_code=403, detail="权限不足，仅管理员可批量操作")
        
        # 过滤掉当前用户（如果是禁用操作）
        user_ids = batch_data.user_ids
        skipped_count = 0
        
        if not batch_data.is_active and current_user.id in user_ids:
            user_ids = [uid for uid in user_ids if uid != current_user.id]
            skipped_count = 1
        
        # 批量更新
        success_count = await self.repo.batch_toggle_status(user_ids, batch_data.is_active)
        fail_count = len(batch_data.user_ids) - success_count - skipped_count
        
        action = "启用" if batch_data.is_active else "禁用"
        message = f"成功{action} {success_count} 个用户"
        if skipped_count > 0:
            message += f"，跳过当前用户 {skipped_count} 个"
        if fail_count > 0:
            message += f"，失败 {fail_count} 个"
        
        return BatchStatusResponse(
            success_count=success_count,
            fail_count=fail_count,
            skipped_count=skipped_count,
            message=message
        )
    
    async def update_push_cid(self, user_id: int, cid: str) -> bool:
        """更新用户的推送客户端ID"""
        return await self.repo.update(user_id, {"push_cid": cid})

    async def update_profile(self, user_id: int, profile_data: dict) -> UserDetailResponse:
        """更新当前用户的个人资料（用户名、真实姓名）"""
        import re
        
        # 检查用户是否存在
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        update_dict = {}
        
        # 更新用户名
        if 'username' in profile_data and profile_data['username']:
            new_username = profile_data['username']
            
            # 验证用户名格式
            if len(new_username) < 3 or len(new_username) > 50:
                raise HTTPException(status_code=422, detail="用户名长度应在3-50个字符之间")
            
            if not re.match(r'^[a-zA-Z0-9_-]+$', new_username):
                raise HTTPException(status_code=422, detail="用户名只能包含字母、数字、下划线和连字符")
            
            # 检查用户名是否已被占用
            if new_username != user.username:
                existing_user = await self.repo.get_by_username(new_username)
                if existing_user:
                    raise HTTPException(status_code=409, detail="用户名已被占用")
            
            update_dict['username'] = new_username
        
        # 更新真实姓名
        if 'realname' in profile_data:
            update_dict['realname'] = profile_data['realname'] or None
        
        if update_dict:
            updated_user = await self.repo.update(user_id, update_dict)
            return UserDetailResponse.model_validate(updated_user)
        
        return UserDetailResponse.model_validate(user)

    async def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """修改当前用户密码"""
        from app.core.security import verify_password
        
        # 检查用户是否存在
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 验证旧密码
        if not verify_password(old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="当前密码错误")
        
        # 验证新密码
        if len(new_password) < 6:
            raise HTTPException(status_code=422, detail="新密码长度不能少于6位")
        
        # 更新密码
        password_hash = get_password_hash(new_password)
        return await self.repo.update_password(user_id, password_hash)

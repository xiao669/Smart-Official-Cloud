"""用户数据访问层"""
from __future__ import annotations

from sqlalchemy import select, func, or_, update, delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    """用户仓储类"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, user_id: int) -> User | None:
        """根据ID获取用户"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> User | None:
        """根据用户名获取用户"""
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()
    
    async def list(
        self,
        skip: int = 0,
        limit: int = 10,
        keyword: str | None = None,
        user_type: str | None = None
    ) -> tuple[list[User], int]:
        """获取用户列表（分页、搜索、筛选）"""
        # 构建查询条件
        conditions = []
        
        if keyword:
            keyword_pattern = f"%{keyword}%"
            conditions.append(
                or_(
                    User.username.like(keyword_pattern),
                    User.realname.like(keyword_pattern),
                    User.department.like(keyword_pattern)
                )
            )
        
        if user_type:
            conditions.append(User.user_type == user_type)
        
        # 查询总数
        count_query = select(func.count(User.id))
        if conditions:
            count_query = count_query.where(*conditions)
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()
        
        # 查询列表
        list_query = select(User).order_by(User.created_at.desc())
        if conditions:
            list_query = list_query.where(*conditions)
        list_query = list_query.offset(skip).limit(limit)
        
        result = await self.db.execute(list_query)
        users = result.scalars().all()
        
        return list(users), total
    
    async def create(self, user_data: dict) -> User:
        """创建用户"""
        user = User(**user_data)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def update(self, user_id: int, user_data: dict) -> User | None:
        """更新用户信息"""
        user = await self.get_by_id(user_id)
        if not user:
            return None
        
        for key, value in user_data.items():
            if value is not None:
                setattr(user, key, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def delete(self, user_id: int) -> bool:
        """删除用户（数据库已设置级联删除，会自动删除相关操作日志）"""
        result = await self.db.execute(
            delete(User).where(User.id == user_id)
        )
        await self.db.commit()
        return result.rowcount > 0
    
    async def update_password(self, user_id: int, password_hash: str) -> bool:
        """更新用户密码"""
        result = await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(password_hash=password_hash)
        )
        await self.db.commit()
        return result.rowcount > 0
    
    async def toggle_status(self, user_id: int, is_active: bool) -> bool:
        """切换用户状态"""
        result = await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(is_active=is_active)
        )
        await self.db.commit()
        return result.rowcount > 0
    
    async def batch_toggle_status(self, user_ids: list[int], is_active: bool) -> int:
        """批量切换用户状态"""
        result = await self.db.execute(
            update(User)
            .where(User.id.in_(user_ids))
            .values(is_active=is_active)
        )
        await self.db.commit()
        return result.rowcount

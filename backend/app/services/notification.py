"""推送通知服务"""
from datetime import date, datetime
from sqlalchemy import select, func, update, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.notification import Notification, DailyPushCount
from app.models.warning import Warning
from app.models.user import User


class NotificationService:
    """推送通知服务类"""
    
    # 每天最大推送数量
    DAILY_PUSH_LIMIT = 10

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_daily_push_count(self, user_id: int, push_date: date = None) -> int:
        """获取用户当天已推送数量"""
        if push_date is None:
            push_date = date.today()
        
        result = await self.db.execute(
            select(DailyPushCount).where(
                DailyPushCount.user_id == user_id,
                DailyPushCount.push_date == push_date
            )
        )
        record = result.scalar_one_or_none()
        return record.push_count if record else 0

    async def increment_push_count(self, user_id: int, push_date: date = None) -> int:
        """增加用户当天推送计数"""
        if push_date is None:
            push_date = date.today()
        
        result = await self.db.execute(
            select(DailyPushCount).where(
                DailyPushCount.user_id == user_id,
                DailyPushCount.push_date == push_date
            )
        )
        record = result.scalar_one_or_none()
        
        if record:
            record.push_count += 1
            new_count = record.push_count
        else:
            record = DailyPushCount(
                user_id=user_id,
                push_date=push_date,
                push_count=1
            )
            self.db.add(record)
            new_count = 1
        
        await self.db.commit()
        return new_count

    async def can_push_today(self, user_id: int) -> bool:
        """检查用户今天是否还能推送"""
        count = await self.get_daily_push_count(user_id)
        return count < self.DAILY_PUSH_LIMIT

    async def get_remaining_push_count(self, user_id: int) -> int:
        """获取用户今天剩余推送次数"""
        count = await self.get_daily_push_count(user_id)
        return max(0, self.DAILY_PUSH_LIMIT - count)

    async def create_notification_from_warning(
        self, 
        user_id: int, 
        warning: Warning
    ) -> Notification | None:
        """从预警创建推送通知"""
        # 如果预警已被忽略，不创建通知
        if warning.is_dismissed:
            return None
            
        # 检查是否已存在该预警的通知
        existing = await self.db.execute(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.warning_id == warning.id
            )
        )
        if existing.scalar_one_or_none():
            return None
        
        # 生成通知标题和内容
        type_text = {
            'expired': '已过期',
            'expiry': '临期预警',
            'low_stock': '低库存'
        }.get(warning.type, '预警')
        
        title = f"【{type_text}】{warning.medicine.name if warning.medicine else '药品'}"
        
        notification = Notification(
            user_id=user_id,
            warning_id=warning.id,
            title=title,
            content=warning.message,
            type=warning.type,
            push_date=date.today(),
            is_pushed=False,
            is_read=False
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        return notification


    async def generate_notifications_for_user(self, user_id: int) -> int:
        """为用户生成待推送通知（从未读预警中）"""
        # 获取用户当前场景
        user_result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        if not user:
            return 0
        
        current_mode = user.current_mode or "medicine"
        
        # 获取所有未读且未被忽略的预警，并根据用户当前场景过滤
        result = await self.db.execute(
            select(Warning)
            .where(
                Warning.is_read == False,
                Warning.is_dismissed == False,  # 排除被忽略的预警
                Warning.mode == current_mode  # 只获取当前场景的预警
            )
            .options(selectinload(Warning.medicine))
            .order_by(Warning.created_at.desc())
        )
        warnings = list(result.scalars().all())
        
        count = 0
        for warning in warnings:
            notification = await self.create_notification_from_warning(user_id, warning)
            if notification:
                count += 1
        
        return count

    async def get_pending_notifications(self, user_id: int, limit: int = 10) -> list[dict]:
        """获取待推送的通知（分别推送，每次返回一条）"""
        # 检查今天是否还能推送
        remaining = await self.get_remaining_push_count(user_id)
        if remaining <= 0:
            return []
        
        # 获取用户当前场景
        user_result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        if not user:
            return []
        
        current_mode = user.current_mode or "medicine"
        
        # 获取未推送且未读的通知，按创建时间排序
        # 已读的消息不再弹出
        # 同时排除对应预警已被忽略的通知
        # 并且只返回当前场景的通知
        result = await self.db.execute(
            select(Notification)
            .outerjoin(Warning, Notification.warning_id == Warning.id)
            .where(
                Notification.user_id == user_id,
                Notification.is_pushed == False,
                Notification.is_read == False,  # 只返回未读的通知
                Notification.push_date == date.today(),
                # 排除对应预警已被忽略的通知（warning_id为空或预警未被忽略）
                (Notification.warning_id == None) | (Warning.is_dismissed == False),
                # 只返回当前场景的通知
                (Notification.warning_id == None) | (Warning.mode == current_mode)
            )
            .order_by(Notification.created_at.asc())
            .limit(min(limit, remaining))
        )
        notifications = list(result.scalars().all())
        
        return [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "type": n.type,
                "warning_id": n.warning_id,
                "created_at": n.created_at.isoformat()
            }
            for n in notifications
        ]

    async def mark_as_pushed(self, notification_id: int) -> bool:
        """标记通知为已推送"""
        result = await self.db.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        notification = result.scalar_one_or_none()
        if not notification:
            return False
        
        if not notification.is_pushed:
            notification.is_pushed = True
            notification.pushed_at = datetime.now()
            # 增加推送计数
            await self.increment_push_count(notification.user_id)
            await self.db.commit()
        
        return True

    async def mark_as_read(self, notification_id: int) -> bool:
        """标记通知为已读，同时标记对应的预警为已读"""
        result = await self.db.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        notification = result.scalar_one_or_none()
        if not notification:
            return False
        
        notification.is_read = True
        
        # 同时标记对应的预警为已读，防止重复生成通知
        if notification.warning_id:
            warning_result = await self.db.execute(
                select(Warning).where(Warning.id == notification.warning_id)
            )
            warning = warning_result.scalar_one_or_none()
            if warning:
                warning.is_read = True
        
        await self.db.commit()
        return True

    async def get_user_notifications(
        self, 
        user_id: int, 
        is_read: bool | None = None,
        page: int = 1,
        page_size: int = 20
    ) -> dict:
        """获取用户的通知列表"""
        query = select(Notification).where(Notification.user_id == user_id)
        
        if is_read is not None:
            query = query.where(Notification.is_read == is_read)
        
        # 统计总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # 分页
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Notification.created_at.desc())
        
        result = await self.db.execute(query)
        notifications = list(result.scalars().all())
        
        items = [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "type": n.type,
                "warning_id": n.warning_id,
                "is_pushed": n.is_pushed,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
                "pushed_at": n.pushed_at.isoformat() if n.pushed_at else None
            }
            for n in notifications
        ]
        
        pages = (total + page_size - 1) // page_size
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages
        }

    async def get_unread_count(self, user_id: int) -> int:
        """获取未读通知数量"""
        result = await self.db.execute(
            select(func.count()).select_from(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        return result.scalar() or 0

    async def get_push_status(self, user_id: int) -> dict:
        """获取推送状态"""
        daily_count = await self.get_daily_push_count(user_id)
        remaining = max(0, self.DAILY_PUSH_LIMIT - daily_count)
        
        # 获取待推送数量
        result = await self.db.execute(
            select(func.count()).select_from(Notification).where(
                Notification.user_id == user_id,
                Notification.is_pushed == False,
                Notification.push_date == date.today()
            )
        )
        pending_count = result.scalar() or 0
        
        return {
            "daily_limit": self.DAILY_PUSH_LIMIT,
            "pushed_today": daily_count,
            "remaining_today": remaining,
            "pending_count": pending_count
        }

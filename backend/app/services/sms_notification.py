"""
短信通知服务
处理临期药品的短信预警通知
"""
from datetime import date, datetime, timedelta
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.sms import SmsLog, SmsDailyCount, SmsConfig, SmsApiConfig
from app.models.warning import Warning
from app.models.user import User
from app.models.inventory import Batch
from app.models.medicine import Medicine
from app.services.sms import get_sms_service_from_db
from app.core.config import settings


class SmsNotificationService:
    """短信通知服务类"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ========== API 配置管理 ==========
    
    async def get_api_config(self) -> dict:
        """获取短信API配置"""
        result = await self.db.execute(select(SmsApiConfig))
        configs = {c.config_key: c.config_value for c in result.scalars().all()}
        
        return {
            "access_key_id": configs.get("access_key_id", ""),
            "access_key_secret": configs.get("access_key_secret", ""),
            "sign_name": configs.get("sign_name", ""),
            "template_code": configs.get("template_code", ""),
            "expired_template_code": configs.get("expired_template_code", ""),
            "low_stock_template_code": configs.get("low_stock_template_code", ""),
            "sms_enabled": configs.get("sms_enabled", "false") == "true",
            "daily_limit": int(configs.get("daily_limit", "10"))
        }
    
    async def update_api_config(
        self,
        access_key_id: str = None,
        access_key_secret: str = None,
        sign_name: str = None,
        template_code: str = None,
        expired_template_code: str = None,
        low_stock_template_code: str = None,
        sms_enabled: bool = None,
        daily_limit: int = None
    ) -> dict:
        """更新短信API配置"""
        config_updates = {}
        
        if access_key_id is not None:
            config_updates["access_key_id"] = access_key_id
        if access_key_secret is not None:
            config_updates["access_key_secret"] = access_key_secret
        if sign_name is not None:
            config_updates["sign_name"] = sign_name
        if template_code is not None:
            config_updates["template_code"] = template_code
        if expired_template_code is not None:
            config_updates["expired_template_code"] = expired_template_code
        if low_stock_template_code is not None:
            config_updates["low_stock_template_code"] = low_stock_template_code
        if sms_enabled is not None:
            config_updates["sms_enabled"] = "true" if sms_enabled else "false"
        if daily_limit is not None:
            config_updates["daily_limit"] = str(daily_limit)
        
        for key, value in config_updates.items():
            result = await self.db.execute(
                select(SmsApiConfig).where(SmsApiConfig.config_key == key)
            )
            config = result.scalar_one_or_none()
            
            if config:
                config.config_value = value
            else:
                config = SmsApiConfig(config_key=key, config_value=value)
                self.db.add(config)
        
        await self.db.commit()
        return await self.get_api_config()
    
    async def is_api_configured(self) -> bool:
        """检查API是否已配置"""
        config = await self.get_api_config()
        return bool(config.get("access_key_id") and config.get("access_key_secret"))
    
    # ========== 用户配置管理 ==========
    
    async def get_user_sms_config(self, user_id: int) -> dict:
        """获取用户短信配置"""
        result = await self.db.execute(
            select(SmsConfig).where(SmsConfig.user_id == user_id)
        )
        config = result.scalar_one_or_none()
        
        if config:
            return {
                "sms_enabled": config.sms_enabled,
                "expiry_sms_enabled": config.expiry_sms_enabled,
                "expired_sms_enabled": config.expired_sms_enabled,
                "low_stock_sms_enabled": config.low_stock_sms_enabled,
                "notify_time": config.notify_time,
                "notify_phone": config.notify_phone
            }
        
        # 返回默认配置
        return {
            "sms_enabled": False,
            "expiry_sms_enabled": True,
            "expired_sms_enabled": True,
            "low_stock_sms_enabled": False,
            "notify_time": "09:00",
            "notify_phone": None
        }
    
    async def update_user_sms_config(
        self,
        user_id: int,
        sms_enabled: bool = None,
        expiry_sms_enabled: bool = None,
        expired_sms_enabled: bool = None,
        low_stock_sms_enabled: bool = None,
        notify_time: str = None,
        notify_phone: str = None
    ) -> dict:
        """更新用户短信配置"""
        result = await self.db.execute(
            select(SmsConfig).where(SmsConfig.user_id == user_id)
        )
        config = result.scalar_one_or_none()
        
        if not config:
            config = SmsConfig(user_id=user_id)
            self.db.add(config)
        
        if sms_enabled is not None:
            config.sms_enabled = sms_enabled
        if expiry_sms_enabled is not None:
            config.expiry_sms_enabled = expiry_sms_enabled
        if expired_sms_enabled is not None:
            config.expired_sms_enabled = expired_sms_enabled
        if low_stock_sms_enabled is not None:
            config.low_stock_sms_enabled = low_stock_sms_enabled
        if notify_time is not None:
            config.notify_time = notify_time
        if notify_phone is not None:
            config.notify_phone = notify_phone
        
        await self.db.commit()
        return await self.get_user_sms_config(user_id)
    
    async def get_daily_sms_count(self, user_id: int, send_date: date = None) -> int:
        """获取用户当天已发送短信数量"""
        if send_date is None:
            send_date = date.today()
        
        result = await self.db.execute(
            select(SmsDailyCount).where(
                SmsDailyCount.user_id == user_id,
                SmsDailyCount.send_date == send_date
            )
        )
        record = result.scalar_one_or_none()
        return record.send_count if record else 0
    
    async def increment_sms_count(self, user_id: int) -> int:
        """增加用户当天短信计数"""
        send_date = date.today()
        
        result = await self.db.execute(
            select(SmsDailyCount).where(
                SmsDailyCount.user_id == user_id,
                SmsDailyCount.send_date == send_date
            )
        )
        record = result.scalar_one_or_none()
        
        if record:
            record.send_count += 1
            new_count = record.send_count
        else:
            record = SmsDailyCount(
                user_id=user_id,
                send_date=send_date,
                send_count=1
            )
            self.db.add(record)
            new_count = 1
        
        await self.db.commit()
        return new_count
    
    async def can_send_sms(self, user_id: int) -> tuple[bool, str]:
        """检查是否可以发送短信"""
        # 获取API配置
        api_config = await self.get_api_config()
        
        # 检查全局开关（优先使用数据库配置）
        if not api_config.get("sms_enabled", False):
            return False, "短信服务未启用"
        
        # 检查API是否配置
        if not api_config.get("access_key_id") or not api_config.get("access_key_secret"):
            return False, "短信API未配置"
        
        # 检查用户配置
        config = await self.get_user_sms_config(user_id)
        if not config["sms_enabled"]:
            return False, "用户未开启短信通知"
        
        # 检查每日限额（0表示不限制）
        daily_limit = api_config.get("daily_limit", 10)
        if daily_limit > 0:
            daily_count = await self.get_daily_sms_count(user_id)
            if daily_count >= daily_limit:
                return False, f"今日短信已达上限({daily_limit}条)"
        
        return True, "可以发送"
    
    async def get_user_notify_phone(self, user_id: int) -> Optional[str]:
        """获取用户通知手机号"""
        # 先检查短信配置中的手机号
        config = await self.get_user_sms_config(user_id)
        if config.get("notify_phone"):
            return config["notify_phone"]
        
        # 使用用户注册手机号
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        return user.phone if user else None
    
    async def send_warning_sms(
        self,
        user_id: int,
        warning: Warning,
        phone: str = None
    ) -> dict:
        """发送预警短信"""
        # 检查预警是否被忽略（被忽略的预警不发送短信，节省费用）
        if warning.is_dismissed:
            return {"success": False, "message": "该预警已被忽略，不发送短信"}
        
        # 检查是否可以发送
        can_send, reason = await self.can_send_sms(user_id)
        if not can_send:
            return {"success": False, "message": reason}
        
        # 获取手机号
        if not phone:
            phone = await self.get_user_notify_phone(user_id)
        
        if not phone:
            return {"success": False, "message": "未设置通知手机号"}
        
        # 检查用户是否开启了该类型的短信通知
        config = await self.get_user_sms_config(user_id)
        if warning.type == "expiry" and not config["expiry_sms_enabled"]:
            return {"success": False, "message": "用户未开启临期预警短信"}
        if warning.type == "expired" and not config["expired_sms_enabled"]:
            return {"success": False, "message": "用户未开启过期预警短信"}
        if warning.type == "low_stock" and not config["low_stock_sms_enabled"]:
            return {"success": False, "message": "用户未开启低库存预警短信"}
        
        # 检查是否已发送过该预警的短信
        existing = await self.db.execute(
            select(SmsLog).where(
                SmsLog.warning_id == warning.id,
                SmsLog.user_id == user_id,
                SmsLog.status == "success"
            )
        )
        if existing.scalar_one_or_none():
            return {"success": False, "message": "该预警已发送过短信"}
        
        # 创建短信记录
        sms_log = SmsLog(
            user_id=user_id,
            phone=phone,
            content=warning.message[:100],
            sms_type=warning.type,
            warning_id=warning.id,
            status="pending"
        )
        self.db.add(sms_log)
        await self.db.commit()
        
        # 发送短信
        try:
            # 获取短信服务实例（从数据库配置）
            sms_service = await get_sms_service_from_db(self.db)
            
            # 获取药品名称和批次信息
            medicine_name = warning.medicine.name if warning.medicine else "未知药品"
            batch_number = ""
            
            if warning.batch_id:
                batch_result = await self.db.execute(
                    select(Batch).where(Batch.id == warning.batch_id)
                )
                batch = batch_result.scalar_one_or_none()
                if batch:
                    batch_number = batch.batch_number or ""
                    days_left = (batch.expiry_date - date.today()).days
            else:
                days_left = 0
            
            # 根据类型发送不同短信
            if warning.type == "expiry":
                result = await sms_service.send_expiry_warning(
                    phone, medicine_name, days_left, batch_number
                )
            elif warning.type == "expired":
                result = await sms_service.send_expired_warning(
                    phone, medicine_name, abs(days_left)
                )
            elif warning.type == "low_stock":
                # 获取当前库存
                stock_result = await self.db.execute(
                    select(func.sum(Batch.quantity)).where(
                        Batch.medicine_id == warning.medicine_id
                    )
                )
                current_stock = stock_result.scalar() or 0
                result = await sms_service.send_low_stock_warning(
                    phone, medicine_name, current_stock
                )
            else:
                result = {"success": False, "message": "未知预警类型"}
            
            # 更新短信记录
            if result["success"]:
                sms_log.status = "success"
                sms_log.sent_at = datetime.now()
                sms_log.biz_id = result.get("biz_id")
                await self.increment_sms_count(user_id)
            else:
                sms_log.status = "failed"
                sms_log.error_code = result.get("code")
                sms_log.error_message = result.get("message")
            
            await self.db.commit()
            return result
            
        except Exception as e:
            sms_log.status = "failed"
            sms_log.error_message = str(e)
            await self.db.commit()
            return {"success": False, "message": f"发送异常: {str(e)}"}
    
    async def send_batch_warnings_sms(self, user_id: int) -> dict:
        """批量发送预警短信（用于定时任务）"""
        # 检查是否可以发送
        can_send, reason = await self.can_send_sms(user_id)
        if not can_send:
            return {"success": False, "message": reason, "sent": 0, "failed": 0}
        
        # 获取API配置
        api_config = await self.get_api_config()
        daily_limit = api_config.get("daily_limit", 10)
        
        # 获取未读且未被忽略的预警（被忽略的预警不发送短信，节省费用）
        result = await self.db.execute(
            select(Warning)
            .where(
                Warning.is_read == False,
                Warning.is_dismissed == False  # 排除被忽略的预警
            )
            .options(selectinload(Warning.medicine))
            .order_by(Warning.created_at.desc())
            .limit(100)  # 每次最多处理100条
        )
        warnings = list(result.scalars().all())
        
        sent = 0
        failed = 0
        
        for warning in warnings:
            # 检查剩余配额（0表示不限制）
            if daily_limit > 0:
                daily_count = await self.get_daily_sms_count(user_id)
                if daily_count >= daily_limit:
                    break
            
            send_result = await self.send_warning_sms(user_id, warning)
            if send_result["success"]:
                sent += 1
            else:
                failed += 1
        
        return {
            "success": True,
            "message": f"发送完成，成功{sent}条，失败{failed}条",
            "sent": sent,
            "failed": failed
        }
    
    async def get_sms_logs(
        self,
        user_id: int = None,
        status: str = None,
        sms_type: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> dict:
        """获取短信发送记录"""
        query = select(SmsLog)
        
        if user_id:
            query = query.where(SmsLog.user_id == user_id)
        if status:
            query = query.where(SmsLog.status == status)
        if sms_type:
            query = query.where(SmsLog.sms_type == sms_type)
        
        # 统计总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # 分页
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(SmsLog.created_at.desc())
        
        result = await self.db.execute(query)
        logs = list(result.scalars().all())
        
        items = [
            {
                "id": log.id,
                "phone": log.phone[:3] + "****" + log.phone[-4:] if len(log.phone) >= 11 else log.phone,
                "content": log.content,
                "sms_type": log.sms_type,
                "status": log.status,
                "error_message": log.error_message,
                "created_at": log.created_at.isoformat(),
                "sent_at": log.sent_at.isoformat() if log.sent_at else None
            }
            for log in logs
        ]
        
        pages = (total + page_size - 1) // page_size
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages
        }
    
    async def get_sms_stats(self, user_id: int = None) -> dict:
        """获取短信统计"""
        today = date.today()
        api_config = await self.get_api_config()
        daily_limit = api_config.get("daily_limit", 10)
        
        # 今日发送数
        today_query = select(func.count()).select_from(SmsLog).where(
            func.date(SmsLog.created_at) == today
        )
        if user_id:
            today_query = today_query.where(SmsLog.user_id == user_id)
        today_result = await self.db.execute(today_query)
        today_count = today_result.scalar() or 0
        
        # 今日成功数
        success_query = select(func.count()).select_from(SmsLog).where(
            func.date(SmsLog.created_at) == today,
            SmsLog.status == "success"
        )
        if user_id:
            success_query = success_query.where(SmsLog.user_id == user_id)
        success_result = await self.db.execute(success_query)
        success_count = success_result.scalar() or 0
        
        # 本月发送数
        month_start = today.replace(day=1)
        month_query = select(func.count()).select_from(SmsLog).where(
            func.date(SmsLog.created_at) >= month_start
        )
        if user_id:
            month_query = month_query.where(SmsLog.user_id == user_id)
        month_result = await self.db.execute(month_query)
        month_count = month_result.scalar() or 0
        
        # 剩余配额（0表示不限制，显示为"不限"）
        if daily_limit == 0:
            remaining = -1  # -1 表示不限制
        elif user_id:
            remaining = daily_limit - today_count
        else:
            remaining = None
        
        return {
            "today_total": today_count,
            "today_success": success_count,
            "today_failed": today_count - success_count,
            "month_total": month_count,
            "daily_limit": daily_limit,
            "remaining_today": max(0, remaining) if remaining is not None and remaining >= 0 else remaining,
            "sms_enabled": api_config.get("sms_enabled", False)
        }

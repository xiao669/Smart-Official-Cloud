"""预警服务（支持多场景数据隔离）"""
from datetime import date, timedelta, datetime
from sqlalchemy import select, func, and_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.warning import Warning, WarningConfig, ReplenishSuggestion
from app.models.inventory import Batch, Transaction
from app.models.medicine import Medicine
from app.schemas.common import PaginatedResponse
from app.core.exceptions import NotFoundError


# 场景术语映射
MODE_TERMS = {
    "medicine": "药品",
    "inventory": "商品", 
    "food": "食品"
}

# 场景对应的批次表名
MODE_BATCH_TABLES = {
    "medicine": "batches",
    "inventory": "inventory_batches",
    "food": "food_batches"
}

# 场景对应的物品表名
MODE_ITEM_TABLES = {
    "medicine": "medicines",
    "inventory": "inventory_items",
    "food": "food_items"
}


class WarningService:
    """预警服务类（支持多场景）"""

    def __init__(self, db: AsyncSession, mode: str = "medicine"):
        self.db = db
        self.mode = mode
        self.item_term = MODE_TERMS.get(mode, "药品")
        self.batch_table = MODE_BATCH_TABLES.get(mode, "batches")
        self.item_table = MODE_ITEM_TABLES.get(mode, "medicines")

    async def get_config(self) -> dict:
        """获取预警配置"""
        result = await self.db.execute(select(WarningConfig))
        configs = list(result.scalars().all())

        config_dict = {
            "expiry_warning_days": 30,
            "low_stock_threshold": 10,
            "reminder_start_time": "08:00",
            "reminder_end_time": "20:00",
            "reminder_enabled": True,
            "re_remind_enabled": True,
            "re_remind_days": 3,
        }

        for c in configs:
            if c.config_key == "expiry_warning_days":
                config_dict["expiry_warning_days"] = int(c.config_value)
            elif c.config_key == "low_stock_threshold":
                config_dict["low_stock_threshold"] = int(c.config_value)
            elif c.config_key == "reminder_start_time":
                config_dict["reminder_start_time"] = c.config_value
            elif c.config_key == "reminder_end_time":
                config_dict["reminder_end_time"] = c.config_value
            elif c.config_key == "reminder_enabled":
                config_dict["reminder_enabled"] = c.config_value == "true"
            elif c.config_key == "re_remind_enabled":
                config_dict["re_remind_enabled"] = c.config_value == "true"
            elif c.config_key == "re_remind_days":
                config_dict["re_remind_days"] = int(c.config_value)

        return config_dict

    async def update_config(
        self, 
        expiry_warning_days: int, 
        low_stock_threshold: int,
        reminder_start_time: str | None = None,
        reminder_end_time: str | None = None,
        reminder_enabled: bool | None = None,
        re_remind_enabled: bool | None = None,
        re_remind_days: int | None = None
    ) -> dict:
        """更新预警配置"""
        configs_to_update = [
            ("expiry_warning_days", str(expiry_warning_days)),
            ("low_stock_threshold", str(low_stock_threshold)),
        ]
        
        if reminder_start_time is not None:
            configs_to_update.append(("reminder_start_time", reminder_start_time))
        if reminder_end_time is not None:
            configs_to_update.append(("reminder_end_time", reminder_end_time))
        if reminder_enabled is not None:
            configs_to_update.append(("reminder_enabled", "true" if reminder_enabled else "false"))
        if re_remind_enabled is not None:
            configs_to_update.append(("re_remind_enabled", "true" if re_remind_enabled else "false"))
        if re_remind_days is not None:
            configs_to_update.append(("re_remind_days", str(re_remind_days)))
        
        for key, value in configs_to_update:
            result = await self.db.execute(
                select(WarningConfig).where(WarningConfig.config_key == key)
            )
            config = result.scalar_one_or_none()
            if config:
                config.config_value = value
            else:
                config = WarningConfig(config_key=key, config_value=value)
                self.db.add(config)

        await self.db.commit()
        return await self.get_config()

    async def check_and_generate_warnings(self) -> int:
        """检查并生成预警（支持多场景）"""
        config = await self.get_config()
        warning_days = config["expiry_warning_days"]
        low_stock_threshold = config["low_stock_threshold"]
        re_remind_enabled = config.get("re_remind_enabled", True)
        re_remind_days = config.get("re_remind_days", 3)
        count = 0
        
        expiry_threshold = date.today() + timedelta(days=warning_days)
        
        if self.mode == "medicine":
            # 药品场景：使用原有的 batches 表和 medicines 表
            batches_result = await self.db.execute(
                select(Batch)
                .where(Batch.expiry_date <= expiry_threshold, Batch.quantity > 0)
                .options(selectinload(Batch.medicine))
            )
            batches = list(batches_result.scalars().all())
            
            for batch in batches:
                days_left = (batch.expiry_date - date.today()).days
                
                if days_left < 0:
                    warning_type = "expired"
                    message = f"{self.item_term} {batch.medicine.name} 批次 {batch.batch_number or '无'} 已过期 {abs(days_left)} 天"
                else:
                    warning_type = "expiry"
                    message = f"{self.item_term} {batch.medicine.name} 批次 {batch.batch_number or '无'} 将在 {days_left} 天后过期"
                
                # 检查是否已存在预警
                existing_result = await self.db.execute(
                    select(Warning).where(
                        Warning.type == warning_type,
                        Warning.mode == self.mode,
                        Warning.batch_id == batch.id,
                    )
                )
                existing = existing_result.scalar_one_or_none()
                
                if existing:
                    if existing.is_dismissed:
                        continue
                    if re_remind_enabled and existing.is_read and existing.read_at:
                        days_since_read = (datetime.now() - existing.read_at).days
                        if days_since_read >= re_remind_days:
                            existing.is_read = False
                            existing.read_at = None
                            existing.message = message
                            count += 1
                    continue

                warning = Warning(
                    type=warning_type,
                    mode=self.mode,
                    medicine_id=batch.medicine_id,
                    batch_id=batch.id,
                    message=message,
                )
                self.db.add(warning)
                count += 1
            
            # 检查低库存预警
            stock_result = await self.db.execute(
                select(Batch.medicine_id, func.sum(Batch.quantity).label("total"))
                .group_by(Batch.medicine_id)
                .having(func.sum(Batch.quantity) < low_stock_threshold)
            )
            low_stock_items = list(stock_result.all())
            
            for medicine_id, total in low_stock_items:
                existing_result = await self.db.execute(
                    select(Warning).where(
                        Warning.type == "low_stock",
                        Warning.mode == self.mode,
                        Warning.medicine_id == medicine_id,
                    )
                )
                existing = existing_result.scalar_one_or_none()
                
                if existing:
                    if existing.is_dismissed:
                        continue
                    if re_remind_enabled and existing.is_read and existing.read_at:
                        days_since_read = (datetime.now() - existing.read_at).days
                        if days_since_read >= re_remind_days:
                            existing.is_read = False
                            existing.read_at = None
                            medicine_result = await self.db.execute(
                                select(Medicine).where(Medicine.id == medicine_id)
                            )
                            medicine = medicine_result.scalar_one_or_none()
                            existing.message = f"{self.item_term} {medicine.name if medicine else '未知'} 库存不足，当前库存 {total}"
                            count += 1
                    continue

                medicine_result = await self.db.execute(
                    select(Medicine).where(Medicine.id == medicine_id)
                )
                medicine = medicine_result.scalar_one_or_none()
                if not medicine:
                    continue

                warning = Warning(
                    type="low_stock",
                    mode=self.mode,
                    medicine_id=medicine_id,
                    message=f"{self.item_term} {medicine.name} 库存不足，当前库存 {total}",
                )
                self.db.add(warning)
                count += 1
        else:
            # 其他场景：使用动态表名查询
            count += await self._check_mode_warnings(warning_days, low_stock_threshold, re_remind_enabled, re_remind_days)

        await self.db.commit()
        return count

    async def _check_mode_warnings(self, warning_days: int, low_stock_threshold: int, 
                                    re_remind_enabled: bool, re_remind_days: int) -> int:
        """检查其他场景的预警（inventory/food）"""
        count = 0
        expiry_threshold = date.today() + timedelta(days=warning_days)
        
        # 使用原生SQL查询对应场景的批次表
        batch_query = text(f"""
            SELECT b.id, b.item_id, b.batch_number, b.expiry_date, b.quantity, i.name as item_name
            FROM {self.batch_table} b
            JOIN {self.item_table} i ON b.item_id = i.id
            WHERE b.expiry_date <= :expiry_threshold AND b.quantity > 0
        """)
        
        result = await self.db.execute(batch_query, {"expiry_threshold": expiry_threshold})
        batches = result.fetchall()
        
        for batch in batches:
            batch_id, item_id, batch_number, expiry_date, quantity, item_name = batch
            days_left = (expiry_date - date.today()).days
            
            if days_left < 0:
                warning_type = "expired"
                message = f"{self.item_term} {item_name} 批次 {batch_number or '无'} 已过期 {abs(days_left)} 天"
            else:
                warning_type = "expiry"
                message = f"{self.item_term} {item_name} 批次 {batch_number or '无'} 将在 {days_left} 天后过期"
            
            # 检查是否已存在预警（使用item_id而非medicine_id）
            existing_result = await self.db.execute(
                select(Warning).where(
                    Warning.type == warning_type,
                    Warning.mode == self.mode,
                    Warning.item_id == item_id,
                )
            )
            existing = existing_result.scalar_one_or_none()
            
            if existing:
                if existing.is_dismissed:
                    continue
                if re_remind_enabled and existing.is_read and existing.read_at:
                    days_since_read = (datetime.now() - existing.read_at).days
                    if days_since_read >= re_remind_days:
                        existing.is_read = False
                        existing.read_at = None
                        existing.message = message
                        count += 1
                continue

            warning = Warning(
                type=warning_type,
                mode=self.mode,
                item_id=item_id,
                message=message,
            )
            self.db.add(warning)
            count += 1
        
        # 检查低库存预警
        stock_query = text(f"""
            SELECT b.item_id, SUM(b.quantity) as total, i.name as item_name
            FROM {self.batch_table} b
            JOIN {self.item_table} i ON b.item_id = i.id
            GROUP BY b.item_id, i.name
            HAVING SUM(b.quantity) < :threshold
        """)
        
        stock_result = await self.db.execute(stock_query, {"threshold": low_stock_threshold})
        low_stock_items = stock_result.fetchall()
        
        for item_id, total, item_name in low_stock_items:
            existing_result = await self.db.execute(
                select(Warning).where(
                    Warning.type == "low_stock",
                    Warning.mode == self.mode,
                    Warning.item_id == item_id,
                )
            )
            existing = existing_result.scalar_one_or_none()
            
            if existing:
                if existing.is_dismissed:
                    continue
                if re_remind_enabled and existing.is_read and existing.read_at:
                    days_since_read = (datetime.now() - existing.read_at).days
                    if days_since_read >= re_remind_days:
                        existing.is_read = False
                        existing.read_at = None
                        existing.message = f"{self.item_term} {item_name} 库存不足，当前库存 {total}"
                        count += 1
                continue

            warning = Warning(
                type="low_stock",
                mode=self.mode,
                item_id=item_id,
                message=f"{self.item_term} {item_name} 库存不足，当前库存 {total}",
            )
            self.db.add(warning)
            count += 1
        
        return count

    async def list_warnings(
        self,
        warning_type: str | None = None,
        is_read: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse:
        """获取预警列表（按场景过滤）"""
        # 按场景过滤预警
        query = select(Warning).where(
            Warning.mode == self.mode,
            Warning.is_dismissed == False
        )

        if warning_type:
            query = query.where(Warning.type == warning_type)
        if is_read is not None:
            query = query.where(Warning.is_read == is_read)

        # 统计总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Warning.created_at.desc())

        result = await self.db.execute(query)
        warnings = list(result.scalars().all())

        items = []
        for w in warnings:
            # 获取物品名称
            item_name = None
            if self.mode == "medicine" and w.medicine_id:
                medicine_result = await self.db.execute(
                    select(Medicine).where(Medicine.id == w.medicine_id)
                )
                medicine = medicine_result.scalar_one_or_none()
                item_name = medicine.name if medicine else None
            elif w.item_id:
                # 其他场景从对应表获取名称
                name_query = text(f"SELECT name FROM {self.item_table} WHERE id = :item_id")
                name_result = await self.db.execute(name_query, {"item_id": w.item_id})
                row = name_result.fetchone()
                item_name = row[0] if row else None
            
            items.append({
                "id": w.id,
                "type": w.type,
                "medicine_id": w.medicine_id,
                "item_id": w.item_id,
                "medicine_name": item_name,
                "message": w.message,
                "is_read": w.is_read,
                "created_at": w.created_at.isoformat(),
            })

        pages = (total + page_size - 1) // page_size

        return PaginatedResponse(
            items=items, total=total, page=page, page_size=page_size, pages=pages
        )

    async def mark_as_read(self, warning_id: int) -> bool:
        """标记预警为已读"""
        result = await self.db.execute(
            select(Warning).where(Warning.id == warning_id, Warning.mode == self.mode)
        )
        warning = result.scalar_one_or_none()
        if not warning:
            raise NotFoundError("预警", warning_id)

        warning.is_read = True
        warning.read_at = datetime.now()
        await self.db.commit()
        return True

    async def mark_all_as_read(self) -> int:
        """一键标记当前场景所有未读预警为已读"""
        from sqlalchemy import update
        
        result = await self.db.execute(
            update(Warning)
            .where(Warning.mode == self.mode, Warning.is_read == False)
            .values(is_read=True, read_at=datetime.now())
        )
        await self.db.commit()
        return result.rowcount

    async def get_recent_warnings(self, limit: int = 10) -> list:
        """获取当前场景最近预警"""
        result = await self.db.execute(
            select(Warning)
            .where(Warning.mode == self.mode, Warning.is_dismissed == False)
            .order_by(Warning.created_at.desc())
            .limit(limit)
        )
        warnings = list(result.scalars().all())

        items = []
        for w in warnings:
            item_name = None
            if self.mode == "medicine" and w.medicine_id:
                medicine_result = await self.db.execute(
                    select(Medicine).where(Medicine.id == w.medicine_id)
                )
                medicine = medicine_result.scalar_one_or_none()
                item_name = medicine.name if medicine else None
            elif w.item_id:
                name_query = text(f"SELECT name FROM {self.item_table} WHERE id = :item_id")
                name_result = await self.db.execute(name_query, {"item_id": w.item_id})
                row = name_result.fetchone()
                item_name = row[0] if row else None
            
            items.append({
                "id": w.id,
                "type": w.type,
                "medicine_name": item_name,
                "message": w.message,
                "is_read": w.is_read,
                "created_at": w.created_at.isoformat(),
            })
        
        return items

    async def delete_warning(self, warning_id: int) -> bool:
        """删除/忽略单条预警"""
        result = await self.db.execute(
            select(Warning).where(Warning.id == warning_id, Warning.mode == self.mode)
        )
        warning = result.scalar_one_or_none()
        if not warning:
            return False
        
        warning.is_dismissed = True
        warning.dismissed_at = datetime.now()
        warning.is_read = True
        if not warning.read_at:
            warning.read_at = datetime.now()
        await self.db.commit()
        return True

    async def delete_all_warnings(self) -> int:
        """忽略当前场景所有预警"""
        from sqlalchemy import update
        
        result = await self.db.execute(
            update(Warning)
            .where(Warning.mode == self.mode, Warning.is_dismissed == False)
            .values(is_dismissed=True, dismissed_at=datetime.now(), is_read=True, read_at=datetime.now())
        )
        await self.db.commit()
        return result.rowcount

    async def delete_read_warnings(self) -> int:
        """忽略当前场景所有已读预警"""
        from sqlalchemy import update
        
        result = await self.db.execute(
            update(Warning)
            .where(and_(
                Warning.mode == self.mode,
                Warning.is_read == True, 
                Warning.is_dismissed == False
            ))
            .values(is_dismissed=True, dismissed_at=datetime.now())
        )
        await self.db.commit()
        return result.rowcount

    async def cleanup_old_warnings(self, days: int = 30) -> int:
        """清理当前场景旧预警"""
        from sqlalchemy import delete, or_
        
        cutoff_date = datetime.now() - timedelta(days=days)
        dismissed_cutoff = datetime.now() - timedelta(days=7)
        
        result = await self.db.execute(
            delete(Warning).where(
                Warning.mode == self.mode,
                or_(
                    and_(
                        Warning.is_read == True,
                        Warning.created_at < cutoff_date
                    ),
                    and_(
                        Warning.is_dismissed == True,
                        Warning.dismissed_at < dismissed_cutoff
                    )
                )
            )
        )
        await self.db.commit()
        return result.rowcount

    async def get_warning_stats(self) -> dict:
        """获取当前场景预警统计"""
        total_result = await self.db.execute(
            select(func.count(Warning.id)).where(
                Warning.mode == self.mode,
                Warning.is_dismissed == False
            )
        )
        total = total_result.scalar() or 0
        
        read_result = await self.db.execute(
            select(func.count(Warning.id)).where(
                Warning.mode == self.mode,
                Warning.is_read == True, 
                Warning.is_dismissed == False
            )
        )
        read_count = read_result.scalar() or 0
        
        unread_count = total - read_count
        
        return {
            "total": total,
            "read": read_count,
            "unread": unread_count
        }

    async def calculate_replenish_suggestions(self) -> list[dict]:
        """计算补货建议（仅药品场景支持）"""
        if self.mode != "medicine":
            return []
        
        from sqlalchemy import delete
        
        await self.db.execute(delete(ReplenishSuggestion))
        
        thirty_days_ago = date.today() - timedelta(days=30)
        
        outbound_result = await self.db.execute(
            select(
                Batch.medicine_id,
                func.sum(Transaction.quantity).label("total_out")
            )
            .join(Batch, Transaction.batch_id == Batch.id)
            .where(
                Transaction.type == "outbound",
                func.date(Transaction.created_at) >= thirty_days_ago
            )
            .group_by(Batch.medicine_id)
        )
        outbound_stats = {row[0]: row[1] for row in outbound_result.all()}
        
        stock_result = await self.db.execute(
            select(
                Batch.medicine_id,
                func.sum(Batch.quantity).label("total_stock")
            )
            .group_by(Batch.medicine_id)
        )
        stock_stats = {row[0]: row[1] for row in stock_result.all()}
        
        medicines_result = await self.db.execute(select(Medicine))
        medicines = {m.id: m for m in medicines_result.scalars().all()}
        
        suggestions = []
        
        for medicine_id, current_stock in stock_stats.items():
            if medicine_id not in medicines:
                continue
                
            medicine = medicines[medicine_id]
            total_out = outbound_stats.get(medicine_id, 0)
            
            avg_daily = total_out / 30 if total_out > 0 else 0
            
            if avg_daily > 0:
                days_until_stockout = int(current_stock / avg_daily)
                suggested_qty = max(0, int(avg_daily * 30 - current_stock))
                is_urgent = days_until_stockout <= 7
                
                if days_until_stockout <= 15 and suggested_qty > 0:
                    suggestion = ReplenishSuggestion(
                        medicine_id=medicine_id,
                        current_stock=current_stock,
                        avg_daily_consumption=round(avg_daily, 2),
                        days_until_stockout=days_until_stockout,
                        suggested_quantity=suggested_qty,
                        is_urgent=is_urgent
                    )
                    self.db.add(suggestion)
                    
                    suggestions.append({
                        "medicine_id": medicine_id,
                        "medicine_name": medicine.name,
                        "current_stock": current_stock,
                        "avg_daily_consumption": round(avg_daily, 2),
                        "days_until_stockout": days_until_stockout,
                        "suggested_quantity": suggested_qty,
                        "is_urgent": is_urgent
                    })
        
        await self.db.commit()
        suggestions.sort(key=lambda x: (not x["is_urgent"], x["days_until_stockout"]))
        
        return suggestions

    async def get_replenish_suggestions(self) -> list[dict]:
        """获取补货建议列表（仅药品场景支持）"""
        if self.mode != "medicine":
            return []
        
        result = await self.db.execute(
            select(ReplenishSuggestion)
            .options(selectinload(ReplenishSuggestion.medicine))
            .order_by(ReplenishSuggestion.is_urgent.desc(), ReplenishSuggestion.days_until_stockout.asc())
        )
        suggestions = list(result.scalars().all())
        
        return [
            {
                "id": s.id,
                "medicine_id": s.medicine_id,
                "medicine_name": s.medicine.name if s.medicine else None,
                "current_stock": s.current_stock,
                "avg_daily_consumption": s.avg_daily_consumption,
                "days_until_stockout": s.days_until_stockout,
                "suggested_quantity": s.suggested_quantity,
                "is_urgent": s.is_urgent,
                "created_at": s.created_at.isoformat()
            }
            for s in suggestions
        ]

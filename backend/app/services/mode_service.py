"""多场景服务基类"""
from typing import Type
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mode_models import get_category_model, get_item_model, get_batch_model
from app.utils.mode_tables import validate_mode


class ModeService:
    """多场景服务基类
    
    提供基于用户场景的动态模型访问
    """
    
    def __init__(self, db: AsyncSession, mode: str):
        """
        初始化服务
        
        Args:
            db: 数据库会话
            mode: 用户当前场景
        """
        if not validate_mode(mode):
            raise ValueError(f"Invalid mode: {mode}")
        
        self.db = db
        self.mode = mode
        
        # 获取当前场景的模型
        self._category_model = get_category_model(mode)
        self._item_model = get_item_model(mode)
        self._batch_model = get_batch_model(mode)
    
    @property
    def CategoryModel(self) -> Type:
        """获取分类模型"""
        return self._category_model
    
    @property
    def ItemModel(self) -> Type:
        """获取物品模型"""
        return self._item_model
    
    @property
    def BatchModel(self) -> Type:
        """获取批次模型"""
        return self._batch_model

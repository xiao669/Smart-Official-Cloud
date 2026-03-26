"""多场景表名管理工具"""

# 场景与表名前缀映射（只保留3个场景）
MODE_PREFIXES = {
    'medicine': 'medicine',
    'inventory': 'inventory',
    'food': 'food'
}

# 基础表名
BASE_TABLES = {
    'items': 'items',
    'batches': 'batches',
    'categories': 'categories'
}

# 药品场景使用原有表名（兼容旧数据）
MEDICINE_TABLE_MAPPING = {
    'items': 'medicines',           # 药品表用 medicines
    'batches': 'batches',           # 批次表用 batches
    'categories': 'medicine_categories'  # 分类表用 medicine_categories
}


def get_table_name(mode: str, base_table: str) -> str:
    """
    根据场景和基础表名获取实际表名
    
    Args:
        mode: 场景标识 (medicine/inventory/food)
        base_table: 基础表名 (items/batches/categories)
    
    Returns:
        实际表名
    
    Examples:
        >>> get_table_name('medicine', 'items')
        'medicines'
        >>> get_table_name('medicine', 'batches')
        'batches'
        >>> get_table_name('inventory', 'items')
        'inventory_items'
    """
    if mode not in MODE_PREFIXES:
        raise ValueError(f"Invalid mode: {mode}. Must be one of {list(MODE_PREFIXES.keys())}")
    
    if base_table not in BASE_TABLES:
        raise ValueError(f"Invalid base_table: {base_table}. Must be one of {list(BASE_TABLES.keys())}")
    
    # 药品场景使用原有表名
    if mode == 'medicine':
        return MEDICINE_TABLE_MAPPING[base_table]
    
    # 其他场景使用 {mode}_{table} 格式
    prefix = MODE_PREFIXES[mode]
    return f"{prefix}_{base_table}"


def get_all_table_names(mode: str) -> dict[str, str]:
    """
    获取指定场景的所有表名
    
    Args:
        mode: 场景标识
    
    Returns:
        包含所有表名的字典
    
    Example:
        >>> get_all_table_names('medicine')
        {'items': 'medicines', 'batches': 'batches', 'categories': 'medicine_categories'}
        >>> get_all_table_names('inventory')
        {'items': 'inventory_items', 'batches': 'inventory_batches', 'categories': 'inventory_categories'}
    """
    return {
        base: get_table_name(mode, base)
        for base in BASE_TABLES.keys()
    }


def validate_mode(mode: str) -> bool:
    """验证场景是否有效"""
    return mode in MODE_PREFIXES


def get_available_modes() -> list[str]:
    """获取所有可用的场景"""
    return list(MODE_PREFIXES.keys())

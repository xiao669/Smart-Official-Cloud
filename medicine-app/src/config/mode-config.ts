// 使用场景配置文件（只保留3个场景：药品、库存、食品）

export interface ModeConfig {
  id: string
  name: string
  icon: string
  description: string
  features: string[]
  // 术语映射
  terminology: {
    item: string           // 物品名称（药品/商品/食品等）
    itemUnit: string       // 物品单位（盒/件/份等）
    inventory: string      // 库存
    inbound: string        // 入库
    outbound: string       // 出库
    expiry: string         // 效期/保质期
    batch: string          // 批号/批次
    category: string       // 分类/类别
    warning: string        // 预警/提醒
    management: string     // 管理
    list: string          // 列表
    detail: string        // 详情
    add: string           // 添加
    edit: string          // 编辑
    delete: string        // 删除
    search: string        // 搜索
    statistics: string    // 统计
  }
}

// 所有场景配置（只保留3个）
export const modeConfigs: Record<string, ModeConfig> = {
  // 药品管理
  medicine: {
    id: 'medicine',
    name: '药品管理',
    icon: '💊',
    description: '专业的药品库存管理系统',
    features: ['药品入库', '效期预警', '智能提醒', '用药记录'],
    terminology: {
      item: '药品',
      itemUnit: '盒',
      inventory: '库存',
      inbound: '入库',
      outbound: '出库',
      expiry: '效期',
      batch: '批号',
      category: '分类',
      warning: '预警',
      management: '药品管理',
      list: '药品列表',
      detail: '药品详情',
      add: '添加药品',
      edit: '修改药品',
      delete: '删除药品',
      search: '搜索药品',
      statistics: '药品统计'
    }
  },

  // 库存管理
  inventory: {
    id: 'inventory',
    name: '库存管理',
    icon: '📦',
    description: '通用商品库存管理系统',
    features: ['商品入库', '库存盘点', '出入库记录', '数据统计'],
    terminology: {
      item: '商品',
      itemUnit: '件',
      inventory: '库存',
      inbound: '入库',
      outbound: '出库',
      expiry: '保质期',
      batch: '批次',
      category: '类别',
      warning: '提醒',
      management: '库存管理',
      list: '商品列表',
      detail: '商品详情',
      add: '添加商品',
      edit: '修改商品',
      delete: '删除商品',
      search: '搜索商品',
      statistics: '库存统计'
    }
  },

  // 食品管理
  food: {
    id: 'food',
    name: '食品管理',
    icon: '🍱',
    description: '食品安全与保质期管理',
    features: ['食品入库', '保质期提醒', '批次追溯', '安全管理'],
    terminology: {
      item: '食品',
      itemUnit: '份',
      inventory: '库存',
      inbound: '入库',
      outbound: '出库',
      expiry: '保质期',
      batch: '批次',
      category: '类别',
      warning: '提醒',
      management: '食品管理',
      list: '食品列表',
      detail: '食品详情',
      add: '添加食品',
      edit: '修改食品',
      delete: '删除食品',
      search: '搜索食品',
      statistics: '食品统计'
    }
  }
}

// 获取当前场景配置
export function getCurrentModeConfig(): ModeConfig {
  const appMode = uni.getStorageSync('app_mode') || 'medicine'
  return modeConfigs[appMode] || modeConfigs.medicine
}

// 获取术语
export function getTerm(key: keyof ModeConfig['terminology']): string {
  const config = getCurrentModeConfig()
  return config.terminology[key]
}

// 获取场景名称
export function getModeName(): string {
  const config = getCurrentModeConfig()
  return config.name
}

// 获取场景图标
export function getModeIcon(): string {
  const config = getCurrentModeConfig()
  return config.icon
}

// 替换文本中的术语（用于动态替换）
export function replaceTerms(text: string): string {
  const config = getCurrentModeConfig()
  const terms = config.terminology
  
  // 替换规则映射
  const replacements: Record<string, string> = {
    '药品': terms.item,
    '盒': terms.itemUnit,
    '效期': terms.expiry,
    '批号': terms.batch,
    '药品管理': terms.management,
    '药品列表': terms.list,
    '药品详情': terms.detail,
    '添加药品': terms.add,
    '修改药品': terms.edit,
    '删除药品': terms.delete,
    '搜索药品': terms.search,
    '药品统计': terms.statistics
  }
  
  let result = text
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value)
  }
  
  return result
}

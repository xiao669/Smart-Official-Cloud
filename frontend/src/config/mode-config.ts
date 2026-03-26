/**
 * 智管云 PC端 - 场景配置
 * 统一管理使用场景的配置信息
 */

// 场景类型
export type ModeType = 'medicine' | 'inventory' | 'food'

// 场景配置接口
export interface ModeConfig {
  key: ModeType
  name: string
  icon: string
  color: string
  description: string
  itemName: string      // 物品名称（药品/商品/食品）
  categoryName: string  // 分类名称
  categoryLabel: string // 分类标签（分类/类别）
  unitLabel: string     // 单位标签
  unitOptions: string[] // 单位选项
  expiryLabel: string   // 效期标签（效期/保质期）
  batchLabel: string    // 批号标签（批号/批次）
  codeLabel: string     // 编码标签
  manufacturerLabel: string // 生产厂家标签
}

// 场景配置列表
export const MODE_LIST: ModeConfig[] = [
  {
    key: 'medicine',
    name: '药品管理',
    icon: '💊',
    color: '#34c9eb',
    description: '药品库存、效期管理',
    itemName: '药品',
    categoryName: '药品分类',
    categoryLabel: '分类',
    unitLabel: '单位',
    unitOptions: ['盒', '瓶', '袋', '支', '片', '粒', '包', '个'],
    expiryLabel: '有效期',
    batchLabel: '批号',
    codeLabel: '药品编码',
    manufacturerLabel: '生产厂家'
  },
  {
    key: 'inventory',
    name: '库存管理',
    icon: '📦',
    color: '#67c23a',
    description: '通用商品库存管理',
    itemName: '商品',
    categoryName: '商品分类',
    categoryLabel: '类别',
    unitLabel: '单位',
    unitOptions: ['件', '个', '箱', '套', '台', '把', '条', '只'],
    expiryLabel: '保质期',
    batchLabel: '批次',
    codeLabel: '商品编码',
    manufacturerLabel: '供应商'
  },
  {
    key: 'food',
    name: '食品管理',
    icon: '🍜',
    color: '#e6a23c',
    description: '食品保质期管理',
    itemName: '食品',
    categoryName: '食品分类',
    categoryLabel: '类别',
    unitLabel: '单位',
    unitOptions: ['份', '盒', '袋', '瓶', '罐', '包', '斤', '公斤'],
    expiryLabel: '保质期',
    batchLabel: '批次',
    codeLabel: '食品编码',
    manufacturerLabel: '生产厂家'
  }
]

// 根据场景key获取配置
export function getModeConfig(mode: ModeType): ModeConfig {
  return MODE_LIST.find(m => m.key === mode) || MODE_LIST[0]
}

// 默认场景
export const DEFAULT_MODE: ModeType = 'medicine'

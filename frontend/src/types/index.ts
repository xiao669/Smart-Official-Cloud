// 用户类型
export type UserType = 'admin' | 'manager' | 'operator'

// 场景类型
export type ModeType = 'medicine' | 'inventory' | 'food'

// 用户
export interface User {
  id: number
  username: string
  realname: string
  user_type: UserType
  department?: string
  phone?: string
  email?: string
  is_active: boolean
  current_mode?: ModeType  // 当前使用场景
}

// 登录响应
export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

// 药品
export interface Medicine {
  id: number
  name: string
  code: string
  category_id: number
  category_name: string
  specification?: string
  unit: string
  manufacturer?: string
  price?: number
  barcode?: string
  description?: string
  created_at: string
  updated_at: string
}

// 药品分类
export interface MedicineCategory {
  id: number
  name: string
  description?: string
}

// 批次
export interface Batch {
  id: number
  medicine_id: number
  medicine_name: string
  batch_number: string
  quantity: number
  expiry_date: string
  inbound_date: string
  remark?: string
}

// 预警
export interface Warning {
  id: number
  type: 'expiry' | 'low_stock'
  medicine_id: number
  medicine_name: string
  message: string
  is_read: boolean
  created_at: string
}

// 仪表盘统计
export interface DashboardSummary {
  medicine_count: number
  inventory_total: number
  expiring_count: number
  expired_count: number
}

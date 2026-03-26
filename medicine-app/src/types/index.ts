/**
 * 类型定义
 */

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
  code: string
  barcode?: string
  name: string
  category: string
  specification: string
  unit: string
  manufacturer: string
  price?: number
  approval_number: string
  description?: string
  created_at: string
  updated_at: string
}

// 创建药品请求
export interface MedicineCreateRequest {
  name: string
  code: string
  barcode?: string
  category_id: number
  specification?: string
  unit: string
  manufacturer?: string
  price?: number
  description?: string
}

// 批次
export interface Batch {
  id: number
  medicine_id: number
  medicine_name: string
  medicine_price?: number
  batch_number: string
  quantity: number
  production_date: string
  expiry_date: string
  inbound_date: string
  remark?: string
}

// 预警
export interface Warning {
  id: number
  type: 'expired' | 'expiry' | 'low_stock'
  medicine_id: number
  medicine_name: string
  batch_id?: number
  message: string
  is_read: boolean
  created_at: string
}

// 预警配置
export interface WarningConfig {
  expiry_warning_days: number
  low_stock_threshold: number
  reminder_start_time?: string  // 提醒开始时间，如 "08:00"
  reminder_end_time?: string    // 提醒结束时间，如 "20:00"
  reminder_enabled?: boolean    // 是否开启提醒
}

// 统计数据
export interface DashboardStats {
  total_medicines: number
  total_inventory: number
  expired_count: number
  expiry_count: number
  low_stock_count: number
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  email?: string
  role: string
  current_mode?: string  // 当前使用场景
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  access_token: string
  token_type: string
  user: UserInfo
}

// 入库请求
export interface InboundRequest {
  medicine_id: number
  batch_number: string
  quantity: number
  production_date: string
  expiry_date: string
  remark?: string
}

// 出库请求
export interface OutboundRequest {
  batch_id: number
  quantity: number
  reason: string
  recipient?: string
}

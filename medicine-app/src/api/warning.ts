/**
 * 预警相关 API
 */
import { http } from '../utils/request'
import type { Warning, WarningConfig, PaginatedResponse } from '../types'

export interface WarningListParams {
  page?: number
  page_size?: number
  type?: 'expired' | 'expiry' | 'low_stock'
  is_read?: boolean
}

export const warningApi = {
  /**
   * 获取预警列表
   */
  list(params?: WarningListParams): Promise<PaginatedResponse<Warning>> {
    return http.get('/warnings', params)
  },
  
  /**
   * 标记预警为已读
   */
  markAsRead(id: number): Promise<void> {
    return http.put(`/warnings/${id}/read`)
  },
  
  /**
   * 一键全部标记已读
   */
  markAllAsRead(): Promise<{ message: string }> {
    return http.put('/warnings/read-all')
  },
  
  /**
   * 检查并生成预警
   */
  checkWarnings(): Promise<{ generated_count: number }> {
    return http.post('/warnings/check')
  },
  
  /**
   * 获取预警配置
   */
  getConfig(): Promise<WarningConfig> {
    return http.get('/warnings/config')
  },
  
  /**
   * 更新预警配置
   */
  updateConfig(data: WarningConfig): Promise<WarningConfig> {
    return http.put('/warnings/config', data)
  },
  
  /**
   * 删除单条预警
   */
  delete(id: number): Promise<{ message: string }> {
    return http.delete(`/warnings/${id}`)
  },
  
  /**
   * 删除所有预警
   */
  deleteAll(): Promise<{ message: string }> {
    return http.delete('/warnings/batch/all')
  },
  
  /**
   * 删除所有已读预警
   */
  deleteRead(): Promise<{ message: string }> {
    return http.delete('/warnings/batch/read')
  },
  
  /**
   * 获取补货建议
   */
  getReplenishSuggestions(): Promise<ReplenishSuggestion[]> {
    return http.get('/warnings/replenish-suggestions')
  },
  
  /**
   * 计算补货建议
   */
  calculateReplenishSuggestions(): Promise<{ suggestions: ReplenishSuggestion[], count: number }> {
    return http.post('/warnings/replenish-suggestions/calculate')
  }
}

// 补货建议类型
export interface ReplenishSuggestion {
  id: number
  medicine_id: number
  medicine_name: string
  current_stock: number
  avg_daily_consumption: number
  days_until_stockout: number
  suggested_quantity: number
  is_urgent: boolean
  created_at: string
}

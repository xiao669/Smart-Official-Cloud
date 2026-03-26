import request from '@/utils/request'
import type { Warning, PaginatedResponse } from '@/types'

export interface WarningListParams {
  page?: number
  page_size?: number
  type?: string
  is_read?: boolean
}

export interface WarningConfig {
  expiry_warning_days: number
  low_stock_threshold: number
  re_remind_enabled?: boolean
  re_remind_days?: number
}

export const warningApi = {
  list(params?: WarningListParams): Promise<PaginatedResponse<Warning>> {
    return request.get('/warnings', { params })
  },

  markAsRead(id: number): Promise<void> {
    return request.put(`/warnings/${id}/read`)
  },

  getConfig(): Promise<WarningConfig> {
    return request.get('/warnings/config')
  },

  updateConfig(data: WarningConfig): Promise<WarningConfig> {
    return request.put('/warnings/config', data)
  },

  markAllAsRead(): Promise<{ message: string }> {
    return request.put('/warnings/read-all')
  },

  checkWarnings(): Promise<{ generated_count: number }> {
    return request.post('/warnings/check')
  },

  // 删除已读预警
  deleteReadWarnings(): Promise<{ message: string }> {
    return request.delete('/warnings/batch/read')
  },

  // 清理旧预警（指定天数前的已读预警）
  cleanupOldWarnings(days: number = 30): Promise<{ message: string }> {
    return request.delete('/warnings/batch/old', { params: { days } })
  },

  // 获取预警统计
  getStats(): Promise<{ total: number; read: number; unread: number }> {
    return request.get('/warnings/stats')
  },

  // 删除所有预警
  deleteAllWarnings(): Promise<{ message: string }> {
    return request.delete('/warnings/batch/all')
  }
}

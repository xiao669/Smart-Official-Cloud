/**
 * 仪表盘相关 API
 */
import { http } from '../utils/request'
import type { DashboardStats } from '../types'

export const dashboardApi = {
  /**
   * 获取统计数据
   */
  getStats(): Promise<DashboardStats> {
    return http.get('/dashboard/stats')
  }
}

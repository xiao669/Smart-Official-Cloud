import request from '@/utils/request'
import type { DashboardSummary, Warning } from '@/types'

export interface ChartData {
  labels: string[]
  values?: number[]
  inbound?: number[]
  outbound?: number[]
}

export const dashboardApi = {
  getSummary(): Promise<DashboardSummary> {
    return request.get('/dashboard/summary')
  },

  getCharts(type: string, range?: string): Promise<ChartData> {
    return request.get('/dashboard/charts', { params: { type, range } })
  },

  getRecentWarnings(): Promise<Warning[]> {
    return request.get('/dashboard/warnings')
  }
}

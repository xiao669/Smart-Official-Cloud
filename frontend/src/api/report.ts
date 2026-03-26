import request from '@/utils/request'

export interface InventoryReportItem {
  medicine_id: number
  medicine_name: string
  medicine_code: string
  total_quantity: number
  batch_count: number
}

export interface ExpiryReportItem {
  medicine_id?: number
  medicine_name: string
  batch_number: string
  quantity: number
  expiry_date: string
  days_until_expiry: number
}

export interface TransactionReportItem {
  date: string
  inbound_count: number
  outbound_count: number
}

export interface StocktakeReportItem {
  id: number
  name: string
  created_at: string
  status: string
  discrepancy_count: number
}

export const reportApi = {
  getInventoryReport(): Promise<InventoryReportItem[]> {
    return request.get('/reports/inventory')
  },

  getExpiryReport(status: 'expiring' | 'expired'): Promise<ExpiryReportItem[]> {
    return request.get('/reports/expiry', { params: { status } })
  },

  getTransactionReport(startDate?: string, endDate?: string): Promise<TransactionReportItem[]> {
    return request.get('/reports/transactions', { params: { start_date: startDate, end_date: endDate } })
  },

  getStocktakeReport(): Promise<StocktakeReportItem[]> {
    return request.get('/reports/stocktake')
  },

  exportInventory(): Promise<Blob> {
    return request.get('/reports/inventory', { params: { format: 'excel' }, responseType: 'blob' })
  },

  exportExpiry(status: 'expiring' | 'expired'): Promise<Blob> {
    return request.get('/reports/expiry', { params: { status, format: 'excel' }, responseType: 'blob' })
  },

  exportTransactions(startDate?: string, endDate?: string): Promise<Blob> {
    return request.get('/reports/transactions', { params: { start_date: startDate, end_date: endDate, format: 'excel' }, responseType: 'blob' })
  }
}

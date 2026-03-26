import request from '@/utils/request'
import type { Batch, PaginatedResponse } from '@/types'

export interface InventoryListParams {
  page?: number
  page_size?: number
  medicine_id?: number
  keyword?: string
  batch_number?: string
}

export interface InboundRequest {
  medicine_id: number
  batch_number: string
  quantity: number
  expiry_date: string
  remark?: string
}

export interface OutboundRequest {
  batch_id: number
  quantity: number
  reason: string
  recipient?: string
}

export interface Transaction {
  id: number
  batch_id: number
  medicine_name: string
  batch_number: string
  type: 'inbound' | 'outbound'
  quantity: number
  reason?: string
  operator: string
  created_at: string
}

export const inventoryApi = {
  list(params?: InventoryListParams): Promise<PaginatedResponse<Batch>> {
    return request.get('/inventory', { params })
  },

  inbound(data: InboundRequest): Promise<Batch> {
    return request.post('/inventory/inbound', data)
  },

  outbound(data: OutboundRequest): Promise<void> {
    return request.post('/inventory/outbound', data)
  },

  getBatchDetail(batchId: number): Promise<Batch> {
    return request.get(`/inventory/batches/${batchId}`)
  },

  getTransactions(params?: { page?: number; page_size?: number; type?: string }): Promise<PaginatedResponse<Transaction>> {
    return request.get('/inventory/transactions', { params })
  }
}

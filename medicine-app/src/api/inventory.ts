/**
 * 库存相关 API
 */
import { http } from '../utils/request'
import type { Batch, PaginatedResponse, InboundRequest, OutboundRequest } from '../types'

export interface InventoryListParams {
  page?: number
  page_size?: number
  keyword?: string
  batch_number?: string
  medicine_id?: number
  show_zero_stock?: boolean  // 是否显示零库存批次
}

export const inventoryApi = {
  /**
   * 获取库存列表
   */
  list(params?: InventoryListParams): Promise<PaginatedResponse<Batch>> {
    // 移动端默认不显示零库存批次
    const finalParams = {
      ...params,
      show_zero_stock: params?.show_zero_stock ?? false
    }
    return http.get('/inventory', finalParams)
  },
  
  /**
   * 获取批次详情
   */
  detail(id: number): Promise<Batch> {
    return http.get(`/inventory/batches/${id}`)
  },
  
  /**
   * 药品入库
   */
  inbound(data: InboundRequest): Promise<Batch> {
    return http.post('/inventory/inbound', data)
  },
  
  /**
   * 药品出库
   */
  outbound(data: OutboundRequest): Promise<void> {
    return http.post('/inventory/outbound', data)
  },
  
  /**
   * 删除库存批次
   */
  delete(id: number): Promise<void> {
    return http.delete(`/inventory/batches/${id}`)
  },
  
  /**
   * 更新库存批次
   */
  update(id: number, data: Partial<Batch>): Promise<Batch> {
    return http.put(`/inventory/batches/${id}`, data)
  }
}

/**
 * 药品相关 API
 */
import { http } from '../utils/request'
import type { Medicine, PaginatedResponse } from '../types'

export interface MedicineListParams {
  page?: number
  page_size?: number
  keyword?: string
  category?: string
}

export const medicineApi = {
  /**
   * 获取药品列表
   */
  list(params?: MedicineListParams): Promise<PaginatedResponse<Medicine>> {
    return http.get('/medicines', params)
  },
  
  /**
   * 获取药品详情
   */
  detail(id: number): Promise<Medicine> {
    return http.get(`/medicines/${id}`)
  },
  
  /**
   * 通过条形码获取药品
   */
  getByBarcode(barcode: string): Promise<Medicine> {
    return http.get(`/medicines/barcode/${barcode}`)
  },
  
  /**
   * 创建药品
   */
  create(data: Partial<Medicine>): Promise<Medicine> {
    return http.post('/medicines', data)
  },
  
  /**
   * 更新药品
   */
  update(id: number, data: Partial<Medicine>): Promise<Medicine> {
    return http.put(`/medicines/${id}`, data)
  },
  
  /**
   * 删除药品
   */
  delete(id: number): Promise<void> {
    return http.delete(`/medicines/${id}`)
  },
  
  /**
   * 获取分类列表（根据当前场景动态返回）
   */
  getCategories(): Promise<Array<{ id: number; name: string; description?: string; sort_order?: number }>> {
    return http.get('/medicines/categories')
  }
}

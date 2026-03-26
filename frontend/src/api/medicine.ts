import request from '@/utils/request'
import type { Medicine, MedicineCategory, PaginatedResponse } from '@/types'

export interface MedicineListParams {
  page?: number
  page_size?: number
  keyword?: string
  category_id?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface MedicineCreate {
  name: string
  code: string
  category_id: number
  specification?: string
  unit: string
  manufacturer?: string
  description?: string
}

export interface MedicineUpdate {
  name?: string
  category_id?: number
  specification?: string
  unit?: string
  manufacturer?: string
  description?: string
}

export const medicineApi = {
  list(params: MedicineListParams): Promise<PaginatedResponse<Medicine>> {
    return request.get('/medicines', { params })
  },

  get(id: number): Promise<Medicine> {
    return request.get(`/medicines/${id}`)
  },

  create(data: MedicineCreate): Promise<Medicine> {
    return request.post('/medicines', data)
  },

  update(id: number, data: MedicineUpdate): Promise<Medicine> {
    return request.put(`/medicines/${id}`, data)
  },

  delete(id: number): Promise<void> {
    return request.delete(`/medicines/${id}`)
  },

  getCategories(): Promise<MedicineCategory[]> {
    return request.get('/medicines/categories')
  },

  export(params?: MedicineListParams): Promise<Blob> {
    return request.get('/medicines/export', {
      params,
      responseType: 'blob'
    })
  },

  import(file: File): Promise<{ success_count: number; fail_count: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/medicines/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  downloadTemplate(): Promise<Blob> {
    return request.get('/medicines/import/template', {
      responseType: 'blob'
    })
  }
}

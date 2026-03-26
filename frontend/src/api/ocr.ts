import request from '@/utils/request'
import type { PaginatedResponse } from '@/types'

export interface OcrRecord {
  id: number
  image_url: string
  ocr_result: Record<string, any>
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface OcrReviewRequest {
  action: 'approve' | 'reject'
  corrected_data?: {
    name?: string
    batch_number?: string
    quantity?: number
    expiry_date?: string
  }
  reject_reason?: string
}

export const ocrApi = {
  getPendingList(params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<OcrRecord>> {
    return request.get('/ocr/pending', { params })
  },

  review(id: number, data: OcrReviewRequest): Promise<void> {
    return request.post(`/ocr/review/${id}`, data)
  },

  getDetail(id: number): Promise<OcrRecord> {
    return request.get(`/ocr/${id}`)
  }
}

/**
 * OCR识别相关 API
 */
import { http } from '../utils/request'

export interface OCRResult {
  name?: string
  specification?: string
  manufacturer?: string
  approval_number?: string
  production_date?: string
  expiry_date?: string
  batch_number?: string
  error?: string
}

export const ocrApi = {
  /**
   * 识别药品包装信息
   */
  recognize(file: File): Promise<OCRResult> {
    const formData = new FormData()
    formData.append('file', file)
    
    return http.post('/ocr/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

/**
 * 追溯码查询 API
 */
import { http } from '../utils/request'

export interface TraceCodeInfo {
  trace_code: string
  enterprise_code?: string
  product_code?: string
  serial_number?: string
  name?: string
  specification?: string
  manufacturer?: string
  approval_number?: string
  batch_number?: string
  production_date?: string
  expiry_date?: string
  source: string
}

export interface TraceCodeQueryRequest {
  trace_code: string
}

export interface TraceCodeValidateResponse {
  valid: boolean
  trace_code: string
  message: string
}

export const traceCodeApi = {
  /**
   * 查询追溯码信息
   */
  query(data: TraceCodeQueryRequest): Promise<TraceCodeInfo> {
    return http.post('/trace-code/query', data)
  },
  
  /**
   * 验证追溯码格式
   */
  validate(data: TraceCodeQueryRequest): Promise<TraceCodeValidateResponse> {
    return http.post('/trace-code/validate', data)
  }
}

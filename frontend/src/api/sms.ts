/**
 * 短信通知 API
 */
import request from '@/utils/request'

export interface SmsConfig {
  sms_enabled: boolean
  expiry_sms_enabled: boolean
  expired_sms_enabled: boolean
  low_stock_sms_enabled: boolean
  notify_time: string
  notify_phone: string
}

export interface SmsStatus {
  service_enabled: boolean
  user_enabled: boolean
  has_api_key: boolean
  has_template: boolean
  daily_limit: number
  remaining_today: number
  notify_phone: string
}

export interface SmsLog {
  id: number
  phone: string
  content: string
  sms_type: string
  status: string
  error_message: string | null
  created_at: string
  sent_at: string | null
}

export interface SmsApiConfig {
  access_key_id: string
  access_key_secret: string
  access_key_id_masked?: string
  access_key_secret_masked?: string
  sign_name: string
  template_code: string
  expired_template_code: string
  low_stock_template_code: string
  sms_enabled: boolean
  daily_limit: number
}

export const smsApi = {
  /**
   * 获取短信服务状态
   */
  getStatus(): Promise<SmsStatus> {
    return request.get('/sms/status')
  },

  /**
   * 获取短信API配置（管理员）
   */
  getApiConfig(): Promise<SmsApiConfig> {
    return request.get('/sms/api-config')
  },

  /**
   * 更新短信API配置（管理员）
   */
  updateApiConfig(data: Partial<SmsApiConfig>): Promise<any> {
    return request.put('/sms/api-config', data)
  },

  /**
   * 获取用户短信配置
   */
  getConfig(): Promise<SmsConfig> {
    return request.get('/sms/config')
  },

  /**
   * 更新短信配置
   */
  updateConfig(data: Partial<SmsConfig>): Promise<any> {
    return request.put('/sms/config', data)
  },

  /**
   * 获取发送记录
   */
  getLogs(params: {
    status?: string
    sms_type?: string
    page?: number
    page_size?: number
  }): Promise<{
    items: SmsLog[]
    total: number
    page: number
    page_size: number
    pages: number
  }> {
    return request.get('/sms/logs', { params })
  },

  /**
   * 获取短信统计
   */
  getStats(): Promise<{
    today_total: number
    today_success: number
    today_failed: number
    month_total: number
    daily_limit: number
    remaining_today: number
    sms_enabled: boolean
  }> {
    return request.get('/sms/stats')
  },

  /**
   * 发送预警短信
   */
  sendWarningSms(warningId: number, phone?: string): Promise<any> {
    return request.post('/sms/send', { warning_id: warningId, phone })
  },

  /**
   * 批量发送预警短信
   */
  sendBatchSms(): Promise<{
    success: boolean
    message: string
    sent: number
    failed: number
  }> {
    return request.post('/sms/send-batch')
  },

  /**
   * 发送测试短信
   */
  testSms(phone: string): Promise<{
    success: boolean
    message: string
    code?: string
  }> {
    return request.post('/sms/test', { phone })
  }
}

export default smsApi

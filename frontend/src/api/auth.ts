import request from '@/utils/request'
import type { LoginResponse } from '@/types'

interface SmsCodeResponse {
  success: boolean
  message: string
  code?: string  // 开发模式返回验证码
}

export const authApi = {
  login(username: string, password: string): Promise<LoginResponse> {
    return request.post('/auth/login', { username, password })
  },
  
  // 发送短信验证码
  sendSmsCode(phone: string): Promise<SmsCodeResponse> {
    return request.post('/auth/sms/send', { phone })
  },
  
  // 短信验证码登录
  smsLogin(phone: string, code: string): Promise<LoginResponse> {
    return request.post('/auth/sms/login', { phone, code })
  },
  
  logout(): Promise<void> {
    return request.post('/auth/logout')
  },
  
  getCurrentUser(): Promise<LoginResponse['user']> {
    return request.get('/auth/me')
  },
  
  // 更新用户使用场景
  updateUserMode(mode: string): Promise<{ success: boolean; mode: string }> {
    return request.put(`/auth/mode?mode=${mode}`)
  }
}

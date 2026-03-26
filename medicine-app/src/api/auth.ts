/**
 * 认证相关 API
 */
import { http } from '../utils/request'
import type { LoginRequest, LoginResponse, UserInfo } from '../types'

interface SmsCodeResponse {
  success: boolean
  message: string
  code?: string  // 开发模式返回验证码
}

export const authApi = {
  /**
   * 登录
   */
  login(data: LoginRequest): Promise<LoginResponse> {
    return http.post('/auth/login', data)
  },
  
  /**
   * 发送短信验证码
   */
  sendSmsCode(phone: string): Promise<SmsCodeResponse> {
    return http.post('/auth/sms/send', { phone })
  },
  
  /**
   * 短信验证码登录
   */
  smsLogin(phone: string, code: string): Promise<LoginResponse> {
    return http.post('/auth/sms/login', { phone, code })
  },
  
  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<UserInfo> {
    return http.get('/auth/me')
  },
  
  /**
   * 更新用户使用场景
   */
  updateUserMode(mode: string): Promise<UserInfo> {
    return http.put(`/auth/mode?mode=${mode}`)
  },
  
  /**
   * 退出登录
   */
  logout(): Promise<void> {
    return http.post('/auth/logout')
  }
}

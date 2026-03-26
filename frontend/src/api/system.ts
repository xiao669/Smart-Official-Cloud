import request from '@/utils/request'
import type { User, PaginatedResponse } from '@/types'

export interface UserCreate {
  username: string
  password: string
  realname: string
  user_type: 'admin' | 'manager' | 'operator'
  department?: string
  phone?: string
  email?: string
}

export interface UserUpdate {
  realname?: string
  user_type?: 'admin' | 'manager' | 'operator'
  department?: string
  phone?: string
  email?: string
  password?: string
}

export interface OperationLog {
  id: number
  user_id: number
  username: string
  operation: string
  module: string
  detail: string
  ip_address: string
  created_at: string
}

export interface SystemSettings {
  site_name: string
  expiry_warning_days: number
  low_stock_threshold: number
}

export const systemApi = {
  // 用户管理
  getUsers(params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<User>> {
    return request.get('/system/users', { params })
  },

  createUser(data: UserCreate): Promise<User> {
    return request.post('/system/users', data)
  },

  updateUser(id: number, data: UserUpdate): Promise<User> {
    return request.put(`/system/users/${id}`, data)
  },

  toggleUserStatus(id: number): Promise<User> {
    return request.put(`/system/users/${id}/toggle-status`)
  },

  deleteUser(id: number): Promise<void> {
    return request.delete(`/system/users/${id}`)
  },

  // 操作日志
  getLogs(params?: { page?: number; page_size?: number; operation?: string; start_date?: string; end_date?: string }): Promise<PaginatedResponse<OperationLog>> {
    return request.get('/system/logs', { params })
  },

  // 系统设置
  getSettings(): Promise<SystemSettings> {
    return request.get('/system/settings')
  },

  updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return request.put('/system/settings', data)
  }
}

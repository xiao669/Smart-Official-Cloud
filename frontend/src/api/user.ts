import request from '@/utils/request'

export interface User {
  id: number
  username: string
  realname: string | null
  user_type: string
  department: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
}

export interface UserListParams {
  page?: number
  page_size?: number
  keyword?: string
  user_type?: string
}

export interface UserListResponse {
  items: User[]
  total: number
  page: number
  page_size: number
}

export interface UserCreate {
  username: string
  password: string
  realname?: string
  user_type: string
  department?: string
  phone?: string
  email?: string
}

export interface UserUpdate {
  realname?: string
  user_type?: string
  department?: string
  phone?: string
  email?: string
  password?: string
}

export interface PasswordResetRequest {
  new_password: string
  confirm_password: string
}

export interface BatchStatusRequest {
  user_ids: number[]
  is_active: boolean
}

export interface BatchStatusResponse {
  success_count: number
  fail_count: number
  skipped_count: number
  message: string
}

export const userApi = {
  // 获取用户列表
  list(params: UserListParams): Promise<UserListResponse> {
    return request.get('/users', { params })
  },

  // 获取用户详情
  getById(id: number): Promise<User> {
    return request.get(`/users/${id}`)
  },

  // 创建用户
  create(data: UserCreate): Promise<User> {
    return request.post('/users', data)
  },

  // 更新用户
  update(id: number, data: UserUpdate): Promise<User> {
    return request.put(`/users/${id}`, data)
  },

  // 删除用户
  delete(id: number): Promise<void> {
    return request.delete(`/users/${id}`)
  },

  // 重置密码
  resetPassword(id: number, data: PasswordResetRequest): Promise<void> {
    return request.post(`/users/${id}/reset-password`, data)
  },

  // 切换用户状态
  toggleStatus(id: number, isActive: boolean): Promise<void> {
    return request.patch(`/users/${id}/status`, null, {
      params: { is_active: isActive }
    })
  },

  // 批量切换状态
  batchToggleStatus(data: BatchStatusRequest): Promise<BatchStatusResponse> {
    return request.post('/users/batch-status', data)
  },

  // 更新个人资料
  updateProfile(data: { username?: string; realname?: string }): Promise<User> {
    return request.put('/users/profile', data)
  },

  // 修改密码
  changePassword(data: { old_password: string; new_password: string }): Promise<void> {
    return request.post('/users/change-password', data)
  }
}

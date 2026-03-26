/**
 * 用户相关 API
 */
import { http } from '../utils/request'

interface UpdateProfileRequest {
  username?: string
  realname?: string
}

export const userApi = {
  /**
   * 更新个人资料
   */
  updateProfile(data: UpdateProfileRequest): Promise<any> {
    return http.put('/users/profile', data)
  }
}

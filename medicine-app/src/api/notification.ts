/**
 * 推送通知 API
 */
import { http } from '../utils/request'

export interface Notification {
  id: number
  title: string
  content: string
  type: 'expired' | 'expiry' | 'low_stock'
  warning_id: number
  is_pushed: boolean
  is_read: boolean
  created_at: string
  pushed_at: string | null
}

export interface PushStatus {
  daily_limit: number
  pushed_today: number
  remaining_today: number
  pending_count: number
}

export const notificationApi = {
  /**
   * 获取待推送的通知（分别推送，每次1条）
   */
  getPending(limit: number = 1) {
    return http.get<{ items: Notification[]; count: number }>(
      '/notifications/pending',
      { limit }
    )
  },

  /**
   * 标记通知为已推送
   */
  markAsPushed(id: number) {
    return http.post(`/notifications/${id}/pushed`)
  },

  /**
   * 标记通知为已读
   */
  markAsRead(id: number) {
    return http.post(`/notifications/${id}/read`)
  },

  /**
   * 获取通知列表
   */
  list(params: { is_read?: boolean; page?: number; page_size?: number }) {
    return http.get<{
      items: Notification[]
      total: number
      page: number
      page_size: number
      pages: number
    }>('/notifications', params)
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount() {
    return http.get<{ count: number }>('/notifications/unread-count')
  },

  /**
   * 获取推送状态
   */
  getStatus() {
    return http.get<PushStatus>('/notifications/status')
  }
}

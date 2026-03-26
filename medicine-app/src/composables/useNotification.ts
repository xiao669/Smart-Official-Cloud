/**
 * 推送通知管理 composable
 * 实现分别推送逻辑，每天最多10条
 */
import { ref, onUnmounted } from 'vue'
import { notificationApi, type Notification, type PushStatus } from '../api/notification'

// 全局状态
const isPolling = ref(false)
const pushStatus = ref<PushStatus | null>(null)
const unreadCount = ref(0)
let pollTimer: number | null = null

// 推送间隔（毫秒）- 每30秒检查一次
const POLL_INTERVAL = 30 * 1000

export function useNotification() {
  /**
   * 显示本地通知
   */
  function showLocalNotification(notification: Notification) {
    // 使用 uni-app 的消息提示
    uni.showToast({
      title: notification.title,
      icon: 'none',
      duration: 3000
    })
    
    // 同时显示模态框让用户知道详情
    setTimeout(() => {
      uni.showModal({
        title: notification.title,
        content: notification.content,
        showCancel: true,
        cancelText: '稍后查看',
        confirmText: '立即查看',
        success: async (res) => {
          // 标记为已读
          try {
            await notificationApi.markAsRead(notification.id)
          } catch (e) {
            console.error('标记已读失败:', e)
          }
          
          if (res.confirm) {
            // 跳转到预警页面
            uni.switchTab({ url: '/pages/warning/index' })
          }
        }
      })
    }, 500)
  }

  /**
   * 检查并推送一条通知
   */
  async function checkAndPushOne(): Promise<boolean> {
    try {
      // 获取一条待推送通知
      const res = await notificationApi.getPending(1)
      
      if (res.items && res.items.length > 0) {
        const notification = res.items[0]
        
        // 显示通知
        showLocalNotification(notification)
        
        // 标记为已推送
        await notificationApi.markAsPushed(notification.id)
        
        // 更新状态
        await refreshStatus()
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('推送通知失败:', error)
      return false
    }
  }

  /**
   * 刷新推送状态
   */
  async function refreshStatus() {
    try {
      pushStatus.value = await notificationApi.getStatus()
      const countRes = await notificationApi.getUnreadCount()
      unreadCount.value = countRes.count
    } catch (error) {
      console.error('获取推送状态失败:', error)
    }
  }

  /**
   * 开始轮询推送
   */
  function startPolling() {
    if (isPolling.value) return
    
    isPolling.value = true
    
    // 立即执行一次
    checkAndPushOne()
    
    // 设置定时器
    pollTimer = setInterval(async () => {
      // 检查是否还有剩余推送次数
      if (pushStatus.value && pushStatus.value.remaining_today <= 0) {
        console.log('今日推送次数已用完')
        return
      }
      
      await checkAndPushOne()
    }, POLL_INTERVAL) as unknown as number
    
    console.log('推送通知轮询已启动')
  }

  /**
   * 停止轮询推送
   */
  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    isPolling.value = false
    console.log('推送通知轮询已停止')
  }

  /**
   * 手动触发推送检查
   */
  async function manualCheck() {
    uni.showLoading({ title: '检查中...' })
    
    try {
      await refreshStatus()
      
      if (pushStatus.value && pushStatus.value.remaining_today <= 0) {
        uni.hideLoading()
        uni.showToast({
          title: '今日推送次数已用完',
          icon: 'none'
        })
        return
      }
      
      const pushed = await checkAndPushOne()
      uni.hideLoading()
      
      if (!pushed) {
        uni.showToast({
          title: '暂无新通知',
          icon: 'none'
        })
      }
    } catch (error) {
      uni.hideLoading()
      uni.showToast({
        title: '检查失败',
        icon: 'none'
      })
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    // 注意：不要在这里停止轮询，因为可能是全局的
  })

  return {
    isPolling,
    pushStatus,
    unreadCount,
    startPolling,
    stopPolling,
    refreshStatus,
    manualCheck,
    checkAndPushOne
  }
}

/**
 * 日期工具函数
 */

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 计算距离今天的天数
 */
export function getDaysFromNow(date: string | Date): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  // 重置时间为 00:00:00
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)
  
  const diff = targetDate.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * 获取过期状态
 */
export function getExpiryStatus(expiryDate: string | Date): {
  type: 'expired' | 'expiry' | 'normal'
  text: string
  color: string
} {
  const days = getDaysFromNow(expiryDate)
  
  if (days < 0) {
    return {
      type: 'expired',
      text: '已过期',
      color: '#F56C6C'
    }
  }
  
  if (days <= 90) {
    return {
      type: 'expiry',
      text: '临期',
      color: '#E6A23C'
    }
  }
  
  return {
    type: 'normal',
    text: '正常',
    color: '#67C23A'
  }
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) {
    return '刚刚'
  }
  
  if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  }
  
  if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  }
  
  if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  }
  
  return formatDate(d)
}

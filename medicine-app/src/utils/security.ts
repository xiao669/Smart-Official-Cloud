/**
 * 移动端安全防护模块
 */

/**
 * 敏感数据脱敏
 */
export function maskSensitiveData(
  data: string,
  type: 'phone' | 'email' | 'idcard' | 'name' = 'phone'
): string {
  if (!data) return ''

  switch (type) {
    case 'phone':
      // 手机号：138****1234
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    case 'email':
      // 邮箱：a***@example.com
      return data.replace(/(.{1}).*(@.*)/, '$1***$2')
    case 'idcard':
      // 身份证：110***********1234
      return data.replace(/(\d{3})\d{11}(\d{4})/, '$1***********$2')
    case 'name':
      // 姓名：张*
      if (data.length <= 1) return '*'
      return data[0] + '*'.repeat(data.length - 1)
    default:
      return data
  }
}

/**
 * XSS过滤
 */
export function escapeHtml(text: string): string {
  if (!text) return ''

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  return text.replace(/[&<>"'`=/]/g, (s) => map[s])
}

/**
 * 安全的JSON解析
 */
export function safeJSONParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return defaultValue
  }
}

/**
 * 检测可疑输入
 */
export function detectSuspiciousInput(value: string): boolean {
  if (!value || typeof value !== 'string') return false

  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /SELECT.*FROM/i,
    /INSERT.*INTO/i,
    /DELETE.*FROM/i,
    /DROP\s+TABLE/i,
    /UNION.*SELECT/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i
  ]

  return suspiciousPatterns.some((pattern) => pattern.test(value))
}

/**
 * 输入过滤
 */
export function sanitizeInput(value: string): string {
  if (!value || typeof value !== 'string') return ''

  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * 安全存储Token
 */
export function secureSetToken(token: string): void {
  try {
    // 简单混淆存储
    const encoded = btoa(token.split('').reverse().join(''))
    uni.setStorageSync('token', encoded)
  } catch (e) {
    console.error('存储Token失败:', e)
  }
}

/**
 * 安全获取Token
 */
export function secureGetToken(): string {
  try {
    const encoded = uni.getStorageSync('token')
    if (!encoded) return ''

    // 尝试解码
    try {
      return atob(encoded).split('').reverse().join('')
    } catch {
      // 可能是旧格式，直接返回
      return encoded
    }
  } catch (e) {
    console.error('获取Token失败:', e)
    return ''
  }
}

/**
 * 清除敏感数据
 */
export function clearSensitiveData(): void {
  try {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('ocrResult')
  } catch (e) {
    console.error('清除数据失败:', e)
  }
}

/**
 * 会话超时检查
 */
let lastActivityTime = Date.now()
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30分钟

export function updateActivity(): void {
  lastActivityTime = Date.now()
}

export function checkSessionTimeout(): boolean {
  const now = Date.now()
  const inactive = now - lastActivityTime

  if (inactive > SESSION_TIMEOUT) {
    clearSensitiveData()
    return true
  }

  return false
}

/**
 * 初始化安全模块
 */
export function initSecurity(): void {
  // 定期检查会话超时
  setInterval(() => {
    if (checkSessionTimeout()) {
      // 跳转到登录页
      uni.reLaunch({ url: '/pages/login/index' })
    }
  }, 60000) // 每分钟检查一次

  // 监听页面显示，更新活动时间
  uni.onAppShow(() => {
    updateActivity()
  })
}

export default {
  maskSensitiveData,
  escapeHtml,
  safeJSONParse,
  detectSuspiciousInput,
  sanitizeInput,
  secureSetToken,
  secureGetToken,
  clearSensitiveData,
  updateActivity,
  checkSessionTimeout,
  initSecurity
}

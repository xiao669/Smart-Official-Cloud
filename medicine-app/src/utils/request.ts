/**
 * 网络请求封装
 * 包含安全增强：输入过滤、XSS防护
 */

// 配置
// 开发环境：使用局域网 IP，方便真机调试
// 生产环境：使用实际服务器地址
// 注意：请根据实际情况修改IP地址
const BASE_URL = 'http://192.168.3.2:8000/api'  // 修改为你的电脑实际IP
const TIMEOUT = 10000

// 全局标记：是否正在跳转到登录页（防止多个401请求同时触发跳转）
let isRedirectingToLogin = false

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  showLoading?: boolean
  showError?: boolean
  skipSanitize?: boolean  // 跳过输入过滤（特殊情况使用）
}

/**
 * 输入过滤 - 防止XSS攻击
 */
function sanitizeInput(value: any): any {
  if (typeof value === 'string') {
    // 过滤危险字符
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }
  
  if (Array.isArray(value)) {
    return value.map(sanitizeInput)
  }
  
  if (value && typeof value === 'object') {
    const sanitized: any = {}
    for (const key of Object.keys(value)) {
      sanitized[key] = sanitizeInput(value[key])
    }
    return sanitized
  }
  
  return value
}

/**
 * 检测可疑输入
 */
function detectSuspiciousInput(value: any): boolean {
  if (typeof value !== 'string') return false
  
  // 只检测真正危险的模式，避免误判正常输入
  const suspiciousPatterns = [
    /<script\b/i,           // script标签
    /javascript\s*:/i,      // javascript协议
    /on\w+\s*=\s*["']/i,    // 事件处理器（更严格的匹配）
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(value))
}

interface Response<T = any> {
  code?: number
  data?: T
  message?: string
  [key: string]: any
}

/**
 * 获取 Token
 */
function getToken(): string {
  try {
    return uni.getStorageSync('token') || ''
  } catch (e) {
    return ''
  }
}

/**
 * 请求拦截器
 */
function requestInterceptor(options: RequestOptions) {
  const token = getToken()
  
  // 添加 Token
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 显示加载
  if (options.showLoading !== false) {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
  }
  
  return options
}

/**
 * 响应拦截器
 */
function responseInterceptor(response: any, options: RequestOptions) {
  // 隐藏加载
  if (options.showLoading !== false) {
    uni.hideLoading()
  }
  
  const { statusCode, data } = response
  
  // 成功
  if (statusCode === 200) {
    return data
  }
  
  // Token 过期
  if (statusCode === 401) {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    // 防止多个请求同时触发跳转
    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true
      
      // 获取当前页面路径，避免重复跳转到登录页
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentPath = currentPage?.route || ''
      
      // 如果当前不在登录页和启动页，才跳转
      if (!currentPath.includes('login') && !currentPath.includes('splash')) {
        uni.reLaunch({
          url: '/pages/login/index',
          complete: () => {
            // 跳转完成后重置标记
            setTimeout(() => {
              isRedirectingToLogin = false
            }, 1000)
          }
        })
      } else {
        isRedirectingToLogin = false
      }
    }
    throw new Error('登录已过期，请重新登录')
  }
  
  // 其他错误
  let errorMsg = data?.message || data?.detail || '请求失败'
  
  // 如果是验证错误，尝试提取更详细的信息
  if (statusCode === 422 && data?.details?.errors) {
    const errors = data.details.errors
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0]
      const field = firstError.loc?.join('.') || ''
      const msg = firstError.msg || ''
      errorMsg = field ? `${field}: ${msg}` : msg
    }
  }
  
  console.error(`[请求错误] ${statusCode}:`, errorMsg, data)
  
  if (options.showError !== false) {
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 3000
    })
  }
  
  throw new Error(errorMsg)
}

/**
 * 请求方法
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    // 安全检查：检测可疑输入
    if (options.data && !options.skipSanitize) {
      const dataStr = JSON.stringify(options.data)
      if (detectSuspiciousInput(dataStr)) {
        console.warn('检测到可疑输入，已阻止请求')
        reject(new Error('输入包含非法字符'))
        return
      }
    }
    
    // 请求拦截
    const requestOptions = requestInterceptor({
      ...options,
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      timeout: TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      }
    })
    
    // 发起请求
    uni.request({
      ...requestOptions,
      success: (res) => {
        try {
          const data = responseInterceptor(res, options)
          resolve(data as T)
        } catch (error: any) {
          reject(error)
        }
      },
      fail: (err) => {
        if (options.showLoading !== false) {
          uni.hideLoading()
        }
        
        const errorMsg = '网络请求失败，请检查网络连接'
        if (options.showError !== false) {
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          })
        }
        
        reject(new Error(errorMsg))
      }
    })
  })
}

// 默认导出 request 函数
export default request

// 便捷方法
export const http = {
  get<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
    return request<T>({
      url,
      method: 'GET',
      data,
      ...options
    })
  },
  
  post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
    return request<T>({
      url,
      method: 'POST',
      data,
      ...options
    })
  },
  
  put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
    return request<T>({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },
  
  delete<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
    return request<T>({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }
}

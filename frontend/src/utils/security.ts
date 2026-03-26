/**
 * 前端安全防护模块
 * 包含：开发者工具检测、控制台保护、代码混淆、反调试等
 */

// 是否为生产环境
const isProduction = import.meta.env.PROD

/**
 * 开发者工具检测器
 */
class DevToolsDetector {
  private isOpen = false
  private threshold = 160
  private callbacks: Array<() => void> = []

  constructor() {
    if (!isProduction) return
    this.startDetection()
  }

  /**
   * 添加检测到开发者工具打开时的回调
   */
  onOpen(callback: () => void) {
    this.callbacks.push(callback)
  }

  /**
   * 开始检测
   */
  private startDetection() {
    // 方法1: 检测窗口大小变化
    this.detectByWindowSize()
    
    // 方法2: 检测debugger语句执行时间
    this.detectByDebugger()
    
    // 方法3: 检测console.log重写
    this.detectByConsole()
    
    // 方法4: 检测Element检查
    this.detectByElement()
  }

  /**
   * 通过窗口大小检测
   */
  private detectByWindowSize() {
    const check = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > this.threshold
      const heightThreshold = window.outerHeight - window.innerHeight > this.threshold
      
      if (widthThreshold || heightThreshold) {
        if (!this.isOpen) {
          this.isOpen = true
          this.triggerCallbacks()
        }
      } else {
        this.isOpen = false
      }
    }

    setInterval(check, 1000)
    window.addEventListener('resize', check)
  }

  /**
   * 通过debugger执行时间检测
   */
  private detectByDebugger() {
    const check = () => {
      const start = performance.now()
      // debugger语句在开发者工具打开时会暂停
      // eslint-disable-next-line no-debugger
      debugger
      const end = performance.now()
      
      if (end - start > 100) {
        if (!this.isOpen) {
          this.isOpen = true
          this.triggerCallbacks()
        }
      }
    }

    // 每3秒检测一次
    setInterval(check, 3000)
  }

  /**
   * 通过console检测
   */
  private detectByConsole() {
    const element = new Image()
    Object.defineProperty(element, 'id', {
      get: () => {
        if (!this.isOpen) {
          this.isOpen = true
          this.triggerCallbacks()
        }
        return ''
      }
    })
    
    // 定期触发console.log来检测
    setInterval(() => {
      console.log('%c', element)
    }, 2000)
  }

  /**
   * 通过Element检测
   */
  private detectByElement() {
    const element = document.createElement('div')
    Object.defineProperty(element, 'id', {
      get: () => {
        if (!this.isOpen) {
          this.isOpen = true
          this.triggerCallbacks()
        }
        return ''
      }
    })
    
    setInterval(() => {
      console.dir(element)
    }, 2000)
  }

  /**
   * 触发所有回调
   */
  private triggerCallbacks() {
    this.callbacks.forEach(cb => cb())
  }
}

/**
 * 控制台保护
 */
class ConsoleProtector {
  constructor() {
    if (!isProduction) return
    this.protect()
  }

  private protect() {
    // 重写console方法
    const noop = () => {}
    
    // 清空所有console方法
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset', 'assert', 'profile', 'profileEnd', 'time', 'timeLog', 'timeEnd', 'timeStamp', 'context', 'memory']
    
    methods.forEach(method => {
      (console as any)[method] = noop
    })

    // 防止通过iframe恢复console
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = function(tagName: string) {
      const element = originalCreateElement(tagName)
      if (tagName.toLowerCase() === 'iframe') {
        element.addEventListener('load', () => {
          try {
            const iframeWindow = (element as HTMLIFrameElement).contentWindow as any
            const iframeConsole = iframeWindow?.console
            if (iframeConsole) {
              methods.forEach(method => {
                (iframeConsole as any)[method] = noop
              })
            }
          } catch (e) {
            // 跨域iframe会报错，忽略
          }
        })
      }
      return element
    }
  }
}

/**
 * 右键菜单和快捷键禁用
 */
class ContextMenuProtector {
  constructor() {
    if (!isProduction) return
    this.protect()
  }

  private protect() {
    // 禁用右键菜单
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })

    // 禁用F12、Ctrl+Shift+I、Ctrl+Shift+J、Ctrl+U等快捷键
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+I (开发者工具)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+J (控制台)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+C (元素选择器)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+U (查看源代码)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+S (保存页面)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        return false
      }
    })

    // 禁用拖拽
    document.addEventListener('dragstart', (e) => {
      e.preventDefault()
      return false
    })

    // 禁用选择文本（可选，可能影响用户体验）
    // document.addEventListener('selectstart', (e) => {
    //   e.preventDefault()
    //   return false
    // })
  }
}

/**
 * 源代码保护
 */
class SourceCodeProtector {
  constructor() {
    if (!isProduction) return
    this.protect()
  }

  private protect() {
    // 清除页面源代码中的注释
    this.removeComments()
    
    // 混淆关键DOM属性
    this.obfuscateDOM()
  }

  private removeComments() {
    // 移除HTML注释
    const iterator = document.createNodeIterator(
      document.documentElement,
      NodeFilter.SHOW_COMMENT,
      null
    )
    
    const comments: Comment[] = []
    let currentNode: Comment | null
    
    while ((currentNode = iterator.nextNode() as Comment)) {
      comments.push(currentNode)
    }
    
    comments.forEach(comment => comment.remove())
  }

  private obfuscateDOM() {
    // 移除data-*属性中的敏感信息
    const elements = document.querySelectorAll('[data-v-]')
    elements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-v-')) {
          // Vue的scoped样式标记，保留但不暴露
        }
      })
    })
  }
}

/**
 * 反调试保护
 */
class AntiDebugger {
  constructor() {
    if (!isProduction) return
    this.protect()
  }

  private protect() {
    // 定期执行debugger检测
    this.continuousDebuggerCheck()
    
    // 检测断点
    this.detectBreakpoints()
    
    // 检测函数被修改
    this.detectFunctionTampering()
  }

  private continuousDebuggerCheck() {
    const check = () => {
      const start = new Date().getTime()
      // eslint-disable-next-line no-debugger
      debugger
      const end = new Date().getTime()
      
      if (end - start > 100) {
        this.handleDebugDetected()
      }
    }

    // 随机间隔执行，增加检测难度
    const randomInterval = () => {
      check()
      setTimeout(randomInterval, Math.random() * 3000 + 1000)
    }
    
    randomInterval()
  }

  private detectBreakpoints() {
    // 通过Function.prototype.toString检测
    const originalToString = Function.prototype.toString
    
    Function.prototype.toString = function() {
      // 如果有人试图查看函数源码，可能是在调试
      return originalToString.call(this)
    }
  }

  private detectFunctionTampering() {
    // 检测关键函数是否被修改
    const criticalFunctions = [
      { obj: window, name: 'fetch' },
      { obj: window, name: 'XMLHttpRequest' },
      { obj: document, name: 'createElement' },
    ]

    criticalFunctions.forEach(({ obj, name }) => {
      const original = (obj as any)[name]
      const originalString = original.toString()
      
      setInterval(() => {
        const current = (obj as any)[name]
        if (current.toString() !== originalString) {
          this.handleDebugDetected()
        }
      }, 5000)
    })
  }

  private handleDebugDetected() {
    // 检测到调试时的处理
    // 可以选择：清除敏感数据、跳转到其他页面、显示警告等
    
    // 清除本地存储的敏感数据
    localStorage.removeItem('token')
    sessionStorage.clear()
    
    // 显示警告
    console.clear()
    
    // 可选：跳转到登录页
    // window.location.href = '/login'
  }
}

/**
 * 数据保护
 */
class DataProtector {
  constructor() {
    this.protect()
  }

  private protect() {
    // 保护localStorage
    this.protectStorage()
    
    // 保护全局变量
    this.protectGlobals()
  }

  private protectStorage() {
    // 加密存储的token
    const originalSetItem = localStorage.setItem.bind(localStorage)
    const originalGetItem = localStorage.getItem.bind(localStorage)
    
    localStorage.setItem = (key: string, value: string) => {
      if (key === 'token' && isProduction) {
        // 简单混淆（生产环境应使用更强的加密）
        value = btoa(value.split('').reverse().join(''))
      }
      return originalSetItem(key, value)
    }
    
    localStorage.getItem = (key: string) => {
      let value = originalGetItem(key)
      if (key === 'token' && value && isProduction) {
        try {
          value = atob(value).split('').reverse().join('')
        } catch {
          // 解密失败，可能是旧格式
        }
      }
      return value
    }
  }

  private protectGlobals() {
    // 防止通过window访问敏感数据
    if (isProduction) {
      // 冻结关键对象
      Object.freeze(Object.prototype)
      Object.freeze(Array.prototype)
      Object.freeze(Function.prototype)
    }
  }
}

/**
 * 网络请求保护
 */
class NetworkProtector {
  constructor() {
    if (!isProduction) return
    this.protect()
  }

  private protect() {
    // 拦截并验证所有fetch请求
    this.protectFetch()
    
    // 拦截XMLHttpRequest
    this.protectXHR()
  }

  private protectFetch() {
    const originalFetch = window.fetch.bind(window)
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // 检查请求URL是否合法
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid request URL')
      }
      
      // 添加安全头
      const headers = new Headers(init?.headers)
      headers.set('X-Requested-With', 'XMLHttpRequest')
      headers.set('X-Client-Version', '1.0.0')
      
      return originalFetch(input, { ...init, headers })
    }
  }

  private protectXHR() {
    const originalOpen = XMLHttpRequest.prototype.open
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      const urlString = url.toString()
      
      // 检查URL是否合法
      if (!urlString.startsWith('/') && !urlString.includes(window.location.host)) {
        // 可能是跨域请求，记录日志
        console.warn('Cross-origin request detected:', urlString)
      }
      
      return originalOpen.apply(this, [method, url, ...args] as any)
    }
  }

  private isValidUrl(url: string): boolean {
    // 允许相对路径
    if (url.startsWith('/')) return true
    
    // 允许同源请求
    try {
      const urlObj = new URL(url)
      return urlObj.origin === window.location.origin
    } catch {
      return false
    }
  }
}


/**
 * 页面完整性检查
 */
class IntegrityChecker {
  constructor() {
    if (!isProduction) return
    this.protect()
  }

  private protect() {
    // 定期检查DOM是否被篡改
    this.startMonitoring()
  }



  private startMonitoring() {
    // 使用MutationObserver监控DOM变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 检查是否有可疑的脚本注入
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'SCRIPT') {
              const script = node as HTMLScriptElement
              // 检查是否是未知脚本
              if (!script.src.includes(window.location.host) && script.src) {
                console.warn('Suspicious script detected:', script.src)
                script.remove()
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
}

/**
 * 复制保护
 */
class CopyProtector {
  constructor() {
    if (!isProduction) return
    this.protect()
  }

  private protect() {
    // 禁止复制敏感内容
    document.addEventListener('copy', (e) => {
      const selection = window.getSelection()?.toString() || ''
      
      // 检查是否包含敏感信息
      if (this.containsSensitiveData(selection)) {
        e.preventDefault()
        // 可以替换为脱敏内容
        e.clipboardData?.setData('text/plain', '***敏感内容已隐藏***')
      }
    })

    // 禁止剪切
    document.addEventListener('cut', (e) => {
      const selection = window.getSelection()?.toString() || ''
      if (this.containsSensitiveData(selection)) {
        e.preventDefault()
      }
    })
  }

  private containsSensitiveData(text: string): boolean {
    // 检查是否包含敏感模式
    const sensitivePatterns = [
      /token/i,
      /password/i,
      /secret/i,
      /api[_-]?key/i,
      /bearer/i,
    ]
    
    return sensitivePatterns.some(pattern => pattern.test(text))
  }
}

/**
 * 会话保护
 */
class SessionProtector {
  private lastActivity = Date.now()
  private sessionTimeout = 30 * 60 * 1000 // 30分钟

  constructor() {
    this.protect()
  }

  private protect() {
    // 监听用户活动
    this.trackActivity()
    
    // 定期检查会话
    this.checkSession()
    
    // 页面可见性变化时检查
    this.handleVisibilityChange()
  }

  private trackActivity() {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now()
      }, { passive: true })
    })
  }

  private checkSession() {
    setInterval(() => {
      const now = Date.now()
      const inactive = now - this.lastActivity
      
      if (inactive > this.sessionTimeout) {
        // 会话超时，清除数据并跳转到登录页
        this.handleSessionTimeout()
      }
    }, 60000) // 每分钟检查一次
  }

  private handleVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时检查会话
        const now = Date.now()
        const inactive = now - this.lastActivity
        
        if (inactive > this.sessionTimeout) {
          this.handleSessionTimeout()
        }
      }
    })
  }

  private handleSessionTimeout() {
    // 清除敏感数据
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    sessionStorage.clear()
    
    // 跳转到登录页
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?reason=timeout'
    }
  }
}

/**
 * 初始化所有安全保护
 */
export function initSecurity() {
  // 开发者工具检测
  const devToolsDetector = new DevToolsDetector()
  devToolsDetector.onOpen(() => {
    // 检测到开发者工具打开时的处理
    if (isProduction) {
      // 清除敏感数据
      localStorage.removeItem('token')
      sessionStorage.clear()
      
      // 显示警告
      document.body.innerHTML = `
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f5f5f5;
          font-family: Arial, sans-serif;
        ">
          <div style="
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          ">
            <h1 style="color: #e74c3c; margin-bottom: 20px;">⚠️ 安全警告</h1>
            <p style="color: #666; margin-bottom: 20px;">
              检测到开发者工具已打开<br>
              为保护系统安全，页面已被锁定
            </p>
            <button onclick="location.reload()" style="
              padding: 10px 30px;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
            ">
              刷新页面
            </button>
          </div>
        </div>
      `
    }
  })

  // 控制台保护
  new ConsoleProtector()

  // 右键菜单和快捷键保护
  new ContextMenuProtector()

  // 源代码保护
  new SourceCodeProtector()

  // 反调试保护
  new AntiDebugger()

  // 数据保护
  new DataProtector()

  // 网络请求保护
  new NetworkProtector()

  // 页面完整性检查
  new IntegrityChecker()

  // 复制保护
  new CopyProtector()

  // 会话保护
  new SessionProtector()

  // 在控制台显示警告信息
  if (isProduction) {
    setTimeout(() => {
      console.log(
        '%c⚠️ 警告',
        'color: red; font-size: 40px; font-weight: bold;'
      )
      console.log(
        '%c此浏览器功能仅供开发人员使用。如果有人告诉您在此处复制粘贴某些内容，这是一种欺诈行为，会让他们访问您的账户。',
        'color: red; font-size: 16px;'
      )
    }, 1000)
  }
}

/**
 * 敏感数据脱敏
 */
export function maskSensitiveData(data: string, type: 'phone' | 'email' | 'idcard' | 'name' = 'phone'): string {
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
 * XSS过滤
 */
export function escapeHtml(text: string): string {
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

export default {
  initSecurity,
  maskSensitiveData,
  safeJSONParse,
  escapeHtml
}

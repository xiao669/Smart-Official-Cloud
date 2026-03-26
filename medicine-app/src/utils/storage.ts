/**
 * 本地存储工具
 */

/**
 * 设置存储
 */
export function setStorage(key: string, value: any): void {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (error) {
    console.error('setStorage error:', error)
  }
}

/**
 * 获取存储
 */
export function getStorage<T = any>(key: string): T | null {
  try {
    const value = uni.getStorageSync(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('getStorage error:', error)
    return null
  }
}

/**
 * 移除存储
 */
export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key)
  } catch (error) {
    console.error('removeStorage error:', error)
  }
}

/**
 * 清空存储
 */
export function clearStorage(): void {
  try {
    uni.clearStorageSync()
  } catch (error) {
    console.error('clearStorage error:', error)
  }
}

/**
 * Token 相关
 */
export const tokenStorage = {
  get(): string | null {
    return uni.getStorageSync('token') || null
  },
  
  set(token: string): void {
    uni.setStorageSync('token', token)
  },
  
  remove(): void {
    uni.removeStorageSync('token')
  }
}

/**
 * 用户信息相关
 */
export const userStorage = {
  get(): any | null {
    return getStorage('userInfo')
  },
  
  set(userInfo: any): void {
    setStorage('userInfo', userInfo)
  },
  
  remove(): void {
    removeStorage('userInfo')
  }
}

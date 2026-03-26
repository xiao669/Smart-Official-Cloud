import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authApi } from '@/api/auth'
import { useAppStore } from './app'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  
  const userType = computed(() => user.value?.user_type || null)

  const isAdmin = computed(() => userType.value === 'admin')
  const isManager = computed(() => userType.value === 'manager')
  const isOperator = computed(() => userType.value === 'operator')

  async function login(username: string, password: string) {
    const response = await authApi.login(username, password)
    token.value = response.access_token
    user.value = response.user
    localStorage.setItem('token', response.access_token)
    
    // 同步用户的场景设置
    syncUserMode(response.user)
    
    return response
  }

  async function smsLogin(phone: string, code: string) {
    const response = await authApi.smsLogin(phone, code)
    token.value = response.access_token
    user.value = response.user
    localStorage.setItem('token', response.access_token)
    
    // 同步用户的场景设置
    syncUserMode(response.user)
    
    return response
  }
  
  // 同步用户场景设置到app store
  function syncUserMode(userData: User) {
    if (userData.current_mode) {
      const appStore = useAppStore()
      // 直接设置，不调用API（因为这是从后端获取的）
      appStore.currentMode = userData.current_mode as any
      localStorage.setItem('currentMode', userData.current_mode)
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  function setUser(userData: User) {
    user.value = userData
    // 同步场景设置
    syncUserMode(userData)
  }

  return {
    token,
    user,
    isAuthenticated,
    userType,
    isAdmin,
    isManager,
    isOperator,
    login,
    smsLogin,
    logout,
    setUser
  }
})

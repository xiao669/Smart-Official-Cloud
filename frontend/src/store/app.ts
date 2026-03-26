import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { type ModeType, getModeConfig, DEFAULT_MODE, MODE_LIST } from '@/config/mode-config'
import { authApi } from '@/api/auth'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  
  // 当前使用场景
  const currentMode = ref<ModeType>(
    (localStorage.getItem('currentMode') as ModeType) || DEFAULT_MODE
  )
  
  // 当前场景配置
  const modeConfig = computed(() => getModeConfig(currentMode.value))
  
  // 场景列表
  const modeList = MODE_LIST

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setLoading(value: boolean) {
    loading.value = value
  }
  
  // 切换场景（同步更新后端）
  async function setMode(mode: ModeType) {
    try {
      // 调用后端API更新用户场景
      await authApi.updateUserMode(mode)
      currentMode.value = mode
      localStorage.setItem('currentMode', mode)
    } catch (error) {
      console.error('切换场景失败:', error)
      // 即使后端失败，也更新本地状态（兼容离线场景）
      currentMode.value = mode
      localStorage.setItem('currentMode', mode)
    }
  }
  
  // 初始化场景（从后端同步）
  async function initMode() {
    try {
      const user = await authApi.getCurrentUser()
      if (user.current_mode) {
        currentMode.value = user.current_mode as ModeType
        localStorage.setItem('currentMode', user.current_mode)
      }
    } catch (error) {
      console.error('获取用户场景失败:', error)
    }
  }

  return {
    sidebarCollapsed,
    loading,
    currentMode,
    modeConfig,
    modeList,
    toggleSidebar,
    setLoading,
    setMode,
    initMode
  }
})

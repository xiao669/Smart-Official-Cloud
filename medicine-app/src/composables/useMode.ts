// 使用场景 Composable
import { ref, computed } from 'vue'
import { getCurrentModeConfig, getTerm, getModeName, getModeIcon, replaceTerms } from '../config/mode-config'
import type { ModeConfig } from '../config/mode-config'

// 更新 tabBar 文字
function updateTabBarText() {
  const config = getCurrentModeConfig()
  const itemTerm = config.terminology.item
  
  // 更新第二个 tab（药品/商品/食品）
  uni.setTabBarItem({
    index: 1,
    text: itemTerm
  })
}

export function useMode() {
  // 当前场景配置（使用ref确保响应式）
  const modeConfig = ref<ModeConfig>(getCurrentModeConfig())
  
  // 强制刷新标记
  const refreshKey = ref(0)
  
  // 刷新配置（场景切换后调用）
  const refreshConfig = () => {
    modeConfig.value = getCurrentModeConfig()
    refreshKey.value++ // 触发响应式更新
    
    // 更新 tabBar 文字
    updateTabBarText()
  }
  
  // 计算属性：术语
  const terms = computed(() => {
    // 依赖refreshKey确保更新
    refreshKey.value
    return modeConfig.value.terminology
  })
  
  // 计算属性：场景名称
  const modeName = computed(() => {
    refreshKey.value
    return modeConfig.value.name
  })
  
  // 计算属性：场景图标
  const modeIcon = computed(() => {
    refreshKey.value
    return modeConfig.value.icon
  })
  
  // 获取单个术语
  const term = (key: keyof ModeConfig['terminology']) => {
    refreshKey.value
    return terms.value[key]
  }
  
  // 替换文本中的术语
  const replace = (text: string) => {
    return replaceTerms(text)
  }
  
  return {
    modeConfig,
    terms,
    modeName,
    modeIcon,
    term,
    replace,
    refreshConfig,
    refreshKey,
    updateTabBarText
  }
}

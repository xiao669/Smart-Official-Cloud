/**
 * 智管云 PC端 - 场景术语 composable
 * 提供根据当前场景动态获取术语的功能
 */

import { computed } from 'vue'
import { useAppStore } from '@/store/app'

export function useMode() {
  const appStore = useAppStore()
  
  // 当前场景
  const currentMode = computed(() => appStore.currentMode)
  
  // 当前场景配置
  const modeConfig = computed(() => appStore.modeConfig)
  
  // 物品名称（药品/商品/食品）
  const itemName = computed(() => appStore.modeConfig.itemName)
  
  // 分类名称
  const categoryName = computed(() => appStore.modeConfig.categoryName)
  
  // 分类标签（分类/类别）
  const categoryLabel = computed(() => appStore.modeConfig.categoryLabel)
  
  // 单位标签
  const unitLabel = computed(() => appStore.modeConfig.unitLabel)
  
  // 单位选项
  const unitOptions = computed(() => appStore.modeConfig.unitOptions)
  
  // 效期标签（有效期/保质期）
  const expiryLabel = computed(() => appStore.modeConfig.expiryLabel)
  
  // 批号标签（批号/批次）
  const batchLabel = computed(() => appStore.modeConfig.batchLabel)
  
  // 编码标签
  const codeLabel = computed(() => appStore.modeConfig.codeLabel)
  
  // 生产厂家标签
  const manufacturerLabel = computed(() => appStore.modeConfig.manufacturerLabel)
  
  // 场景名称
  const modeName = computed(() => appStore.modeConfig.name)
  
  // 场景图标
  const modeIcon = computed(() => appStore.modeConfig.icon)
  
  // 场景颜色
  const modeColor = computed(() => appStore.modeConfig.color)
  
  return {
    currentMode,
    modeConfig,
    itemName,
    categoryName,
    categoryLabel,
    unitLabel,
    unitOptions,
    expiryLabel,
    batchLabel,
    codeLabel,
    manufacturerLabel,
    modeName,
    modeIcon,
    modeColor
  }
}

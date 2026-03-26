<template>
  <view class="home-page">
    <!-- 固定状态栏背景 -->
    <view class="fixed-status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 内容区域（添加顶部padding避开状态栏） -->
    <view class="page-content" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 顶部渐变背景区域 -->
      <view class="header-section">
        <!-- 自定义导航栏：欢迎语 + 药管家 + 通知 -->
        <view class="custom-navbar">
          <view class="navbar-left">
            <text class="greeting-text">{{ greetingText }}</text>
            <!-- <text class="app-name">药管家</text> -->
          </view>
          <view class="notification-btn" @click="goToWarnings()">
            <text class="notification-icon">🔔</text>
            <view v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
          </view>
        </view>
        
        <!-- 搜索框 -->
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input"
            v-model="searchKeyword"
            :placeholder="`搜索${term('item')}名称、${term('batch')}...`"
            placeholder-class="search-placeholder"
            confirm-type="search"
            @confirm="handleSearch"
            @input="onSearchInput"
          />
          <text v-if="searchKeyword" class="clear-btn" @click="clearSearch">✕</text>
          <view class="search-btn" @click="handleSearch">
            <text class="search-btn-text">搜索</text>
          </view>
        </view>
      
      <!-- 搜索结果弹层 -->
      <view v-if="showSearchResult" class="search-result-overlay" @click="closeSearchResult">
        <view class="search-result-panel" @click.stop>
          <view class="result-header">
            <text class="result-title">搜索结果</text>
            <text class="result-close" @click="closeSearchResult">✕</text>
          </view>
          
          <view v-if="searchLoading" class="result-loading">
            <text class="loading-icon">⏳</text>
            <text class="loading-text">搜索中...</text>
          </view>
          
          <view v-else-if="searchResults.length === 0" class="result-empty">
            <text class="empty-icon">🔍</text>
            <text class="empty-text">未找到相关{{ term('item') }}</text>
          </view>
          
          <scroll-view v-else class="result-list" scroll-y>
            <view 
              v-for="item in searchResults" 
              :key="item.id"
              class="result-item"
              @click="goToMedicineDetail(item)"
            >
              <view class="result-item-left">
                <text class="result-name">{{ item.medicine_name }}</text>
                <text class="result-info">{{ term('batch') }}: {{ item.batch_number }} | {{ term('inventory') }}: {{ item.quantity }}{{ item.medicine_unit || term('itemUnit') }}</text>
              </view>
              <view class="result-status" :class="getStatusClass(item.expiry_date)">
                {{ getStatusText(item.expiry_date) }}
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
      
      <!-- 主统计卡片 -->
      <view class="main-stats-card">
        <view class="stats-header">
          <text class="stats-title">{{ term('inventory') }}概览</text>
          <text class="stats-date">{{ currentDate }}</text>
        </view>
        <view class="stats-row">
          <view class="main-stat">
            <text class="main-stat-value">{{ stats.total_medicines }}</text>
            <text class="main-stat-label">{{ term('item') }}种类</text>
          </view>
          <view class="stats-divider"></view>
          <view class="main-stat">
            <text class="main-stat-value">{{ stats.total_inventory }}</text>
            <text class="main-stat-label">{{ term('inventory') }}总量</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 预警状态卡片 - 老年人友好，加大加粗 -->
    <view class="alert-cards">
      <view class="alert-card expired" @click="goToWarnings('expired')">
        <view class="alert-icon-wrap">
          <text class="alert-icon">🚨</text>
        </view>
        <text class="alert-value">{{ stats.expired_count }}</text>
        <text class="alert-label">已过期</text>
      </view>
      
      <view class="alert-card warning" @click="goToWarnings('expiry')">
        <view class="alert-icon-wrap">
          <text class="alert-icon">⏰</text>
        </view>
        <text class="alert-value">{{ stats.expiry_count }}</text>
        <text class="alert-label">临期预警</text>
      </view>
      
      <view class="alert-card low-stock" @click="goToWarnings('low_stock')">
        <view class="alert-icon-wrap">
          <text class="alert-icon">📦</text>
        </view>
        <text class="alert-value">{{ stats.low_stock_count }}</text>
        <text class="alert-label">低库存</text>
      </view>
    </view>
    
    <!-- 快捷操作区域 -->
    <view class="quick-section">
      <view class="section-header">
        <text class="section-title">快捷操作</text>
      </view>
      
      <!-- 出库大卡片 -->
      <view class="outbound-card">
        <view class="outbound-left">
          <view class="outbound-btn" @click="goToScanOutbound">
            <text class="outbound-btn-icon">📷</text>
            <text class="outbound-btn-text">扫码</text>
          </view>
          <view class="outbound-btn" @click="handlePhotoOutbound">
            <text class="outbound-btn-icon">📤</text>
            <text class="outbound-btn-text">拍照</text>
          </view>
        </view>
        <view class="outbound-info">
          <text class="outbound-title">快速{{ term('outbound') }}</text>
          <text class="outbound-desc">扫码或拍照识别{{ term('item') }}</text>
        </view>
        <text class="outbound-arrow">›</text>
      </view>
      
      <!-- 其他快捷操作 -->
      <view class="quick-grid">
        <view class="quick-item" @click="goToAdd">
          <view class="quick-icon-wrap add">
            <text class="quick-icon">📥</text>
          </view>
          <text class="quick-text">{{ term('inbound') }}登记</text>
        </view>
        <view class="quick-item" @click="checkWarnings">
          <view class="quick-icon-wrap check">
            <text class="quick-icon">🔍</text>
          </view>
          <text class="quick-text">检查{{ term('warning') }}</text>
        </view>
        <view class="quick-item" @click="goToMedicineList">
          <view class="quick-icon-wrap list">
            <text class="quick-icon">📋</text>
          </view>
          <text class="quick-text">{{ term('list') }}</text>
        </view>
        <view class="quick-item" @click="goToWarnings()">
          <view class="quick-icon-wrap warning">
            <text class="quick-icon">⚠️</text>
          </view>
          <text class="quick-text">{{ term('warning') }}管理</text>
        </view>
      </view>
    </view>

    <!-- 最近预警 -->
    <view class="warnings-section">
      <view class="section-header">
        <text class="section-title">最近{{ term('warning') }}</text>
        <text class="section-more" @click="goToWarnings()">查看全部 ›</text>
      </view>
      
      <view v-if="warnings.length === 0" class="empty-state">
        <view class="empty-icon-wrap">
          <text class="empty-icon">✅</text>
        </view>
        <text class="empty-title">一切正常</text>
        <text class="empty-desc">暂无{{ term('warning') }}信息，继续保持！</text>
      </view>
      
      <view v-if="warnings.length > 0" class="warning-list">
        <view 
          v-for="(warning, index) in warnings.slice(0, 5)" 
          :key="warning.id"
          class="warning-card"
          :class="{ 'is-read': warning.is_read }"
          :style="{ animationDelay: index * 0.1 + 's' }"
          @click="handleWarningClick(warning)"
        >
          <view class="warning-left">
            <view class="warning-type-icon" :class="getWarningClass(warning.type)">
              {{ getWarningIcon(warning.type) }}
            </view>
          </view>
          <view class="warning-center">
            <view class="warning-title-row">
              <text class="warning-medicine">{{ warning.medicine_name }}</text>
              <view class="warning-tag" :class="getWarningClass(warning.type)">
                {{ getWarningText(warning.type) }}
              </view>
            </view>
            <text class="warning-message">{{ warning.message }}</text>
            <text class="warning-time">{{ formatTime(warning.created_at) }}</text>
          </view>
          <view class="warning-right">
            <text class="warning-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部安全区域 -->
    <view class="safe-bottom"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onPullDownRefresh, onShow, onHide } from '@dcloudio/uni-app'
import { dashboardApi } from '../../src/api/dashboard'
import { warningApi } from '../../src/api/warning'
import { notificationApi } from '../../src/api/notification'
import { inventoryApi } from '../../src/api/inventory'
import { formatRelativeTime, getExpiryStatus } from '../../src/utils/date'
import type { DashboardStats, Warning, Batch } from '../../src/types'
import { useMode } from '../../src/composables/useMode'

// 使用场景配置
const { terms, term, modeName, modeIcon, refreshConfig } = useMode()

// 推送通知相关
let notificationTimer: ReturnType<typeof setInterval> | null = null
const NOTIFICATION_INTERVAL = 60 * 1000 // 60秒检查一次（降低频率）
let emptyCheckCount = 0 // 连续空检查次数
const MAX_EMPTY_CHECKS = 3 // 连续3次无通知后暂停轮询
let isFirstLoad = true // 是否首次加载
let lastLoadTime = 0 // 上次加载时间
const MIN_RELOAD_INTERVAL = 30 * 1000 // 最小刷新间隔30秒（避免频繁刷新）

// 缓存Key
const CACHE_KEY_STATS = 'home_stats_cache'
const CACHE_KEY_WARNINGS = 'home_warnings_cache'
const CACHE_EXPIRE_TIME = 5 * 60 * 1000 // 缓存5分钟过期

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${month}月${day}日 ${weekDays[now.getDay()]}`
})

// 欢迎语（根据时间段）
const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 9) return '早上好 🌅'
  if (hour >= 9 && hour < 12) return '上午好 ☀️'
  if (hour >= 12 && hour < 14) return '中午好 🌞'
  if (hour >= 14 && hour < 18) return '下午好 ☀️'
  if (hour >= 18 && hour < 22) return '晚上好 🌆'
  return '夜深了 🌙'
})

// 状态
const stats = ref<DashboardStats>({
  total_medicines: 0,
  total_inventory: 0,
  expired_count: 0,
  expiry_count: 0,
  low_stock_count: 0
})

const warnings = ref<Warning[]>([])

// 状态栏高度
const statusBarHeight = ref(44)

// 获取状态栏高度
try {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 44
} catch (e) {
  statusBarHeight.value = 44
}

// 搜索相关状态
const searchKeyword = ref('')
const showSearchResult = ref(false)
const searchLoading = ref(false)
const searchResults = ref<Batch[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

// 未读数量
const unreadCount = computed(() => {
  return warnings.value.filter(w => !w.is_read).length
})

// ========== 缓存优先策略 ==========

// 从缓存加载数据（立即显示）
function loadFromCache() {
  try {
    const statsCache = uni.getStorageSync(CACHE_KEY_STATS)
    if (statsCache) {
      const { data, timestamp } = JSON.parse(statsCache)
      // 即使过期也先显示，后台会更新
      stats.value = data
    }
    
    const warningsCache = uni.getStorageSync(CACHE_KEY_WARNINGS)
    if (warningsCache) {
      const { data } = JSON.parse(warningsCache)
      warnings.value = data
    }
  } catch (e) {
    console.error('读取缓存失败:', e)
  }
}

// 保存到缓存
function saveToCache(key: string, data: any) {
  try {
    uni.setStorageSync(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.error('保存缓存失败:', e)
  }
}

// 检查缓存是否过期
function isCacheExpired(key: string): boolean {
  try {
    const cache = uni.getStorageSync(key)
    if (!cache) return true
    const { timestamp } = JSON.parse(cache)
    return Date.now() - timestamp > CACHE_EXPIRE_TIME
  } catch {
    return true
  }
}

// 加载统计数据（静默更新，不影响UI）
async function loadStats(forceRefresh = false) {
  try {
    const data = await dashboardApi.getStats()
    // 只有数据真正变化时才更新（避免闪烁）
    if (JSON.stringify(data) !== JSON.stringify(stats.value)) {
      stats.value = data
    }
    saveToCache(CACHE_KEY_STATS, data)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载最近预警（静默更新）
async function loadWarnings() {
  try {
    const res = await warningApi.list({
      page: 1,
      page_size: 10,
      is_read: false
    })
    // 只有数据真正变化时才更新
    if (JSON.stringify(res.items) !== JSON.stringify(warnings.value)) {
      warnings.value = res.items
    }
    saveToCache(CACHE_KEY_WARNINGS, res.items)
  } catch (error) {
    console.error('加载预警列表失败:', error)
  }
}

// 检查预警
async function checkWarnings() {
  uni.showLoading({ title: '检查中...' })
  try {
    const res = await warningApi.checkWarnings()
    uni.hideLoading()
    
    if (res.generated_count > 0) {
      uni.showToast({
        title: `发现 ${res.generated_count} 条新预警`,
        icon: 'none'
      })
      await loadStats()
      await loadWarnings()
    } else {
      uni.showToast({
        title: '暂无新预警',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
  }
}

// 跳转到预警页面
function goToWarnings(type?: string) {
  // 通过本地存储传递筛选类型（因为switchTab不支持传参）
  if (type) {
    uni.setStorageSync('warningFilterType', type)
  } else {
    uni.removeStorageSync('warningFilterType')
  }
  uni.switchTab({ url: '/pages/warning/index' })
}

// 跳转到添加页面
function goToAdd() {
  uni.navigateTo({ url: '/pages/add/index' })
}

// 扫码出库 - 最简单方式，直接调用uni.scanCode
function goToScanOutbound() {
  uni.scanCode({
    success: (res: any) => {
      const code = res.result
      if (code) {
        uni.showModal({
          title: '扫描成功',
          content: `条形码: ${code}`,
          confirmText: '去出库',
          cancelText: '取消',
          success: (modalRes: any) => {
            if (modalRes.confirm) {
              uni.setStorageSync('scannedBarcode', code)
              uni.navigateTo({ url: '/pages/outbound/index' })
            }
          }
        })
      }
    },
    fail: (err: any) => {
      if (!err.errMsg?.includes('cancel')) {
        uni.showToast({ title: '扫描失败', icon: 'none' })
      }
    }
  })
}

// 跳转到药品列表
function goToMedicineList() {
  uni.switchTab({ url: '/pages/medicine/list' })
}

// 搜索输入（防抖）
function onSearchInput() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  if (!searchKeyword.value.trim()) {
    showSearchResult.value = false
    searchResults.value = []
    return
  }
  
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 500)
}

// 执行搜索
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    return
  }
  
  showSearchResult.value = true
  searchLoading.value = true
  
  try {
    const res = await inventoryApi.list({
      page: 1,
      page_size: 20,
      keyword: searchKeyword.value.trim()
    })
    searchResults.value = res.items
  } catch (error) {
    console.error('搜索失败:', error)
    uni.showToast({ title: '搜索失败', icon: 'none' })
  } finally {
    searchLoading.value = false
  }
}

// 清除搜索
function clearSearch() {
  searchKeyword.value = ''
  showSearchResult.value = false
  searchResults.value = []
}

// 关闭搜索结果
function closeSearchResult() {
  showSearchResult.value = false
}

// 跳转到药品详情
function goToMedicineDetail(item: Batch) {
  closeSearchResult()
  uni.navigateTo({
    url: `/pages/medicine/edit?id=${item.id}&medicine_id=${item.medicine_id}`
  })
}

// 获取状态样式
function getStatusClass(expiryDate: string) {
  const status = getExpiryStatus(expiryDate)
  return `status-${status.type}`
}

// 获取状态文本
function getStatusText(expiryDate: string) {
  const status = getExpiryStatus(expiryDate)
  return status.text
}

// 拍照出库
function handlePhotoOutbound() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
        return
      }
      
      const tempFilePath = res.tempFilePaths[0]
      
      uni.showLoading({
        title: '识别中...',
        mask: true
      })
      
      try {
        const uploadRes = await uni.uploadFile({
          url: 'http://192.168.3.2:8000/api/ocr/recognize',
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        
        uni.hideLoading()
        
        if (uploadRes.statusCode === 200) {
          const result = JSON.parse(uploadRes.data)
          const hasValidInfo = result.name || result.batch_number
          
          if (hasValidInfo) {
            uni.setStorageSync('ocrResult', result)
            uni.navigateTo({ url: '/pages/outbound/index' })
          } else {
            uni.showToast({
              title: '未识别到药品信息，请重试',
              icon: 'none',
              duration: 2000
            })
          }
        } else {
          uni.showToast({
            title: '识别失败，请重试',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '识别失败，请重试',
          icon: 'none'
        })
      }
    },
    fail: (err) => {
      if (!err.errMsg.includes('cancel')) {
        uni.showToast({
          title: '拍照失败',
          icon: 'none'
        })
      }
    }
  })
}

// 处理预警点击
async function handleWarningClick(warning: Warning) {
  if (!warning.is_read) {
    try {
      await warningApi.markAsRead(warning.id)
      warning.is_read = true
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
}

// 获取预警类型样式
function getWarningClass(type: string) {
  const classMap: Record<string, string> = {
    expired: 'type-expired',
    expiry: 'type-expiry',
    low_stock: 'type-low-stock'
  }
  return classMap[type] || 'type-low-stock'
}

// 获取预警图标
function getWarningIcon(type: string) {
  const iconMap: Record<string, string> = {
    expired: '🚨',
    expiry: '⏰',
    low_stock: '📦'
  }
  return iconMap[type] || '⚠️'
}

// 获取预警类型文本
function getWarningText(type: string) {
  const textMap: Record<string, string> = {
    expired: '已过期',
    expiry: '临期',
    low_stock: '低库存'
  }
  return textMap[type] || '预警'
}

// 格式化时间
function formatTime(time: string) {
  return formatRelativeTime(time)
}

// 下拉刷新
onPullDownRefresh(async () => {
  await Promise.all([loadStats(), loadWarnings()])
  lastLoadTime = Date.now() // 更新刷新时间
  uni.stopPullDownRefresh()
})

// ========== 推送通知功能 ==========

// 检查并推送一条通知
async function checkAndPushNotification() {
  try {
    const res = await notificationApi.getPending(1)
    
    if (res.items && res.items.length > 0) {
      const notification = res.items[0]
      emptyCheckCount = 0 // 重置空检查计数
      
      // 显示通知弹窗
      uni.showModal({
        title: notification.title,
        content: notification.content,
        showCancel: true,
        cancelText: '稍后查看',
        confirmText: '立即查看',
        success: async (modalRes: { confirm: boolean }) => {
          // 标记为已读
          try {
            await notificationApi.markAsRead(notification.id)
          } catch (e) {
            console.error('标记已读失败:', e)
          }
          
          if (modalRes.confirm) {
            uni.switchTab({ url: '/pages/warning/index' })
          }
        }
      })
      
      // 标记为已推送
      await notificationApi.markAsPushed(notification.id)
      
      // 静默刷新数据
      await loadWarnings()
    } else {
      // 没有待推送通知，增加空检查计数
      emptyCheckCount++
      
      // 连续多次无通知，暂停轮询节省资源
      if (emptyCheckCount >= MAX_EMPTY_CHECKS) {
        stopNotificationPolling()
      }
    }
  } catch (error) {
    console.error('推送通知检查失败:', error)
  }
}

// 启动推送通知轮询
function startNotificationPolling() {
  // 已经在运行就不重复启动
  if (notificationTimer) return
  
  // 先检查是否有预警数据，没有就不启动轮询
  const hasWarnings = stats.value.expired_count > 0 || 
                      stats.value.expiry_count > 0 || 
                      stats.value.low_stock_count > 0
  
  if (!hasWarnings) {
    return // 无预警数据，不启动轮询
  }
  
  emptyCheckCount = 0 // 重置计数
  
  // 延迟10秒后开始第一次检查，避免首次加载时的闪烁和卡顿
  setTimeout(() => {
    if (!notificationTimer) return // 如果已被停止则不执行
    checkAndPushNotification()
  }, 10000)
  
  // 设置定时器
  notificationTimer = setInterval(() => {
    checkAndPushNotification()
  }, NOTIFICATION_INTERVAL)
}

// 停止推送通知轮询
function stopNotificationPolling() {
  if (notificationTimer) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
}

// 页面加载
onMounted(async () => {
  // 首次安装时，先显示加载状态，避免空白闪烁
  const hasCache = uni.getStorageSync(CACHE_KEY_STATS)
  
  if (hasCache) {
    // 有缓存：先显示缓存，后台更新
    loadFromCache()
    Promise.all([loadStats(), loadWarnings()]).then(() => {
      lastLoadTime = Date.now()
      isFirstLoad = false
      // 加载完数据后再决定是否启动轮询
      startNotificationPolling()
    })
  } else {
    // 无缓存（首次安装）：直接加载数据，避免空白→数据的闪烁
    await Promise.all([loadStats(), loadWarnings()])
    lastLoadTime = Date.now()
    isFirstLoad = false
    startNotificationPolling()
  }
})

// 页面显示时恢复轮询
onShow(async () => {
  // 刷新场景配置（场景切换后更新术语）
  refreshConfig()
  
  // 避免频繁刷新导致页面闪烁
  const now = Date.now()
  if (!isFirstLoad && (now - lastLoadTime) > MIN_RELOAD_INTERVAL) {
    // 后台静默刷新，不阻塞UI
    Promise.all([loadStats(), loadWarnings()]).then(() => {
      lastLoadTime = now
    })
  }
  
  // 恢复轮询（如果之前被暂停）
  if (!notificationTimer) {
    startNotificationPolling()
  }
})

// 页面隐藏时暂停轮询
onHide(() => {
  stopNotificationPolling()
})

// 组件卸载时清理
onUnmounted(() => {
  stopNotificationPolling()
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: #F5F7FA;
}

// 固定状态栏背景（不随页面滚动）
.fixed-status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  z-index: 999;
}

// 内容区域
.page-content {
  padding-bottom: 180rpx;
}

// 顶部渐变区域
.header-section {
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  padding: 0 24rpx 48rpx;
  border-radius: 0 0 48rpx 48rpx;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    border-radius: 0 0 48rpx 48rpx;
    pointer-events: none;
  }
}

// 自定义导航栏
.custom-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0 24rpx;
  position: relative;
  z-index: 10;
}

.navbar-left {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.greeting-text {
  font-size: 28rpx;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.app-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.notification-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.notification-icon {
  font-size: 40rpx;
}

.notification-badge {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  min-width: 36rpx;
  height: 36rpx;
  background: #FF4757;
  border-radius: 18rpx;
  font-size: 20rpx;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  font-weight: 600;
  border: 4rpx solid #0e7490;
}

// 搜索框
.search-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  position: relative;
  z-index: 10;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 24rpx;
}

.search-icon {
  font-size: 36rpx;
  color: #0e7490;
}

.search-input {
  flex: 1;
  height: 56rpx;
  font-size: 28rpx;
  color: #303133;
  background: transparent;
}

.search-placeholder {
  color: #909399;
}

.clear-btn {
  font-size: 28rpx;
  color: #909399;
  padding: 8rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn {
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  padding: 12rpx 28rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(14, 116, 144, 0.3);
}

.search-btn-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 600;
}

// 搜索结果弹层
.search-result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding-top: 200rpx;
}

.search-result-panel {
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #EBEEF5;
}

.result-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #303133;
}

.result-close {
  font-size: 40rpx;
  color: #909399;
  padding: 8rpx;
}

.result-loading,
.result-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx;
}

.loading-icon {
  font-size: 80rpx;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text,
.empty-text {
  font-size: 28rpx;
  color: #909399;
  margin-top: 24rpx;
}

.empty-icon {
  font-size: 100rpx;
  opacity: 0.5;
}

.result-list {
  flex: 1;
  padding: 0 24rpx 24rpx;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #F8F9FA;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  
  &:active {
    background: #EBEEF5;
  }
}

.result-item-left {
  flex: 1;
  min-width: 0;
}

.result-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8rpx;
}

.result-info {
  display: block;
  font-size: 24rpx;
  color: #909399;
}

.result-status {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 16rpx;
  
  &.status-expired {
    background: rgba(255, 107, 107, 0.15);
    color: #FF6B6B;
  }
  
  &.status-expiry {
    background: rgba(255, 167, 38, 0.15);
    color: #FFA726;
  }
  
  &.status-normal {
    background: rgba(103, 194, 58, 0.15);
    color: #67C23A;
  }
}

// 主统计卡片
.main-stats-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(20px);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.stats-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
}

.stats-date {
  font-size: 24rpx;
  color: #909399;
}

.stats-row {
  display: flex;
  align-items: center;
}

.main-stat {
  flex: 1;
  text-align: center;
}

.main-stat-value {
  display: block;
  font-size: 64rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.main-stat-label {
  display: block;
  font-size: 26rpx;
  color: #909399;
  margin-top: 8rpx;
}

.stats-divider {
  width: 2rpx;
  height: 80rpx;
  background: linear-gradient(180deg, transparent, #E4E7ED, transparent);
  margin: 0 32rpx;
}

// 预警状态卡片 - 老年人友好，加大加粗
.alert-cards {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  margin-top: -24rpx;
}

.alert-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx 20rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 10rpx;
  }
  
  &.expired::before {
    background: linear-gradient(90deg, #FF4757, #FF6B6B);
  }
  
  &.warning::before {
    background: linear-gradient(90deg, #FF9500, #FFA726);
  }
  
  &.low-stock::before {
    background: linear-gradient(90deg, #2196F3, #42A5F5);
  }
}

.alert-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  
  .expired & {
    background: rgba(255, 71, 87, 0.15);
  }
  
  .warning & {
    background: rgba(255, 149, 0, 0.15);
  }
  
  .low-stock & {
    background: rgba(33, 150, 243, 0.15);
  }
}

.alert-icon {
  font-size: 48rpx;
}

.alert-value {
  display: block;
  font-size: 72rpx;
  font-weight: 900;
  line-height: 1;
  
  .expired & {
    color: #FF4757;
  }
  
  .warning & {
    color: #FF9500;
  }
  
  .low-stock & {
    color: #2196F3;
  }
}

.alert-label {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #333333;
  margin-top: 16rpx;
}

// 快捷操作区域
.quick-section {
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #303133;
  position: relative;
  padding-left: 20rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 32rpx;
    background: linear-gradient(180deg, #0e7490, #14b8a6);
    border-radius: 4rpx;
  }
}

.section-more {
  font-size: 26rpx;
  color: #0e7490;
  font-weight: 500;
}

// 出库大卡片 - 主色调青蓝色
.outbound-card {
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(14, 116, 144, 0.35);
}

.outbound-left {
  display: flex;
  gap: 20rpx;
}

.outbound-btn {
  width: 112rpx;
  height: 112rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}

.outbound-btn-icon {
  font-size: 44rpx;
}

.outbound-btn-text {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.outbound-info {
  flex: 1;
}

.outbound-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.outbound-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.outbound-arrow {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.6);
}

// 快捷操作网格
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.quick-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  
  // 各按钮独立颜色
  &.add {
    background: linear-gradient(135deg, #0e7490, #14b8a6);
  }
  
  &.check {
    background: linear-gradient(135deg, #FFA726, #FF9800);
  }
  
  &.list {
    background: linear-gradient(135deg, #56CCF2, #2F80ED);
  }
  
  &.warning {
    background: linear-gradient(135deg, #FF4757, #FF6B81);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.quick-icon {
  font-size: 44rpx;
}

.quick-text {
  font-size: 24rpx;
  color: #303133;
  font-weight: 600;
  text-align: center;
}

// 预警列表区域
.warnings-section {
  padding: 0 24rpx;
}

.empty-state {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 80rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.empty-icon-wrap {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #909399;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.warning-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(20rpx);
  
  &.is-read {
    opacity: 0.6;
  }
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.warning-left {
  flex-shrink: 0;
}

.warning-type-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  
  &.type-expired {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(238, 90, 90, 0.15) 100%);
  }
  
  &.type-expiry {
    background: linear-gradient(135deg, rgba(255, 167, 38, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%);
  }
  
  &.type-low-stock {
    background: linear-gradient(135deg, rgba(66, 165, 245, 0.15) 0%, rgba(33, 150, 243, 0.15) 100%);
  }
}

.warning-center {
  flex: 1;
  min-width: 0;
}

.warning-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.warning-medicine {
  font-size: 30rpx;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warning-tag {
  flex-shrink: 0;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  
  &.type-expired {
    background: rgba(255, 107, 107, 0.1);
    color: #FF6B6B;
  }
  
  &.type-expiry {
    background: rgba(255, 167, 38, 0.1);
    color: #FFA726;
  }
  
  &.type-low-stock {
    background: rgba(66, 165, 245, 0.1);
    color: #42A5F5;
  }
}

.warning-message {
  display: block;
  font-size: 26rpx;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warning-time {
  font-size: 22rpx;
  color: #C0C4CC;
}

.warning-right {
  flex-shrink: 0;
}

.warning-arrow {
  font-size: 40rpx;
  color: #DCDFE6;
  font-weight: 300;
}

// 底部安全区域
.safe-bottom {
  height: 40rpx;
}

// ==================== 深色模式样式 ====================
.dark-mode {
  background: #1a1a2e !important;
  
  // 顶部区域
  .header-section {
    background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
  }
  
  // 自定义导航栏
  .greeting-text {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .app-name {
    color: #FFFFFF;
  }
  
  // 搜索框
  .search-box {
    background: rgba(22, 33, 62, 0.95);
    
    .search-input {
      color: #FFFFFF;
    }
  }
  
  // 搜索结果
  .search-result-panel {
    background: #16213e;
    
    .result-header {
      border-color: #2d2d44;
      
      .result-title {
        color: #FFFFFF;
      }
    }
    
    .result-item {
      background: #1a1a2e;
      
      .result-name {
        color: #FFFFFF;
      }
      
      .result-info {
        color: #8e8e9a;
      }
    }
  }
  
  // 主统计卡片
  .main-stats-card {
    background: rgba(22, 33, 62, 0.95);
    box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.4);
    
    .stats-title {
      color: #FFFFFF;
    }
    
    .stats-date {
      color: #8e8e9a;
    }
    
    .main-stat-label {
      color: #8e8e9a;
    }
  }
  
  // 预警卡片
  .alert-card {
    background: #16213e;
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.3);
    
    .alert-label {
      color: #FFFFFF;
    }
  }
  
  // 区域标题
  .section-title {
    color: #FFFFFF;
  }
  
  .section-more {
    color: #14b8a6;
  }
  
  // 出库卡片
  .outbound-card {
    background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.4);
  }
  
  // 快捷操作
  .quick-text {
    color: #c0c0c0;
  }
  
  // 空状态
  .empty-state {
    background: #16213e;
    
    .empty-title {
      color: #FFFFFF;
    }
    
    .empty-desc {
      color: #8e8e9a;
    }
  }
  
  // 预警列表
  .warning-card {
    background: #16213e;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
    
    .warning-medicine {
      color: #FFFFFF;
    }
    
    .warning-message {
      color: #c0c0c0;
    }
    
    .warning-time {
      color: #8e8e9a;
    }
  }
}
</style>

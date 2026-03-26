<template>
  <view class="warning-page">
    <!-- Tab 切换 -->
    <view class="tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
      </view>
    </view>
    
    <!-- 操作栏 -->
    <view class="action-bar">
      <view class="auto-check-status" :class="{ disabled: !autoCheckEnabled }" @click="toggleAutoCheck">
        <view class="pulse-dot" v-if="autoCheckEnabled"></view>
        <view class="static-dot" v-else></view>
        <text class="status-text">{{ autoCheckEnabled ? '自动检查' : '已关闭' }}</text>
      </view>
      <view class="action-btn" @click="markAllAsRead">
        <text class="action-icon">✓</text>
        <text>已读</text>
      </view>
      <view class="action-btn delete-btn" @click="showDeleteOptions">
        <text class="action-icon">🗑️</text>
        <text>删除</text>
      </view>
      <view class="action-btn refresh-btn" @click="loadList(true)">
        <text class="action-icon">🔄</text>
        <text>刷新</text>
      </view>
    </view>
    
    <!-- 预警列表 -->
    <view v-if="loading && list.length === 0" class="loading-state">
      <text>加载中...</text>
    </view>
    
    <view v-else-if="list.length === 0" class="empty-state">
      <text class="empty-icon">✅</text>
      <text class="empty-text">暂无预警信息</text>
    </view>
    
    <view 
      v-else
      class="warning-scroll"
    >
      <view class="warning-list">
        <view 
          v-for="warning in list" 
          :key="warning.id"
          class="warning-item"
          :class="{ 'is-read': warning.is_read }"
          @click="handleWarningClick(warning)"
        >
          <view class="warning-header">
            <view class="warning-tag" :class="getWarningClass(warning.type)">
              {{ getWarningText(warning.type) }}
            </view>
            <text class="warning-time">{{ formatTime(warning.created_at) }}</text>
          </view>
          
          <view class="warning-content">
            <text class="warning-medicine">{{ warning.medicine_name }}</text>
            <text class="warning-message">{{ warning.message }}</text>
          </view>
          
          <view v-if="!warning.is_read" class="warning-footer">
            <view class="mark-read-btn" @click.stop="markAsRead(warning)">
              标记已读
            </view>
          </view>
        </view>
      </view>
      
      <view v-if="hasMore" class="load-more">
        <text>{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
      </view>
      
      <view v-else class="no-more">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { onLoad, onPullDownRefresh, onShow, onHide, onReachBottom } from '@dcloudio/uni-app'
import { warningApi } from '../../src/api/warning'
import { formatRelativeTime } from '../../src/utils/date'
import type { Warning } from '../../src/types'

// 状态
const list = ref<Warning[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const activeTab = ref('')
const autoCheckEnabled = ref(true) // 自动检查开关，默认开启

const page = ref(1)
const pageSize = 20
const total = ref(0)

const hasMore = computed(() => list.value.length < total.value)

// Tab 配置
const tabs = computed(() => [
  { label: '全部', value: '', count: 0 },
  { 
    label: '过期', 
    value: 'expired', 
    count: list.value.filter(w => w.type === 'expired' && !w.is_read).length 
  },
  { 
    label: '临期', 
    value: 'expiry', 
    count: list.value.filter(w => w.type === 'expiry' && !w.is_read).length 
  },
  { 
    label: '低库存', 
    value: 'low_stock', 
    count: list.value.filter(w => w.type === 'low_stock' && !w.is_read).length 
  }
])

// 加载列表
async function loadList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    list.value = []
  }
  
  if (page.value === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  
  try {
    const res = await warningApi.list({
      page: page.value,
      page_size: pageSize,
      type: activeTab.value || undefined
    })
    
    if (isRefresh) {
      list.value = res.items
    } else {
      list.value = [...list.value, ...res.items]
    }
    
    total.value = res.total
  } catch (error) {
    console.error('加载列表失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  page.value++
  loadList()
}

// 切换 Tab
function switchTab(value: string) {
  activeTab.value = value
  loadList(true)
}

// 自动检查定时器
let autoCheckTimer: number | null = null

// 自动检查预警（静默模式）
async function autoCheckWarnings() {
  try {
    const res = await warningApi.checkWarnings()
    if (res.generated_count > 0) {
      // 有新预警时刷新列表
      loadList(true)
    }
  } catch (error) {
    console.error('自动检查预警失败:', error)
  }
}

// 启动自动检查
function startAutoCheck() {
  // 立即执行一次
  autoCheckWarnings()
  
  // 设置定时器，每5分钟检查一次
  autoCheckTimer = setInterval(() => {
    autoCheckWarnings()
  }, 5 * 60 * 1000) as unknown as number
}

// 停止自动检查
function stopAutoCheck() {
  if (autoCheckTimer) {
    clearInterval(autoCheckTimer)
    autoCheckTimer = null
  }
}

// 切换自动检查开关
function toggleAutoCheck() {
  autoCheckEnabled.value = !autoCheckEnabled.value
  
  if (autoCheckEnabled.value) {
    startAutoCheck()
    uni.showToast({
      title: '自动检查已开启',
      icon: 'success'
    })
  } else {
    stopAutoCheck()
    uni.showToast({
      title: '自动检查已关闭',
      icon: 'none'
    })
  }
  
  // 保存设置到本地存储
  uni.setStorageSync('autoCheckEnabled', autoCheckEnabled.value)
}

// 标记单条已读
async function markAsRead(warning: Warning) {
  try {
    await warningApi.markAsRead(warning.id)
    warning.is_read = true
    uni.showToast({
      title: '已标记为已读',
      icon: 'success'
    })
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 全部标记已读
async function markAllAsRead() {
  uni.showModal({
    title: '提示',
    content: '确定要将所有未读预警标记为已读吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await warningApi.markAllAsRead()
          list.value.forEach(w => {
            w.is_read = true
          })
          uni.showToast({
            title: '操作成功',
            icon: 'success'
          })
        } catch (error) {
          console.error('操作失败:', error)
        }
      }
    }
  })
}

// 处理预警点击
function handleWarningClick(warning: Warning) {
  if (!warning.is_read) {
    markAsRead(warning)
  }
}

// 显示删除选项
function showDeleteOptions() {
  uni.showActionSheet({
    itemList: ['删除已读预警', '删除全部预警'],
    success: (res) => {
      if (res.tapIndex === 0) {
        deleteReadWarnings()
      } else if (res.tapIndex === 1) {
        deleteAllWarnings()
      }
    }
  })
}

// 删除已读预警
async function deleteReadWarnings() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除所有已读预警吗？',
    confirmColor: '#F56C6C',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await warningApi.deleteRead()
          uni.showToast({
            title: result.message,
            icon: 'success'
          })
          loadList(true)
        } catch (error) {
          console.error('删除失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 删除全部预警
async function deleteAllWarnings() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除所有预警吗？此操作不可恢复！',
    confirmColor: '#F56C6C',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await warningApi.deleteAll()
          uni.showToast({
            title: result.message,
            icon: 'success'
          })
          loadList(true)
        } catch (error) {
          console.error('删除失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 获取预警类型样式
function getWarningClass(type: string) {
  const classMap: Record<string, string> = {
    expired: 'tag-danger',
    expiry: 'tag-warning',
    low_stock: 'tag-info'
  }
  return classMap[type] || 'tag-info'
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
  await loadList(true)
  uni.stopPullDownRefresh()
})

// 触底加载更多
onReachBottom(() => {
  loadMore()
})

// 页面加载
onLoad((options: any) => {
  if (options.type) {
    activeTab.value = options.type
  }
  
  // 从本地存储读取自动检查设置，默认为开启
  const savedAutoCheck = uni.getStorageSync('autoCheckEnabled')
  autoCheckEnabled.value = savedAutoCheck !== false // 默认为 true
  
  loadList(true)
  
  // 根据设置决定是否启动自动检查
  if (autoCheckEnabled.value) {
    startAutoCheck()
  }
})

// 页面显示时恢复自动检查，并检查筛选类型
onShow(() => {
  // 检查是否有从首页传来的筛选类型
  const filterType = uni.getStorageSync('warningFilterType')
  if (filterType) {
    // 清除存储，避免下次进入还是这个筛选
    uni.removeStorageSync('warningFilterType')
    // 切换到对应的tab
    if (filterType !== activeTab.value) {
      activeTab.value = filterType
      loadList(true)
    }
  }
  
  if (autoCheckEnabled.value && !autoCheckTimer) {
    startAutoCheck()
  }
})

// 页面隐藏时暂停自动检查
onHide(() => {
  stopAutoCheck()
})

// 组件卸载时停止自动检查
onUnmounted(() => {
  stopAutoCheck()
})
</script>

<style lang="scss" scoped>
.warning-page {
  min-height: 100vh;
  background: #F5F7FA;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

// Tab 切换
.tabs {
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  display: flex;
  padding: 0 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(14, 116, 144, 0.3);
}

.tab-item {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &.active {
    .tab-text {
      color: #FFFFFF;
      font-weight: bold;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #FFFFFF;
      border-radius: 2rpx;
    }
  }
}

.tab-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
}

.tab-badge {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #F56C6C;
  color: #FFFFFF;
  font-size: 20rpx;
  border-radius: 16rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 操作栏
.action-bar {
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.auto-check-status {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  backdrop-filter: blur(10rpx);
  
  &.disabled {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .pulse-dot {
    width: 12rpx;
    height: 12rpx;
    background: #4ade80;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
    box-shadow: 0 0 8rpx rgba(74, 222, 128, 0.6);
  }
  
  .static-dot {
    width: 12rpx;
    height: 12rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
  }
  
  .status-text {
    font-size: 24rpx;
    color: #FFFFFF;
    font-weight: 500;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

.action-btn {
  flex: 1;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #FFFFFF;
  backdrop-filter: blur(10rpx);
  
  &.delete-btn {
    background: rgba(245, 108, 108, 0.3);
    color: #FFFFFF;
  }
  
  &.refresh-btn {
    background: rgba(255, 255, 255, 0.3);
    color: #FFFFFF;
  }
}

.action-icon {
  font-size: 28rpx;
}

// 列表
.warning-scroll {
  padding: 24rpx;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.warning-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  
  &.is-read {
    opacity: 0.6;
  }
}

.warning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.warning-tag {
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 600;
  
  &.tag-danger {
    background-color: #FEF0F0;
    color: #F56C6C;
  }
  
  &.tag-warning {
    background-color: #FDF6EC;
    color: #E6A23C;
  }
  
  &.tag-info {
    background-color: #F4F4F5;
    color: #909399;
  }
}

.warning-time {
  font-size: 24rpx;
  color: #909399;
}

.warning-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.warning-medicine {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
}

.warning-message {
  font-size: 26rpx;
  color: #606266;
  line-height: 1.5;
}

.warning-footer {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #EBEEF5;
  display: flex;
  justify-content: flex-end;
}

.mark-read-btn {
  padding: 8rpx 24rpx;
  background: #409EFF;
  color: #FFFFFF;
  border-radius: 16rpx;
  font-size: 24rpx;
}

// 加载状态
.loading-state,
.empty-state {
  padding: 200rpx 0;
  text-align: center;
  color: #909399;
}

.empty-icon {
  display: block;
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
}

.load-more,
.no-more {
  padding: 32rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #909399;
}

// ==================== 深色模式样式 ====================
.dark-mode {
  background: #1a1a2e !important;
  
  // Tab栏
  .tabs {
    background: #16213e;
    border-color: #2d2d44;
    
    .tab-item {
      .tab-text {
        color: #8e8e9a;
      }
      
      &.active {
        .tab-text {
          color: #14b8a6;
        }
        
        &::after {
          background: #14b8a6;
        }
      }
    }
  }
  
  // 操作栏
  .action-bar {
    background: #16213e;
    border-color: #2d2d44;
    
    .action-btn {
      color: #c0c0c0;
    }
    
    .auto-check-status {
      background: #1a1a2e;
      
      .status-text {
        color: #c0c0c0;
      }
    }
  }
  
  // 加载状态
  .loading-state, .empty-state {
    color: #8e8e9a;
    
    .empty-text {
      color: #8e8e9a;
    }
  }
  
  // 预警卡片
  .warning-item {
    background: #16213e;
    
    .warning-medicine {
      color: #FFFFFF;
    }
    
    .warning-message {
      color: #c0c0c0;
    }
    
    .warning-time {
      color: #8e8e9a;
    }
    
    &.is-read {
      background: #12192a;
    }
  }
  
  // 弹窗
  .popup-content {
    background: #16213e;
    
    .popup-title {
      color: #FFFFFF;
      border-color: #2d2d44;
    }
    
    .popup-item {
      border-color: #2d2d44;
      color: #c0c0c0;
      
      &:active {
        background: #1a1a2e;
      }
    }
  }
  
  // 加载更多
  .load-more, .no-more {
    color: #8e8e9a;
  }
}
</style>

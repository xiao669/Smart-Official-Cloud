<template>
  <view class="medicine-list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon-left">🔍</text>
        <input 
          class="search-input" 
          v-model="keyword" 
          :placeholder="`搜索${term('item')}名称`"
          @confirm="handleSearch"
          @input="onSearchInput"
          confirm-type="search"
        />
        <text v-if="keyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
      <button class="search-btn" @click="handleSearch">
        <text>搜索</text>
      </button>
    </view>
    
    <!-- 统计信息 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ total }}</text>
        <text class="stat-label">总数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value expired">{{ expiredCount }}</text>
        <text class="stat-label">已过期</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value warning">{{ expiryCount }}</text>
        <text class="stat-label">临期</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value normal">{{ normalCount }}</text>
        <text class="stat-label">正常</text>
      </view>
    </view>
    
    <!-- 筛选按钮组 -->
    <view class="filter-bar">
      <scroll-view class="filter-scroll" scroll-x :show-scrollbar="false">
        <view class="filter-chips">
          <view 
            v-for="status in statusOptions" 
            :key="status.value"
            class="filter-chip"
            :class="{ active: filterStatus === status.value }"
            @click="selectFilter(status.value)"
          >
            <text class="chip-text">{{ status.label }}</text>
            <text v-if="filterStatus === status.value" class="chip-icon">✓</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 药品列表 -->
    <view v-if="loading && list.length === 0" class="loading-state">
      <text class="loading-icon">⏳</text>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="list.length === 0" class="empty-state">
      <text class="empty-icon">{{ keyword ? '🔍' : '📦' }}</text>
      <text class="empty-text">{{ keyword ? `未找到相关${term('item')}` : `暂无${term('item')}数据` }}</text>
      <text class="empty-hint">{{ keyword ? `没有找到"${keyword}"相关的${term('item')}` : `点击首页${term('inbound')}登记添加${term('item')}` }}</text>
      <view v-if="keyword" class="empty-action" @click="clearSearch">
        <text class="empty-action-text">清除搜索</text>
      </view>
    </view>
    
    <view 
      v-else
      class="medicine-scroll"
    >
      <view class="medicine-list">
          <!-- 药品列表 - 左滑操作 -->
          <view 
            v-for="item in list" 
            :key="item.id"
            class="swipe-item-wrapper"
          >
            <!-- 滑动容器 -->
            <view 
              class="swipe-container"
              :class="{ animating: !isMoving }"
              :style="{ transform: `translateX(${getSwipeOffset(item.id)}px)` }"
              @touchstart="onTouchStart($event, item.id)"
              @touchmove="onTouchMove($event, item.id)"
              @touchend="onTouchEnd($event, item.id)"
            >
              <view class="medicine-item" @click="handleItemClick(item)">
                <!-- 状态指示条 -->
                <view class="status-indicator" :class="getStatusClass(item.expiry_date)"></view>
                
                <view class="item-content">
                  <view class="medicine-header">
                    <view class="name-section">
                      <text class="medicine-name">{{ item.medicine_name }}</text>
                    </view>
                    <view class="status-tag" :class="getStatusClass(item.expiry_date)">
                      {{ getStatusText(item.expiry_date) }}
                    </view>
                  </view>
                  
                  <view class="medicine-info">
                    <view class="info-item">
                      <text class="info-icon">📦</text>
                      <view class="info-content">
                        <text class="info-label">{{ term('inventory') }}数量</text>
                        <text class="info-value">{{ item.quantity }} {{ item.medicine_unit || term('itemUnit') }}</text>
                      </view>
                    </view>
                    
                    <view class="info-item">
                      <text class="info-icon">💰</text>
                      <view class="info-content">
                        <text class="info-label">单价</text>
                        <text class="info-value price" v-if="item.medicine_price">¥{{ item.medicine_price.toFixed(2) }}</text>
                        <text class="info-value" v-else>-</text>
                      </view>
                    </view>
                    
                    <view class="info-item">
                      <text class="info-icon">🏭</text>
                      <view class="info-content">
                        <text class="info-label">生产日期</text>
                        <text class="info-value">{{ item.production_date || '未知' }}</text>
                      </view>
                    </view>
                    
                    <view class="info-item">
                      <text class="info-icon">📅</text>
                      <view class="info-content">
                        <text class="info-label">有效期至</text>
                        <text class="info-value">{{ item.expiry_date }}</text>
                      </view>
                    </view>
                    
                    <view class="info-item">
                      <text class="info-icon">⏰</text>
                      <view class="info-content">
                        <text class="info-label">剩余时间</text>
                        <text class="info-value" :class="getDaysClass(item.expiry_date)">
                          {{ getDaysText(item.expiry_date) }}
                        </text>
                      </view>
                    </view>
                  </view>
                  
                  <view class="item-arrow">›</view>
                </view>
              </view>
            </view>
            
            <!-- 右侧操作按钮 -->
            <view class="swipe-actions">
              <view class="action-btn edit-btn" @click="handleEdit(item)">
                <text class="action-icon">✏️</text>
                <text class="action-text">修改</text>
              </view>
              <view class="action-btn delete-btn" @click="handleDelete(item)">
                <text class="action-icon">🗑️</text>
                <text class="action-text">删除</text>
              </view>
            </view>
          </view>
      </view>
      
      <view v-if="hasMore" class="load-more">
        <text>{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
      </view>
      
      <view v-else-if="list.length > 0" class="no-more">
        <text>已加载全部 {{ total }} 条数据</text>
      </view>
    </view>
    

    
    <!-- 筛选弹窗 -->
    <view v-if="showFilterPopup" class="filter-popup" @click="showFilterPopup = false">
      <view class="filter-content" @click.stop>
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <text class="filter-close" @click="showFilterPopup = false">✕</text>
        </view>
        
        <view class="filter-body">
          <view class="filter-section">
            <text class="filter-label">状态</text>
            <view class="filter-options">
              <view 
                v-for="status in statusOptions" 
                :key="status.value"
                class="filter-option"
                :class="{ active: filterStatus === status.value }"
                @click="filterStatus = status.value"
              >
                {{ status.label }}
              </view>
            </view>
          </view>
        </view>
        
        <view class="filter-footer">
          <view class="filter-btn reset" @click="resetFilter">重置</view>
          <view class="filter-btn confirm" @click="applyFilter">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { inventoryApi } from '../../src/api/inventory'
import { getExpiryStatus, getDaysFromNow } from '../../src/utils/date'
import type { Batch } from '../../src/types'
import { useMode } from '../../src/composables/useMode'

// 使用场景配置
const { term, refreshConfig } = useMode()

// 状态
const list = ref<Batch[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const keyword = ref('')
const filterStatus = ref('')
const showFilterPopup = ref(false)

const page = ref(1)
const pageSize = 20
const total = ref(0)

const hasMore = computed(() => list.value.length < total.value)

// 滑动相关状态
const swipeState = ref<Record<number, number>>({}) // 记录每个item的滑动偏移
const touchStartX = ref(0)
const touchStartY = ref(0)
const currentSwipeId = ref<number | null>(null)
const isMoving = ref(false)
const SWIPE_THRESHOLD = 160 // 滑动阈值（按钮宽度）

// 获取滑动偏移量
function getSwipeOffset(id: number): number {
  return swipeState.value[id] || 0
}

// 触摸开始
function onTouchStart(e: any, id: number) {
  // 如果有其他item打开，先关闭
  if (currentSwipeId.value !== null && currentSwipeId.value !== id) {
    swipeState.value[currentSwipeId.value] = 0
  }
  
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  currentSwipeId.value = id
  isMoving.value = false
  isHorizontalSwipe.value = false
}

// 是否正在水平滑动（用于阻止页面滚动）
const isHorizontalSwipe = ref(false)

// 触摸移动
function onTouchMove(e: any, id: number) {
  if (currentSwipeId.value !== id) return
  
  const touch = e.touches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  
  // 首次判断滑动方向
  if (!isHorizontalSwipe.value && !isMoving.value) {
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
      isHorizontalSwipe.value = true
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
      // 垂直滑动，不处理
      return
    }
  }
  
  // 水平滑动处理
  if (isHorizontalSwipe.value) {
    isMoving.value = true
    
    let newOffset = (swipeState.value[id] || 0) + deltaX
    
    // 限制滑动范围
    if (newOffset > 0) newOffset = 0
    if (newOffset < -SWIPE_THRESHOLD) newOffset = -SWIPE_THRESHOLD
    
    swipeState.value[id] = newOffset
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
  }
}

// 触摸结束
function onTouchEnd(e: any, id: number) {
  if (currentSwipeId.value !== id) return
  
  const currentOffset = swipeState.value[id] || 0
  
  // 根据滑动距离决定是否展开
  if (currentOffset < -SWIPE_THRESHOLD / 2) {
    swipeState.value[id] = -SWIPE_THRESHOLD
  } else {
    swipeState.value[id] = 0
    currentSwipeId.value = null
  }
  
  // 重置状态
  isHorizontalSwipe.value = false
}

// 点击item处理
function handleItemClick(item: Batch) {
  // 如果正在滑动或已展开，不跳转
  if (isMoving.value) return
  
  const offset = swipeState.value[item.id] || 0
  if (offset < 0) {
    // 关闭滑动
    swipeState.value[item.id] = 0
    currentSwipeId.value = null
    return
  }
  
  goToDetail(item)
}

// 编辑药品
function handleEdit(item: Batch) {
  // 关闭滑动
  swipeState.value[item.id] = 0
  currentSwipeId.value = null
  
  // 跳转到编辑页面
  uni.navigateTo({
    url: `/pages/medicine/edit?id=${item.id}&medicine_id=${item.medicine_id}`
  })
}

// 删除药品
function handleDelete(item: Batch) {
  // 关闭滑动
  swipeState.value[item.id] = 0
  currentSwipeId.value = null
  
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${item.medicine_name}"的这条库存记录吗？`,
    confirmColor: '#F56C6C',
    success: async (res) => {
      if (res.confirm) {
        try {
          await inventoryApi.delete(item.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          // 从列表中移除
          list.value = list.value.filter(i => i.id !== item.id)
          total.value--
        } catch (error) {
          console.error('删除失败:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}



// 统计数据
const expiredCount = computed(() => {
  return list.value.filter(item => getDaysFromNow(item.expiry_date) < 0).length
})

const expiryCount = computed(() => {
  return list.value.filter(item => {
    const days = getDaysFromNow(item.expiry_date)
    return days >= 0 && days <= 90
  }).length
})

const normalCount = computed(() => {
  return list.value.filter(item => getDaysFromNow(item.expiry_date) > 90).length
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已过期', value: 'expired' },
  { label: '临期', value: 'expiry' },
  { label: '正常', value: 'normal' }
]

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
    const res = await inventoryApi.list({
      page: page.value,
      page_size: pageSize,
      keyword: keyword.value || undefined
    })
    
    let items = res.items
    
    // 前端筛选
    if (filterStatus.value) {
      items = items.filter(item => {
        const days = getDaysFromNow(item.expiry_date)
        
        if (filterStatus.value === 'expired') {
          return days < 0
        } else if (filterStatus.value === 'expiry') {
          return days >= 0 && days <= 90
        } else if (filterStatus.value === 'normal') {
          return days > 90
        }
        
        return true
      })
    }
    
    if (isRefresh) {
      list.value = items
    } else {
      list.value = [...list.value, ...items]
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

// 搜索防抖定时器
let searchTimer: ReturnType<typeof setTimeout> | null = null

// 搜索输入（实时搜索，带防抖）
function onSearchInput() {
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  // 如果输入为空，立即加载全部
  if (!keyword.value.trim()) {
    loadList(true)
    return
  }
  
  // 防抖：500ms后执行搜索
  searchTimer = setTimeout(() => {
    loadList(true)
  }, 500)
}

// 搜索按钮点击
function handleSearch() {
  // 清除防抖定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
  
  // 立即执行搜索
  loadList(true)
}

// 清除搜索
function clearSearch() {
  keyword.value = ''
  loadList(true)
}

// 选择筛选
function selectFilter(value: string) {
  filterStatus.value = value
  loadList(true)
}

// 应用筛选
function applyFilter() {
  showFilterPopup.value = false
  loadList(true)
}

// 重置筛选
function resetFilter() {
  filterStatus.value = ''
  keyword.value = ''
  showFilterPopup.value = false
  loadList(true)
}

// 跳转详情
function goToDetail(item: Batch) {
  uni.navigateTo({
    url: `/pages/medicine/detail?id=${item.id}`
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

// 获取剩余天数样式
function getDaysClass(expiryDate: string) {
  const days = getDaysFromNow(expiryDate)
  if (days < 0) return 'danger'
  if (days <= 90) return 'warning'
  return 'normal'
}

// 获取剩余天数文本
function getDaysText(expiryDate: string) {
  const days = getDaysFromNow(expiryDate)
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  if (days === 0) return '今天过期'
  return `剩余 ${days} 天`
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

// 记录是否首次加载
let isFirstLoad = true

// 页面加载
onLoad(() => {
  loadList(true)
  isFirstLoad = false
})

// 页面显示时刷新（从其他页面返回时）
onShow(() => {
  refreshConfig()
  // 动态设置页面标题
  uni.setNavigationBarTitle({
    title: term('list')
  })
  // 非首次加载时刷新列表（从出库、编辑等页面返回时）
  if (!isFirstLoad) {
    loadList(true)
  }
})
</script>

<style lang="scss" scoped>
.medicine-list-page {
  min-height: 100vh;
  background: #F5F7FA;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

// 搜索栏
.search-bar {
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  padding: 24rpx;
  display: flex;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(14, 116, 144, 0.3);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  padding: 0 32rpx;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  
  &:focus-within {
    background: #FFFFFF;
    box-shadow: 0 4rpx 20rpx rgba(255, 255, 255, 0.3);
  }
}

.search-icon-left {
  font-size: 32rpx;
  margin-right: 12rpx;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  height: 72rpx;
  background: transparent;
  border: none;
  font-size: 28rpx;
  color: #303133;
}

.clear-icon {
  font-size: 28rpx;
  color: #909399;
  padding: 8rpx;
  margin-left: 8rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:active {
    background: rgba(0, 0, 0, 0.1);
  }
}

.search-btn {
  width: 120rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.95);
  color: #0e7490;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(255, 255, 255, 0.3);
  border: none;
  padding: 0;
  backdrop-filter: blur(10rpx);
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}



// 统计栏
.stats-bar {
  background: #FFFFFF;
  margin: 24rpx 24rpx 0;
  padding: 32rpx 24rpx;
  border-radius: 20rpx 20rpx 0 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #409EFF;
  
  &.expired {
    color: #F56C6C;
  }
  
  &.warning {
    color: #E6A23C;
  }
  
  &.normal {
    color: #67C23A;
  }
}

.stat-label {
  font-size: 24rpx;
  color: #909399;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #EBEEF5;
}

// 筛选栏
.filter-bar {
  background: #FFFFFF;
  margin: 0 24rpx 24rpx;
  padding: 20rpx 0;
  border-radius: 0 0 20rpx 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.filter-scroll {
  width: 100%;
  white-space: nowrap;
}

.filter-chips {
  display: inline-flex;
  gap: 16rpx;
  padding: 0 24rpx;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #F5F7FA;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #606266;
  white-space: nowrap;
  transition: all 0.3s;
  border: 2rpx solid transparent;
  
  &.active {
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    color: #FFFFFF;
    border-color: #667EEA;
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.chip-text {
  font-weight: 600;
}

.chip-icon {
  font-size: 24rpx;
  font-weight: bold;
}

// 列表
.medicine-scroll {
  padding: 0 24rpx 24rpx;
}

.medicine-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

// 滑动容器
.swipe-item-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 20rpx;
}

.swipe-container {
  position: relative;
  z-index: 2;
  touch-action: pan-y; // 只允许垂直滚动，水平由JS控制
  will-change: transform;
  
  &.animating {
    transition: transform 0.2s ease-out;
  }
}

// 右侧操作按钮
.swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  z-index: 1;
}

.action-btn {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  
  &.edit-btn {
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  }
  
  &.delete-btn {
    background: linear-gradient(135deg, #F56C6C 0%, #C03639 100%);
  }
  
  &:active {
    opacity: 0.8;
  }
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.medicine-item {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

.status-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  
  &.status-expired {
    background: linear-gradient(180deg, #F56C6C 0%, #C03639 100%);
  }
  
  &.status-expiry {
    background: linear-gradient(180deg, #E6A23C 0%, #CF7E1F 100%);
  }
  
  &.status-normal {
    background: linear-gradient(180deg, #67C23A 0%, #529B2E 100%);
  }
}

.item-content {
  padding: 28rpx 48rpx 28rpx 36rpx;
  position: relative;
}

.medicine-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.name-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-right: 16rpx;
}

.medicine-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #303133;
  line-height: 1.4;
}



.status-tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
  
  &.status-expired {
    background: linear-gradient(135deg, #F56C6C 0%, #C03639 100%);
    color: #FFFFFF;
    box-shadow: 0 4rpx 12rpx rgba(245, 108, 108, 0.3);
  }
  
  &.status-expiry {
    background: linear-gradient(135deg, #E6A23C 0%, #CF7E1F 100%);
    color: #FFFFFF;
    box-shadow: 0 4rpx 12rpx rgba(230, 162, 60, 0.3);
  }
  
  &.status-normal {
    background: linear-gradient(135deg, #67C23A 0%, #529B2E 100%);
    color: #FFFFFF;
    box-shadow: 0 4rpx 12rpx rgba(103, 194, 58, 0.3);
  }
}

.medicine-info {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.info-icon {
  font-size: 36rpx;
  width: 48rpx;
  text-align: center;
}

.info-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #F0F2F5;
}

.info-label {
  font-size: 26rpx;
  color: #909399;
}

.info-value {
  font-size: 28rpx;
  color: #303133;
  font-weight: 600;
  
  &.danger {
    color: #F56C6C;
  }
  
  &.warning {
    color: #E6A23C;
  }
  
  &.normal {
    color: #67C23A;
  }
  
  &.price {
    color: #E74C3C;
    font-weight: 700;
  }
}

.item-arrow {
  position: absolute;
  right: 48rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 48rpx;
  color: #DCDFE6;
  font-weight: 300;
}

// 加载状态
.loading-state {
  padding: 200rpx 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.loading-icon {
  font-size: 120rpx;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #909399;
}

.empty-state {
  padding: 200rpx 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.empty-icon {
  font-size: 160rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  color: #606266;
  font-weight: 600;
}

.empty-hint {
  font-size: 26rpx;
  color: #909399;
  text-align: center;
  padding: 0 40rpx;
}

.empty-action {
  margin-top: 32rpx;
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  
  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

.empty-action-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.load-more {
  padding: 40rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #909399;
}

.no-more {
  padding: 40rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #C0C4CC;
  
  &::before,
  &::after {
    content: '—';
    margin: 0 16rpx;
  }
}

// 筛选弹窗
.filter-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.filter-content {
  width: 100%;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 80vh;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #EBEEF5;
}

.filter-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
}

.filter-close {
  font-size: 40rpx;
  color: #909399;
}

.filter-body {
  padding: 24rpx;
}

.filter-section {
  margin-bottom: 32rpx;
}

.filter-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16rpx;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.filter-option {
  padding: 16rpx 32rpx;
  background: #F5F7FA;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #606266;
  
  &.active {
    background: #409EFF;
    color: #FFFFFF;
  }
}

.filter-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  border-top: 1rpx solid #EBEEF5;
}

.filter-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  
  &.reset {
    background: #F5F7FA;
    color: #606266;
  }
  
  &.confirm {
    background: #409EFF;
    color: #FFFFFF;
  }
}

// ==================== 深色模式样式 ====================
.dark-mode {
  background: #1a1a2e !important;

  // 搜索栏
  .search-bar {
    background: #16213e;

    .search-input-wrapper {
      background: #1a1a2e;
      border-color: #2d2d44;
    }

    .search-input {
      color: #ffffff;
    }

    .search-icon-left,
    .clear-icon {
      color: #8e8e9a;
    }
  }

  // 统计栏
  .stats-bar {
    background: #16213e;

    .stat-label {
      color: #8e8e9a;
    }

    .stat-divider {
      background: #2d2d44;
    }
  }

  // 筛选栏
  .filter-bar {
    background: #1a1a2e;
    border-color: #2d2d44;
  }

  .filter-chip {
    background: #16213e;
    border-color: #2d2d44;

    .chip-text {
      color: #c0c0c0;
    }

    &.active {
      background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
      border-color: transparent;

      .chip-text {
        color: #ffffff;
      }
    }
  }

  // 加载状态
  .loading-state,
  .empty-state {
    .loading-text,
    .empty-text,
    .empty-hint {
      color: #8e8e9a;
    }
  }

  // 药品卡片
  .medicine-item {
    background: #16213e;

    .medicine-name {
      color: #ffffff;
    }

    .medicine-spec,
    .batch-info,
    .stock-label {
      color: #8e8e9a;
    }

    // 信息项 - 生产日期、有效期等
    .info-item {
      .info-label {
        color: #8e8e9a;
      }

      .info-value {
        color: #ffffff !important;
        
        &.danger {
          color: #FF6B6B !important;
        }
        
        &.warning {
          color: #FFA726 !important;
        }
        
        &.normal {
          color: #67C23A !important;
        }
        
        &.price {
          color: #FF6B6B !important;
        }
      }
    }

    // 库存数量
    .stock-value {
      color: #34c9eb;
    }

    .expiry-text {
      color: #c0c0c0;
    }
    
    // 箭头
    .item-arrow {
      color: #8e8e9a;
    }
  }

  // 滑动操作按钮
  .swipe-actions {
    .action-btn {
      &.edit-btn {
        background: #2d5a8a;
      }

      &.delete-btn {
        background: #8b3a3a;
      }
    }
  }

  // 弹窗
  .popup-content {
    background: #16213e;

    .popup-title {
      color: #ffffff;
      border-color: #2d2d44;
    }

    .popup-item {
      border-color: #2d2d44;

      .item-label {
        color: #8e8e9a;
      }

      .item-value {
        color: #ffffff;
      }
    }
  }

  // 删除确认弹窗
  .delete-popup {
    .popup-content {
      background: #16213e;

      .popup-message {
        color: #c0c0c0;
      }
    }
  }
}

</style>

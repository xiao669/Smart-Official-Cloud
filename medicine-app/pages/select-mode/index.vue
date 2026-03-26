<template>
  <view class="select-mode-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
    </view>
    
    <view class="content-container">
      <!-- 顶部标题 -->
      <view class="header-section">
        <text class="main-title">选择使用场景</text>
        <text class="sub-title">智管云支持多种管理场景，请选择您的使用需求</text>
      </view>
      
      <!-- 场景卡片列表 -->
      <scroll-view class="mode-list" scroll-y>
        <view 
          v-for="mode in modeList" 
          :key="mode.id"
          class="mode-card"
          :class="{ selected: selectedMode === mode.id }"
          @click="selectMode(mode.id)"
        >
          <view class="mode-icon-wrap">
            <text class="mode-icon">{{ mode.icon }}</text>
          </view>
          <view class="mode-info">
            <text class="mode-name">{{ mode.name }}</text>
            <text class="mode-desc">{{ mode.description }}</text>
            <view class="mode-features">
              <text 
                v-for="(feature, index) in mode.features" 
                :key="index"
                class="feature-tag"
              >
                {{ feature }}
              </text>
            </view>
          </view>
          <view class="mode-check">
            <text class="check-icon">{{ selectedMode === mode.id ? '✓' : '' }}</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 底部按钮 -->
      <view class="footer-actions">
        <button class="confirm-btn" :disabled="!selectedMode" @click="confirmMode">
          <text class="btn-text">确认进入</text>
        </button>
        <text class="skip-text" @click="skipSelection">暂时跳过，稍后设置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authApi } from '../../src/api/auth'
import { getCurrentModeConfig } from '../../src/config/mode-config'

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

// 使用场景列表（只保留3个场景）
const modeList = ref([
  {
    id: 'medicine',
    name: '药品管理',
    icon: '💊',
    description: '专业的药品库存管理系统',
    features: ['药品入库', '效期预警', '智能提醒', '用药记录']
  },
  {
    id: 'inventory',
    name: '库存管理',
    icon: '📦',
    description: '通用商品库存管理系统',
    features: ['商品入库', '库存盘点', '出入库记录', '数据统计']
  },
  {
    id: 'food',
    name: '食品管理',
    icon: '🍱',
    description: '食品安全与保质期管理',
    features: ['食品入库', '保质期提醒', '批次追溯', '安全管理']
  }
])

const selectedMode = ref('')

// 选择场景
function selectMode(modeId: string) {
  selectedMode.value = modeId
}

// 确认进入
async function confirmMode() {
  if (!selectedMode.value) {
    uni.showToast({ title: '请选择使用场景', icon: 'none' })
    return
  }
  
  // 获取旧场景
  const oldMode = uni.getStorageSync('app_mode')
  
  try {
    // 调用API更新用户的使用场景
    await authApi.updateUserMode(selectedMode.value)
    
    // 保存用户选择的场景到本地存储
    uni.setStorageSync('app_mode', selectedMode.value)
    
    // 立即更新 tabBar 文字
    updateTabBarText()
    
    // 显示提示
    const modeName = modeList.value.find(m => m.id === selectedMode.value)?.name || ''
    uni.showToast({ 
      title: `已切换到${modeName}模式`, 
      icon: 'success',
      duration: 1500
    })
    
    // 判断是首次选择还是切换场景
    setTimeout(() => {
      if (oldMode) {
        // 切换场景，使用reLaunch重新加载首页
        uni.reLaunch({ 
          url: '/pages/index/index',
          success: () => {
            // 触发全局刷新事件
            uni.$emit('modeChanged')
          }
        })
      } else {
        // 首次选择，跳转到首页
        uni.switchTab({ url: '/pages/index/index' })
      }
    }, 1500)
  } catch (error) {
    console.error('切换场景失败:', error)
    uni.showToast({ 
      title: '切换场景失败，请重试', 
      icon: 'none' 
    })
  }
}

// 跳过选择
async function skipSelection() {
  uni.showModal({
    title: '提示',
    content: '跳过后将默认使用药品管理模式，您可以稍后在设置中更改',
    confirmText: '确定跳过',
    cancelText: '返回选择',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用API设置为药品管理模式
          await authApi.updateUserMode('medicine')
          
          // 默认使用药品管理模式
          uni.setStorageSync('app_mode', 'medicine')
          
          // 更新 tabBar 文字
          updateTabBarText()
          
          uni.switchTab({ url: '/pages/index/index' })
        } catch (error) {
          console.error('设置默认场景失败:', error)
          // 即使API失败，也允许继续使用
          uni.setStorageSync('app_mode', 'medicine')
          updateTabBarText()
          uni.switchTab({ url: '/pages/index/index' })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.select-mode-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  overflow: hidden;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 400rpx;
  height: 400rpx;
  top: -150rpx;
  right: -100rpx;
}

.circle-2 {
  width: 300rpx;
  height: 300rpx;
  bottom: -100rpx;
  left: -80rpx;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30rpx) rotate(180deg); }
}

.content-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 80rpx 40rpx 40rpx;
}

// 顶部标题
.header-section {
  text-align: center;
  margin-bottom: 48rpx;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.main-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.sub-title {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

// 场景列表
.mode-list {
  flex: 1;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.mode-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 3rpx solid transparent;
  
  &.selected {
    border-color: #0e7490;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    box-shadow: 0 12rpx 32rpx rgba(14, 116, 144, 0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.mode-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.mode-icon {
  font-size: 56rpx;
}

.mode-info {
  flex: 1;
}

.mode-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8rpx;
}

.mode-desc {
  display: block;
  font-size: 26rpx;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.mode-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.feature-tag {
  padding: 8rpx 16rpx;
  background: #F5F7FA;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #909399;
}

.mode-check {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 3rpx solid #DCDFE6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  .mode-card.selected & {
    background: #0e7490;
    border-color: #0e7490;
  }
}

.check-icon {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: bold;
}

// 底部按钮
.footer-actions {
  padding-top: 32rpx;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.confirm-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%);
  border-radius: 16rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
  
  &[disabled] {
    opacity: 0.5;
  }
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #0e7490;
  letter-spacing: 2rpx;
}

.skip-text {
  display: block;
  text-align: center;
  margin-top: 24rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  padding: 16rpx;
}
</style>

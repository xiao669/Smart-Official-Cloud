<template>
  <view class="splash-container">
    <!-- 背景动画 -->
    <view class="bg-animation">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>
    
    <!-- 主内容 -->
    <view class="splash-content">
      <!-- Logo区域 -->
      <view class="logo-section">
        <view class="logo-wrapper" :class="{ 'animate': showLogo }">
          <view class="logo-icon">
            <!-- 智管云Logo图片 -->
            <image class="logo-image" src="/static/logo.png" mode="aspectFit" />
          </view>
        </view>
        
        <!-- App名称 -->
        <view class="app-name" :class="{ 'animate': showName }">
          <text class="name-text">智管云</text>
        </view>
        
        <!-- 副标题 -->
        <view class="app-slogan" :class="{ 'animate': showSlogan }">
          <text class="slogan-text">智能{{ modeName }} · 安全高效</text>
        </view>
      </view>
      
      <!-- 加载动画 -->
      <view class="loading-section" :class="{ 'animate': showLoading }">
        <view class="loading-dots">
          <view class="dot dot-1"></view>
          <view class="dot dot-2"></view>
          <view class="dot dot-3"></view>
        </view>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
    </view>
    
    <!-- 底部信息 -->
    <view class="footer-section" :class="{ 'animate': showFooter }">
      <text class="version">{{ versionText }}</text>
      <text class="copyright">© 2026 {{ modeName }}系统</text>
      <text class="disclaimer">{{ disclaimer }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMode } from '../../src/composables/useMode'
import { AppConfig } from '../../src/config/app-config'

// 使用场景配置
const { modeName } = useMode()

// 使用全局配置
const versionText = AppConfig.getVersionText()
const disclaimer = AppConfig.disclaimer

const showLogo = ref(false)
const showName = ref(false)
const showSlogan = ref(false)
const showLoading = ref(false)
const showFooter = ref(false)
const loadingText = ref('正在启动...')
let hasNavigated = false // 防止重复跳转

// 检查登录状态
function checkLoginStatus(): boolean {
  try {
    const token = uni.getStorageSync('token')
    return !!token
  } catch (e) {
    return false
  }
}

// 跳转到主页或登录页
function navigateToMain() {
  // 防止重复跳转
  if (hasNavigated) return
  hasNavigated = true
  
  const isLoggedIn = checkLoginStatus()
  
  if (isLoggedIn) {
    // 已登录，跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    })
  } else {
    // 未登录，跳转到登录页
    uni.redirectTo({
      url: '/pages/login/index'
    })
  }
}

onMounted(() => {
  // 动画序列
  setTimeout(() => {
    showLogo.value = true
  }, 100)
  
  setTimeout(() => {
    showName.value = true
  }, 400)
  
  setTimeout(() => {
    showSlogan.value = true
  }, 700)
  
  setTimeout(() => {
    showLoading.value = true
  }, 1000)
  
  setTimeout(() => {
    showFooter.value = true
  }, 1200)
  
  // 更新加载文字
  setTimeout(() => {
    loadingText.value = '正在初始化...'
  }, 1500)
  
  setTimeout(() => {
    loadingText.value = '即将进入...'
  }, 2200)
  
  // 跳转 - 缩短到1.5秒，减少等待时间
  setTimeout(() => {
    navigateToMain()
  }, 1500)
})
</script>

<style lang="scss" scoped>
.splash-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

// 背景动画圆圈
.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 400rpx;
  height: 400rpx;
  top: -100rpx;
  right: -100rpx;
  animation-delay: 0s;
}

.circle-2 {
  width: 300rpx;
  height: 300rpx;
  bottom: 200rpx;
  left: -100rpx;
  animation-delay: 2s;
}

.circle-3 {
  width: 200rpx;
  height: 200rpx;
  bottom: -50rpx;
  right: 100rpx;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-30rpx) scale(1.1);
    opacity: 0.2;
  }
}

// 主内容
.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

// Logo区域
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-wrapper {
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: scale(0.5) translateY(50rpx);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &.animate {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.logo-icon {
  width: 140rpx;
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 智管云Logo图片
.logo-image {
  width: 140rpx;
  height: 140rpx;
}

// App名称
.app-name {
  margin-top: 40rpx;
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.5s ease-out;
  
  &.animate {
    opacity: 1;
    transform: translateY(0);
  }
}

.name-text {
  font-size: 56rpx;
  font-weight: bold;
  color: #FFFFFF;
  letter-spacing: 8rpx;
  text-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

// 副标题
.app-slogan {
  margin-top: 20rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.5s ease-out;
  
  &.animate {
    opacity: 1;
    transform: translateY(0);
  }
}

.slogan-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 4rpx;
}

// 加载动画
.loading-section {
  margin-top: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transition: all 0.5s ease-out;
  
  &.animate {
    opacity: 1;
  }
}

.loading-dots {
  display: flex;
  gap: 16rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.2s;
}

.dot-3 {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

// 底部信息
.footer-section {
  position: absolute;
  bottom: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  opacity: 0;
  transition: all 0.5s ease-out;
  
  &.animate {
    opacity: 1;
  }
}

.version {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.copyright {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

.disclaimer {
  font-size: 20rpx;
  color: rgba(255, 200, 100, 0.8);
  margin-top: 12rpx;
}
</style>

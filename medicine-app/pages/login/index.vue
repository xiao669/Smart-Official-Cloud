<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>
    
    <view class="login-container">
      <!-- Logo区域 -->
      <view class="logo-section">
        <view class="logo-wrapper">
          <image class="logo-img" src="/static/logo.png" mode="aspectFit" />
        </view>
        <text class="app-title">智管云</text>
        <text class="app-subtitle">INTELLIGENT MANAGEMENT SYSTEM</text>
      </view>
      
      <!-- 登录表单 -->
      <view class="login-card">
        <view class="card-header">
          <text class="welcome-text">欢迎登录</text>
          <text class="welcome-desc">请选择登录方式</text>
        </view>
        
        <!-- 登录方式切换 -->
        <view class="login-tabs">
          <view 
            class="tab-item" 
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >
            <text>账号密码</text>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: loginType === 'sms' }"
            @click="loginType = 'sms'"
          >
            <text>验证码登录</text>
          </view>
        </view>
        
        <!-- 账号密码登录 -->
        <view v-if="loginType === 'password'" class="form-content">
          <view class="form-group">
            <view class="input-label">
              <text class="label-icon">👤</text>
              <text class="label-text">账号</text>
            </view>
            <view class="input-box" :class="{ focused: usernameFocused }">
              <input 
                class="input-field" 
                v-model="form.username" 
                placeholder="请输入用户名"
                placeholder-class="input-placeholder"
                @focus="usernameFocused = true"
                @blur="usernameFocused = false"
              />
            </view>
          </view>
          
          <view class="form-group">
            <view class="input-label">
              <text class="label-icon">🔒</text>
              <text class="label-text">密码</text>
            </view>
            <view class="input-box" :class="{ focused: passwordFocused }">
              <input 
                class="input-field" 
                v-model="form.password" 
                type="password"
                placeholder="请输入密码"
                placeholder-class="input-placeholder"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
              />
            </view>
          </view>
          
          <!-- 同意条款 -->
          <view class="agreement-wrap">
            <view class="agreement-checkbox" :class="{ checked: agreeTerms }" @click="agreeTerms = !agreeTerms">
              <text v-if="agreeTerms" class="check-icon">✓</text>
            </view>
            <view class="agreement-text">
              <text>我已阅读并同意</text>
              <text class="link" @click.stop="openDisclaimer">《免责声明》</text>
              <text>和</text>
              <text class="link" @click.stop="openAbout">《使用条款》</text>
            </view>
          </view>
          
          <button class="login-button" @click="handleLogin" :loading="loading" :disabled="loading">
            <text class="btn-text">{{ loading ? '登录中...' : '立即登录' }}</text>
          </button>
        </view>
        
        <!-- 短信验证码登录 -->
        <view v-if="loginType === 'sms'" class="form-content">
          <view class="form-group">
            <view class="input-label">
              <text class="label-icon">📱</text>
              <text class="label-text">手机号</text>
            </view>
            <view class="input-box" :class="{ focused: phoneFocused }">
              <input 
                class="input-field" 
                v-model="smsForm.phone" 
                type="number"
                placeholder="请输入手机号"
                placeholder-class="input-placeholder"
                maxlength="11"
                @focus="phoneFocused = true"
                @blur="phoneFocused = false"
              />
            </view>
          </view>
          
          <view class="form-group">
            <view class="input-label">
              <text class="label-icon">🔢</text>
              <text class="label-text">验证码</text>
            </view>
            <view class="code-input-wrap">
              <view class="input-box code-input" :class="{ focused: codeFocused }">
                <input 
                  class="input-field" 
                  v-model="smsForm.code" 
                  type="number"
                  placeholder="请输入验证码"
                  placeholder-class="input-placeholder"
                  maxlength="6"
                  @focus="codeFocused = true"
                  @blur="codeFocused = false"
                />
              </view>
              <button 
                class="send-code-btn" 
                :disabled="countdown > 0 || sendingCode"
                @click="sendCode"
              >
                <text class="send-code-text">{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
              </button>
            </view>
          </view>
          
          <!-- 开发模式验证码提示 -->
          <view v-if="devCode" class="dev-code-tip">
            <text class="dev-code-label">测试验证码：</text>
            <text class="dev-code-value">{{ devCode }}</text>
          </view>
          
          <!-- 同意条款 -->
          <view class="agreement-wrap">
            <view class="agreement-checkbox" :class="{ checked: agreeTerms }" @click="agreeTerms = !agreeTerms">
              <text v-if="agreeTerms" class="check-icon">✓</text>
            </view>
            <view class="agreement-text">
              <text>我已阅读并同意</text>
              <text class="link" @click.stop="openDisclaimer">《免责声明》</text>
              <text>和</text>
              <text class="link" @click.stop="openAbout">《使用条款》</text>
            </view>
          </view>
          
          <button class="login-button" @click="handleSmsLogin" :loading="loading" :disabled="loading">
            <text class="btn-text">{{ loading ? '登录中...' : '立即登录' }}</text>
          </button>
        </view>
      </view>
      
      <!-- 底部信息 -->
      <view class="footer-info">
        <view class="footer-links">
          <text class="link" @click="openAbout">关于我们</text>
          <text class="divider">|</text>
          <text class="link" @click="openDisclaimer">免责声明</text>
        </view>
        <text class="footer-text">智能提醒 · 安全管理 · 高效便捷</text>
      </view>
    </view>
    
    <!-- 关于我们弹窗 -->
    <view v-if="showAboutPopup" class="popup-mask" @click="closeAbout">
      <view class="popup-content about-popup" @click.stop>
        <view class="popup-header about-header">
          <image class="popup-logo-img" src="/static/logo.png" mode="aspectFit" />
          <text class="popup-title">智管云</text>
          <text class="popup-version">v6.0.2</text>
        </view>
        <view class="popup-body">
          <text class="popup-desc">智管云是一款专业的库存管理软件，支持药品管理、商品库存、食品管理等多种使用场景。</text>
          <view class="popup-features">
            <view class="feature-item">
              <text class="feature-icon">📦</text>
              <text class="feature-text">库存管理</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">🔔</text>
              <text class="feature-text">智能预警</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">📊</text>
              <text class="feature-text">数据报表</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">📱</text>
              <text class="feature-text">移动办公</text>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button class="popup-btn" @click="closeAbout">我知道了</button>
        </view>
      </view>
    </view>
    
    <!-- 免责声明弹窗 -->
    <view v-if="showDisclaimerPopup" class="popup-mask" @click="closeDisclaimer">
      <view class="popup-content disclaimer-popup" @click.stop>
        <view class="popup-header disclaimer-header">
          <text class="popup-icon">⚠️</text>
          <text class="popup-title">免责声明</text>
        </view>
        <view class="popup-body">
          <view class="disclaimer-list">
            <view class="disclaimer-item">
              <text class="item-icon">⚠️</text>
              <text class="item-text">本系统仅用于辅助库存管理，<text class="highlight">无任何收银交易功能</text></text>
            </view>
            <view class="disclaimer-item">
              <text class="item-icon">⚠️</text>
              <text class="item-text">本系统仅供个人学习研究使用，<text class="highlight">不可用于商业用途</text></text>
            </view>
            <view class="disclaimer-item">
              <text class="item-icon">⚠️</text>
              <text class="item-text">使用本系统产生的任何问题，开发者不承担任何责任</text>
            </view>
            <view class="disclaimer-item">
              <text class="item-icon">⚠️</text>
              <text class="item-text">库存管理涉及安全问题，请以实际库存为准</text>
            </view>
            <view class="disclaimer-item">
              <text class="item-icon">⚠️</text>
              <text class="item-text">请妥善保管您的账号密码，避免泄露</text>
            </view>
          </view>
          <text class="disclaimer-footer">使用本系统即表示您已阅读并同意以上声明</text>
        </view>
        <view class="popup-footer">
          <button class="popup-btn" @click="closeDisclaimer">我知道了</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../src/store/user'
import { authApi } from '../../src/api/auth'
import type { LoginRequest } from '../../src/types'

const userStore = useUserStore()

// 登录方式
const loginType = ref<'password' | 'sms'>('password')

// 弹窗状态
const showAboutPopup = ref(false)
const showDisclaimerPopup = ref(false)

// 打开关于我们弹窗
function openAbout() {
  showAboutPopup.value = true
}

// 关闭关于我们弹窗
function closeAbout() {
  showAboutPopup.value = false
}

// 打开免责声明弹窗
function openDisclaimer() {
  showDisclaimerPopup.value = true
}

// 关闭免责声明弹窗
function closeDisclaimer() {
  showDisclaimerPopup.value = false
}

// 同意条款
const agreeTerms = ref(false)

// 账号密码表单
const form = ref<LoginRequest>({
  username: '',
  password: ''
})
const loading = ref(false)
const usernameFocused = ref(false)
const passwordFocused = ref(false)

// 短信验证码表单
const smsForm = ref({
  phone: '',
  code: ''
})
const phoneFocused = ref(false)
const codeFocused = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const devCode = ref('')  // 开发模式显示验证码

// 账号密码表单验证
function validateForm(): boolean {
  if (!form.value.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return false
  }
  if (!form.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return false
  }
  if (!agreeTerms.value) {
    uni.showToast({ title: '请先阅读并同意免责声明和使用条款', icon: 'none' })
    return false
  }
  return true
}

// 短信表单验证
function validateSmsForm(): boolean {
  if (!smsForm.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(smsForm.value.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return false
  }
  if (!smsForm.value.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return false
  }
  if (!agreeTerms.value) {
    uni.showToast({ title: '请先阅读并同意免责声明和使用条款', icon: 'none' })
    return false
  }
  return true
}

// 账号密码登录
async function handleLogin() {
  if (!validateForm()) return
  
  loading.value = true
  try {
    await userStore.login(form.value)
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    // 检查用户是否已选择过使用场景
    const appMode = uni.getStorageSync('app_mode')
    
    setTimeout(() => {
      if (appMode) {
        // 已选择过场景，直接进入首页
        uni.switchTab({ url: '/pages/index/index' })
      } else {
        // 未选择场景，跳转到场景选择页面
        uni.navigateTo({ url: '/pages/select-mode/index' })
      }
    }, 1500)
  } catch (error: any) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 发送验证码
async function sendCode() {
  if (!smsForm.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!/^1[3-9]\d{9}$/.test(smsForm.value.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  
  sendingCode.value = true
  devCode.value = ''
  
  try {
    const res = await authApi.sendSmsCode(smsForm.value.phone)
    uni.showToast({ title: res.message || '验证码已发送', icon: 'none' })
    
    // 开发模式显示验证码
    if (res.code) {
      devCode.value = res.code
    }
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('发送验证码失败:', error)
  } finally {
    sendingCode.value = false
  }
}

// 短信验证码登录
async function handleSmsLogin() {
  if (!validateSmsForm()) return
  
  loading.value = true
  try {
    await userStore.smsLogin(smsForm.value.phone, smsForm.value.code)
    uni.showToast({ title: '登录成功', icon: 'success' })
    devCode.value = ''
    
    // 检查用户是否已选择过使用场景
    const appMode = uni.getStorageSync('app_mode')
    
    setTimeout(() => {
      if (appMode) {
        // 已选择过场景，直接进入首页
        uni.switchTab({ url: '/pages/index/index' })
      } else {
        // 未选择场景，跳转到场景选择页面
        uni.navigateTo({ url: '/pages/select-mode/index' })
      }
    }, 1500)
  } catch (error: any) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
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
  width: 300rpx;
  height: 300rpx;
  top: -100rpx;
  right: -50rpx;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  bottom: 100rpx;
  left: -50rpx;
}

.circle-3 {
  width: 150rpx;
  height: 150rpx;
  top: 50%;
  right: 50rpx;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30rpx) rotate(180deg); }
}

.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60rpx 40rpx;
}

// Logo区域
.logo-section {
  text-align: center;
  margin-bottom: 60rpx;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 32rpx;
}

.logo-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 32rpx;
}

.app-title {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.app-subtitle {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 4rpx;
}

// 登录卡片
.login-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  margin-bottom: 32rpx;
}

.welcome-text {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12rpx;
}

.welcome-desc {
  display: block;
  font-size: 26rpx;
  color: #909399;
}

// 登录方式切换
.login-tabs {
  display: flex;
  background: #F5F7FA;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 36rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 12rpx;
  transition: all 0.3s;
  
  text {
    font-size: 28rpx;
    color: #606266;
  }
  
  &.active {
    background: #FFFFFF;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    
    text {
      color: #0e7490;
      font-weight: 600;
    }
  }
}

// 表单内容
.form-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.form-group {
  margin-bottom: 36rpx;
}

.input-label {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.label-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.label-text {
  font-size: 28rpx;
  color: #606266;
  font-weight: 500;
}

.input-box {
  height: 96rpx;
  background: #F5F7FA;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  
  &.focused {
    background: #FFFFFF;
    border-color: #0e7490;
    box-shadow: 0 0 0 4rpx rgba(14, 116, 144, 0.1);
  }
}

.input-field {
  width: 100%;
  height: 100%;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #303133;
  background: transparent;
}

.input-placeholder {
  color: #C0C4CC;
}

// 验证码输入
.code-input-wrap {
  display: flex;
  gap: 20rpx;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  width: 200rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  border-radius: 16rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    border: none;
  }
  
  &[disabled] {
    opacity: 0.6;
  }
}

.send-code-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 500;
}

// 开发模式验证码提示
.dev-code-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: #FFF7E6;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #FFE4B5;
}

.dev-code-label {
  font-size: 26rpx;
  color: #E6A23C;
}

.dev-code-value {
  font-size: 32rpx;
  color: #E6A23C;
  font-weight: 700;
  margin-left: 12rpx;
  letter-spacing: 4rpx;
}

// 登录按钮
.login-button {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  border-radius: 16rpx;
  border: none;
  margin-top: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(14, 116, 144, 0.4);
  transition: all 0.3s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(14, 116, 144, 0.3);
  }
  
  &[disabled] {
    opacity: 0.6;
  }
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}

// 底部信息
.footer-info {
  text-align: center;
  margin-top: 48rpx;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
  
  .link {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .divider {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.5);
  }
}

.footer-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2rpx;
}

// 同意条款
.agreement-wrap {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
  margin-top: 8rpx;
}

.agreement-checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #DCDFE6;
  border-radius: 6rpx;
  margin-right: 12rpx;
  margin-top: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #fff;
  
  &.checked {
    background: #0e7490;
    border-color: #0e7490;
  }
  
  .check-icon {
    font-size: 24rpx;
    color: #fff;
    font-weight: bold;
  }
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #606266;
  line-height: 1.6;
  
  .link {
    color: #0e7490;
  }
}

// 弹窗遮罩
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

// 弹窗样式
.popup-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.popup-header {
  padding: 40rpx 32rpx;
  text-align: center;
}

.about-header {
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  
  .popup-logo-img {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    margin-bottom: 16rpx;
  }
  
  .popup-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }
  
  .popup-version {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.disclaimer-header {
  background: #FFF7E6;
  
  .popup-icon {
    display: block;
    font-size: 48rpx;
    margin-bottom: 12rpx;
  }
  
  .popup-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #E6A23C;
  }
}

.popup-body {
  padding: 32rpx;
}

.popup-desc {
  font-size: 28rpx;
  color: #606266;
  line-height: 1.8;
  display: block;
  margin-bottom: 24rpx;
}

.popup-features {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.feature-item {
  width: calc(50% - 12rpx);
  display: flex;
  align-items: center;
  gap: 12rpx;
  
  .feature-icon {
    font-size: 32rpx;
  }
  
  .feature-text {
    font-size: 26rpx;
    color: #606266;
  }
}

.disclaimer-list {
  margin-bottom: 24rpx;
}

.disclaimer-item {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx dashed #E4E7ED;
  
  &:last-child {
    border-bottom: none;
  }
  
  .item-icon {
    font-size: 28rpx;
    margin-right: 12rpx;
    flex-shrink: 0;
  }
  
  .item-text {
    font-size: 26rpx;
    color: #606266;
    line-height: 1.6;
    
    .highlight {
      color: #E6A23C;
      font-weight: 500;
    }
  }
}

.disclaimer-footer {
  font-size: 24rpx;
  color: #909399;
  text-align: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #E4E7ED;
  display: block;
}

.popup-footer {
  padding: 24rpx 32rpx 32rpx;
}

.popup-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
  
  &::after {
    border: none;
  }
}
</style>

<template>
  <view class="settings-page">
    <!-- 顶部渐变背景 -->
    <view class="header-bg">
      <view class="bg-pattern"></view>
    </view>
    
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-avatar-section">
        <view class="avatar-container">
          <view class="avatar-ring">
            <view class="avatar-inner">
              <text class="avatar-emoji">{{ getAvatarEmoji() }}</text>
            </view>
          </view>
          <view class="online-indicator"></view>
        </view>
        <view class="user-badge" :class="getUserTypeClass()">
          <text class="badge-icon">{{ getBadgeIcon() }}</text>
          <text class="badge-text">{{ getUserTypeBadge() }}</text>
        </view>
      </view>
      
      <view class="user-info-section">
        <text class="user-name">{{ userInfo?.username || '未登录' }}</text>
        <text class="user-realname">{{ userInfo?.realname || '欢迎使用智管云' }}</text>
        <view class="user-stats">
          <view class="stat-item">
            <text class="stat-value">{{ loginDays }}</text>
            <text class="stat-label">使用天数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ currentTime }}</text>
            <text class="stat-label">当前时间</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-features">
      <view class="feature-item" @click="showConfigDialog = true">
        <view class="feature-icon warning">
          <text>⚙️</text>
        </view>
        <text class="feature-text">预警设置</text>
      </view>
      <view class="feature-item" @click="showReplenishDialog = true">
        <view class="feature-icon primary">
          <text>📦</text>
        </view>
        <text class="feature-text">补货建议</text>
      </view>
      <view class="feature-item" @click="goToWarnings">
        <view class="feature-icon danger">
          <text>🔔</text>
        </view>
        <text class="feature-text">预警中心</text>
      </view>
      <view class="feature-item" @click="refreshData">
        <view class="feature-icon success">
          <text>🔄</text>
        </view>
        <text class="feature-text">刷新数据</text>
      </view>
    </view>
    
    <!-- 账号设置 -->
    <view class="menu-section">
      <view class="section-header">
        <text class="section-title">账号设置</text>
      </view>
      
      <view class="menu-card">
        <view class="menu-item" @click="showEditUsernameDialog = true">
          <view class="menu-left">
            <view class="menu-icon-box purple">
              <text class="menu-icon">✏️</text>
            </view>
            <view class="menu-text">
              <text class="menu-title">修改用户名</text>
              <text class="menu-subtitle">当前：{{ userInfo?.username || '未设置' }}</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
        
        <view class="menu-item" @click="showEditRealnameDialog = true">
          <view class="menu-left">
            <view class="menu-icon-box blue">
              <text class="menu-icon">👤</text>
            </view>
            <view class="menu-text">
              <text class="menu-title">修改真实姓名</text>
              <text class="menu-subtitle">当前：{{ userInfo?.realname || '未设置' }}</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 设置菜单 -->
    <view class="menu-section">
      <view class="section-header">
        <text class="section-title">系统设置</text>
      </view>
      
      <view class="menu-card">
        <view class="menu-item" @click="goToSelectMode">
          <view class="menu-left">
            <view class="menu-icon-box gradient">
              <text class="menu-icon">{{ currentModeIcon }}</text>
            </view>
            <view class="menu-text">
              <text class="menu-title">使用场景</text>
              <text class="menu-subtitle">当前：{{ currentModeName }}</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-value">切换</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
        
        <view class="menu-item" @click="showConfigDialog = true">
          <view class="menu-left">
            <view class="menu-icon-box orange">
              <text class="menu-icon">⏰</text>
            </view>
            <view class="menu-text">
              <text class="menu-title">预警配置</text>
              <text class="menu-subtitle">临期{{ config.expiry_warning_days }}天 · 库存{{ config.low_stock_threshold }}件</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
        
        <view class="menu-item" @click="clearCache">
          <view class="menu-left">
            <view class="menu-icon-box blue">
              <text class="menu-icon">🗑️</text>
            </view>
            <view class="menu-text">
              <text class="menu-title">清除缓存</text>
              <text class="menu-subtitle">清理本地缓存数据</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 关于应用 -->
    <view class="menu-section">
      <view class="section-header">
        <text class="section-title">关于应用</text>
      </view>
      
      <view class="menu-card">
        <view class="menu-item">
          <view class="menu-left">
            <view class="menu-icon-box purple">
              <text class="menu-icon">💊</text>
            </view>
            <view class="menu-text">
              <text class="menu-title">智管云</text>
              <text class="menu-subtitle">智能库存管理系统</text>
            </view>
          </view>
          <view class="menu-right">
            <view class="version-tag">{{ AppConfig.getVersionText() }}</view>
          </view>
        </view>
        
        <view class="menu-item" @click="showAbout">
          <view class="menu-left">
            <view class="menu-icon-box green">
              <text class="menu-icon">ℹ️</text>
            </view>
            <view class="menu-text">
              <text class="menu-title">关于我们</text>
              <text class="menu-subtitle">了解更多信息</text>
            </view>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">
       
        <text class="logout-text">退出登录</text>
      </button>
      <text class="logout-hint">退出后需要重新登录</text>
    </view>
    
    <!-- 底部版权 -->
    <view class="footer">
      <text class="footer-text">© 2026 智管云</text>
      <text class="footer-sub">Made with ❤️</text>
      <text class="footer-disclaimer">本助手仅辅助管理，无收银功能，不可商用</text>
    </view>
        <!-- 底部安全区域 -->
    <!-- <view class="safe-bottom"></view> -->

    <!-- 预警配置弹窗 -->
    <view v-if="showConfigDialog" class="dialog-overlay" @click="showConfigDialog = false">
      <view class="dialog-container" @click.stop>
        <view class="dialog-header">
          <view class="dialog-title-wrap">
            <text class="dialog-icon">⚙️</text>
            <text class="dialog-title">预警配置</text>
          </view>
          <view class="dialog-close" @click="showConfigDialog = false">
            <text>✕</text>
          </view>
        </view>
        
        <view class="dialog-body">
          <view class="config-card">
            <view class="config-header">
              <text class="config-icon">⏰</text>
              <text class="config-title">临期预警天数</text>
            </view>
            <view class="config-input-wrap">
              <button class="config-btn minus" @click="adjustDays(-10)">-10</button>
              <view class="config-value-box">
                <input 
                  type="number" 
                  v-model.number="config.expiry_warning_days"
                  class="config-input"
                />
                <text class="config-unit">天</text>
              </view>
              <button class="config-btn plus" @click="adjustDays(10)">+10</button>
            </view>
            <text class="config-hint">药品有效期剩余天数低于此值时触发预警</text>
          </view>
          
          <view class="config-card">
            <view class="config-header">
              <text class="config-icon">📦</text>
              <text class="config-title">低库存阈值</text>
            </view>
            <view class="config-input-wrap">
              <button class="config-btn minus" @click="adjustStock(-5)">-5</button>
              <view class="config-value-box">
                <input 
                  type="number" 
                  v-model.number="config.low_stock_threshold"
                  class="config-input"
                />
                <text class="config-unit">件</text>
              </view>
              <button class="config-btn plus" @click="adjustStock(5)">+5</button>
            </view>
            <text class="config-hint">库存数量低于此值时触发低库存预警</text>
          </view>
          
          <view class="config-card">
            <view class="config-header">
              <text class="config-icon">🔔</text>
              <text class="config-title">提醒时间段</text>
            </view>
            <view class="time-range-row">
              <view class="time-select-item">
                <text class="time-label">开始</text>
                <picker 
                  mode="selector" 
                  :range="timeOptions" 
                  :value="getTimeIndex(config.reminder_start_time || '08:00')"
                  @change="onStartTimeChange"
                >
                  <view class="time-dropdown">
                    <text class="time-value">{{ config.reminder_start_time || '08:00' }}</text>
                    <text class="dropdown-icon">▼</text>
                  </view>
                </picker>
              </view>
              <text class="time-separator">至</text>
              <view class="time-select-item">
                <text class="time-label">结束</text>
                <picker 
                  mode="selector" 
                  :range="timeOptions" 
                  :value="getTimeIndex(config.reminder_end_time || '20:00')"
                  @change="onEndTimeChange"
                >
                  <view class="time-dropdown">
                    <text class="time-value">{{ config.reminder_end_time || '20:00' }}</text>
                    <text class="dropdown-icon">▼</text>
                  </view>
                </picker>
              </view>
            </view>
            <text class="config-hint">在此时间段内推送预警通知</text>
          </view>
        </view>
        
        <view class="dialog-footer">
          <button class="dialog-btn cancel" @click="showConfigDialog = false">取消</button>
          <button class="dialog-btn confirm" @click="saveConfig">
            <text class="btn-icon">✓</text>
            <text>保存设置</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 补货建议弹窗 -->
    <view v-if="showReplenishDialog" class="dialog-overlay" @click="showReplenishDialog = false">
      <view class="dialog-container replenish-dialog" @click.stop>
        <view class="dialog-header">
          <view class="dialog-title-wrap">
            <text class="dialog-icon">📦</text>
            <text class="dialog-title">补货建议</text>
          </view>
          <view class="dialog-close" @click="showReplenishDialog = false">
            <text>✕</text>
          </view>
        </view>
        
        <view class="dialog-body replenish-body">
          <view v-if="replenishLoading" class="replenish-loading">
            <text>分析中...</text>
          </view>
          
          <view v-else-if="replenishList.length === 0" class="replenish-empty">
            <text class="empty-icon">✅</text>
            <text class="empty-text">库存充足，暂无补货建议</text>
          </view>
          
          <view v-else class="replenish-list">
            <view 
              v-for="item in replenishList" 
              :key="item.id" 
              class="replenish-item"
              :class="{ urgent: item.is_urgent }"
            >
              <view class="replenish-header">
                <text class="replenish-name">{{ item.medicine_name }}</text>
                <view v-if="item.is_urgent" class="urgent-tag">紧急</view>
              </view>
              <view class="replenish-info">
                <view class="info-row">
                  <text class="info-label">当前库存</text>
                  <text class="info-value">{{ item.current_stock }} 件</text>
                </view>
                <view class="info-row">
                  <text class="info-label">日均消耗</text>
                  <text class="info-value">{{ item.avg_daily_consumption }} 件/天</text>
                </view>
                <view class="info-row">
                  <text class="info-label">预计断货</text>
                  <text class="info-value" :class="{ 'text-danger': item.days_until_stockout <= 7 }">
                    {{ item.days_until_stockout }} 天后
                  </text>
                </view>
                <view class="info-row highlight">
                  <text class="info-label">建议补货</text>
                  <text class="info-value text-primary">{{ item.suggested_quantity }} 件</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="dialog-footer">
          <button class="dialog-btn cancel" @click="showReplenishDialog = false">关闭</button>
          <button class="dialog-btn confirm" @click="calculateReplenish">
            <text class="btn-icon">🔄</text>
            <text>重新分析</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 修改用户名弹窗 -->
    <view v-if="showEditUsernameDialog" class="dialog-overlay" @click="showEditUsernameDialog = false">
      <view class="dialog-container edit-dialog" @click.stop>
        <view class="dialog-header">
          <view class="dialog-title-wrap">
            <text class="dialog-icon">✏️</text>
            <text class="dialog-title">修改用户名</text>
          </view>
          <view class="dialog-close" @click="showEditUsernameDialog = false">
            <text>✕</text>
          </view>
        </view>
        
        <view class="dialog-body edit-dialog-body">
          <view class="edit-tip-box">
            <text class="edit-tip-icon">💡</text>
            <text class="edit-tip-text">用户名用于账号密码登录，修改后请使用新用户名登录</text>
          </view>
          
          <view class="edit-form-group">
            <text class="edit-form-label">新用户名</text>
            <view class="edit-input-box">
              <input 
                class="edit-form-input" 
                v-model="newUsername" 
                placeholder="请输入新用户名"
                maxlength="20"
              />
            </view>
            <text class="edit-form-hint">支持字母、数字、下划线，3-20个字符</text>
          </view>
        </view>
        
        <view class="dialog-footer edit-dialog-footer">
          <button class="dialog-btn cancel" @click="showEditUsernameDialog = false">取消</button>
          <button class="dialog-btn confirm" @click="saveUsername" :disabled="savingUsername">
            <text>{{ savingUsername ? '保存中...' : '确认修改' }}</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 修改真实姓名弹窗 -->
    <view v-if="showEditRealnameDialog" class="dialog-overlay" @click="showEditRealnameDialog = false">
      <view class="dialog-container edit-dialog" @click.stop>
        <view class="dialog-header">
          <view class="dialog-title-wrap">
            <text class="dialog-icon">👤</text>
            <text class="dialog-title">修改真实姓名</text>
          </view>
          <view class="dialog-close" @click="showEditRealnameDialog = false">
            <text>✕</text>
          </view>
        </view>
        
        <view class="dialog-body edit-dialog-body">
          <view class="edit-form-group">
            <text class="edit-form-label">真实姓名</text>
            <view class="edit-input-box">
              <input 
                class="edit-form-input" 
                v-model="newRealname" 
                placeholder="请输入真实姓名"
                maxlength="20"
              />
            </view>
            <text class="edit-form-hint">可选填写，方便管理员识别</text>
          </view>
        </view>
        
        <view class="dialog-footer edit-dialog-footer">
          <button class="dialog-btn cancel" @click="showEditRealnameDialog = false">取消</button>
          <button class="dialog-btn confirm" @click="saveRealname" :disabled="savingRealname">
            <text>{{ savingRealname ? '保存中...' : '确认修改' }}</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../src/store/user'
import { warningApi } from '../../src/api/warning'
import { userApi } from '../../src/api/user'
import type { WarningConfig } from '../../src/types'
import { useMode } from '../../src/composables/useMode'
import { AppConfig } from '../../src/config/app-config'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 使用场景配置
const { modeName, modeIcon, refreshConfig } = useMode()
const currentModeName = computed(() => modeName.value)
const currentModeIcon = computed(() => modeIcon.value)

const showConfigDialog = ref(false)
const showReplenishDialog = ref(false)
const replenishLoading = ref(false)
const replenishList = ref<any[]>([])

// 修改用户名
const showEditUsernameDialog = ref(false)
const newUsername = ref('')
const savingUsername = ref(false)

// 修改真实姓名
const showEditRealnameDialog = ref(false)
const newRealname = ref('')
const savingRealname = ref(false)

const config = ref<WarningConfig>({
  expiry_warning_days: 90,
  low_stock_threshold: 10,
  reminder_start_time: '08:00',
  reminder_end_time: '20:00',
  reminder_enabled: true
})

// 时间选项（整点）
const timeOptions = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
]

// 获取时间在数组中的索引
function getTimeIndex(time: string): number {
  const index = timeOptions.indexOf(time)
  return index >= 0 ? index : 2 // 默认08:00
}

// 开始时间选择
function onStartTimeChange(e: any) {
  config.value.reminder_start_time = timeOptions[e.detail.value]
}

// 结束时间选择
function onEndTimeChange(e: any) {
  config.value.reminder_end_time = timeOptions[e.detail.value]
}

// 当前时间
const currentTime = ref('')

// 使用天数 - 基于首次使用日期计算
const loginDays = ref(1)

// 计算使用天数
function calculateLoginDays() {
  // 从本地存储获取首次使用日期
  let firstUseDate = uni.getStorageSync('firstUseDate')
  
  if (!firstUseDate) {
    // 首次使用，记录当前日期
    firstUseDate = new Date().toISOString().split('T')[0]
    uni.setStorageSync('firstUseDate', firstUseDate)
  }
  
  // 计算天数差
  const first = new Date(firstUseDate)
  const now = new Date()
  const diffTime = now.getTime() - first.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 包含当天
  
  loginDays.value = diffDays
}

// 更新时间
function updateTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

// 获取头像表情
function getAvatarEmoji() {
  const userType = userInfo.value?.user_type
  const emojis: Record<string, string> = {
    'admin': '👨‍💼',
    'manager': '👨‍🔬',
    'operator': '👨‍⚕️'
  }
  return emojis[userType || ''] || '👤'
}

// 获取用户类型徽章
function getUserTypeBadge() {
  const userType = userInfo.value?.user_type
  const badges: Record<string, string> = {
    'admin': '系统管理员',
    'manager': '仓库经理',
    'operator': '操作员'
  }
  return badges[userType || ''] || '普通用户'
}

// 获取用户类型样式
function getUserTypeClass() {
  const userType = userInfo.value?.user_type
  const classes: Record<string, string> = {
    'admin': 'badge-admin',
    'manager': 'badge-manager',
    'operator': 'badge-operator'
  }
  return classes[userType || ''] || 'badge-user'
}

// 获取徽章图标
function getBadgeIcon() {
  const userType = userInfo.value?.user_type
  const icons: Record<string, string> = {
    'admin': '👑',
    'manager': '⭐',
    'operator': '🔧'
  }
  return icons[userType || ''] || '👤'
}

// 加载配置
async function loadConfig() {
  try {
    const data = await warningApi.getConfig()
    config.value = data
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 调整天数
function adjustDays(delta: number) {
  const newValue = config.value.expiry_warning_days + delta
  if (newValue >= 1 && newValue <= 365) {
    config.value.expiry_warning_days = newValue
  }
}

// 调整库存阈值
function adjustStock(delta: number) {
  const newValue = config.value.low_stock_threshold + delta
  if (newValue >= 1 && newValue <= 1000) {
    config.value.low_stock_threshold = newValue
  }
}

// 保存配置
async function saveConfig() {
  try {
    await warningApi.updateConfig(config.value)
    uni.showToast({ title: '保存成功', icon: 'success' })
    showConfigDialog.value = false
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 跳转药品列表
function goToMedicineList() {
  uni.switchTab({ url: '/pages/medicine/list' })
}

// 跳转预警中心
function goToWarnings() {
  uni.switchTab({ url: '/pages/warning/index' })
}

// 跳转到场景选择页面
function goToSelectMode() {
  uni.navigateTo({ 
    url: '/pages/select-mode/index',
    success: () => {
      // 页面跳转成功
    }
  })
}

// 刷新数据
function refreshData() {
  uni.showLoading({ title: '刷新中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '数据已刷新', icon: 'success' })
    // 刷新场景配置
    refreshConfig()
  }, 1000)
}

// 清除缓存
function clearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除本地缓存吗？',
    success: (res) => {
      if (res.confirm) {
        // 保留主题设置
        const theme = uni.getStorageSync('theme')
        uni.clearStorageSync()
        if (theme) {
          uni.setStorageSync('theme', theme)
        }
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    }
  })
}

// 显示关于
function showAbout() {
  uni.showModal({
    title: '关于智管云',
    content: `版本：${AppConfig.getVersionText()}\n\n一款专业的智能库存管理应用，帮助您轻松管理库存、追踪有效期、及时预警。\n\n⚠️ 免责声明：\n${AppConfig.disclaimer}`,
    showCancel: false
  })
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmColor: '#F56C6C',
    success: (res: any) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

// 加载补货建议
async function loadReplenishSuggestions() {
  replenishLoading.value = true
  try {
    const data = await warningApi.getReplenishSuggestions()
    replenishList.value = data
  } catch (error) {
    console.error('加载补货建议失败:', error)
  } finally {
    replenishLoading.value = false
  }
}

// 计算补货建议
async function calculateReplenish() {
  replenishLoading.value = true
  try {
    const res = await warningApi.calculateReplenishSuggestions()
    replenishList.value = res.suggestions
    if (res.count > 0) {
      uni.showToast({ title: `发现 ${res.count} 条建议`, icon: 'none' })
    } else {
      uni.showToast({ title: '库存充足', icon: 'success' })
    }
  } catch (error) {
    console.error('计算补货建议失败:', error)
    uni.showToast({ title: '分析失败', icon: 'none' })
  } finally {
    replenishLoading.value = false
  }
}

// 打开补货建议弹窗时加载数据
watch(showReplenishDialog, (val) => {
  if (val) {
    loadReplenishSuggestions()
  }
})

// 打开修改用户名弹窗时初始化
watch(showEditUsernameDialog, (val) => {
  if (val) {
    newUsername.value = userInfo.value?.username || ''
  }
})

// 打开修改真实姓名弹窗时初始化
watch(showEditRealnameDialog, (val) => {
  if (val) {
    newRealname.value = userInfo.value?.realname || ''
  }
})

// 保存用户名
async function saveUsername() {
  if (!newUsername.value || newUsername.value.length < 3) {
    uni.showToast({ title: '用户名至少3个字符', icon: 'none' })
    return
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(newUsername.value)) {
    uni.showToast({ title: '用户名只能包含字母、数字、下划线', icon: 'none' })
    return
  }
  
  savingUsername.value = true
  try {
    await userApi.updateProfile({ username: newUsername.value })
    
    // 更新本地用户信息
    if (userStore.userInfo) {
      userStore.userInfo.username = newUsername.value
    }
    
    uni.showToast({ title: '用户名修改成功', icon: 'success' })
    showEditUsernameDialog.value = false
  } catch (error: any) {
    console.error('修改用户名失败:', error)
  } finally {
    savingUsername.value = false
  }
}

// 保存真实姓名
async function saveRealname() {
  savingRealname.value = true
  try {
    await userApi.updateProfile({ realname: newRealname.value || undefined })
    
    // 更新本地用户信息
    if (userStore.userInfo) {
      userStore.userInfo.realname = newRealname.value || null
    }
    
    uni.showToast({ title: '真实姓名修改成功', icon: 'success' })
    showEditRealnameDialog.value = false
  } catch (error: any) {
    console.error('修改真实姓名失败:', error)
  } finally {
    savingRealname.value = false
  }
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000)
  loadConfig()
  calculateLoginDays()
  
  // 监听场景切换事件
  uni.$on('modeChanged', () => {
    refreshConfig()
  })
})
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: #F5F7FA;
  padding-bottom: 120rpx;
}

// 顶部渐变背景
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  border-radius: 0 0 60rpx 60rpx;
  
  .bg-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    border-radius: 0 0 60rpx 60rpx;
  }
}

// 用户卡片
.user-card {
  position: relative;
  margin: 24rpx;
  margin-top: 48rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(14, 116, 144, 0.2);
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}

.avatar-container {
  position: relative;
}

.avatar-ring {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  padding: 6rpx;
  box-shadow: 0 12rpx 32rpx rgba(14, 116, 144, 0.3);
}

.avatar-inner {
  width: 100%;
  height: 100%;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-emoji {
  font-size: 72rpx;
}

.online-indicator {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 28rpx;
  height: 28rpx;
  background: #67C23A;
  border-radius: 50%;
  border: 4rpx solid #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(103, 194, 58, 0.4);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 16rpx;
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  
  &.badge-admin {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  }
  
  &.badge-manager {
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  }
  
  &.badge-operator {
    background: linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%);
  }
  
  &.badge-user {
    background: linear-gradient(135deg, #A8A8A8 0%, #888888 100%);
  }
}

.badge-icon {
  font-size: 24rpx;
}

.badge-text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.user-info-section {
  text-align: center;
}

.user-name {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #303133;
  margin-bottom: 8rpx;
}

.user-realname {
  display: block;
  font-size: 26rpx;
  color: #909399;
  margin-bottom: 24rpx;
}

.user-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F8F9FC;
  border-radius: 16rpx;
  padding: 20rpx 40rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #0e7490;
}

.stat-label {
  font-size: 22rpx;
  color: #909399;
  margin-top: 4rpx;
}

.stat-divider {
  width: 2rpx;
  height: 48rpx;
  background: #E4E7ED;
}

// 快捷功能
.quick-features {
  display: flex;
  justify-content: space-around;
  margin: 24rpx;
  padding: 32rpx 16rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.feature-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  transition: transform 0.3s;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.warning {
    background: linear-gradient(135deg, rgba(255, 167, 38, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%);
  }
  
  &.primary {
    background: linear-gradient(135deg, rgba(14, 116, 144, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%);
  }
  
  &.danger {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(238, 90, 90, 0.15) 100%);
  }
  
  &.success {
    background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(82, 155, 46, 0.15) 100%);
  }
}

.feature-text {
  font-size: 24rpx;
  color: #606266;
  font-weight: 500;
}

// 菜单区域
.menu-section {
  margin: 24rpx;
}

.section-header {
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.section-title {
  font-size: 28rpx;
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
    width: 6rpx;
    height: 28rpx;
    background: linear-gradient(180deg, #0e7490, #14b8a6);
    border-radius: 3rpx;
  }
}

.menu-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F5F7FA;
  transition: background 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #F8F9FC;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-icon-box {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.gradient {
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
    box-shadow: 0 4rpx 12rpx rgba(14, 116, 144, 0.3);
  }
  
  &.orange {
    background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
  }
  
  &.blue {
    background: linear-gradient(135deg, #42A5F5 0%, #2196F3 100%);
  }
  
  &.purple {
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  }
  
  &.green {
    background: linear-gradient(135deg, #67C23A 0%, #529B2E 100%);
  }
}

.menu-icon {
  font-size: 32rpx;
}

.menu-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.menu-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #303133;
}

.menu-subtitle {
  font-size: 24rpx;
  color: #909399;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.menu-value {
  font-size: 26rpx;
  color: #0e7490;
  font-weight: 600;
}

.menu-arrow {
  font-size: 40rpx;
  color: #C0C4CC;
  font-weight: 300;
}

.version-tag {
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 16rpx;
}

// 退出登录
.logout-section {
  margin: 48rpx 24rpx 24rpx;
  text-align: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  width: 100%;
  height: 100rpx;
  background: #FFFFFF;
  border: 2rpx solid #FFCDD2;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 108, 108, 0.1);
  transition: all 0.3s;
  
  &::after {
    border: none;
  }
  
  &:active {
    background: #FFF5F5;
    transform: scale(0.98);
  }
}

.logout-icon-wrap {
  width: 48rpx;
  height: 48rpx;
  background: rgba(245, 108, 108, 0.1);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-icon {
  font-size: 28rpx;
}

.logout-text {
  font-size: 30rpx;
  color: #F56C6C;
  font-weight: 600;
}

.logout-hint {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #C0C4CC;
}

// 底部版权
.footer {
  text-align: center;
  padding: 40rpx 0;
}

.footer-text {
  display: block;
  font-size: 24rpx;
  color: #C0C4CC;
}

.footer-sub {
  display: block;
  font-size: 22rpx;
  color: #DCDFE6;
  margin-top: 8rpx;
}

.footer-disclaimer {
  display: block;
  font-size: 20rpx;
  color: #E6A23C;
  margin-top: 16rpx;
  padding: 8rpx 24rpx;
  background: rgba(230, 162, 60, 0.1);
  border-radius: 8rpx;
}

.safe-bottom {
  height: env(safe-area-inset-bottom);
}

// 配置弹窗
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(4px);
}

.dialog-container {
  width: 640rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 32rpx 80rpx rgba(0, 0, 0, 0.2);
  animation: dialogIn 0.3s ease-out;
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
}

.dialog-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.dialog-icon {
  font-size: 36rpx;
}

.dialog-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.dialog-close {
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #FFFFFF;
}

.dialog-body {
  padding: 32rpx;
}

.config-card {
  background: #F8F9FC;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.config-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.config-icon {
  font-size: 32rpx;
}

.config-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
}

.config-input-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.config-btn {
  width: 80rpx;
  height: 72rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  padding: 0;
  
  &::after {
    border: none;
  }
  
  &.minus {
    background: #FEF0F0;
    color: #F56C6C;
  }
  
  &.plus {
    background: #E8F5E9;
    color: #67C23A;
  }
  
  &:active {
    opacity: 0.8;
  }
}

.config-value-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  height: 72rpx;
  border: 2rpx solid #E4E7ED;
}

.config-input {
  width: 100rpx;
  text-align: center;
  font-size: 36rpx;
  font-weight: 700;
  color: #0e7490;
}

.config-unit {
  font-size: 26rpx;
  color: #909399;
  margin-left: 8rpx;
}

.config-hint {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  color: #909399;
  text-align: center;
}

.dialog-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx 32rpx;
}

.dialog-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  
  &::after {
    border: none;
  }
  
  &.cancel {
    background: #F5F7FA;
    color: #606266;
  }
  
  &.confirm {
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
    color: #FFFFFF;
    box-shadow: 0 8rpx 24rpx rgba(14, 116, 144, 0.3);
  }
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.btn-icon {
  font-size: 28rpx;
}

// 时间下拉选择
.time-range-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.time-select-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.time-label {
  font-size: 24rpx;
  color: #909399;
}

.time-dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: #FFFFFF;
  border: 2rpx solid #E4E7ED;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  min-width: 160rpx;
}

.time-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #0e7490;
}

.dropdown-icon {
  font-size: 20rpx;
  color: #909399;
}

.time-separator {
  font-size: 28rpx;
  color: #909399;
  font-weight: 500;
  margin-top: 32rpx;
}

// 补货建议弹窗
.replenish-dialog {
  width: 680rpx;
  max-height: 80vh;
}

.replenish-body {
  max-height: 500rpx;
  overflow-y: auto;
}

.replenish-loading,
.replenish-empty {
  padding: 80rpx 0;
  text-align: center;
  color: #909399;
}

.replenish-empty .empty-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.replenish-empty .empty-text {
  font-size: 28rpx;
}

.replenish-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.replenish-item {
  background: #F8F9FC;
  border-radius: 16rpx;
  padding: 20rpx;
  border-left: 6rpx solid #0e7490;
  
  &.urgent {
    border-left-color: #F56C6C;
    background: #FEF0F0;
  }
}

.replenish-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.replenish-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #303133;
}

.urgent-tag {
  padding: 4rpx 16rpx;
  background: #F56C6C;
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 8rpx;
}

.replenish-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &.highlight {
    margin-top: 8rpx;
    padding-top: 12rpx;
    border-top: 1rpx dashed #E4E7ED;
  }
}

.info-label {
  font-size: 26rpx;
  color: #909399;
}

.info-value {
  font-size: 26rpx;
  color: #303133;
  font-weight: 500;
  
  &.text-danger {
    color: #F56C6C;
    font-weight: 700;
  }
  
  &.text-primary {
    color: #0e7490;
    font-weight: 700;
    font-size: 30rpx;
  }
}

// 编辑弹窗（修改用户名/真实姓名）
.edit-dialog {
  width: 620rpx;
}

.edit-dialog-body {
  padding: 40rpx 36rpx;
}

.edit-tip-box {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
  border-radius: 16rpx;
  margin-bottom: 36rpx;
  border: 1rpx solid #FFE082;
}

.edit-tip-icon {
  font-size: 36rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.edit-tip-text {
  font-size: 26rpx;
  color: #E65100;
  line-height: 1.6;
  font-weight: 500;
}

.edit-form-group {
  margin-bottom: 20rpx;
}

.edit-form-label {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #303133;
  margin-bottom: 20rpx;
}

.edit-input-box {
  background: #F5F7FA;
  border-radius: 20rpx;
  border: 2rpx solid #E4E7ED;
  overflow: hidden;
  transition: all 0.3s;
  
  &:focus-within {
    background: #FFFFFF;
    border-color: #0e7490;
    box-shadow: 0 4rpx 16rpx rgba(14, 116, 144, 0.15);
  }
}

.edit-form-input {
  width: 100%;
  height: 100rpx;
  padding: 0 28rpx;
  font-size: 32rpx;
  color: #303133;
  background: transparent;
}

.edit-form-hint {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #909399;
  padding-left: 4rpx;
}

.edit-dialog-footer {
  padding: 28rpx 36rpx 40rpx;
}

// 主题切换开关
.theme-switch {
  width: 100rpx;
  height: 56rpx;
  background: #E4E7ED;
  border-radius: 28rpx;
  position: relative;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
    
    .switch-thumb {
      transform: translateX(44rpx);
      background: #FFFFFF;
    }
  }
  
  .switch-thumb {
    position: absolute;
    left: 6rpx;
    top: 6rpx;
    width: 44rpx;
    height: 44rpx;
    background: #FFFFFF;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
}

.menu-icon-box {
  &.light {
    background: linear-gradient(135deg, #FFD54F 0%, #FFC107 100%);
  }
  
  &.dark {
    background: linear-gradient(135deg, #5C6BC0 0%, #3F51B5 100%);
  }
}

// ==================== 深色模式样式 ====================
.dark-mode {
  background: #1a1a2e !important;
  
  // 顶部背景
  .header-bg {
    background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
  }
  
  // 用户卡片
  .user-card {
    background: #16213e;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.4);
    
    .user-name {
      color: #FFFFFF;
    }
    
    .user-realname {
      color: #8e8e9a;
    }
    
    .user-stats {
      background: #1a1a2e;
    }
    
    .stat-label {
      color: #8e8e9a;
    }
    
    .stat-divider {
      background: #2d2d44;
    }
  }
  
  // 快捷功能
  .quick-features {
    background: #16213e;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
    
    .feature-text {
      color: #c0c0c0;
    }
  }
  
  // 菜单区域
  .section-title {
    color: #FFFFFF;
  }
  
  .menu-card {
    background: #16213e;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
  }
  
  .menu-item {
    border-bottom-color: #2d2d44;
    
    &:active {
      background: #1a1a2e;
    }
  }
  
  .menu-title {
    color: #FFFFFF;
  }
  
  .menu-subtitle {
    color: #8e8e9a;
  }
  
  .menu-arrow {
    color: #8e8e9a;
  }
  
  .version-tag {
    background: #2d2d44;
    color: #8e8e9a;
  }
  
  // 退出按钮
  .logout-btn {
    background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
  }
  
  .logout-hint {
    color: #8e8e9a;
  }
  
  // 底部
  .footer {
    .footer-text, .footer-sub, .footer-disclaimer {
      color: #8e8e9a;
    }
  }
  
  // 弹窗
  .dialog-container {
    background: #16213e;
    
    .dialog-header {
      border-bottom-color: #2d2d44;
    }
    
    .dialog-title {
      color: #FFFFFF;
    }
    
    .dialog-close {
      color: #8e8e9a;
    }
    
    .config-card {
      background: #1a1a2e;
      border-color: #2d2d44;
    }
    
    .config-title {
      color: #FFFFFF;
    }
    
    .config-hint {
      color: #8e8e9a;
    }
    
    .config-input {
      background: #16213e;
      color: #FFFFFF;
      border-color: #2d2d44;
    }
    
    .dialog-footer {
      border-top-color: #2d2d44;
    }
  }
}
</style>

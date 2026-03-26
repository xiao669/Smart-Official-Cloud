<template>
  <div class="login-page">
    <!-- 装饰背景 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>
    
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="logo-text">智管云</h1>
      </div>
      
      <!-- 登录卡片 -->
      <div class="login-card">
        <h2 class="welcome">欢迎回来</h2>
        <p class="subtitle">请选择登录方式</p>
        
        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <div 
            class="tab-item" 
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >
            账号密码登录
          </div>
          <div 
            class="tab-item" 
            :class="{ active: loginType === 'sms' }"
            @click="loginType = 'sms'"
          >
            短信验证码登录
          </div>
        </div>
        
        <!-- 账号密码登录 -->
        <el-form 
          v-if="loginType === 'password'"
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          class="login-form"
        >
          <div class="form-group">
            <label class="form-label">用户名</label>
            <el-input 
              v-model="form.username" 
              placeholder="请输入用户名"
              size="large"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <el-input 
              v-model="form.password" 
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            />
          </div>
          
          <!-- 同意条款 -->
          <div class="agreement-wrap">
            <el-checkbox v-model="agreeTerms">
              <span class="agreement-text">
                我已阅读并同意
                <span class="link" @click.stop="showDisclaimer = true">《免责声明》</span>
                和
                <span class="link" @click.stop="showAbout = true">《使用条款》</span>
              </span>
            </el-checkbox>
          </div>
          
          <el-button 
            type="primary" 
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form>
        
        <!-- 短信验证码登录 -->
        <el-form 
          v-if="loginType === 'sms'"
          ref="smsFormRef" 
          :model="smsForm" 
          :rules="smsRules" 
          class="login-form"
        >
          <div class="form-group">
            <label class="form-label">手机号</label>
            <el-input 
              v-model="smsForm.phone" 
              placeholder="请输入手机号"
              size="large"
              maxlength="11"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">验证码</label>
            <div class="code-input-wrap">
              <el-input 
                v-model="smsForm.code" 
                placeholder="请输入验证码"
                size="large"
                maxlength="6"
                @keyup.enter="handleSmsLogin"
              />
              <el-button 
                type="primary"
                size="large"
                :disabled="countdown > 0"
                :loading="sendingCode"
                class="send-code-btn"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </div>
          
          <!-- 验证码提示（开发模式） -->
          <div v-if="devCode" class="dev-code-tip">
            <el-alert 
              :title="`测试验证码: ${devCode}`" 
              type="warning" 
              :closable="false"
              show-icon
            />
          </div>
          
          <!-- 同意条款 -->
          <div class="agreement-wrap">
            <el-checkbox v-model="agreeTerms">
              <span class="agreement-text">
                我已阅读并同意
                <span class="link" @click.stop="showDisclaimer = true">《免责声明》</span>
                和
                <span class="link" @click.stop="showAbout = true">《使用条款》</span>
              </span>
            </el-checkbox>
          </div>
          
          <el-button 
            type="primary" 
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleSmsLogin"
          >
            登 录
          </el-button>
        </el-form>
      </div>
      
      <!-- 底部链接 -->
      <div class="footer-links">
        <span class="link" @click="showAbout = true">关于我们</span>
        <span class="divider">|</span>
        <span class="link" @click="showDisclaimer = true">免责声明</span>
      </div>
      
      <p class="copyright">© 2026 智管云</p>
    </div>
    
    <!-- 关于我们弹窗 -->
    <el-dialog v-model="showAbout" title="关于智管云" width="520px" class="about-dialog">
      <div class="about-content">
        <div class="about-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h2>智管云</h2>
          <p class="version">v6.0.2</p>
        </div>
        
        <div class="about-desc">
          <p><strong>智管云</strong> 是一款专业的库存管理软件，支持药品管理、商品库存、食品管理等多种使用场景。</p>
          <p>系统采用现代化技术架构，提供PC端网页版和手机App双平台支持，帮助您轻松管理库存信息、出入库、有效期预警等日常工作。</p>
        </div>
        
        <div class="about-features">
          <div class="feature">
            <span class="icon">📦</span>
            <span>库存管理</span>
          </div>
          <div class="feature">
            <span class="icon">🔔</span>
            <span>智能预警</span>
          </div>
          <div class="feature">
            <span class="icon">📊</span>
            <span>数据报表</span>
          </div>
          <div class="feature">
            <span class="icon">📱</span>
            <span>移动办公</span>
          </div>
        </div>
        
        <div class="about-contact">
          <p>📧 技术支持：support@zhiguanyun.com</p>
          <p>🌐 官方网站：www.zhiguanyun.com</p>
        </div>
      </div>
    </el-dialog>
    
    <!-- 免责声明弹窗 -->
    <el-dialog v-model="showDisclaimer" title="免责声明" width="520px" class="disclaimer-dialog">
      <div class="disclaimer-content">
        <div class="disclaimer-icon">⚠️</div>
        <div class="disclaimer-text">
          <h3>重要提示</h3>
          <ul>
            <li>本系统仅用于辅助库存管理，<strong>无任何收银交易功能</strong></li>
            <li>本系统仅供个人学习研究使用，<strong>不可用于商业用途</strong></li>
            <li>使用本系统产生的任何问题，开发者不承担任何责任</li>
            <li>库存管理涉及安全问题，请以实际库存为准</li>
            <li>请妥善保管您的账号密码，避免泄露</li>
          </ul>
          <p class="disclaimer-footer">使用本系统即表示您已阅读并同意以上声明</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 登录方式
const loginType = ref<'password' | 'sms'>('password')

// 弹窗状态
const showAbout = ref(false)
const showDisclaimer = ref(false)

// 同意条款
const agreeTerms = ref(false)

// 账号密码表单
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 短信验证码表单
const smsFormRef = ref<FormInstance>()
const sendingCode = ref(false)
const countdown = ref(0)
const devCode = ref('')  // 开发模式显示验证码
const smsForm = reactive({
  phone: '',
  code: ''
})
const smsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' }
  ]
}

// 账号密码登录
async function handleLogin() {
  if (!formRef.value) return
  
  // 检查是否同意条款
  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意免责声明和使用条款')
    return
  }
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await authStore.login(form.username, form.password)
      ElMessage.success('登录成功')
      const redirect = route.query.redirect as string || '/dashboard'
      router.push(redirect)
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}

// 发送验证码
async function sendCode() {
  if (!smsForm.phone || !/^1[3-9]\d{9}$/.test(smsForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  sendingCode.value = true
  devCode.value = ''
  
  try {
    const res = await authApi.sendSmsCode(smsForm.phone)
    ElMessage.success(res.message || '验证码已发送')
    
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
    ElMessage.error(error.response?.data?.message || '发送失败')
  } finally {
    sendingCode.value = false
  }
}

// 短信验证码登录
async function handleSmsLogin() {
  if (!smsFormRef.value) return
  
  // 检查是否同意条款
  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意免责声明和使用条款')
    return
  }
  
  await smsFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await authStore.smsLogin(smsForm.phone, smsForm.code)
      ElMessage.success('登录成功')
      devCode.value = ''
      const redirect = route.query.redirect as string || '/dashboard'
      router.push(redirect)
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #34c9eb 0%, #1ab5d8 100%);
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  
  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .circle-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -100px;
  }
  
  .circle-2 {
    width: 300px;
    height: 300px;
    bottom: -80px;
    left: -80px;
  }
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  
  .logo-icon {
    width: 48px;
    height: 48px;
    color: #fff;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  .logo-text {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 2px;
  }
}

.login-card {
  width: 420px;
  padding: 48px 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.welcome {
  font-size: 26px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #8e8e9a;
  margin-bottom: 24px;
}

// 登录方式切换
.login-tabs {
  display: flex;
  background: #f5f7fa;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 28px;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s;
    
    &.active {
      background: #fff;
      color: #34c9eb;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    &:hover:not(.active) {
      color: #34c9eb;
    }
  }
}

.login-form {
  .form-group {
    margin-bottom: 24px;
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #1a1a2e;
    margin-bottom: 8px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 0 0 1px #e4e4e7;
    padding: 4px 16px;
    
    &:hover {
      box-shadow: 0 0 0 1px #34c9eb;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 2px rgba(52, 201, 235, 0.2), 0 0 0 1px #34c9eb;
    }
  }
  
  :deep(.el-input__inner) {
    height: 44px;
  }
}

// 验证码输入
.code-input-wrap {
  display: flex;
  gap: 12px;
  
  .el-input {
    flex: 1;
  }
  
  .send-code-btn {
    width: 120px;
    border-radius: 10px;
  }
}

// 开发模式验证码提示
.dev-code-tip {
  margin-bottom: 16px;
  
  :deep(.el-alert) {
    border-radius: 8px;
  }
}

// 同意条款
.agreement-wrap {
  margin-bottom: 16px;
  
  :deep(.el-checkbox) {
    align-items: flex-start;
    
    .el-checkbox__input {
      margin-top: 3px;
    }
    
    .el-checkbox__label {
      white-space: normal;
      line-height: 1.5;
    }
  }
  
  .agreement-text {
    font-size: 13px;
    color: #606266;
    
    .link {
      color: #34c9eb;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.login-btn {
  width: 100%;
  height: 50px;
  margin-top: 8px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #34c9eb 0%, #1ab5d8 100%);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(52, 201, 235, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.copyright {
  margin-top: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

// 底部链接
.footer-links {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  
  .link {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
  
  .divider {
    color: rgba(255, 255, 255, 0.4);
  }
}

// 关于我们弹窗
.about-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2f5;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.about-content {
  text-align: center;
  
  .about-logo {
    padding: 32px 24px;
    background: linear-gradient(135deg, #34c9eb 0%, #1ab5d8 100%);
    
    .logo-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 12px;
      color: #fff;
      
      svg {
        width: 100%;
        height: 100%;
      }
    }
    
    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
    }
    
    .version {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
    }
  }
  
  .about-desc {
    padding: 24px;
    text-align: left;
    
    p {
      font-size: 14px;
      line-height: 1.8;
      color: #606266;
      margin: 0 0 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .about-features {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 0 24px 24px;
    
    .feature {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      
      .icon {
        font-size: 28px;
      }
      
      span:last-child {
        font-size: 13px;
        color: #606266;
      }
    }
  }
  
  .about-contact {
    padding: 20px 24px;
    background: #f8f9fc;
    text-align: left;
    
    p {
      font-size: 14px;
      color: #606266;
      margin: 0 0 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 免责声明弹窗
.disclaimer-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2f5;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.disclaimer-content {
  display: flex;
  gap: 20px;
  
  .disclaimer-icon {
    font-size: 48px;
    flex-shrink: 0;
  }
  
  .disclaimer-text {
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #e6a23c;
      margin: 0 0 16px;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
      
      li {
        font-size: 14px;
        color: #606266;
        padding: 8px 0;
        border-bottom: 1px dashed #e4e7ed;
        
        &:last-child {
          border-bottom: none;
        }
        
        &::before {
          content: '⚠️';
          margin-right: 8px;
        }
        
        strong {
          color: #e6a23c;
        }
      }
    }
    
    .disclaimer-footer {
      font-size: 13px;
      color: #909399;
      margin: 0;
      padding-top: 12px;
      border-top: 1px solid #e4e7ed;
    }
  }
}
</style>

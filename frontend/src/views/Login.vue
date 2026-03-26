<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-pattern"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    
    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"/>
              <path d="M12 8V16M8 12H16" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="logo-text">智管云</span>
        </div>
        
        <h1 class="brand-headline">
          <span class="highlight">智能</span>库存管理<br>让工作更<span class="highlight">高效</span>
        </h1>
        
        <p class="brand-desc">
          新一代企业级库存管理平台，支持药品、商品、食品等多场景管理<br>
          数据驱动，智能预警，助力企业降本增效
        </p>
        
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">📦</span>
            <span class="feature-text">智能库存</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔔</span>
            <span class="feature-text">效期预警</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span class="feature-text">数据分析</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📱</span>
            <span class="feature-text">多端同步</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧登录区域 -->
    <div class="login-section">
      <div class="login-card">
        <div class="login-header">
          <div class="login-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">登录您的账号以继续</p>
        </div>
        
        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <div 
            class="tab-item" 
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >账号密码</div>
          <div 
            class="tab-item" 
            :class="{ active: loginType === 'sms' }"
            @click="loginType = 'sms'"
          >短信验证码</div>
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
          
          <div class="agreement-wrap">
            <input type="checkbox" v-model="agreeTerms" class="agreement-checkbox" id="agree">
            <label class="agreement-text" for="agree">
              我已阅读并同意 
              <span class="link" @click.prevent="showDisclaimer = true">《免责声明》</span> 
              和 
              <span class="link" @click.prevent="showAbout = true">《使用条款》</span>
            </label>
          </div>
          
          <button type="button" class="login-btn" :disabled="loading" @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </button>
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
              <button 
                type="button"
                class="send-code-btn"
                :disabled="countdown > 0 || sendingCode"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>
          
          <div v-if="devCode" class="dev-code-tip">
            测试验证码: {{ devCode }}
          </div>
          
          <div class="agreement-wrap">
            <input type="checkbox" v-model="agreeTerms" class="agreement-checkbox" id="agree2">
            <label class="agreement-text" for="agree2">
              我已阅读并同意 
              <span class="link" @click.prevent="showDisclaimer = true">《免责声明》</span> 
              和 
              <span class="link" @click.prevent="showAbout = true">《使用条款》</span>
            </label>
          </div>
          
          <button type="button" class="login-btn" :disabled="loading" @click="handleSmsLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </el-form>
        
        <div class="login-footer">
          <a href="javascript:;" @click="showAbout = true">关于我们</a>
          <a href="javascript:;" @click="showDisclaimer = true">免责声明</a>
        </div>
      </div>
    </div>
    
    <p class="copyright">© 2026 智管云 · 专业库存管理平台</p>
    
    <!-- 关于我们弹窗 -->
    <el-dialog v-model="showAbout" title="关于智管云" width="520px" class="about-dialog">
      <div class="about-content">
        <div class="about-logo">
          <div class="about-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"/>
              <path d="M12 8V16M8 12H16" stroke-linecap="round"/>
            </svg>
          </div>
          <h2>智管云</h2>
          <p class="version">v6.0.2</p>
        </div>
        <div class="about-desc">
          <p><strong>智管云</strong> 是一款专业的库存管理软件，支持药品管理、商品库存、食品管理等多种使用场景。</p>
          <p>系统采用现代化技术架构，提供PC端网页版和手机App双平台支持。</p>
        </div>
        <div class="about-features">
          <div class="feature"><span class="icon">📦</span><span>库存管理</span></div>
          <div class="feature"><span class="icon">🔔</span><span>智能预警</span></div>
          <div class="feature"><span class="icon">📊</span><span>数据报表</span></div>
          <div class="feature"><span class="icon">📱</span><span>移动办公</span></div>
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

const loginType = ref<'password' | 'sms'>('password')
const showAbout = ref(false)
const showDisclaimer = ref(false)
const agreeTerms = ref(false)

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const smsFormRef = ref<FormInstance>()
const sendingCode = ref(false)
const countdown = ref(0)
const devCode = ref('')
const smsForm = reactive({ phone: '', code: '' })
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

async function handleLogin() {
  if (!formRef.value) return
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
      router.push(route.query.redirect as string || '/dashboard')
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}

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
    if (res.code) devCode.value = res.code
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '发送失败')
  } finally {
    sendingCode.value = false
  }
}

async function handleSmsLogin() {
  if (!smsFormRef.value) return
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
      router.push(route.query.redirect as string || '/dashboard')
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
  display: flex;
  height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  overflow: hidden;
}

/* 背景装饰 */
.bg-pattern {
  position: fixed;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.bg-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  animation: float 8s ease-in-out infinite;
}
.bg-glow-1 { width: 500px; height: 500px; background: rgba(20, 184, 166, 0.25); top: -150px; left: -100px; }
.bg-glow-2 { width: 400px; height: 400px; background: rgba(6, 182, 212, 0.2); bottom: -100px; right: 20%; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.03); }
}

/* 左侧品牌区域 */
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 60px;
  position: relative;
  z-index: 1;
}

.brand-content {
  max-width: 480px;
  color: #fff;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 26px;
    height: 26px;
  }
}

.logo-text {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 2px;
}

.brand-headline {
  font-size: 56px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  
  .highlight {
    background: linear-gradient(90deg, #5eead4, #22d3ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.brand-desc {
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 32px;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
}

.feature-icon { font-size: 22px; }
.feature-text { font-size: 15px; font-weight: 500; }

/* 右侧登录区域 */
.login-section {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 50px 30px 20px;
  position: relative;
  z-index: 1;
}

.login-card {
  width: 360px;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px 30px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 30px;
    right: 30px;
    height: 3px;
    background: linear-gradient(90deg, #0e7490, #14b8a6, #22d3ee);
    border-radius: 0 0 3px 3px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  box-shadow: 0 8px 24px rgba(14, 116, 144, 0.3);
  
  svg {
    width: 28px;
    height: 28px;
    color: #fff;
  }
}

.login-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.login-subtitle {
  font-size: 13px;
  color: #64748b;
}

.login-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 20px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 9px 0;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  
  &.active {
    background: #fff;
    color: #0e7490;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }
}

.login-form {
  .form-group {
    margin-bottom: 14px;
  }
  
  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 6px;
  }
  
  :deep(.el-input__wrapper) {
    height: 42px;
    border-radius: 10px;
    box-shadow: 0 0 0 2px #e2e8f0;
    
    &:hover, &.is-focus {
      box-shadow: 0 0 0 2px #0e7490;
    }
  }
}

.code-input-wrap {
  display: flex;
  gap: 10px;
  
  .el-input { flex: 1; }
}

.send-code-btn {
  width: 100px;
  height: 42px;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(14, 116, 144, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.dev-code-tip {
  background: #fef3c7;
  color: #92400e;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 14px;
}

.agreement-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
}

.agreement-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #0e7490;
  cursor: pointer;
}

.agreement-text {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  
  .link {
    color: #0e7490;
    cursor: pointer;
    
    &:hover { text-decoration: underline; }
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(14, 116, 144, 0.35);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.login-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  
  a {
    font-size: 12px;
    color: #64748b;
    text-decoration: none;
    
    &:hover { color: #0e7490; }
  }
}

.copyright {
  position: fixed;
  bottom: 16px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  z-index: 10;
}

/* 弹窗样式 */
.about-dialog, .disclaimer-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2f5;
  }
}

.about-content {
  text-align: center;
  
  .about-logo {
    padding: 24px;
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
    
    .about-logo-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 12px;
      color: #fff;
      
      svg { width: 100%; height: 100%; }
    }
    
    h2 {
      font-size: 22px;
      color: #fff;
      margin: 0 0 6px;
    }
    
    .version {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
    }
  }
  
  .about-desc {
    padding: 20px;
    text-align: left;
    
    p {
      font-size: 14px;
      line-height: 1.7;
      color: #606266;
      margin: 0 0 10px;
    }
  }
  
  .about-features {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 0 20px 20px;
    
    .feature {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      
      .icon { font-size: 24px; }
      span:last-child { font-size: 12px; color: #606266; }
    }
  }
}

.disclaimer-content {
  display: flex;
  gap: 16px;
  
  .disclaimer-icon { font-size: 40px; }
  
  .disclaimer-text {
    h3 {
      font-size: 16px;
      color: #e6a23c;
      margin: 0 0 12px;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0 0 12px;
      
      li {
        font-size: 13px;
        color: #606266;
        padding: 6px 0;
        border-bottom: 1px dashed #e4e7ed;
        
        &::before { content: '⚠️'; margin-right: 6px; }
        strong { color: #e6a23c; }
      }
    }
    
    .disclaimer-footer {
      font-size: 12px;
      color: #909399;
      margin: 0;
    }
  }
}

/* 响应式 */
@media (max-width: 1000px) {
  .brand-headline { font-size: 42px; }
  .login-section { width: 420px; padding-right: 30px; }
}

@media (max-width: 850px) {
  .login-page { 
    flex-direction: column; 
    overflow-y: auto;
    height: auto;
    min-height: 100vh;
  }
  .brand-section { 
    padding: 30px; 
    text-align: center;
  }
  .brand-logo { justify-content: center; }
  .brand-headline { font-size: 32px; }
  .features { justify-content: center; }
  .login-section { 
    width: 100%; 
    padding: 20px;
    justify-content: center;
  }
  .login-card { 
    width: 100%;
    max-width: 380px;
  }
  .copyright { 
    position: static; 
    padding: 20px 0;
  }
}
</style>

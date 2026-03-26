<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <el-card class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <el-avatar :size="100" class="user-avatar">
            <span class="avatar-text">{{ avatarText }}</span>
          </el-avatar>
          <div class="user-basic">
            <h2 class="user-name">{{ authStore.user?.realname || authStore.user?.username }}</h2>
            <div class="user-role">
              <el-tag :type="roleTagType" effect="dark">{{ roleText }}</el-tag>
            </div>
          </div>
        </div>
        <div class="mode-info">
          <span class="mode-icon">{{ modeIcon }}</span>
          <span class="mode-name">{{ modeName }}</span>
        </div>
      </div>
    </el-card>

    <div class="profile-content">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span class="header-icon">👤</span>
            <span class="header-title">基本信息</span>
            <el-button type="primary" text @click="showEditDialog = true">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </template>
        
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ authStore.user?.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">真实姓名</span>
            <span class="info-value">{{ authStore.user?.realname || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ authStore.user?.phone || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ authStore.user?.email || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">部门</span>
            <span class="info-value">{{ authStore.user?.department || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">账号状态</span>
            <span class="info-value">
              <el-tag :type="authStore.user?.is_active ? 'success' : 'danger'" size="small">
                {{ authStore.user?.is_active ? '正常' : '已禁用' }}
              </el-tag>
            </span>
          </div>
        </div>
      </el-card>

      <!-- 安全设置 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span class="header-icon">🔐</span>
            <span class="header-title">安全设置</span>
          </div>
        </template>
        
        <div class="security-list">
          <div class="security-item">
            <div class="security-info">
              <span class="security-icon">🔑</span>
              <div class="security-text">
                <span class="security-title">登录密码</span>
                <span class="security-desc">定期更换密码可以保护账号安全</span>
              </div>
            </div>
            <el-button type="primary" plain @click="showPasswordDialog = true">修改密码</el-button>
          </div>
        </div>
      </el-card>

      <!-- 当前场景 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span class="header-icon">🎯</span>
            <span class="header-title">当前使用场景</span>
          </div>
        </template>
        
        <div class="mode-section">
          <div class="current-mode">
            <span class="mode-big-icon">{{ modeIcon }}</span>
            <div class="mode-details">
              <h3>{{ modeName }}</h3>
              <p>{{ modeConfig.description }}</p>
            </div>
          </div>
          <p class="mode-tip">
            <el-icon><InfoFilled /></el-icon>
            您可以在顶部导航栏切换使用场景
          </p>
        </div>
      </el-card>
    </div>

    <!-- 编辑个人信息对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑个人信息" width="480px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realname">
          <el-input v-model="editForm.realname" placeholder="请输入真实姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile" :loading="updating">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="480px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="当前密码" prop="old_password">
          <el-input v-model="passwordForm.old_password" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="passwordForm.new_password" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirm_password">
          <el-input v-model="passwordForm.confirm_password" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, InfoFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useMode } from '@/composables/useMode'
import { userApi } from '@/api'

const authStore = useAuthStore()
const { modeIcon, modeName, modeConfig } = useMode()

// 头像文字
const avatarText = computed(() => {
  const name = authStore.user?.realname || authStore.user?.username || ''
  return name.slice(0, 2).toUpperCase()
})

// 角色显示
const roleText = computed(() => {
  const type = authStore.user?.user_type
  if (type === 'admin') return '系统管理员'
  if (type === 'manager') return '管理员'
  return '操作员'
})

const roleTagType = computed(() => {
  const type = authStore.user?.user_type
  if (type === 'admin') return 'danger'
  if (type === 'manager') return 'warning'
  return 'info'
})

// 编辑个人信息
const showEditDialog = ref(false)
const editFormRef = ref<FormInstance>()
const updating = ref(false)
const editForm = reactive({
  username: '',
  realname: ''
})
const editRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realname: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }]
}

// 修改密码
const showPasswordDialog = ref(false)
const passwordFormRef = ref<FormInstance>()
const changingPassword = ref(false)
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  old_password: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 初始化编辑表单
function initEditForm() {
  editForm.username = authStore.user?.username || ''
  editForm.realname = authStore.user?.realname || ''
}

// 更新个人信息
async function handleUpdateProfile() {
  if (!editFormRef.value) return
  await editFormRef.value.validate()
  
  updating.value = true
  try {
    const res = await userApi.updateProfile(editForm)
    // 转换类型
    authStore.setUser({
      ...authStore.user!,
      username: res.username,
      realname: res.realname || ''
    })
    ElMessage.success('个人信息更新成功')
    showEditDialog.value = false
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '更新失败')
  } finally {
    updating.value = false
  }
}

// 修改密码
async function handleChangePassword() {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate()
  
  changingPassword.value = true
  try {
    await userApi.changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })
    ElMessage.success('密码修改成功，请重新登录')
    showPasswordDialog.value = false
    // 清空表单
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
    // 退出登录
    authStore.logout()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  initEditForm()
})
</script>


<style scoped lang="scss">
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 24px;
  border-radius: 16px;
  overflow: hidden;
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
  border: 4px solid rgba(255, 255, 255, 0.3);
  
  .avatar-text {
    font-size: 36px;
    font-weight: 600;
    color: #fff;
  }
}

.user-basic {
  .user-name {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
  }
  
  .user-role {
    :deep(.el-tag) {
      font-size: 14px;
      padding: 6px 16px;
      border-radius: 20px;
    }
  }
}

.mode-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  
  .mode-icon {
    font-size: 24px;
  }
  
  .mode-name {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  border-radius: 16px;
  
  :deep(.el-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2f5;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .header-icon {
    font-size: 24px;
  }
  
  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    flex: 1;
  }
}

.info-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  padding: 8px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .info-label {
    font-size: 14px;
    color: #909399;
  }
  
  .info-value {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fc;
  border-radius: 12px;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .security-icon {
    font-size: 32px;
  }
  
  .security-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .security-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .security-desc {
      font-size: 14px;
      color: #909399;
    }
  }
}

.mode-section {
  .current-mode {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(14, 116, 144, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%);
    border-radius: 16px;
    border-left: 4px solid #0e7490;
    
    .mode-big-icon {
      font-size: 56px;
    }
    
    .mode-details {
      h3 {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px;
      }
      
      p {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }
  }
  
  .mode-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 14px;
    color: #909399;
    
    .el-icon {
      color: #0e7490;
    }
  }
}

:deep(.el-dialog) {
  border-radius: 16px;
  
  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2f5;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f2f5;
  }
}
</style>

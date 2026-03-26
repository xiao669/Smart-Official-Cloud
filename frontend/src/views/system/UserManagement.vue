<template>
  <div class="user-management-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-buttons">
            <el-button type="success" @click="handleAddPhoneUser">
              <el-icon><Iphone /></el-icon>
              添加手机号用户
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名/真实姓名/部门"
          clearable
          style="width: 300px"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        <el-select
          v-model="userTypeFilter"
          placeholder="用户类型"
          clearable
          style="width: 150px; margin-left: 10px"
          @change="handleSearch"
        >
          <el-option label="管理员" value="admin" />
          <el-option label="经理" value="manager" />
          <el-option label="操作员" value="operator" />
        </el-select>
      </div>

      <!-- 批量操作栏 -->
      <div v-if="selectedUsers.length > 0" class="batch-actions">
        <span class="selected-count">已选择 {{ selectedUsers.length }} 个用户</span>
        <el-button type="success" size="small" @click="handleBatchEnable">
          批量启用
        </el-button>
        <el-button type="warning" size="small" @click="handleBatchDisable">
          批量禁用
        </el-button>
      </div>

      <!-- 统计信息 -->
      <div class="table-info">
        <span class="total-count">
          <el-icon><User /></el-icon>
          总计：<strong>{{ total }}</strong> 个用户
        </span>
      </div>

      <!-- 用户表格 -->
      <el-table
        :data="users"
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realname" label="真实姓名" width="120" />
        <el-table-column prop="user_type" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.user_type === 'admin' ? 'danger' : row.user_type === 'manager' ? 'warning' : 'info'"
              size="small"
            >
              {{ getUserTypeLabel(row.user_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="phone" label="手机号" width="140">
          <template #default="{ row }">
            <span v-if="row.phone" class="phone-cell">
              <el-icon class="phone-icon"><Iphone /></el-icon>
              {{ row.phone }}
            </span>
            <span v-else class="no-phone">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="is_active" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_active"
              @change="handleStatusChange(row)"
              :disabled="row.id === currentUserId"
            />
          </template>
        </el-table-column>
        <el-table-column prop="last_login" label="最后登录" width="180">
          <template #default="{ row }">
            {{ formatLastLogin(row.last_login) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" plain @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="warning" size="small" plain @click="handleResetPassword(row)">
                重置密码
              </el-button>
              <el-button
                type="danger"
                size="small"
                plain
                @click="handleDelete(row)"
                :disabled="row.id === currentUserId"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="loadData"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑用户' : '新增用户'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="密码" :prop="editingId ? '' : 'password'">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="editingId ? '留空则不修改密码' : '请输入密码'"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realname">
          <el-input v-model="form.realname" />
        </el-form-item>
        <el-form-item label="用户类型" prop="user_type">
          <el-select v-model="form.user_type" placeholder="选择用户类型" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="经理" value="manager" />
            <el-option label="操作员" value="operator" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="用于短信验证码登录" maxlength="11" />
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>手机号用于短信验证码登录，请确保填写正确</span>
          </div>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加手机号用户对话框 -->
    <el-dialog v-model="phoneUserDialogVisible" title="添加手机号用户" width="450px">
      <div class="phone-user-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>添加手机号用户后，该用户可使用短信验证码登录，用户名自动生成，用户可在App中自行修改</span>
      </div>
      <el-form ref="phoneUserFormRef" :model="phoneUserForm" :rules="phoneUserRules" label-width="100px">
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="phoneUserForm.phone" 
            placeholder="请输入11位手机号" 
            maxlength="11"
            size="large"
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="用户类型" prop="user_type">
          <el-radio-group v-model="phoneUserForm.user_type" size="large">
            <el-radio-button label="operator">操作员</el-radio-button>
            <el-radio-button label="manager">经理</el-radio-button>
            <el-radio-button label="admin">管理员</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realname">
          <el-input v-model="phoneUserForm.realname" placeholder="可选，方便识别用户" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="phoneUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPhoneUser" :loading="submittingPhoneUser">
          确定添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="重置密码" width="400px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="新密码" prop="new_password">
          <el-input
            v-model="passwordForm.new_password"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm_password">
          <el-input
            v-model="passwordForm.confirm_password"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordReset" :loading="resettingPassword">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, User, InfoFilled, Iphone } from '@element-plus/icons-vue'
import { userApi, type User as UserType } from '@/api/user'
import { useAuthStore } from '@/store/auth'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id)

const loading = ref(false)
const users = ref<UserType[]>([])
const searchKeyword = ref('')
const userTypeFilter = ref<string>()
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedUsers = ref<UserType[]>([])

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  username: '',
  password: '',
  realname: '',
  user_type: 'operator',
  department: '',
  phone: '',
  email: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '用户名只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  user_type: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  phone: [
    { pattern: /^\d{11}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

// 添加手机号用户
const phoneUserDialogVisible = ref(false)
const phoneUserFormRef = ref<FormInstance>()
const submittingPhoneUser = ref(false)
const phoneUserForm = reactive({
  phone: '',
  user_type: 'operator',
  realname: ''
})
const phoneUserRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  user_type: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const passwordDialogVisible = ref(false)
const resettingUserId = ref<number | null>(null)
const passwordFormRef = ref<FormInstance>()
const resettingPassword = ref(false)

const passwordForm = reactive({
  new_password: '',
  confirm_password: ''
})

const passwordRules = {
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function loadData() {
  loading.value = true
  try {
    const res = await userApi.list({
      page: page.value,
      page_size: pageSize.value,
      keyword: searchKeyword.value || undefined,
      user_type: userTypeFilter.value
    })
    users.value = res.items
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleAdd() {
  editingId.value = null
  Object.assign(form, {
    username: '',
    password: '',
    realname: '',
    user_type: 'operator',
    department: '',
    phone: '',
    email: ''
  })
  dialogVisible.value = true
}

// 生成随机用户名
function generateRandomUsername(): string {
  const prefix = 'user'
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `${prefix}_${timestamp}${random}`
}

// 生成随机密码
function generateRandomPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function handleAddPhoneUser() {
  phoneUserForm.phone = ''
  phoneUserForm.user_type = 'operator'
  phoneUserForm.realname = ''
  phoneUserDialogVisible.value = true
}

async function submitPhoneUser() {
  if (!phoneUserFormRef.value) return
  await phoneUserFormRef.value.validate()
  submittingPhoneUser.value = true
  try {
    const username = generateRandomUsername()
    const password = generateRandomPassword()
    
    await userApi.create({
      username,
      password,
      phone: phoneUserForm.phone,
      user_type: phoneUserForm.user_type,
      realname: phoneUserForm.realname || undefined
    } as any)
    
    ElMessage.success('手机号用户添加成功，用户可使用验证码登录')
    phoneUserDialogVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.detail || '添加失败')
  } finally {
    submittingPhoneUser.value = false
  }
}

function handleEdit(row: UserType) {
  editingId.value = row.id
  Object.assign(form, {
    username: row.username,
    password: '',
    realname: row.realname || '',
    user_type: row.user_type,
    department: row.department || '',
    phone: row.phone || '',
    email: row.email || ''
  })
  dialogVisible.value = true
}

async function handleDelete(row: UserType) {
  try {
    await ElMessageBox.confirm(
      `确定删除用户 "${row.username}" 吗？此操作不可恢复！`,
      '提示',
      { type: 'warning' }
    )
    await userApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      const updateData: any = {
        realname: form.realname || undefined,
        user_type: form.user_type,
        department: form.department || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined
      }
      if (form.password) {
        updateData.password = form.password
      }
      await userApi.update(editingId.value, updateData)
      ElMessage.success('更新成功')
    } else {
      await userApi.create(form as any)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.detail || (editingId.value ? '更新失败' : '创建失败'))
  } finally {
    submitting.value = false
  }
}

async function handleStatusChange(row: UserType) {
  try {
    await userApi.toggleStatus(row.id, row.is_active)
    ElMessage.success(row.is_active ? '已启用' : '已禁用')
  } catch (e: any) {
    row.is_active = !row.is_active
    ElMessage.error(e.response?.data?.detail || '操作失败')
  }
}

function handleResetPassword(row: UserType) {
  resettingUserId.value = row.id
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
  passwordDialogVisible.value = true
}

async function submitPasswordReset() {
  if (!passwordFormRef.value || !resettingUserId.value) return
  await passwordFormRef.value.validate()
  resettingPassword.value = true
  try {
    await userApi.resetPassword(resettingUserId.value, passwordForm)
    ElMessage.success('密码重置成功')
    passwordDialogVisible.value = false
  } catch (e: any) {
    ElMessage.error(e.response?.data?.detail || '密码重置失败')
  } finally {
    resettingPassword.value = false
  }
}

function handleSelectionChange(selection: UserType[]) {
  selectedUsers.value = selection
}

async function handleBatchEnable() {
  try {
    await ElMessageBox.confirm(
      `确定启用选中的 ${selectedUsers.value.length} 个用户吗？`,
      '提示',
      { type: 'info' }
    )
    const res = await userApi.batchToggleStatus({
      user_ids: selectedUsers.value.map(u => u.id),
      is_active: true
    })
    ElMessage.success(res.message)
    loadData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('批量启用失败')
  }
}

async function handleBatchDisable() {
  try {
    await ElMessageBox.confirm(
      `确定禁用选中的 ${selectedUsers.value.length} 个用户吗？`,
      '提示',
      { type: 'warning' }
    )
    const res = await userApi.batchToggleStatus({
      user_ids: selectedUsers.value.map(u => u.id),
      is_active: false
    })
    ElMessage.success(res.message)
    loadData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('批量禁用失败')
  }
}

function getUserTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    admin: '管理员',
    manager: '经理',
    operator: '操作员'
  }
  return labels[type] || type
}

function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return '从未登录'
  try {
    return formatDistanceToNow(new Date(lastLogin), { addSuffix: true, locale: zhCN })
  } catch {
    return lastLogin
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.user-management-page {
  :deep(.el-card) {
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  :deep(.el-card__header) {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-bottom: 2px solid #f0f2f5;
    padding: 16px 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .header-buttons {
    display: flex;
    gap: 12px;
  }
}

.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  :deep(.el-input-group__append) {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    cursor: pointer;

    &:hover {
      background-color: var(--primary-hover-color);
    }
  }
}

.batch-actions {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5cc 100%);
  border-radius: var(--radius-md);
  border-left: 4px solid #ffa726;
  display: flex;
  align-items: center;
  gap: 12px;

  .selected-count {
    font-size: 14px;
    font-weight: 600;
    color: #ff9800;
  }
}

.table-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);

  .total-count {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-primary);

    .el-icon {
      font-size: 18px;
      color: var(--primary-color);
    }

    strong {
      font-size: 18px;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0 4px;
    }
  }
}

:deep(.el-table) {
  border-radius: var(--radius-md);
  overflow: hidden;

  .el-table__header {
    th {
      background-color: #fafafa;
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
    }
  }

  .el-table__body {
    td {
      font-size: 14px;
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.el-pagination) {
  margin-top: 16px;
  justify-content: flex-end;

  .el-pagination__total {
    font-weight: 600;
  }
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  
  .el-icon {
    color: #e6a23c;
  }
}

.phone-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #0e7490;
  font-weight: 500;
  
  .phone-icon {
    font-size: 14px;
  }
}

.no-phone {
  color: #c0c4cc;
  font-size: 12px;
}

.phone-user-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #4caf50;
  
  .el-icon {
    color: #4caf50;
    font-size: 18px;
    margin-top: 2px;
  }
  
  span {
    font-size: 13px;
    color: #2e7d32;
    line-height: 1.5;
  }
}
</style>

<template>
  <div class="sms-settings">
    <!-- 服务状态卡片 -->
    <el-card class="status-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>短信服务状态</span>
          <el-button type="primary" link @click="refreshStatus">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-descriptions :column="3" border v-loading="statusLoading">
        <el-descriptions-item label="服务状态">
          <el-tag :type="status.service_enabled ? 'success' : 'danger'">
            {{ status.service_enabled ? '已启用' : '未启用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="API配置">
          <el-tag :type="status.has_api_key ? 'success' : 'warning'">
            {{ status.has_api_key ? '已配置' : '未配置' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="短信模板">
          <el-tag :type="status.has_template ? 'success' : 'warning'">
            {{ status.has_template ? '已配置' : '未配置' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="今日已发送">
          {{ status.daily_limit - (status.remaining_today || 0) }} 条
        </el-descriptions-item>
        <el-descriptions-item label="今日剩余">
          {{ status.remaining_today === -1 ? '不限' : (status.remaining_today || 0) + ' 条' }}
        </el-descriptions-item>
        <el-descriptions-item label="每日限额">
          {{ status.daily_limit === 0 ? '不限' : status.daily_limit + ' 条' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- API配置（管理员） -->
    <el-card class="api-config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>阿里云短信API配置</span>
          <el-tag type="warning" size="small">仅管理员可见</el-tag>
        </div>
      </template>
      
      <el-form 
        :model="apiConfig" 
        label-width="160px" 
        style="max-width: 700px"
        v-loading="apiConfigLoading"
      >
        <el-form-item label="启用短信服务">
          <el-switch v-model="apiConfig.sms_enabled" />
          <span class="form-tip">全局开关，关闭后所有用户都无法发送短信</span>
        </el-form-item>
        
        <el-divider content-position="left">API密钥</el-divider>
        
        <el-form-item label="AccessKey ID">
          <el-input 
            v-model="apiConfig.access_key_id" 
            placeholder="请输入阿里云AccessKey ID"
            style="width: 300px"
          />
          <span class="form-tip" v-if="apiConfig.access_key_id_masked">
            当前: {{ apiConfig.access_key_id_masked }}
          </span>
        </el-form-item>
        
        <el-form-item label="AccessKey Secret">
          <el-input 
            v-model="apiConfig.access_key_secret" 
            type="password"
            placeholder="请输入阿里云AccessKey Secret"
            show-password
            style="width: 300px"
          />
          <span class="form-tip" v-if="apiConfig.access_key_secret_masked">
            当前: {{ apiConfig.access_key_secret_masked }}
          </span>
        </el-form-item>
        
        <el-divider content-position="left">短信签名和模板</el-divider>
        
        <el-form-item label="短信签名">
          <el-input 
            v-model="apiConfig.sign_name" 
            :placeholder="`如：${itemName}管理系统`"
            style="width: 300px"
          />
          <span class="form-tip">需在阿里云短信控制台申请</span>
        </el-form-item>
        
        <el-form-item label="临期预警模板">
          <div class="template-input-group">
            <el-input 
              v-model="apiConfig.template_code" 
              placeholder="如：SMS_123456789"
              style="width: 300px"
            />
            <el-dropdown trigger="click" @command="(cmd: string) => selectTemplate('expiry', cmd)">
              <el-button type="primary" plain>
                选择模板 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="tpl in expiryTemplates" 
                    :key="tpl.code" 
                    :command="tpl.code"
                  >
                    <div class="template-option">
                      <div class="template-name">{{ tpl.name }}</div>
                      <div class="template-preview">{{ tpl.preview }}</div>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="form-tip-block">变量: name({{ itemName }}名), days(天数), batch(批次)</div>
        </el-form-item>
        
        <el-form-item label="过期预警模板">
          <div class="template-input-group">
            <el-input 
              v-model="apiConfig.expired_template_code" 
              placeholder="可选，留空则使用临期模板"
              style="width: 300px"
            />
            <el-dropdown trigger="click" @command="(cmd: string) => selectTemplate('expired', cmd)">
              <el-button type="primary" plain>
                选择模板 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="tpl in expiredTemplates" 
                    :key="tpl.code" 
                    :command="tpl.code"
                  >
                    <div class="template-option">
                      <div class="template-name">{{ tpl.name }}</div>
                      <div class="template-preview">{{ tpl.preview }}</div>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="form-tip-block">变量: name({{ itemName }}名), days(过期天数), batch(批次)</div>
        </el-form-item>
        
        <el-form-item label="低库存预警模板">
          <div class="template-input-group">
            <el-input 
              v-model="apiConfig.low_stock_template_code" 
              placeholder="可选，留空则使用临期模板"
              style="width: 300px"
            />
            <el-dropdown trigger="click" @command="(cmd: string) => selectTemplate('low_stock', cmd)">
              <el-button type="primary" plain>
                选择模板 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="tpl in lowStockTemplates" 
                    :key="tpl.code" 
                    :command="tpl.code"
                  >
                    <div class="template-option">
                      <div class="template-name">{{ tpl.name }}</div>
                      <div class="template-preview">{{ tpl.preview }}</div>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="form-tip-block">变量: name({{ itemName }}名), stock(库存数)</div>
        </el-form-item>
        
        <el-divider content-position="left">限制设置</el-divider>
        
        <el-form-item label="每日发送限额">
          <el-input-number 
            v-model="apiConfig.daily_limit" 
            :min="1" 
            :max="9999"
            :step="10"
          />
          <span class="form-tip">每个用户每天最多发送的短信数量（0表示不限制）</span>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveApiConfig" :loading="savingApi">
            保存API配置
          </el-button>
          <el-button @click="testSms" :loading="testing" :disabled="!status.has_api_key">
            发送测试短信
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 快捷操作卡片 -->
    <el-card class="action-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📤 短信推送</span>
        </div>
      </template>
      
      <div class="action-content">
        <div class="action-item">
          <div class="action-info">
            <div class="action-title">🤖 自动推送</div>
            <div class="action-desc">
              系统每天在设定时间自动发送预警短信
              <el-tag :type="config.sms_enabled ? 'success' : 'info'" size="small" style="margin-left: 8px">
                {{ config.sms_enabled ? '已开启' : '未开启' }}
              </el-tag>
            </div>
            <div class="action-time" v-if="config.sms_enabled">
              ⏰ 每天 {{ config.notify_time || '09:00' }} 自动发送
            </div>
          </div>
          <el-switch 
            v-model="config.sms_enabled" 
            :disabled="!status.service_enabled"
            @change="toggleAutoSms"
            size="large"
          />
        </div>
        
        <el-divider />
        
        <div class="action-item">
          <div class="action-info">
            <div class="action-title">✋ 手动推送</div>
            <div class="action-desc">立即发送所有未读预警短信（今日剩余 {{ status.remaining_today === -1 ? '不限' : status.remaining_today }} 条）</div>
          </div>
          <el-button 
            type="primary" 
            @click="sendBatchSms" 
            :loading="batchSending"
            :disabled="!status.service_enabled || !config.sms_enabled"
          >
            立即发送
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 用户通知配置 -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <span>我的通知配置</span>
      </template>
      
      <el-form 
        :model="config" 
        label-width="140px" 
        style="max-width: 600px"
        v-loading="configLoading"
      >
        <el-form-item label="启用短信通知">
          <el-switch 
            v-model="config.sms_enabled"
            :disabled="!status.service_enabled"
          />
          <span class="form-tip" v-if="!status.service_enabled">
            短信服务未启用，请先配置API
          </span>
        </el-form-item>
        
        <el-divider content-position="left">通知类型</el-divider>
        
        <el-form-item label="临期预警短信">
          <el-switch v-model="config.expiry_sms_enabled" :disabled="!config.sms_enabled" />
          <span class="form-tip">{{ itemName }}即将过期时发送短信提醒</span>
        </el-form-item>
        
        <el-form-item label="过期预警短信">
          <el-switch v-model="config.expired_sms_enabled" :disabled="!config.sms_enabled" />
          <span class="form-tip">{{ itemName }}已过期时发送短信提醒</span>
        </el-form-item>
        
        <el-form-item label="低库存预警短信">
          <el-switch v-model="config.low_stock_sms_enabled" :disabled="!config.sms_enabled" />
          <span class="form-tip">库存不足时发送短信提醒</span>
        </el-form-item>
        
        <el-divider content-position="left">通知设置</el-divider>
        
        <el-form-item label="通知时间">
          <el-time-select
            v-model="config.notify_time"
            start="06:00"
            step="00:30"
            end="22:00"
            placeholder="选择时间"
            :disabled="!config.sms_enabled"
          />
          <span class="form-tip">每日定时发送预警短信的时间</span>
        </el-form-item>
        
        <el-form-item label="通知手机号">
          <el-input 
            v-model="config.notify_phone" 
            placeholder="留空则使用账号绑定的手机号"
            :disabled="!config.sms_enabled"
            maxlength="11"
            style="width: 200px"
          />
          <span class="form-tip">
            当前账号手机号: {{ status.notify_phone || '未设置' }}
          </span>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveConfig" :loading="saving">
            保存配置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 发送记录 -->
    <el-card class="logs-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>发送记录</span>
          <el-button type="primary" link @click="loadLogs">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="logs" v-loading="logsLoading" stripe>
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="sms_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.sms_type)" size="small">
              {{ getTypeText(row.sms_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="发送时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="error_message" label="错误信息" show-overflow-tooltip />
      </el-table>
      
      <el-pagination
        v-if="logsTotal > 10"
        class="pagination"
        :current-page="logsPage"
        :page-size="10"
        :total="logsTotal"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 测试短信对话框 -->
    <el-dialog v-model="testDialogVisible" title="发送测试短信" width="400px">
      <el-form :model="testForm" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="testForm.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="testDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTestSms" :loading="testing">
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, ArrowDown } from '@element-plus/icons-vue'
import { smsApi } from '@/api/sms'
import { useMode } from '@/composables/useMode'

// 使用场景术语
const { itemName } = useMode()

// 状态
const statusLoading = ref(false)
const apiConfigLoading = ref(false)
const configLoading = ref(false)
const logsLoading = ref(false)
const savingApi = ref(false)
const saving = ref(false)
const testing = ref(false)
const testDialogVisible = ref(false)

// 数据
const status = reactive({
  service_enabled: false,
  user_enabled: false,
  has_api_key: false,
  has_template: false,
  daily_limit: 10,
  remaining_today: 10,
  notify_phone: ''
})

const apiConfig = reactive({
  access_key_id: '',
  access_key_secret: '',
  access_key_id_masked: '',
  access_key_secret_masked: '',
  sign_name: '',
  template_code: '',
  expired_template_code: '',
  low_stock_template_code: '',
  sms_enabled: false,
  daily_limit: 10
})

const config = reactive({
  sms_enabled: false,
  expiry_sms_enabled: true,
  expired_sms_enabled: true,
  low_stock_sms_enabled: false,
  notify_time: '09:00',
  notify_phone: ''
})

const logs = ref<any[]>([])
const logsPage = ref(1)
const logsTotal = ref(0)

const testForm = reactive({
  phone: ''
})

const batchSending = ref(false)

// 预设模板列表 - 动态生成
const expiryTemplates = computed(() => [
  { 
    code: 'SMS_EXPIRY_001', 
    name: '模板1 - 简洁版', 
    preview: `【签名】${itemName.value}\${name}将于\${days}天后过期，批次\${batch}，请及时处理。` 
  },
  { 
    code: 'SMS_EXPIRY_002', 
    name: '模板2 - 详细版', 
    preview: `【签名】温馨提示：您的${itemName.value}「\${name}」（批次：\${batch}）将在\${days}天后到期，请尽快使用或处理。` 
  },
  { 
    code: 'SMS_EXPIRY_003', 
    name: '模板3 - 紧急版', 
    preview: `【签名】⚠️紧急提醒：\${name}还有\${days}天过期！批次\${batch}，请立即处理！` 
  },
  { 
    code: 'SMS_EXPIRY_004', 
    name: '模板4 - 家庭版', 
    preview: `【签名】${itemName.value}提醒：\${name}即将过期（\${days}天），请及时处理。` 
  }
])

const expiredTemplates = computed(() => [
  { 
    code: 'SMS_EXPIRED_001', 
    name: '模板1 - 简洁版', 
    preview: `【签名】${itemName.value}\${name}已过期\${days}天，批次\${batch}，请立即处理！` 
  },
  { 
    code: 'SMS_EXPIRED_002', 
    name: '模板2 - 警告版', 
    preview: `【签名】⚠️警告：${itemName.value}「\${name}」已过期！批次\${batch}，过期\${days}天，请勿使用并妥善处理。` 
  },
  { 
    code: 'SMS_EXPIRED_003', 
    name: '模板3 - 安全版', 
    preview: `【签名】安全提醒：\${name}已过期，为保障安全，请勿继续使用，建议按规定处理。` 
  }
])

const lowStockTemplates = computed(() => [
  { 
    code: 'SMS_LOWSTOCK_001', 
    name: '模板1 - 简洁版', 
    preview: `【签名】${itemName.value}\${name}库存不足，当前仅剩\${stock}，请及时补货。` 
  },
  { 
    code: 'SMS_LOWSTOCK_002', 
    name: '模板2 - 提醒版', 
    preview: `【签名】库存预警：「\${name}」库存偏低，剩余\${stock}，建议尽快采购补充。` 
  },
  { 
    code: 'SMS_LOWSTOCK_003', 
    name: '模板3 - 紧急版', 
    preview: `【签名】⚠️紧急：\${name}库存告急！仅剩\${stock}，请立即补货！` 
  }
])

// 选择模板
function selectTemplate(type: string, code: string) {
  switch (type) {
    case 'expiry':
      apiConfig.template_code = code
      break
    case 'expired':
      apiConfig.expired_template_code = code
      break
    case 'low_stock':
      apiConfig.low_stock_template_code = code
      break
  }
  ElMessage.success('已选择模板，请在阿里云控制台申请对应模板后填入实际模板ID')
}

// 加载状态
async function refreshStatus() {
  statusLoading.value = true
  try {
    const res = await smsApi.getStatus()
    Object.assign(status, res)
  } catch (e) {
    console.error('加载状态失败', e)
  } finally {
    statusLoading.value = false
  }
}

// 加载API配置
async function loadApiConfig() {
  apiConfigLoading.value = true
  try {
    const res = await smsApi.getApiConfig()
    // 不覆盖密钥输入框，只更新其他字段
    apiConfig.access_key_id_masked = res.access_key_id_masked || ''
    apiConfig.access_key_secret_masked = res.access_key_secret_masked || ''
    apiConfig.sign_name = res.sign_name || ''
    apiConfig.template_code = res.template_code || ''
    apiConfig.expired_template_code = res.expired_template_code || ''
    apiConfig.low_stock_template_code = res.low_stock_template_code || ''
    apiConfig.sms_enabled = res.sms_enabled || false
    apiConfig.daily_limit = res.daily_limit || 10
  } catch (e: any) {
    // 非管理员会返回403，忽略
    if (e.response?.status !== 403) {
      console.error('加载API配置失败', e)
    }
  } finally {
    apiConfigLoading.value = false
  }
}

// 保存API配置
async function saveApiConfig() {
  savingApi.value = true
  try {
    const data: any = {
      sign_name: apiConfig.sign_name,
      template_code: apiConfig.template_code,
      expired_template_code: apiConfig.expired_template_code,
      low_stock_template_code: apiConfig.low_stock_template_code,
      sms_enabled: apiConfig.sms_enabled,
      daily_limit: apiConfig.daily_limit
    }
    // 只有填写了才更新密钥
    if (apiConfig.access_key_id) {
      data.access_key_id = apiConfig.access_key_id
    }
    if (apiConfig.access_key_secret) {
      data.access_key_secret = apiConfig.access_key_secret
    }
    
    await smsApi.updateApiConfig(data)
    ElMessage.success('API配置保存成功')
    // 清空密钥输入框
    apiConfig.access_key_id = ''
    apiConfig.access_key_secret = ''
    // 重新加载
    loadApiConfig()
    refreshStatus()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    savingApi.value = false
  }
}

// 加载用户配置
async function loadConfig() {
  configLoading.value = true
  try {
    const res = await smsApi.getConfig()
    Object.assign(config, res)
  } catch (e) {
    console.error('加载配置失败', e)
  } finally {
    configLoading.value = false
  }
}

// 保存用户配置
async function saveConfig() {
  saving.value = true
  try {
    await smsApi.updateConfig(config)
    ElMessage.success('配置保存成功')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 加载发送记录
async function loadLogs() {
  logsLoading.value = true
  try {
    const res = await smsApi.getLogs({ page: logsPage.value, page_size: 10 })
    logs.value = res.items
    logsTotal.value = res.total
  } catch (e) {
    console.error('加载记录失败', e)
  } finally {
    logsLoading.value = false
  }
}

// 分页
function handlePageChange(page: number) {
  logsPage.value = page
  loadLogs()
}

// 测试短信
function testSms() {
  testForm.phone = config.notify_phone || status.notify_phone || ''
  testDialogVisible.value = true
}

async function confirmTestSms() {
  if (!testForm.phone || testForm.phone.length !== 11) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  testing.value = true
  try {
    const res = await smsApi.testSms(testForm.phone)
    if (res.success) {
      ElMessage.success('测试短信发送成功')
      testDialogVisible.value = false
      loadLogs()
      refreshStatus()
    } else {
      ElMessage.error(res.message || '发送失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '发送失败')
  } finally {
    testing.value = false
  }
}

// 切换自动推送
async function toggleAutoSms(enabled: boolean) {
  try {
    await smsApi.updateConfig({ sms_enabled: enabled })
    ElMessage.success(enabled ? '自动推送已开启' : '自动推送已关闭')
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
    config.sms_enabled = !enabled // 恢复状态
  }
}

// 手动批量发送
async function sendBatchSms() {
  batchSending.value = true
  try {
    const res = await smsApi.sendBatchSms()
    if (res.success) {
      ElMessage.success(`发送完成！成功 ${res.sent} 条，失败 ${res.failed} 条`)
      loadLogs()
      refreshStatus()
    } else {
      ElMessage.warning(res.message || '发送失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '发送失败')
  } finally {
    batchSending.value = false
  }
}

// 工具函数
function getTypeTag(type: string) {
  const map: Record<string, string> = {
    expiry: 'warning',
    expired: 'danger',
    low_stock: 'info'
  }
  return map[type] || 'info'
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    expiry: '临期',
    expired: '过期',
    low_stock: '低库存'
  }
  return map[type] || type
}

function getStatusTag(status: string) {
  const map: Record<string, string> = {
    success: 'success',
    failed: 'danger',
    pending: 'warning'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    success: '成功',
    failed: '失败',
    pending: '待发送'
  }
  return map[status] || status
}

function formatTime(time: string) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  refreshStatus()
  loadApiConfig()
  loadConfig()
  loadLogs()
})
</script>

<style scoped lang="scss">
.sms-settings {
  .status-card,
  .api-config-card,
  .action-card,
  .config-card,
  .logs-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .form-tip {
    margin-left: 12px;
    color: #909399;
    font-size: 12px;
  }
  
  .form-tip-block {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
  }
  
  .template-input-group {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
  
  .action-content {
    .action-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      
      .action-info {
        flex: 1;
        
        .action-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }
        
        .action-desc {
          font-size: 14px;
          color: #606266;
          margin-bottom: 4px;
        }
        
        .action-time {
          font-size: 13px;
          color: #0e7490;
          font-weight: 500;
        }
      }
    }
  }
}

// 模板选项样式
.template-option {
  padding: 8px 0;
  min-width: 320px;
  
  .template-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
  }
  
  .template-preview {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
    word-break: break-all;
  }
}
</style>

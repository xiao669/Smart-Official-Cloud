<template>
  <div class="warning-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">预警管理</span>
            <div 
              class="auto-check-badge" 
              :class="{ disabled: !autoCheckEnabled }"
              @click="toggleAutoCheck"
              style="cursor: pointer;"
            >
              <span class="pulse-dot" v-if="autoCheckEnabled"></span>
              <span class="static-dot" v-else></span>
              <span class="badge-text">{{ autoCheckEnabled ? '自动检查中' : '自动检查已关闭' }}</span>
            </div>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="manualCheckWarnings" :loading="checking">
              <el-icon><Search /></el-icon>
              手动检查
            </el-button>
            <el-button type="success" @click="markAllAsRead" :loading="markingAll">一键已读</el-button>
            <el-dropdown trigger="click" @command="handleCleanupCommand">
              <el-button type="warning">
                清理预警
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="read">清理已读预警</el-dropdown-item>
                  <el-dropdown-item command="old30">清理30天前已读</el-dropdown-item>
                  <el-dropdown-item command="old7">清理7天前已读</el-dropdown-item>
                  <el-dropdown-item divided command="all" style="color: #F56C6C;">清理全部预警</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button @click="showConfig = true">预警配置</el-button>
            <el-button :icon="Refresh" @click="loadData" :loading="loading">刷新</el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-label">总预警</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
        <div class="stat-item unread">
          <span class="stat-label">未读</span>
          <span class="stat-value">{{ stats.unread }}</span>
        </div>
        <div class="stat-item read">
          <span class="stat-label">已读</span>
          <span class="stat-value">{{ stats.read }}</span>
        </div>
        <div class="auto-cleanup-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>系统每天自动清理30天前的已读预警</span>
        </div>
      </div>

      <div class="filter-bar">
        <el-radio-group v-model="typeFilter" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="expired">过期预警</el-radio-button>
          <el-radio-button label="expiry">临期预警</el-radio-button>
          <el-radio-button label="low_stock">低库存预警</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="readFilter" @change="handleFilterChange" style="margin-left: 20px;">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="unread">未读</el-radio-button>
          <el-radio-button label="read">已读</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="warnings" stripe v-loading="loading">
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="row.type === 'expired' ? 'danger' : row.type === 'expiry' ? 'warning' : 'info'"
            >
              {{ row.type === 'expired' ? '过期' : row.type === 'expiry' ? '临期' : '低库存' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="medicine_name" :label="`${itemName}名称`" />
        <el-table-column prop="message" label="预警信息" />
        <el-table-column prop="is_read" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_read ? 'info' : 'primary'" size="small">
              {{ row.is_read ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button v-if="!row.is_read" text type="primary" @click="markAsRead(row)">标记已读</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 预警配置对话框 -->
    <el-dialog v-model="showConfig" title="预警系统配置" width="680px" class="config-dialog">
      <el-tabs v-model="configTab">
        <!-- 预警阈值 -->
        <el-tab-pane label="预警阈值" name="threshold">
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">⏰</span>
              <span class="section-title">临期预警</span>
            </div>
            <div class="section-content">
              <div class="config-row">
                <span class="config-label">预警天数</span>
                <el-input-number v-model="config.expiry_warning_days" :min="1" :max="365" />
                <span class="config-unit">天</span>
              </div>
              <div class="config-desc">{{ itemName }}有效期剩余天数 ≤ {{ config.expiry_warning_days }} 天时触发临期预警</div>
            </div>
          </div>
          
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">📦</span>
              <span class="section-title">低库存预警</span>
            </div>
            <div class="section-content">
              <div class="config-row">
                <span class="config-label">库存阈值</span>
                <el-input-number v-model="config.low_stock_threshold" :min="1" :max="9999" />
                <span class="config-unit">件</span>
              </div>
              <div class="config-desc">{{ itemName }}库存数量 ＜ {{ config.low_stock_threshold }} 件时触发低库存预警</div>
            </div>
          </div>
          
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">❌</span>
              <span class="section-title">过期预警</span>
            </div>
            <div class="section-content">
              <div class="config-desc">{{ itemName }}有效期已过时自动触发过期预警（系统自动检测，无需配置）</div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 自动检查 -->
        <el-tab-pane label="自动检查" name="autocheck">
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">🔄</span>
              <span class="section-title">前端自动检查</span>
              <el-switch v-model="autoCheckEnabled" @change="onAutoCheckChange" style="margin-left: auto;" />
            </div>
            <div class="section-content">
              <div class="config-row">
                <span class="config-label">检查间隔</span>
                <el-select v-model="autoCheckInterval" style="width: 180px;" @change="onAutoCheckIntervalChange">
                  <el-option :value="1" label="每1分钟" />
                  <el-option :value="5" label="每5分钟（推荐）" />
                  <el-option :value="10" label="每10分钟" />
                  <el-option :value="30" label="每30分钟" />
                </el-select>
              </div>
              <div class="config-desc">
                <span :class="{ 'text-success': autoCheckEnabled, 'text-muted': !autoCheckEnabled }">
                  {{ autoCheckEnabled ? `✅ 已开启，每 ${autoCheckInterval} 分钟自动检查一次预警` : '❌ 已关闭，需手动点击检查按钮' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">⚙️</span>
              <span class="section-title">后端定时任务</span>
            </div>
            <div class="section-content">
              <div class="config-desc">
                <div class="task-item">📋 每天自动清理 30 天前的已读预警</div>
                <div class="task-item">🔔 服务启动时自动执行一次预警清理</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 重新提醒 -->
        <el-tab-pane label="重新提醒" name="reremind">
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">🔔</span>
              <span class="section-title">已读预警重新提醒</span>
              <el-switch v-model="config.re_remind_enabled" style="margin-left: auto;" />
            </div>
            <div class="section-content">
              <div class="config-row" v-if="config.re_remind_enabled">
                <span class="config-label">提醒间隔</span>
                <el-select v-model="config.re_remind_days" style="width: 180px;">
                  <el-option :value="1" label="1天后重新提醒" />
                  <el-option :value="2" label="2天后重新提醒" />
                  <el-option :value="3" label="3天后重新提醒（推荐）" />
                  <el-option :value="5" label="5天后重新提醒" />
                  <el-option :value="7" label="7天后重新提醒" />
                </el-select>
              </div>
              <div class="config-desc">
                <span v-if="config.re_remind_enabled" class="text-success">
                  ✅ 已开启：已读预警在 {{ config.re_remind_days }} 天后如果问题仍未解决，将重新变为未读状态
                </span>
                <span v-else class="text-warning">
                  ⚠️ 已关闭：已读预警将不再重新提醒（标记已读后永久静默）
                </span>
              </div>
            </div>
          </div>
          
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">💡</span>
              <span class="section-title">功能说明</span>
            </div>
            <div class="section-content">
              <div class="explain-list">
                <div class="explain-item">
                  <span class="explain-icon on">✅</span>
                  <div class="explain-text">
                    <div class="explain-title">开启重新提醒</div>
                    <div class="explain-desc">已读预警在 N 天后，如果{{ itemName }}仍然临期/过期/低库存，系统会自动将预警重置为未读状态，确保问题不被遗忘</div>
                  </div>
                </div>
                <div class="explain-item">
                  <span class="explain-icon off">❌</span>
                  <div class="explain-text">
                    <div class="explain-title">关闭重新提醒</div>
                    <div class="explain-desc">已读预警将永久保持已读状态，不会再次提醒。适合已经处理完毕或暂时忽略的预警</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="logic-flow">
            <div class="flow-title">📊 预警处理流程</div>
            <div class="flow-steps">
              <div class="flow-step">
                <div class="step-num">1</div>
                <div class="step-content">
                  <div class="step-title">生成预警</div>
                  <div class="step-desc">系统检测到临期/过期/低库存</div>
                </div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="step-num">2</div>
                <div class="step-content">
                  <div class="step-title">标记已读</div>
                  <div class="step-desc">用户查看并标记为已读</div>
                </div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step" :class="{ disabled: !config.re_remind_enabled }">
                <div class="step-num">3</div>
                <div class="step-content">
                  <div class="step-title">重新提醒</div>
                  <div class="step-desc">{{ config.re_remind_days }}天后未处理则重新提醒</div>
                </div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="step-num">4</div>
                <div class="step-content">
                  <div class="step-title">自动清理</div>
                  <div class="step-desc">30天后自动删除已读预警</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 清理规则 -->
        <el-tab-pane label="清理规则" name="cleanup">
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">🗑️</span>
              <span class="section-title">自动清理规则</span>
            </div>
            <div class="section-content">
              <div class="cleanup-rules">
                <div class="rule-item">
                  <div class="rule-icon auto">⏰</div>
                  <div class="rule-content">
                    <div class="rule-title">定时自动清理</div>
                    <div class="rule-desc">每天自动清理 30 天前的已读预警，减轻数据库压力</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="config-section">
            <div class="section-header">
              <span class="section-icon">🖱️</span>
              <span class="section-title">手动清理选项</span>
            </div>
            <div class="section-content">
              <div class="cleanup-rules">
                <div class="rule-item clickable" @click="handleCleanupCommand('read')">
                  <div class="rule-icon manual">📖</div>
                  <div class="rule-content">
                    <div class="rule-title">清理已读预警</div>
                    <div class="rule-desc">删除所有已读状态的预警记录</div>
                  </div>
                  <div class="rule-action">执行</div>
                </div>
                <div class="rule-item clickable" @click="handleCleanupCommand('old7')">
                  <div class="rule-icon manual">📅</div>
                  <div class="rule-content">
                    <div class="rule-title">清理7天前已读</div>
                    <div class="rule-desc">删除7天前标记为已读的预警</div>
                  </div>
                  <div class="rule-action">执行</div>
                </div>
                <div class="rule-item clickable" @click="handleCleanupCommand('old30')">
                  <div class="rule-icon manual">📆</div>
                  <div class="rule-content">
                    <div class="rule-title">清理30天前已读</div>
                    <div class="rule-desc">删除30天前标记为已读的预警</div>
                  </div>
                  <div class="rule-action">执行</div>
                </div>
                <div class="rule-item clickable danger" @click="handleCleanupCommand('all')">
                  <div class="rule-icon danger">⚠️</div>
                  <div class="rule-content">
                    <div class="rule-title">清理全部预警</div>
                    <div class="rule-desc">删除所有预警记录（不可恢复）</div>
                  </div>
                  <div class="rule-action danger">执行</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <el-button @click="showConfig = false">取消</el-button>
        <el-button type="primary" @click="saveConfig" :loading="savingConfig">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { warningApi } from '@/api'
import { useMode } from '@/composables/useMode'
import type { Warning } from '@/types'
import { Refresh, Search, ArrowDown, InfoFilled } from '@element-plus/icons-vue'

// 使用场景术语
const { itemName } = useMode()

const loading = ref(false)
const warnings = ref<Warning[]>([])
const typeFilter = ref('')
const readFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const markingAll = ref(false)
const checking = ref(false)
const autoCheckEnabled = ref(true) // 自动检查开关，默认开启
let autoCheckTimer: number | null = null

const showConfig = ref(false)
const savingConfig = ref(false)
const configTab = ref('threshold')
const autoCheckInterval = ref(5) // 自动检查间隔（分钟）
const config = reactive({
  expiry_warning_days: 30,
  low_stock_threshold: 10,
  re_remind_enabled: true,
  re_remind_days: 3
})

// 预警统计
const stats = reactive({
  total: 0,
  read: 0,
  unread: 0
})

async function loadData() {
  loading.value = true
  try {
    const isRead = readFilter.value === 'read' ? true : readFilter.value === 'unread' ? false : undefined
    const res = await warningApi.list({
      type: typeFilter.value || undefined,
      is_read: isRead,
      page: page.value,
      page_size: pageSize.value
    })
    warnings.value = res.items
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载预警列表失败')
  } finally {
    loading.value = false
  }
}

async function loadConfig() {
  try {
    const res = await warningApi.getConfig()
    Object.assign(config, res)
  } catch (e) {
    console.error('加载配置失败', e)
  }
}

// 加载统计信息
async function loadStats() {
  try {
    const res = await warningApi.getStats()
    Object.assign(stats, res)
  } catch (e) {
    console.error('加载统计失败', e)
  }
}

// 处理清理命令
async function handleCleanupCommand(command: string) {
  let confirmMsg = ''
  let action: () => Promise<{ message: string }>
  
  switch (command) {
    case 'read':
      confirmMsg = '确定要清理所有已读预警吗？'
      action = () => warningApi.deleteReadWarnings()
      break
    case 'old30':
      confirmMsg = '确定要清理30天前的已读预警吗？'
      action = () => warningApi.cleanupOldWarnings(30)
      break
    case 'old7':
      confirmMsg = '确定要清理7天前的已读预警吗？'
      action = () => warningApi.cleanupOldWarnings(7)
      break
    case 'all':
      confirmMsg = '确定要清理全部预警吗？此操作不可恢复！'
      action = () => warningApi.deleteAllWarnings()
      break
    default:
      return
  }
  
  try {
    await ElMessageBox.confirm(confirmMsg, '确认清理', {
      type: command === 'all' ? 'error' : 'warning',
      confirmButtonText: '确定清理',
      cancelButtonText: '取消'
    })
    
    const res = await action()
    ElMessage.success(res.message || '清理成功')
    loadData()
    loadStats()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('清理失败')
    }
  }
}

function handleFilterChange() {
  page.value = 1
  loadData()
}

async function markAsRead(row: Warning) {
  try {
    await warningApi.markAsRead(row.id)
    row.is_read = true
    ElMessage.success('已标记为已读')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 手动检查预警（显示提示）
async function manualCheckWarnings() {
  checking.value = true
  try {
    const res = await warningApi.checkWarnings()
    if (res.generated_count > 0) {
      ElMessage.success(`发现 ${res.generated_count} 条新预警`)
      loadData()
    } else {
      ElMessage.info('暂无新预警')
    }
  } catch (e) {
    ElMessage.error('检查预警失败')
  } finally {
    checking.value = false
  }
}

// 自动检查预警（静默模式，不显示提示）
async function autoCheckWarnings() {
  try {
    const res = await warningApi.checkWarnings()
    if (res.generated_count > 0) {
      // 有新预警时刷新列表
      loadData()
    }
  } catch (e) {
    console.error('自动检查预警失败', e)
  }
}

// 启动自动检查定时器
function startAutoCheck() {
  // 立即执行一次
  autoCheckWarnings()
  
  // 设置定时器
  autoCheckTimer = window.setInterval(() => {
    autoCheckWarnings()
  }, autoCheckInterval.value * 60 * 1000)
}

// 停止自动检查
function stopAutoCheck() {
  if (autoCheckTimer) {
    clearInterval(autoCheckTimer)
    autoCheckTimer = null
  }
}

// 切换自动检查开关
function toggleAutoCheck() {
  autoCheckEnabled.value = !autoCheckEnabled.value
  
  if (autoCheckEnabled.value) {
    startAutoCheck()
    ElMessage.success('自动检查已开启')
  } else {
    stopAutoCheck()
    ElMessage.info('自动检查已关闭')
  }
  
  // 保存设置到本地存储
  localStorage.setItem('autoCheckEnabled', String(autoCheckEnabled.value))
}

// 配置页面中切换自动检查
function onAutoCheckChange(val: boolean) {
  if (val) {
    startAutoCheck()
  } else {
    stopAutoCheck()
  }
  localStorage.setItem('autoCheckEnabled', String(val))
}

// 修改自动检查间隔
function onAutoCheckIntervalChange(val: number) {
  localStorage.setItem('autoCheckInterval', String(val))
  if (autoCheckEnabled.value) {
    stopAutoCheck()
    startAutoCheck()
  }
}

async function markAllAsRead() {
  try {
    await ElMessageBox.confirm('确定要将所有未读预警标记为已读吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    markingAll.value = true
    const res = await warningApi.markAllAsRead()
    ElMessage.success(res.message || '操作成功')
    loadData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('操作失败')
    }
  } finally {
    markingAll.value = false
  }
}

async function saveConfig() {
  savingConfig.value = true
  try {
    await warningApi.updateConfig(config)
    ElMessage.success('配置保存成功')
    showConfig.value = false
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    savingConfig.value = false
  }
}

onMounted(() => {
  // 从本地存储读取自动检查设置
  const savedAutoCheck = localStorage.getItem('autoCheckEnabled')
  autoCheckEnabled.value = savedAutoCheck !== 'false' // 默认为 true
  
  // 读取自动检查间隔
  const savedInterval = localStorage.getItem('autoCheckInterval')
  if (savedInterval) {
    autoCheckInterval.value = parseInt(savedInterval)
  }
  
  loadData()
  loadConfig()
  loadStats()
  
  // 根据设置决定是否启动自动检查
  if (autoCheckEnabled.value) {
    startAutoCheck()
  }
})

onUnmounted(() => {
  stopAutoCheck() // 停止自动检查
})
</script>

<style scoped lang="scss">
.warning-page {
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

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .auto-check-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
      border-radius: 20px;
      transition: all 0.3s;
      
      &:hover {
        opacity: 0.9;
        transform: scale(1.02);
      }
      
      &.disabled {
        background: #909399;
      }
      
      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #4ade80;
        border-radius: 50%;
        animation: pulse 1.5s ease-in-out infinite;
        box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
      }
      
      .static-dot {
        width: 8px;
        height: 8px;
        background: #C0C4CC;
        border-radius: 50%;
      }
      
      .badge-text {
        font-size: 12px;
        color: #fff;
        font-weight: 500;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 16px;
    border-right: 1px solid #e4e7ed;
    
    &:last-of-type {
      border-right: none;
    }
    
    .stat-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #303133;
    }
    
    &.unread .stat-value {
      color: #E6A23C;
    }
    
    &.read .stat-value {
      color: #67C23A;
    }
  }
  
  .auto-cleanup-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
    padding: 8px 16px;
    background: rgba(103, 194, 58, 0.1);
    border-radius: 8px;
    
    .el-icon {
      color: #67C23A;
      font-size: 16px;
    }
    
    span {
      font-size: 13px;
      color: #67C23A;
      font-weight: 500;
    }
  }
}

.filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
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

  .el-tag {
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 4px;
  }

  .el-button {
    &.el-button--text {
      &.el-button--primary {
        color: #0e7490;
        
        &:hover {
          background-color: rgba(14, 116, 144, 0.1);
        }
      }
    }
  }
}

:deep(.el-pagination) {
  margin-top: 16px;
  justify-content: flex-end;

  .el-pagination__total {
    font-weight: 600;
  }
}

// 配置弹窗样式
.config-dialog {
  :deep(.el-dialog__body) {
    padding: 0 20px 20px;
  }
  
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.config-section {
  background: #f8f9fc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.section-icon {
  font-size: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.section-content {
  padding-left: 30px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.config-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.config-unit {
  font-size: 14px;
  color: #909399;
}

.config-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  
  .text-success {
    color: #67c23a;
  }
  
  .text-warning {
    color: #e6a23c;
  }
  
  .text-muted {
    color: #909399;
  }
}

// 功能说明列表
.explain-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.explain-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.explain-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  
  &.on {
    background: rgba(103, 194, 58, 0.1);
  }
  
  &.off {
    background: rgba(230, 162, 60, 0.1);
  }
}

.explain-text {
  flex: 1;
}

.explain-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.explain-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.task-item {
  padding: 8px 0;
  border-bottom: 1px dashed #e4e7ed;
  
  &:last-child {
    border-bottom: none;
  }
}

// 流程图
.logic-flow {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  border: 1px solid #e4e7ed;
}

.flow-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.flow-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(52, 201, 235, 0.15) 0%, rgba(26, 181, 216, 0.15) 100%);
  border-radius: 8px;
  border: 1px solid rgba(52, 201, 235, 0.3);
  flex: 1;
  min-width: 120px;
  
  &.disabled {
    opacity: 0.5;
    background: #f5f7fa;
    border-color: #e4e7ed;
  }
}

.step-num {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.step-desc {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.flow-arrow {
  color: #c0c4cc;
  font-size: 18px;
  flex-shrink: 0;
}

// 清理规则
.cleanup-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      border-color: #0e7490;
      box-shadow: 0 2px 8px rgba(14, 116, 144, 0.15);
    }
  }
  
  &.danger {
    border-color: #fde2e2;
    background: #fef0f0;
    
    &:hover {
      border-color: #f56c6c;
    }
  }
}

.rule-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  
  &.auto {
    background: linear-gradient(135deg, #67c23a15 0%, #529b2e15 100%);
  }
  
  &.manual {
    background: linear-gradient(135deg, #409eff15 0%, #337ecc15 100%);
  }
  
  &.danger {
    background: linear-gradient(135deg, #f56c6c15 0%, #c4565615 100%);
  }
}

.rule-content {
  flex: 1;
}

.rule-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.rule-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.rule-action {
  padding: 6px 16px;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  
  &.danger {
    background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%);
  }
}
</style>

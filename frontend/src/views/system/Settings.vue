<template>
  <div class="system-settings">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">⚙️ 系统配置中心</span>
          <span class="subtitle">集中管理所有系统功能配置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card" class="config-tabs" v-loading="loading">
        <!-- 基础设置 -->
        <el-tab-pane label="基础设置" name="basic">
          <div class="tab-content">
            <div class="config-section">
              <div class="section-header">
                <span class="section-icon">🏠</span>
                <span class="section-title">系统信息</span>
              </div>
              <div class="section-content">
                <el-form label-width="120px">
                  <el-form-item label="系统名称">
                    <el-input v-model="config.site_name" style="width: 300px" placeholder="智管云" />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 预警配置 -->
        <el-tab-pane label="预警配置" name="warning">
          <div class="tab-content">
            <div class="config-section">
              <div class="section-header">
                <span class="section-icon">⏰</span>
                <span class="section-title">预警阈值</span>
              </div>
              <div class="section-content">
                <el-form label-width="140px">
                  <el-form-item label="临期预警天数">
                    <el-input-number v-model="config.expiry_warning_days" :min="1" :max="365" />
                    <span class="unit">天</span>
                  </el-form-item>
                  <el-form-item label="低库存阈值">
                    <el-input-number v-model="config.low_stock_threshold" :min="1" :max="9999" />
                    <span class="unit">件</span>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <div class="config-section">
              <div class="section-header">
                <span class="section-icon">🔔</span>
                <span class="section-title">重新提醒</span>
                <el-switch v-model="config.re_remind_enabled" style="margin-left: auto;" />
              </div>
              <div class="section-content">
                <el-form label-width="140px">
                  <el-form-item label="提醒间隔" v-if="config.re_remind_enabled">
                    <el-select v-model="config.re_remind_days" style="width: 200px">
                      <el-option :value="1" label="1天后重新提醒" />
                      <el-option :value="2" label="2天后重新提醒" />
                      <el-option :value="3" label="3天后重新提醒" />
                      <el-option :value="5" label="5天后重新提醒" />
                      <el-option :value="7" label="7天后重新提醒" />
                    </el-select>
                  </el-form-item>
                </el-form>
                <div class="status-text" :class="config.re_remind_enabled ? 'success' : 'warning'">
                  {{ config.re_remind_enabled 
                    ? `✅ 已开启：已读预警 ${config.re_remind_days} 天后未处理将重新提醒` 
                    : '⚠️ 已关闭：已读预警将永久静默' }}
                </div>
              </div>
            </div>

            <div class="config-section">
              <div class="section-header">
                <span class="section-icon">🗑️</span>
                <span class="section-title">自动清理</span>
              </div>
              <div class="section-content">
                <el-form label-width="140px">
                  <el-form-item label="清理天数">
                    <el-input-number v-model="config.auto_cleanup_days" :min="7" :max="365" />
                    <span class="unit">天前的已读预警</span>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 库存配置 -->
        <el-tab-pane label="库存配置" name="inventory">
          <div class="tab-content">
            <div class="config-section">
              <div class="section-header">
                <span class="section-icon">📦</span>
                <span class="section-title">临期阈值</span>
              </div>
              <div class="section-content">
                <el-form label-width="140px">
                  <el-form-item label="临期天数">
                    <el-input-number v-model="config.expiry_threshold_days" :min="30" :max="365" />
                    <span class="unit">天</span>
                  </el-form-item>
                </el-form>
                <div class="status-definition">
                  <div class="status-item normal">
                    <span class="status-badge">正常</span>
                    <span class="status-desc">有效期 &gt; {{ config.expiry_threshold_days }}天</span>
                  </div>
                  <div class="status-item warning">
                    <span class="status-badge">临期</span>
                    <span class="status-desc">0 &lt; 有效期 ≤ {{ config.expiry_threshold_days }}天</span>
                  </div>
                  <div class="status-item danger">
                    <span class="status-badge">过期</span>
                    <span class="status-desc">有效期 ≤ 今天</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 安全配置 -->
        <el-tab-pane label="安全配置" name="security">
          <div class="tab-content">
            <div class="config-section">
              <div class="section-header">
                <span class="section-icon">🔐</span>
                <span class="section-title">登录安全</span>
              </div>
              <div class="section-content">
                <el-form label-width="160px">
                  <el-form-item label="Token有效期">
                    <el-input-number v-model="config.token_expire_days" :min="1" :max="30" />
                    <span class="unit">天</span>
                  </el-form-item>
                  <el-form-item label="验证码有效期">
                    <el-input-number v-model="config.sms_code_expire_minutes" :min="1" :max="30" />
                    <span class="unit">分钟</span>
                  </el-form-item>
                  <el-form-item label="验证码最大尝试">
                    <el-input-number v-model="config.sms_code_max_attempts" :min="3" :max="10" />
                    <span class="unit">次</span>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="action-bar">
        <el-button type="primary" size="large" @click="saveConfig" :loading="saving">
          💾 保存配置
        </el-button>
        <el-button size="large" @click="loadConfig">🔄 重置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { systemApi } from '@/api'

const activeTab = ref('basic')
const loading = ref(false)
const saving = ref(false)

const config = reactive({
  site_name: '智管云',
  expiry_warning_days: 30,
  low_stock_threshold: 10,
  re_remind_enabled: true,
  re_remind_days: 3,
  auto_cleanup_days: 30,
  expiry_threshold_days: 90,
  token_expire_days: 7,
  sms_code_expire_minutes: 5,
  sms_code_max_attempts: 5
})

async function loadConfig() {
  loading.value = true
  try {
    const res = await systemApi.getSettings()
    Object.assign(config, res)
  } catch (e) {
    console.error('加载配置失败', e)
  } finally {
    loading.value = false
  }
}

async function saveConfig() {
  saving.value = true
  try {
    await systemApi.updateSettings(config)
    ElMessage.success('配置保存成功')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>


<style scoped lang="scss">
.system-settings {
  .main-card {
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
      border-bottom: none;
      padding: 20px 24px;
    }
  }
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  .title { font-size: 20px; font-weight: 700; color: #fff; }
  .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); }
}

.config-tabs {
  :deep(.el-tabs__header) { background: #f8f9fc; }
  :deep(.el-tabs__content) { padding: 0; }
}

.tab-content { padding: 20px; min-height: 400px; }

.config-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.section-icon { font-size: 20px; }
.section-title { font-size: 16px; font-weight: 600; color: #303133; }
.section-content { padding-left: 30px; }
.unit { margin-left: 8px; color: #909399; font-size: 14px; }

.status-text {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 12px;
  &.success { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
  &.warning { background: rgba(230, 162, 60, 0.1); color: #e6a23c; }
}

.status-definition { display: flex; gap: 20px; margin-top: 16px; }

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 8px;
  &.normal { background: rgba(103, 194, 58, 0.1); .status-badge { background: #67c23a; } }
  &.warning { background: rgba(230, 162, 60, 0.1); .status-badge { background: #e6a23c; } }
  &.danger { background: rgba(245, 108, 108, 0.1); .status-badge { background: #f56c6c; } }
  .status-badge { padding: 4px 12px; border-radius: 4px; color: #fff; font-size: 13px; font-weight: 600; }
  .status-desc { font-size: 14px; color: #606266; }
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: #f8f9fc;
  border-top: 1px solid #e4e7ed;
}
</style>

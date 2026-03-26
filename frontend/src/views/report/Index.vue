<template>
  <div class="report-page">
    <el-card>
      <template #header>报表中心</template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="库存报表" name="inventory">
          <div class="report-toolbar">
            <span></span>
            <el-button type="primary" @click="exportReport('inventory')">导出Excel</el-button>
          </div>
          <el-table :data="inventoryReport" stripe v-loading="loading">
            <el-table-column prop="medicine_code" :label="`${itemName}编码`" width="120" />
            <el-table-column prop="medicine_name" :label="`${itemName}名称`" />
            <el-table-column prop="total_quantity" label="库存总量" width="120" />
            <el-table-column prop="batch_count" label="批次数" width="100" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="效期报表" name="expiry">
          <div class="report-toolbar">
            <el-radio-group v-model="expiryStatus" @change="loadExpiryReport">
              <el-radio-button label="expiring">临期</el-radio-button>
              <el-radio-button label="expired">已过期</el-radio-button>
            </el-radio-group>
            <el-button type="primary" @click="exportReport('expiry')">导出Excel</el-button>
          </div>
          <el-table :data="expiryReport" stripe v-loading="loading">
            <el-table-column prop="medicine_name" :label="`${itemName}名称`" />
            <el-table-column prop="batch_number" label="批次号" width="150" />
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="expiry_date" label="有效期" width="120" />
            <el-table-column prop="days_until_expiry" label="剩余天数" width="100">
              <template #default="{ row }">
                <el-tag :type="row.days_until_expiry < 0 ? 'danger' : 'warning'">
                  {{ row.days_until_expiry < 0 ? `已过期${-row.days_until_expiry}天` : `${row.days_until_expiry}天` }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="出入库报表" name="transactions">
          <div class="report-toolbar">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="loadTransactionReport" />
            <el-button type="primary" @click="exportReport('transactions')">导出Excel</el-button>
          </div>
          <el-table :data="transactionReport" stripe v-loading="loading">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="inbound_count" label="入库数量" width="120" />
            <el-table-column prop="outbound_count" label="出库数量" width="120" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="盘点报表" name="stocktake">
          <div class="report-toolbar">
            <span></span>
            <el-button type="primary" disabled>导出Excel</el-button>
          </div>
          <el-table :data="stocktakeReport" stripe v-loading="loading">
            <el-table-column prop="name" label="盘点任务" />
            <el-table-column prop="created_at" label="创建时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'completed' ? 'success' : 'info'">
                  {{ row.status === 'completed' ? '已完成' : '进行中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="discrepancy_count" label="差异数" width="100" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { reportApi } from '@/api'
import type { InventoryReportItem, ExpiryReportItem, TransactionReportItem, StocktakeReportItem } from '@/api/report'
import { useMode } from '@/composables/useMode'

const { itemName } = useMode()

const loading = ref(false)
const activeTab = ref('inventory')

const inventoryReport = ref<InventoryReportItem[]>([])
const expiryReport = ref<ExpiryReportItem[]>([])
const transactionReport = ref<TransactionReportItem[]>([])
const stocktakeReport = ref<StocktakeReportItem[]>([])

const expiryStatus = ref<'expiring' | 'expired'>('expiring')
const dateRange = ref<[string, string]>()

async function loadInventoryReport() {
  loading.value = true
  try {
    inventoryReport.value = await reportApi.getInventoryReport()
  } catch (e) {
    ElMessage.error('加载库存报表失败')
  } finally {
    loading.value = false
  }
}

async function loadExpiryReport() {
  loading.value = true
  try {
    expiryReport.value = await reportApi.getExpiryReport(expiryStatus.value)
  } catch (e) {
    ElMessage.error('加载效期报表失败')
  } finally {
    loading.value = false
  }
}

async function loadTransactionReport() {
  loading.value = true
  try {
    const [start, end] = dateRange.value || []
    transactionReport.value = await reportApi.getTransactionReport(start, end)
  } catch (e) {
    ElMessage.error('加载出入库报表失败')
  } finally {
    loading.value = false
  }
}

async function loadStocktakeReport() {
  loading.value = true
  try {
    stocktakeReport.value = await reportApi.getStocktakeReport()
  } catch (e) {
    ElMessage.error('加载盘点报表失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange(tab: string) {
  switch (tab) {
    case 'inventory': loadInventoryReport(); break
    case 'expiry': loadExpiryReport(); break
    case 'transactions': loadTransactionReport(); break
    case 'stocktake': loadStocktakeReport(); break
  }
}

async function exportReport(type: string) {
  try {
    let blob: Blob
    let filename: string
    switch (type) {
      case 'inventory':
        blob = await reportApi.exportInventory()
        filename = `库存报表_${new Date().toISOString().slice(0, 10)}.xlsx`
        break
      case 'expiry':
        blob = await reportApi.exportExpiry(expiryStatus.value)
        filename = `效期报表_${expiryStatus.value === 'expiring' ? '临期' : '过期'}_${new Date().toISOString().slice(0, 10)}.xlsx`
        break
      case 'transactions':
        const [start, end] = dateRange.value || []
        blob = await reportApi.exportTransactions(start, end)
        filename = `出入库报表_${new Date().toISOString().slice(0, 10)}.xlsx`
        break
      default:
        return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  loadInventoryReport()
})
</script>

<style scoped lang="scss">
.report-page {
  :deep(.el-card) {
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  :deep(.el-card__header) {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-bottom: 2px solid #f0f2f5;
    padding: 16px 20px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  :deep(.el-tabs__item) {
    font-size: 14px;
    font-weight: 500;
    
    &.is-active {
      color: #0e7490;
    }
  }
  
  :deep(.el-tabs__active-bar) {
    background-color: #0e7490;
  }
}

.report-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border-left: 4px solid #0e7490;
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
}
</style>

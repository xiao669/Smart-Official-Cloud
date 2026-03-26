<template>
  <div class="inventory-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存管理</span>
          <div>
            <el-button type="primary" @click="handleInbound">入库</el-button>
            <el-button type="warning" @click="handleOutbound">出库</el-button>
          </div>
        </div>
      </template>

      <!-- 库存统计 -->
      <div class="stats-bar">
        <div class="stat-card total">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <span class="stat-value">{{ totalStock }}</span>
            <span class="stat-label">总库存</span>
          </div>
        </div>
        <div class="stat-card normal">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ normalCount }}</span>
            <span class="stat-label">正常</span>
          </div>
        </div>
        <div class="stat-card warning">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <span class="stat-value">{{ expiringCount }}</span>
            <span class="stat-label">临期</span>
          </div>
        </div>
        <div class="stat-card danger">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <span class="stat-value">{{ expiredCount }}</span>
            <span class="stat-label">过期</span>
          </div>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="searchKeyword" 
          :placeholder="`搜索${itemName}名称、编码、规格...`" 
          clearable 
          size="large"
          style="width: 400px" 
          @keyup.enter="loadData"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="loadData" type="primary">搜索</el-button>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="库存状态" clearable style="width: 140px" @change="loadData">
          <el-option label="全部状态" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="临期" value="expiring" />
          <el-option label="已过期" value="expired" />
        </el-select>
      </div>

      <el-table :data="inventoryList" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" sortable />
        <el-table-column prop="medicine_name" :label="`${itemName}名称`" min-width="180">
          <template #default="{ row }">
            <span class="medicine-name">{{ row.medicine_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存数量" width="120" align="center" sortable>
          <template #default="{ row }">
            <span class="quantity-value" :class="{ 'low-stock': row.quantity < 10 }">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="production_date" label="生产日期" width="120" />
        <el-table-column prop="expiry_date" :label="`${expiryLabel}至`" width="120" sortable />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getExpiryStatus(row.expiry_date).type" effect="dark">
              {{ getExpiryStatus(row.expiry_date).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inbound_date" label="入库日期" width="120" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" size="small" plain @click="quickOutbound(row)" :disabled="row.quantity <= 0">出库</el-button>
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

    <!-- 入库对话框 -->
    <el-dialog v-model="inboundDialogVisible" :title="`${itemName}入库`" width="500px">
      <el-form ref="inboundFormRef" :model="inboundForm" :rules="inboundRules" label-width="100px">
        <el-form-item :label="itemName" prop="medicine_id">
          <el-select v-model="inboundForm.medicine_id" filterable :placeholder="`选择${itemName}`" style="width: 100%">
            <el-option v-for="m in medicineOptions" :key="m.id" :label="`${m.name} (${m.code})`" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="batchLabel" prop="batch_number">
          <el-input v-model="inboundForm.batch_number" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="inboundForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="生产日期" prop="production_date">
          <el-date-picker v-model="inboundForm.production_date" type="date" placeholder="选择生产日期" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item :label="expiryLabel" prop="expiry_date">
          <el-date-picker v-model="inboundForm.expiry_date" type="date" :placeholder="`选择${expiryLabel}`" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="inboundForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInbound" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 出库对话框 -->
    <el-dialog v-model="outboundDialogVisible" :title="`${itemName}出库`" width="500px">
      <el-form ref="outboundFormRef" :model="outboundForm" :rules="outboundRules" label-width="100px">
        <el-form-item :label="itemName">
          <el-input :value="selectedBatch?.medicine_name" disabled />
        </el-form-item>
        <el-form-item :label="batchLabel">
          <el-input :value="selectedBatch?.batch_number" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="selectedBatch?.quantity" disabled />
        </el-form-item>
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number v-model="outboundForm.quantity" :min="1" :max="selectedBatch?.quantity || 1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="出库原因" prop="reason">
          <el-select v-model="outboundForm.reason" placeholder="选择原因" style="width: 100%">
            <el-option label="销售" value="销售" />
            <el-option label="报损" value="报损" />
            <el-option label="过期销毁" value="过期销毁" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="领用人">
          <el-input v-model="outboundForm.recipient" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="outboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOutbound" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { inventoryApi, medicineApi } from '@/api'
import { useMode } from '@/composables/useMode'
import type { Batch, Medicine } from '@/types'

// 使用场景术语
const { itemName, expiryLabel, batchLabel } = useMode()

const loading = ref(false)
const inventoryList = ref<Batch[]>([])
const medicineOptions = ref<Medicine[]>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const submitting = ref(false)

// 库存统计
const totalStock = ref(0)
const normalCount = ref(0)
const expiringCount = ref(0)
const expiredCount = ref(0)

// 入库
const inboundDialogVisible = ref(false)
const inboundFormRef = ref<FormInstance>()
const inboundForm = reactive({
  medicine_id: undefined as number | undefined,
  batch_number: '',
  quantity: 1,
  production_date: '',
  expiry_date: '',
  remark: ''
})
const inboundRules = {
  medicine_id: [{ required: true, message: '请选择药品', trigger: 'change' }],
  batch_number: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  production_date: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
  expiry_date: [{ required: true, message: '请选择有效期', trigger: 'change' }]
}

// 出库
const outboundDialogVisible = ref(false)
const outboundFormRef = ref<FormInstance>()
const selectedBatch = ref<Batch | null>(null)
const outboundForm = reactive({
  quantity: 1,
  reason: '',
  recipient: ''
})
const outboundRules = {
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  reason: [{ required: true, message: '请选择原因', trigger: 'change' }]
}

function getExpiryStatus(expiryDate: string) {
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { type: 'danger' as const, text: '已过期' }
  if (days <= 90) return { type: 'warning' as const, text: '临期' }
  return { type: 'success' as const, text: '正常' }
}

async function loadData() {
  loading.value = true
  try {
    const res = await inventoryApi.list({
      keyword: searchKeyword.value || undefined,
      status: statusFilter.value || undefined,
      page: page.value,
      page_size: pageSize.value
    } as any)
    inventoryList.value = res.items
    total.value = res.total
    
    // 计算统计数据
    calculateStats(res.items)
  } catch (e) {
    ElMessage.error('加载库存数据失败')
  } finally {
    loading.value = false
  }
}

// 计算库存统计
function calculateStats(items: Batch[]) {
  let total = 0
  let normal = 0
  let expiring = 0
  let expired = 0
  
  items.forEach(item => {
    total += item.quantity
    const status = getExpiryStatus(item.expiry_date)
    if (status.text === '正常') normal++
    else if (status.text === '临期') expiring++
    else if (status.text === '已过期') expired++
  })
  
  totalStock.value = total
  normalCount.value = normal
  expiringCount.value = expiring
  expiredCount.value = expired
}

async function loadMedicines() {
  try {
    const res = await medicineApi.list({ page_size: 100 })
    medicineOptions.value = res.items
  } catch (e) {
    console.error('加载药品列表失败', e)
  }
}

function handleInbound() {
  Object.assign(inboundForm, { medicine_id: undefined, batch_number: '', quantity: 1, production_date: '', expiry_date: '', remark: '' })
  inboundDialogVisible.value = true
}

function handleOutbound() {
  ElMessage.info('请在列表中选择要出库的批次')
}

function quickOutbound(row: Batch) {
  selectedBatch.value = row
  Object.assign(outboundForm, { quantity: 1, reason: '', recipient: '' })
  outboundDialogVisible.value = true
}

async function submitInbound() {
  if (!inboundFormRef.value) return
  await inboundFormRef.value.validate()
  submitting.value = true
  try {
    await inventoryApi.inbound(inboundForm as any)
    ElMessage.success('入库成功')
    inboundDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('入库失败')
  } finally {
    submitting.value = false
  }
}

async function submitOutbound() {
  if (!outboundFormRef.value || !selectedBatch.value) return
  await outboundFormRef.value.validate()
  submitting.value = true
  try {
    await inventoryApi.outbound({
      batch_id: selectedBatch.value.id,
      quantity: outboundForm.quantity,
      reason: outboundForm.reason,
      recipient: outboundForm.recipient || undefined
    })
    ElMessage.success('出库成功')
    outboundDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('出库失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadMedicines()
  loadData()
})
</script>

<style scoped lang="scss">
.inventory-page {
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

  div {
    display: flex;
    gap: 8px;
  }
}

// 库存统计栏
.stats-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  .stat-card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon {
      font-size: 32px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    
    .stat-info {
      display: flex;
      flex-direction: column;
      
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
      }
      
      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }
    
    &.total {
      background: linear-gradient(135deg, rgba(14, 116, 144, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%);
      border-left: 4px solid #0e7490;
      
      .stat-icon {
        background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
        color: white;
      }
      
      .stat-value {
        color: #0e7490;
      }
    }
    
    &.normal {
      background: linear-gradient(135deg, #67c23a15 0%, #529b2e15 100%);
      border-left: 4px solid #67c23a;
      
      .stat-icon {
        background: #67c23a;
      }
      
      .stat-value {
        color: #67c23a;
      }
    }
    
    &.warning {
      background: linear-gradient(135deg, #e6a23c15 0%, #cf9236 15 100%);
      border-left: 4px solid #e6a23c;
      
      .stat-icon {
        background: #e6a23c;
      }
      
      .stat-value {
        color: #e6a23c;
      }
    }
    
    &.danger {
      background: linear-gradient(135deg, #f56c6c15 0%, #c45656 15 100%);
      border-left: 4px solid #f56c6c;
      
      .stat-icon {
        background: #f56c6c;
      }
      
      .stat-value {
        color: #f56c6c;
      }
    }
  }
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8f9fc;
  border-radius: 12px;
}

.medicine-name {
  font-weight: 600;
  color: #303133;
}

.quantity-value {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  
  &.low-stock {
    color: #f56c6c;
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

  .el-button {
    padding: 6px 14px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.3s;

    &.el-button--small {
      padding: 6px 14px;
      font-size: 14px;
    }

    &.is-plain {
      &.el-button--warning {
        background-color: #fff8e1;
        border-color: #ffcc80;
        color: #f57c00;

        &:hover {
          background-color: #f57c00;
          border-color: #f57c00;
          color: white;
        }
      }
      
      &.el-button--primary {
        background-color: rgba(14, 116, 144, 0.1);
        border-color: #0e7490;
        color: #0e7490;

        &:hover {
          background-color: #0e7490;
          border-color: #0e7490;
          color: white;
        }
      }
    }

    &.el-button--text {
      &.el-button--warning {
        color: #f57c00;
        
        &:hover {
          background-color: #fff8e1;
        }

        &:disabled {
          color: #c0c4cc;
        }
      }
    }
  }

  .el-tag {
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 4px;
  }
}

:deep(.el-pagination) {
  margin-top: 16px;
  justify-content: flex-end;

  .el-pagination__total {
    font-weight: 600;
  }
}
</style>

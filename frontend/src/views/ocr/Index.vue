<template>
  <div class="ocr-page">
    <el-card>
      <template #header>拍照录入审核</template>
      
      <el-table :data="pendingList" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <el-image :src="row.image_url" :preview-src-list="[row.image_url]" fit="cover" style="width: 80px; height: 60px;" />
          </template>
        </el-table-column>
        <el-table-column label="识别结果">
          <template #default="{ row }">
            <div>{{ itemName }}名称: {{ row.ocr_result?.name || '-' }}</div>
            <div>批次号: {{ row.ocr_result?.batch_number || '-' }}</div>
            <div>数量: {{ row.ocr_result?.quantity || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="上传时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" @click="handleReview(row)">审核</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadData"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="审核OCR识别结果" width="600px">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="image-preview">
            <el-image :src="currentRecord?.image_url" fit="contain" style="width: 100%; max-height: 300px;" />
          </div>
        </el-col>
        <el-col :span="12">
          <el-form :model="reviewForm" label-width="80px">
            <el-form-item :label="`${itemName}名称`">
              <el-input v-model="reviewForm.name" />
            </el-form-item>
            <el-form-item label="批次号">
              <el-input v-model="reviewForm.batch_number" />
            </el-form-item>
            <el-form-item label="数量">
              <el-input-number v-model="reviewForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
            <el-form-item label="有效期">
              <el-date-picker v-model="reviewForm.expiry_date" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="handleReject" :loading="submitting" type="danger">驳回</el-button>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApprove" :loading="submitting">通过并入库</el-button>
      </template>
    </el-dialog>

    <!-- 驳回原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="驳回原因" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReject" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ocrApi } from '@/api'
import type { OcrRecord } from '@/api/ocr'
import { useMode } from '@/composables/useMode'

const { itemName } = useMode()

const loading = ref(false)
const pendingList = ref<OcrRecord[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const submitting = ref(false)

const reviewDialogVisible = ref(false)
const currentRecord = ref<OcrRecord | null>(null)
const reviewForm = reactive({
  name: '',
  batch_number: '',
  quantity: 1,
  expiry_date: ''
})

const rejectDialogVisible = ref(false)
const rejectReason = ref('')

async function loadData() {
  loading.value = true
  try {
    const res = await ocrApi.getPendingList({ page: page.value, page_size: pageSize.value })
    pendingList.value = res.items
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载待审核列表失败')
  } finally {
    loading.value = false
  }
}

function handleReview(row: OcrRecord) {
  currentRecord.value = row
  Object.assign(reviewForm, {
    name: row.ocr_result?.name || '',
    batch_number: row.ocr_result?.batch_number || '',
    quantity: row.ocr_result?.quantity || 1,
    expiry_date: row.ocr_result?.expiry_date || ''
  })
  reviewDialogVisible.value = true
}

async function handleApprove() {
  if (!currentRecord.value) return
  submitting.value = true
  try {
    await ocrApi.review(currentRecord.value.id, {
      action: 'approve',
      corrected_data: {
        name: reviewForm.name,
        batch_number: reviewForm.batch_number,
        quantity: reviewForm.quantity,
        expiry_date: reviewForm.expiry_date
      }
    })
    ElMessage.success('审核通过，已入库')
    reviewDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

function handleReject() {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

async function submitReject() {
  if (!currentRecord.value) return
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  submitting.value = true
  try {
    await ocrApi.review(currentRecord.value.id, {
      action: 'reject',
      reject_reason: rejectReason.value
    })
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    reviewDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.image-preview {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background: #f5f7fa;
}
</style>

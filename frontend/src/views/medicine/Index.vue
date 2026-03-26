<template>
  <div class="medicine-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ itemName }}管理</span>
          <div>
            <el-button type="primary" @click="handleAdd">新增{{ itemName }}</el-button>
            <el-button @click="handleImport">导入</el-button>
            <el-button @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <div class="search-bar">
        <el-input v-model="searchKeyword" :placeholder="`搜索${itemName}名称/编码`" clearable style="width: 300px" @keyup.enter="handleSearch">
          <template #append>
            <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" :placeholder="`选择${categoryLabel}`" clearable style="width: 150px; margin-left: 10px" @change="handleSearch">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </div>

      <div class="table-info">
        <span class="total-count">
          <el-icon><DataAnalysis /></el-icon>
          总计：<strong>{{ total }}</strong> 种{{ itemName }}
        </span>
      </div>

      <el-table :data="medicines" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="code" :label="`${itemName}编码`" width="120" />
        <el-table-column prop="name" :label="`${itemName}名称`" min-width="150" />
        <el-table-column prop="barcode" label="条形码" width="140">
          <template #default="{ row }">
            <span v-if="row.barcode">{{ row.barcode }}</span>
            <span v-else class="barcode-empty">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="category_name" :label="categoryLabel" width="100" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="unit" :label="unitLabel" width="80" />
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row.price !== null && row.price !== undefined" class="price-text">
              ¥{{ row.price.toFixed(2) }}
            </span>
            <span v-else class="price-empty">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" :label="manufacturerLabel" min-width="150" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" plain @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" plain @click="handleDelete(row)">删除</el-button>
            </div>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? `编辑${itemName}` : `新增${itemName}`" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="`${itemName}编码`" prop="code">
          <el-input v-model="form.code" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item :label="`${itemName}名称`" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="categoryLabel" prop="category_id">
          <el-select v-model="form.category_id" :placeholder="`选择${categoryLabel}`" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input v-model="form.specification" />
        </el-form-item>
        <el-form-item :label="unitLabel" prop="unit">
          <el-select v-model="form.unit" :placeholder="`请选择${unitLabel}`" style="width: 100%">
            <el-option v-for="unit in modeUnitOptions" :key="unit" :label="unit" :value="unit" />
          </el-select>
        </el-form-item>
        <el-form-item :label="manufacturerLabel" prop="manufacturer">
          <el-input v-model="form.manufacturer" />
        </el-form-item>
        <el-form-item label="条形码" prop="barcode">
          <el-input v-model="form.barcode" placeholder="请输入条形码（选填）" />
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number 
            v-model="form.price" 
            :precision="2" 
            :step="0.1" 
            :min="0"
            placeholder="请输入单价"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" :title="`导入${itemName}`" width="500px">
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <template #default>
          <div style="font-size: 13px; line-height: 1.8">
            <p style="margin: 0 0 8px 0">1. 请先下载导入模板，按照模板格式填写数据</p>
            <p style="margin: 0 0 8px 0">2. 带*号的列为必填项（{{ itemName }}编码、{{ itemName }}名称、单位）</p>
            <p style="margin: 0 0 8px 0">3. {{ itemName }}编码不能重复</p>
            <p style="margin: 0">4. 支持 .xlsx 和 .xls 格式</p>
          </div>
        </template>
      </el-alert>

      <div style="text-align: center; margin-bottom: 16px">
        <el-button type="success" @click="handleDownloadTemplate" :icon="Download">
          下载导入模板
        </el-button>
      </div>

      <el-upload
        ref="uploadRef"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx, .xls 格式</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitImport" :loading="importing">
          <el-icon style="margin-right: 4px"><Upload /></el-icon>
          开始导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, UploadInstance, UploadFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataAnalysis, Search, Upload, Download } from '@element-plus/icons-vue'
import { medicineApi } from '@/api'
import { useMode } from '@/composables/useMode'
import type { Medicine, MedicineCategory } from '@/types'

// 使用场景术语
const { itemName, categoryLabel, unitLabel, unitOptions: modeUnitOptions, manufacturerLabel } = useMode()

const loading = ref(false)
const medicines = ref<Medicine[]>([])
const categories = ref<MedicineCategory[]>([])
const searchKeyword = ref('')
const categoryFilter = ref<number>()
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  code: '',
  name: '',
  category_id: undefined as number | undefined,
  specification: '',
  unit: '',
  manufacturer: '',
  barcode: '',
  price: undefined as number | undefined,
  description: ''
})

const rules = {
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }]
}

const importDialogVisible = ref(false)
const uploadRef = ref<UploadInstance>()
const importFile = ref<File | null>(null)
const importing = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await medicineApi.list({
      page: page.value,
      page_size: pageSize.value,
      keyword: searchKeyword.value || undefined,
      category_id: categoryFilter.value
    })
    medicines.value = res.items
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载药品列表失败')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await medicineApi.getCategories()
  } catch (e) {
    console.error('加载分类失败', e)
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleAdd() {
  editingId.value = null
  Object.assign(form, { code: '', name: '', category_id: undefined, specification: '', unit: '', manufacturer: '', barcode: '', price: undefined, description: '' })
  dialogVisible.value = true
}

function handleEdit(row: Medicine) {
  editingId.value = row.id
  Object.assign(form, {
    code: row.code,
    name: row.name,
    category_id: row.category_id,
    specification: row.specification || '',
    unit: row.unit,
    manufacturer: row.manufacturer || '',
    barcode: row.barcode || '',
    price: row.price ?? undefined,
    description: row.description || ''
  })
  dialogVisible.value = true
}

async function handleDelete(row: Medicine) {
  try {
    await ElMessageBox.confirm(`确定删除药品 "${row.name}" 吗？`, '提示', { type: 'warning' })
    await medicineApi.delete(row.id)
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
      await medicineApi.update(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await medicineApi.create(form as any)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(editingId.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

function handleImport() {
  importFile.value = null
  uploadRef.value?.clearFiles()
  importDialogVisible.value = true
}

function handleFileChange(file: UploadFile) {
  importFile.value = file.raw || null
}

async function submitImport() {
  if (!importFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  importing.value = true
  try {
    const res = await medicineApi.import(importFile.value)
    ElMessage.success(`导入成功 ${res.success_count} 条，失败 ${res.fail_count} 条`)
    importDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

async function handleExport() {
  try {
    const blob = await medicineApi.export({ keyword: searchKeyword.value, category_id: categoryFilter.value })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `药品列表_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

async function handleDownloadTemplate() {
  try {
    const blob = await medicineApi.downloadTemplate()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '药品导入模板.xlsx'
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('模板下载成功')
  } catch (e) {
    ElMessage.error('模板下载失败')
  }
}

onMounted(() => {
  loadCategories()
  loadData()
})
</script>

<style scoped lang="scss">
.medicine-page {
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

.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;

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

      &.el-button--danger {
        background-color: #ffebee;
        border-color: #ef9a9a;
        color: #d32f2f;

        &:hover {
          background-color: #d32f2f;
          border-color: #d32f2f;
          color: white;
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.price-text {
  font-weight: 600;
  color: #e74c3c;
  font-size: 14px;
}

.price-empty {
  color: #909399;
}

.barcode-empty {
  color: #909399;
}

:deep(.el-pagination) {
  margin-top: 16px;
  justify-content: flex-end;

  .el-pagination__total {
    font-weight: 600;
  }
}
</style>

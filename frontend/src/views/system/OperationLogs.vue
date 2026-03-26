<template>
  <div class="operation-logs">
    <el-card>
      <template #header>操作日志</template>

      <div class="filter-bar">
        <el-select v-model="operationFilter" placeholder="操作类型" clearable style="width: 150px">
          <el-option label="登录" value="login" />
          <el-option label="药品入库" value="inbound" />
          <el-option label="药品出库" value="outbound" />
          <el-option label="药品新增" value="medicine_create" />
          <el-option label="药品修改" value="medicine_update" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="margin-left: 10px" value-format="YYYY-MM-DD" />
        <el-button type="primary" @click="handleSearch" style="margin-left: 10px">查询</el-button>
      </div>

      <el-table :data="logs" stripe v-loading="loading">
        <el-table-column prop="created_at" label="时间" width="180" />
        <el-table-column prop="username" label="操作人" width="100" />
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="operation" label="操作类型" width="120" />
        <el-table-column prop="detail" label="详情" show-overflow-tooltip />
        <el-table-column prop="ip_address" label="IP地址" width="130" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { systemApi } from '@/api'
import type { OperationLog } from '@/api/system'

const loading = ref(false)
const logs = ref<OperationLog[]>([])
const operationFilter = ref('')
const dateRange = ref<[string, string]>()
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

async function loadData() {
  loading.value = true
  try {
    const [startDate, endDate] = dateRange.value || []
    const res = await systemApi.getLogs({
      page: page.value,
      page_size: pageSize.value,
      operation: operationFilter.value || undefined,
      start_date: startDate,
      end_date: endDate
    })
    logs.value = res.items
    total.value = res.total
  } catch (e) {
    ElMessage.error('加载操作日志失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
</style>

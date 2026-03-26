<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><Odometer /></el-icon>
          数据总览
        </h1>
        <p class="page-subtitle">实时监控{{ itemName }}库存和预警信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="24" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card-wrapper">
          <el-card shadow="hover" class="stat-card blue">
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <div class="stat-icon">
                  <el-icon><FirstAidKit /></el-icon>
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ summary.medicine_count || 0 }}</div>
                <div class="stat-label">{{ itemName }}总数</div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card-wrapper">
          <el-card shadow="hover" class="stat-card green">
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <div class="stat-icon">
                  <el-icon><Box /></el-icon>
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ summary.inventory_total || 0 }}</div>
                <div class="stat-label">库存总量</div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card-wrapper">
          <el-card shadow="hover" class="stat-card orange">
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <div class="stat-icon">
                  <el-icon><Clock /></el-icon>
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ summary.expiring_count || 0 }}</div>
                <div class="stat-label">临期{{ itemName }}</div>
                <div class="stat-trend warning" v-if="summary.expiring_count > 0">
                  <el-icon class="trend-icon"><WarningFilled /></el-icon>
                  <span class="trend-text">需要关注</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card-wrapper">
          <el-card shadow="hover" class="stat-card red">
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <div class="stat-icon">
                  <el-icon><WarningFilled /></el-icon>
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ summary.expired_count || 0 }}</div>
                <div class="stat-label">过期{{ itemName }}</div>
                <div class="stat-trend danger" v-if="summary.expired_count > 0">
                  <el-icon class="trend-icon"><Close /></el-icon>
                  <span class="trend-text">需要处理</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" class="charts-section">
      <!-- 库存趋势图 -->
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><TrendCharts /></el-icon>
                <span>库存趋势分析</span>
              </div>
              <el-radio-group v-model="trendPeriod" size="small" @change="loadCharts">
                <el-radio-button label="7d">近7天</el-radio-button>
                <el-radio-button label="30d">近30天</el-radio-button>
                <el-radio-button label="90d">近90天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="trendChartRef"></div>
        </el-card>
      </el-col>
      
      <!-- 效期分布图 -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><PieChart /></el-icon>
                <span>效期分布</span>
              </div>
            </div>
          </template>
          <div class="chart-container" ref="expiryChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行图表 -->
    <el-row :gutter="24" class="charts-section">
      <!-- {{ itemName }}分类统计 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><DataAnalysis /></el-icon>
                <span>{{ itemName }}分类统计</span>
              </div>
            </div>
          </template>
          <div class="chart-container" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
      
      <!-- 出入库统计 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><Histogram /></el-icon>
                <span>出入库统计（近7天）</span>
              </div>
            </div>
          </template>
          <div class="chart-container" ref="transactionChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警信息 -->
    <el-card class="warning-section">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="header-icon"><Bell /></el-icon>
            <span>最近预警</span>
            <el-badge :value="warnings.length" :max="99" class="warning-badge" />
          </div>
          <el-button text type="primary" @click="$router.push('/warnings')">
            查看全部
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      
      <div v-if="warnings.length > 0">
        <el-table :data="warnings" stripe class="warning-table">
          <el-table-column prop="type" label="类型" width="160" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="row.type === 'expiry' ? 'warning' : 'danger'" 
                effect="dark"
                round
                size="default"
              >
                <span class="tag-content">
                  <el-icon class="tag-icon">
                    <Clock v-if="row.type === 'expiry'" />
                    <WarningFilled v-else />
                  </el-icon>
                  <span class="tag-text">{{ row.type === 'expiry' ? '临期预警' : '低库存' }}</span>
                </span>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="medicine_name" :label="`${itemName}名称`" width="200">
            <template #default="{ row }">
              <div class="medicine-name">
                <el-icon class="medicine-icon"><FirstAidKit /></el-icon>
                <span>{{ row.medicine_name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="预警信息" min-width="250" show-overflow-tooltip />
          <el-table-column prop="created_at" label="预警时间" width="200" align="center">
            <template #default="{ row }">
              <div class="time-cell">
                <el-icon><Clock /></el-icon>
                <span>{{ row.created_at }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleWarning(row)">
                处理
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <el-empty v-else description="暂无预警信息" :image-size="120">
        <template #image>
          <el-icon :size="80" color="#909399"><SuccessFilled /></el-icon>
        </template>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { dashboardApi } from '@/api'
import { useMode } from '@/composables/useMode'
import type { DashboardSummary, Warning } from '@/types'
import { ElMessage } from 'element-plus'
import {
  Odometer, Refresh, FirstAidKit, Box, Clock, WarningFilled, Close,
  CaretTop, TrendCharts, PieChart, DataAnalysis, Histogram, Bell,
  ArrowRight, SuccessFilled, Warning as WarningIcon
} from '@element-plus/icons-vue'

// 使用场景术语
const { itemName } = useMode()

const router = useRouter()
const loading = ref(false)
const trendPeriod = ref('30d')

const summary = ref<DashboardSummary>({
  medicine_count: 0,
  inventory_total: 0,
  expiring_count: 0,
  expired_count: 0
})

const warnings = ref<Warning[]>([])
const trendChartRef = ref<HTMLElement>()
const expiryChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
const transactionChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let expiryChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let transactionChart: echarts.ECharts | null = null

// 刷新所有数据
async function refreshData() {
  loading.value = true
  try {
    await Promise.all([
      loadSummary(),
      loadWarnings(),
      loadCharts()
    ])
    ElMessage.success('数据刷新成功')
  } catch (e) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  try {
    summary.value = await dashboardApi.getSummary()
  } catch (e) {
    console.error('加载统计数据失败', e)
  }
}

async function loadWarnings() {
  try {
    warnings.value = await dashboardApi.getRecentWarnings()
  } catch (e) {
    console.error('加载预警数据失败', e)
  }
}

async function loadCharts() {
  try {
    // 库存趋势图
    const trendData = await dashboardApi.getCharts('inventory_trend', trendPeriod.value)
    if (trendChartRef.value) {
      if (!trendChart) {
        trendChart = echarts.init(trendChartRef.value)
      }
      trendChart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e4e7ed',
          borderWidth: 1,
          textStyle: { color: '#606266' },
          axisPointer: {
            type: 'cross',
            label: { backgroundColor: '#6a7985' }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: trendData.labels,
          boundaryGap: false,
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
        },
        series: [{
          data: trendData.values,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#0e7490' },
              { offset: 1, color: '#14b8a6' }
            ])
          },
          itemStyle: {
            color: '#0e7490',
            borderWidth: 2,
            borderColor: '#fff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(14, 116, 144, 0.3)' },
              { offset: 1, color: 'rgba(14, 116, 144, 0.05)' }
            ])
          }
        }]
      })
    }

    // 效期分布图
    const expiryData = await dashboardApi.getCharts('expiry_distribution')
    if (expiryChartRef.value) {
      if (!expiryChart) {
        expiryChart = echarts.init(expiryChartRef.value)
      }
      expiryChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e4e7ed',
          borderWidth: 1,
          textStyle: { color: '#606266' }
        },
        legend: {
          bottom: 10,
          left: 'center',
          textStyle: { color: '#606266' }
        },
        color: ['#14b8a6', '#e6a23c', '#f56c6c', '#909399'],
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontSize: 12,
            color: '#606266'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          data: expiryData.labels.map((label, i) => ({
            name: label,
            value: expiryData.values[i]
          }))
        }]
      })
    }

    // {{ itemName }}分类统计
    const categoryData = await dashboardApi.getCharts('category_distribution')
    if (categoryChartRef.value) {
      if (!categoryChart) {
        categoryChart = echarts.init(categoryChartRef.value)
      }
      categoryChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e4e7ed',
          borderWidth: 1,
          textStyle: { color: '#606266' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categoryData.labels || [],
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
        },
        series: [{
          data: categoryData.values || [],
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#0e7490' },
              { offset: 1, color: '#14b8a6' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#0c4a6e' },
                { offset: 1, color: '#0e7490' }
              ])
            }
          }
        }]
      })
    }

    // 出入库统计
    const transactionData = await dashboardApi.getCharts('transaction_stats', '7d')
    if (transactionChartRef.value) {
      if (!transactionChart) {
        transactionChart = echarts.init(transactionChartRef.value)
      }
      transactionChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e4e7ed',
          borderWidth: 1,
          textStyle: { color: '#606266' }
        },
        legend: {
          top: 0,
          textStyle: { color: '#606266' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: transactionData.labels || [],
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
        },
        series: [
          {
            name: '入库',
            type: 'bar',
            data: transactionData.inbound || [],
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#14b8a6' },
                { offset: 1, color: '#5eead4' }
              ])
            }
          },
          {
            name: '出库',
            type: 'bar',
            data: transactionData.outbound || [],
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#0e7490' },
                { offset: 1, color: '#22d3ee' }
              ])
            }
          }
        ]
      })
    }
  } catch (e) {
    console.error('加载图表失败', e)
  }
}

function handleResize() {
  trendChart?.resize()
  expiryChart?.resize()
  categoryChart?.resize()
  transactionChart?.resize()
}

function handleWarning(row: Warning) {
  router.push('/warnings')
}

onMounted(() => {
  loadSummary()
  loadWarnings()
  loadCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  expiryChart?.dispose()
  categoryChart?.dispose()
  transactionChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard {
  // 页面头部
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding: 24px;
    background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
    border-radius: var(--radius-xl);
    color: white;
    box-shadow: 0 8px 24px rgba(14, 116, 144, 0.3);
    
    .header-left {
      .page-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #f7f7f7;
        .el-icon {
          font-size: 32px;
        }
      }
      
      .page-subtitle {
        font-size: 14px;
        opacity: 0.9;
        margin: 0;
      }
    }
    
    .header-right {
      :deep(.el-button) {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        backdrop-filter: blur(10px);
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }

  // 统计卡片
  .stat-cards {
    margin-bottom: 28px;
    
    .stat-card-wrapper {
      height: 100%;
      margin-bottom: 24px;
    }
    
    .stat-card {
      height: 160px;
      border: none;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      overflow: hidden;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        opacity: 0.1;
        transition: all 0.4s;
      }
      
      &.blue {
        background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 100%);
        &::before { background: #fff; }
      }
      
      &.green {
        background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
        &::before { background: #fff; }
      }
      
      &.orange {
        background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
        &::before { background: #fff; }
      }
      
      &.red {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
        &::before { background: #fff; }
      }
      
      &:hover {
        transform: translateY(-12px) scale(1.02);
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
        
        &::before {
          transform: translate(20px, -20px) scale(1.2);
        }
      }
      
      :deep(.el-card__body) {
        padding: 24px;
      }
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      z-index: 1;
      height: 100%;
    }
    
    .stat-icon-wrapper {
      flex-shrink: 0;
      
      .stat-icon {
        width: 70px;
        height: 70px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        font-size: 32px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;
        
        .el-icon {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
      }
    }
    
    .stat-info {
      flex: 1;
      color: white;
      min-width: 0;
      
      .stat-value {
        font-size: 32px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 6px;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      .stat-label {
        font-size: 13px;
        font-weight: 500;
        opacity: 0.9;
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        opacity: 0.85;
        
        .trend-icon {
          font-size: 12px;
          flex-shrink: 0;
          
          &.up {
            color: #fff;
          }
        }
        
        .trend-text {
          white-space: nowrap;
        }
        
        &.warning, &.danger {
          .trend-icon {
            animation: pulse 2s infinite;
          }
        }
      }
    }
  }

  // 图表区域
  .charts-section {
    margin-bottom: 28px;
    
    .chart-card {
      height: 100%;
      min-height: 450px;
      border: none;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
      
      :deep(.el-card__header) {
        background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
        border-bottom: 2px solid #ccfbf1;
        padding: 16px 20px;
      }
      
      :deep(.el-card__body) {
        padding: 20px;
      }
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      
      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
        
        .header-icon {
          font-size: 18px;
          color: #0e7490;
          flex-shrink: 0;
        }
      }
      
      :deep(.el-radio-group) {
        .el-radio-button__inner {
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 13px;
        }
      }
    }
    
    .chart-container {
      height: 350px;
      width: 100%;
    }
  }

  // 预警区域
  .warning-section {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
      border-bottom: 2px solid #fecaca;
      padding: 16px 20px;
    }
    
    :deep(.el-card__body) {
      padding: 0;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      
      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
        
        .header-icon {
          font-size: 18px;
          color: var(--danger-color);
          animation: ring 2s infinite;
          flex-shrink: 0;
        }
        
        .warning-badge {
          margin-left: 4px;
        }
      }
    }
    
    .warning-table {
      :deep(.el-table__header) {
        th {
          background-color: #fafafa;
          font-weight: 600;
          font-size: 13px;
        }
      }
      
      :deep(.el-table__body) {
        td {
          font-size: 13px;
        }
      }
      
      :deep(.el-tag) {
        font-weight: 600;
        padding: 8px 16px;
        font-size: 13px;
        white-space: nowrap;
        display: inline-flex !important;
        align-items: center;
        min-width: 110px;
        justify-content: center;
        
        .tag-content {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        
        .tag-icon {
          font-size: 14px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        .tag-text {
          white-space: nowrap;
          line-height: 1;
        }
      }
      
      .medicine-name {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        
        .medicine-icon {
          color: #0e7490;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      
      .time-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--text-secondary);
        font-size: 12px;
        white-space: nowrap;
        
        .el-icon {
          font-size: 12px;
          flex-shrink: 0;
        }
        
        span {
          white-space: nowrap;
        }
      }
    }
    
    :deep(.el-empty) {
      padding: 60px 20px;
    }
  }
}

// 动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ring {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30% {
    transform: rotate(-10deg);
  }
  20%, 40% {
    transform: rotate(10deg);
  }
}

// 入场动画
.stat-cards .el-col {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
}

.charts-section {
  animation: fadeInUp 0.6s ease-out 0.5s;
  animation-fill-mode: both;
}

.warning-section {
  animation: fadeInUp 0.6s ease-out 0.6s;
  animation-fill-mode: both;
}

// 响应式
@media (max-width: 1200px) {
  .dashboard {
    .stat-info {
      .stat-value {
        font-size: 28px !important;
      }
      
      .stat-label {
        font-size: 12px !important;
      }
    }
    
    .chart-container {
      height: 320px !important;
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .page-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
      padding: 20px;
      
      .header-left {
        .page-title {
          justify-content: center;
          font-size: 24px;
          
          .el-icon {
            font-size: 28px;
          }
        }
        
        .page-subtitle {
          font-size: 13px;
        }
      }
    }
    
    .stat-card {
      height: auto !important;
      min-height: 140px;
      
      .stat-content {
        flex-direction: row;
        padding: 16px;
      }
      
      .stat-icon-wrapper .stat-icon {
        width: 60px !important;
        height: 60px !important;
        font-size: 28px !important;
      }
      
      .stat-info {
        .stat-value {
          font-size: 24px !important;
        }
        
        .stat-label {
          font-size: 12px !important;
        }
        
        .stat-trend {
          font-size: 10px !important;
        }
      }
    }
    
    .chart-card {
      min-height: 380px !important;
      
      :deep(.el-card__header) {
        padding: 14px 16px !important;
      }
      
      :deep(.el-card__body) {
        padding: 16px !important;
      }
    }
    
    .chart-container {
      height: 280px !important;
    }
    
    .card-header {
      .header-title {
        font-size: 14px !important;
        
        .header-icon {
          font-size: 16px !important;
        }
      }
      
      :deep(.el-radio-group) {
        width: 100%;
        
        .el-radio-button {
          flex: 1;
          
          .el-radio-button__inner {
            width: 100%;
            padding: 6px 8px !important;
            font-size: 12px !important;
          }
        }
      }
    }
    
    .warning-section {
      :deep(.el-card__header) {
        padding: 14px 16px !important;
      }
      
      .warning-table {
        :deep(.el-table) {
          font-size: 12px;
        }
        
        :deep(.el-tag) {
          padding: 6px 10px !important;
          font-size: 11px !important;
          min-width: 90px !important;
          
          .tag-content {
            gap: 4px !important;
          }
          
          .tag-icon {
            font-size: 11px !important;
          }
          
          .tag-text {
            font-size: 11px !important;
          }
        }
      }
    }
  }
}
</style>

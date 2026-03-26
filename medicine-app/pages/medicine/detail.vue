<template>
  <view class="detail-page">
    <view v-if="loading" class="loading-state">
      <text class="loading-icon">⏳</text>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="detail" class="detail-container">
      <!-- 药品名称卡片 -->
      <view class="medicine-header">
        <view class="medicine-name-section">
          <text class="medicine-name">{{ detail.medicine_name }}</text>
        </view>
        <view class="status-tag" :class="getStatusClass(detail.expiry_date)">
          {{ getStatusText(detail.expiry_date) }}
        </view>
      </view>
      
      <!-- 库存数量卡片 -->
      <view class="quantity-card">
        <view class="quantity-icon">📦</view>
        <view class="quantity-info">
          <text class="quantity-label">当前库存</text>
          <text class="quantity-value">{{ detail.quantity }} 盒</text>
        </view>
      </view>
      
      <!-- 基本信息 -->
      <view class="info-card">
        <view class="card-title">
          <text class="title-icon">📋</text>
          <text class="title-text">基本信息</text>
        </view>
        
        <view class="info-list">
          <view class="info-row">
            <view class="info-item">
              <text class="info-icon">🏭</text>
              <view class="info-content">
                <text class="info-label">生产日期</text>
                <text class="info-value">{{ detail.production_date || '未知' }}</text>
              </view>
            </view>
          </view>
          
          <view class="info-row">
            <view class="info-item">
              <text class="info-icon">📅</text>
              <view class="info-content">
                <text class="info-label">有效期至</text>
                <text class="info-value">{{ detail.expiry_date }}</text>
              </view>
            </view>
          </view>
          
          <view class="info-row">
            <view class="info-item">
              <text class="info-icon">📥</text>
              <view class="info-content">
                <text class="info-label">入库日期</text>
                <text class="info-value">{{ formatDate(detail.inbound_date) }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="detail.remark" class="info-row">
            <view class="info-item full">
              <text class="info-icon">📝</text>
              <view class="info-content">
                <text class="info-label">备注信息</text>
                <text class="info-value remark">{{ detail.remark }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 过期提示 -->
      <view class="expiry-card" :class="getDaysClass(detail.expiry_date)">
        <text class="expiry-icon">{{ getExpiryIcon(detail.expiry_date) }}</text>
        <view class="expiry-content">
          <text class="expiry-title">{{ getExpiryTitle(detail.expiry_date) }}</text>
          <text class="expiry-text">{{ getDaysText(detail.expiry_date) }}</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn primary" @click="showOutboundDialog = true">
          <text class="btn-icon">📤</text>
          <text>出库</text>
        </button>
      </view>
    </view>
    
    <!-- 出库弹窗 -->
    <view v-if="showOutboundDialog" class="dialog-mask" @click="showOutboundDialog = false">
      <view class="dialog-content" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">药品出库</text>
          <text class="dialog-close" @click="showOutboundDialog = false">✕</text>
        </view>
        
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">当前库存</text>
            <text class="form-value">{{ detail?.quantity }}</text>
          </view>
          
          <view class="form-item">
            <text class="form-label required">出库数量</text>
            <input 
              class="form-input" 
              v-model.number="outboundForm.quantity" 
              type="number"
              :max="detail?.quantity"
              placeholder="请输入出库数量"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label required">出库原因</text>
            <picker 
              mode="selector" 
              :range="reasonOptions"
              @change="onReasonChange"
            >
              <view class="form-input">
                <text :class="{ placeholder: !outboundForm.reason }">
                  {{ outboundForm.reason || '请选择出库原因' }}
                </text>
                <text class="arrow">›</text>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">领用人</text>
            <input 
              class="form-input" 
              v-model="outboundForm.recipient" 
              placeholder="请输入领用人（可选）"
            />
          </view>
        </view>
        
        <view class="dialog-footer">
          <button class="dialog-btn cancel" @click="showOutboundDialog = false">取消</button>
          <button class="dialog-btn confirm" @click="handleOutbound" :loading="submitting">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { inventoryApi } from '../../src/api/inventory'
import { getExpiryStatus, getDaysFromNow } from '../../src/utils/date'
import type { Batch, OutboundRequest } from '../../src/types'

const detail = ref<Batch | null>(null)
const loading = ref(false)
const showOutboundDialog = ref(false)
const submitting = ref(false)

const outboundForm = ref<OutboundRequest>({
  batch_id: 0,
  quantity: 1,
  reason: '',
  recipient: ''
})

const reasonOptions = ['销售', '报损', '过期销毁', '其他']

// 加载详情
async function loadDetail(id: number) {
  loading.value = true
  try {
    const data = await inventoryApi.detail(id)
    detail.value = data
    outboundForm.value.batch_id = id
  } catch (error) {
    console.error('加载详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 选择原因
function onReasonChange(e: any) {
  outboundForm.value.reason = reasonOptions[e.detail.value]
}

// 出库
async function handleOutbound() {
  if (!outboundForm.value.quantity || outboundForm.value.quantity <= 0) {
    uni.showToast({
      title: '请输入正确的数量',
      icon: 'none'
    })
    return
  }
  
  if (outboundForm.value.quantity > (detail.value?.quantity || 0)) {
    uni.showToast({
      title: '出库数量不能大于库存',
      icon: 'none'
    })
    return
  }
  
  if (!outboundForm.value.reason) {
    uni.showToast({
      title: '请选择出库原因',
      icon: 'none'
    })
    return
  }
  
  submitting.value = true
  try {
    await inventoryApi.outbound(outboundForm.value)
    
    uni.showToast({
      title: '出库成功',
      icon: 'success'
    })
    
    showOutboundDialog.value = false
    
    // 重新加载详情
    if (detail.value) {
      loadDetail(detail.value.id)
    }
  } catch (error) {
    console.error('出库失败:', error)
  } finally {
    submitting.value = false
  }
}

// 获取状态样式
function getStatusClass(expiryDate: string) {
  const status = getExpiryStatus(expiryDate)
  return `status-${status.type}`
}

// 获取状态文本
function getStatusText(expiryDate: string) {
  const status = getExpiryStatus(expiryDate)
  return status.text
}

// 获取剩余天数样式
function getDaysClass(expiryDate: string) {
  const days = getDaysFromNow(expiryDate)
  if (days < 0) return 'danger'
  if (days <= 90) return 'warning'
  return 'normal'
}

// 获取剩余天数文本
function getDaysText(expiryDate: string) {
  const days = getDaysFromNow(expiryDate)
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  if (days === 0) return '今天过期'
  return `距离过期还有 ${days} 天`
}

// 获取过期图标
function getExpiryIcon(expiryDate: string) {
  const days = getDaysFromNow(expiryDate)
  if (days < 0) return '❌'
  if (days <= 90) return '⚠️'
  return '✅'
}

// 获取过期标题
function getExpiryTitle(expiryDate: string) {
  const days = getDaysFromNow(expiryDate)
  if (days < 0) return '已过期'
  if (days <= 90) return '临期预警'
  return '状态正常'
}

// 格式化日期
function formatDate(dateStr: string) {
  if (!dateStr) return '未知'
  return dateStr.split('T')[0]
}

onLoad((options: any) => {
  if (options.id) {
    loadDetail(Number(options.id))
  }
})
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0F4FF 0%, #F5F7FA 100%);
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.loading-state {
  padding: 200rpx 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.loading-icon {
  font-size: 120rpx;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #909399;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

// 药品名称卡片
.medicine-header {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.medicine-name-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-right: 16rpx;
}

.medicine-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1.4;
}



.status-tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
  
  &.status-expired {
    background: #FFFFFF;
    color: #F56C6C;
  }
  
  &.status-expiry {
    background: #FFFFFF;
    color: #E6A23C;
  }
  
  &.status-normal {
    background: #FFFFFF;
    color: #67C23A;
  }
}

// 库存数量卡片
.quantity-card {
  background: linear-gradient(135deg, #42A5F5 0%, #2196F3 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.3);
}

.quantity-icon {
  font-size: 64rpx;
}

.quantity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.quantity-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

.quantity-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
}

// 信息卡片
.info-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #F0F2F5;
}

.title-icon {
  font-size: 32rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-row {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  
  &.full {
    flex-direction: column;
    gap: 12rpx;
  }
}

.info-icon {
  font-size: 36rpx;
  width: 48rpx;
  text-align: center;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #F0F2F5;
  
  .info-item.full & {
    flex-direction: column;
    align-items: flex-start;
    gap: 8rpx;
  }
}

.info-label {
  font-size: 26rpx;
  color: #909399;
}

.info-value {
  font-size: 28rpx;
  color: #303133;
  font-weight: 600;
  
  &.remark {
    font-weight: normal;
    line-height: 1.6;
  }
}

// 过期提示卡片
.expiry-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  
  &.danger {
    background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
    color: #FFFFFF;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
  }
  
  &.warning {
    background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
    color: #FFFFFF;
    box-shadow: 0 8rpx 24rpx rgba(255, 167, 38, 0.3);
  }
  
  &.normal {
    background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
    color: #FFFFFF;
    box-shadow: 0 8rpx 24rpx rgba(102, 187, 106, 0.3);
  }
}

.expiry-icon {
  font-size: 64rpx;
  flex-shrink: 0;
}

.expiry-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.expiry-title {
  font-size: 28rpx;
  font-weight: 600;
  opacity: 0.9;
}

.expiry-text {
  font-size: 32rpx;
  font-weight: bold;
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 16rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: #FFFFFF;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.action-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  
  &::after {
    border: none;
  }
  
  &.primary {
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    color: #FFFFFF;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  }
}

.btn-icon {
  font-size: 36rpx;
}

// 出库弹窗
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.dialog-content {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  max-height: 80vh;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #EBEEF5;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
}

.dialog-close {
  font-size: 40rpx;
  color: #909399;
}

.dialog-body {
  padding: 32rpx 24rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #303133;
  margin-bottom: 16rpx;
  
  &.required::before {
    content: '*';
    color: #F56C6C;
    margin-right: 4rpx;
  }
}

.form-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #409EFF;
}

.form-input {
  height: 80rpx;
  background: #F5F7FA;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #303133;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .placeholder {
    color: #C0C4CC;
  }
  
  .arrow {
    font-size: 40rpx;
    color: #C0C4CC;
  }
}

input.form-input {
  display: block;
}

.dialog-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  border-top: 1rpx solid #EBEEF5;
}

.dialog-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
  
  &::after {
    border: none;
  }
  
  &.cancel {
    background: #F5F7FA;
    color: #606266;
  }
  
  &.confirm {
    background: #409EFF;
    color: #FFFFFF;
  }
}
</style>

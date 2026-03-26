<template>
  <view class="outbound-page">
    <!-- 快捷操作区 -->
    <view class="quick-actions">
      <button class="action-btn scan-barcode-btn" @click="handleScanBarcode" :loading="scanning">
        <text class="action-icon">📷</text>
        <text class="action-text">{{ scanning ? '识别中...' : `扫码${term('outbound')}` }}</text>
      </button>
      <text class="action-tip">扫描{{ term('item') }}条形码，快速识别{{ term('item') }}</text>
    </view>
    
    <view class="form-container">
      <view class="form-item">
        <view class="form-label required">{{ term('item') }}名称</view>
        <view class="medicine-input-group">
          <input 
            class="form-input medicine-name-input" 
            v-model="medicineName" 
            :placeholder="`请输入或选择${term('item')}名称`"
            @input="onMedicineNameInput"
          />
          <button class="select-btn" @click="showMedicinePicker = true">
            <text class="select-icon">📋</text>
          </button>
        </view>
      </view>
      
      <!-- <view class="form-item">
        <view class="form-label">批次号</view>
        <input 
          class="form-input" 
          v-model="form.batch_number" 
          placeholder="请输入批次号（选填）"
        />
      </view> -->
      
      <view class="form-item">
        <view class="form-label required">{{ term('outbound') }}数量</view>
        <input 
          class="form-input" 
          v-model.number="form.quantity" 
          type="number"
          :placeholder="`请输入${term('outbound')}数量`"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label required">{{ term('outbound') }}原因</view>
        <view class="reason-input-group">
          <view class="form-input reason-display" @click="showReasonPicker = true">
            <text :class="{ placeholder: !form.reason }">{{ form.reason || `请选择${term('outbound')}原因` }}</text>
            <text class="arrow">▼</text>
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <view class="form-label">领用人</view>
        <input 
          class="form-input" 
          v-model="form.recipient" 
          placeholder="请输入领用人（选填）"
        />
      </view>
    </view>
    
    <view class="form-footer">
      <button class="submit-btn" @click="handleSubmit" :loading="submitting">
        确认{{ term('outbound') }}
      </button>
    </view>
    
    <!-- 出库原因选择器 -->
    <view v-if="showReasonPicker" class="picker-popup" @click="showReasonPicker = false">
      <view class="picker-content reason-picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择{{ term('outbound') }}原因</text>
          <text class="picker-close" @click="showReasonPicker = false">✕</text>
        </view>
        
        <scroll-view class="picker-list" scroll-y>
          <view 
            v-for="(reason, index) in reasonOptions" 
            :key="index"
            class="picker-item reason-item"
            :class="{ active: form.reason === reason }"
            @click="selectReason(reason)"
          >
            <text class="reason-text">{{ reason }}</text>
            <text v-if="form.reason === reason" class="check-icon">✓</text>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 药品选择器 -->
    <view v-if="showMedicinePicker" class="picker-popup" @click="showMedicinePicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择{{ term('item') }}</text>
          <text class="picker-close" @click="showMedicinePicker = false">✕</text>
        </view>
        
        <view class="picker-search">
          <input 
            class="search-input" 
            v-model="medicineKeyword" 
            placeholder="搜索药品名称"
            @input="searchMedicines"
          />
        </view>
        
        <scroll-view class="picker-list" scroll-y>
          <view 
            v-for="medicine in medicineList" 
            :key="medicine.id"
            class="picker-item"
            :class="{ active: selectedMedicineId === medicine.id }"
            @click="selectMedicine(medicine)"
          >
            <view class="medicine-info">
              <text class="medicine-name">{{ medicine.name }}</text>
              <text class="medicine-spec">{{ medicine.specification }}</text>
            </view>
            <text v-if="selectedMedicineId === medicine.id" class="check-icon">✓</text>
          </view>
          
          <view v-if="medicineList.length === 0" class="empty-state">
            <text>暂无药品数据</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { medicineApi } from '../../src/api/medicine'
import { inventoryApi } from '../../src/api/inventory'
import type { Medicine } from '../../src/types'
import { useMode } from '../../src/composables/useMode'

// 使用场景配置
const { term, refreshConfig } = useMode()

interface OutboundForm {
  batch_id: number
  quantity: number
  reason: string
  recipient: string
  batch_number: string
}

const form = ref<OutboundForm>({
  batch_id: 0,
  quantity: 1,
  reason: '销售',  // 默认原因为"销售"
  recipient: '',
  batch_number: ''
})

// 出库原因选项
const reasonOptions = [
  '销售',
  '损耗',
  '过期',
  '退货',
  '调拨',
  '其他'
]

const showReasonPicker = ref(false)

const submitting = ref(false)
const scanning = ref(false)
const showMedicinePicker = ref(false)
const medicineList = ref<Medicine[]>([])
const medicineKeyword = ref('')
const medicineName = ref('')
const selectedMedicineId = ref(0)

// 药品名称输入
function onMedicineNameInput() {
  selectedMedicineId.value = 0
}

// 加载药品列表
async function loadMedicines() {
  try {
    const res = await medicineApi.list({ page: 1, page_size: 100 })
    medicineList.value = res.items || []
  } catch (error: any) {
    console.error('加载药品列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    medicineList.value = []
  }
}

// 搜索药品
function searchMedicines() {
  loadMedicines()
}

// 选择药品
function selectMedicine(medicine: Medicine) {
  selectedMedicineId.value = medicine.id
  medicineName.value = medicine.name
  showMedicinePicker.value = false
}

// 选择出库原因
function selectReason(reason: string) {
  form.value.reason = reason
  showReasonPicker.value = false
}

// 扫描条形码出库 - 直接调用uni.scanCode
function handleScanBarcode() {
  uni.scanCode({
    success: async (res: any) => {
      const code = res.result
      if (code) {
        scanning.value = true
        try {
          // 根据条形码查询药品
          const medicine = await medicineApi.getByBarcode(code)
          selectedMedicineId.value = medicine.id
          medicineName.value = medicine.name
          uni.showToast({
            title: `已识别: ${medicine.name}`,
            icon: 'success'
          })
        } catch (error: any) {
          console.error('条形码查询失败:', error)
          uni.showToast({
            title: '未找到该条形码对应的药品',
            icon: 'none'
          })
        } finally {
          scanning.value = false
        }
      }
    },
    fail: (err: any) => {
      if (!err.errMsg?.includes('cancel')) {
        uni.showToast({ title: '扫描失败', icon: 'none' })
      }
    }
  })
}

// 从本地存储加载扫描结果（从首页扫码跳转过来）
async function loadScanResult() {
  try {
    // 检查首页扫码传过来的条形码
    const barcode = uni.getStorageSync('scannedBarcode')
    if (barcode) {
      uni.removeStorageSync('scannedBarcode')
      scanning.value = true
      try {
        const medicine = await medicineApi.getByBarcode(barcode)
        selectedMedicineId.value = medicine.id
        medicineName.value = medicine.name
        uni.showToast({
          title: `已识别: ${medicine.name}`,
          icon: 'success'
        })
      } catch (error: any) {
        console.error('条形码查询失败:', error)
        uni.showToast({
          title: '未找到该条形码对应的药品',
          icon: 'none'
        })
      } finally {
        scanning.value = false
      }
    }
  } catch (error) {
    console.error('读取扫描结果失败:', error)
  }
}

// 表单验证
function validateForm(): boolean {
  if (!selectedMedicineId.value && !medicineName.value.trim()) {
    uni.showToast({ title: '请输入或选择药品名称', icon: 'none' })
    return false
  }
  
  if (!form.value.quantity || form.value.quantity <= 0) {
    uni.showToast({ title: '请输入正确的出库数量', icon: 'none' })
    return false
  }
  
  if (!form.value.reason || !form.value.reason.trim()) {
    uni.showToast({ title: '请输入出库原因', icon: 'none' })
    return false
  }
  
  return true
}

// 提交表单
async function handleSubmit() {
  if (!validateForm()) return
  
  submitting.value = true
  try {
    // 根据药品名称和批次号查找batch_id
    let batchId = form.value.batch_id
    
    if (!batchId || batchId === 0) {
      console.log('查找批次:', { 
        medicineName: medicineName.value, 
        batchNumber: form.value.batch_number,
        selectedMedicineId: selectedMedicineId.value 
      })
      
      // 查询库存列表，找到匹配的批次
      // 注意：移动端默认 show_zero_stock=false，只返回有库存的批次
      const inventoryRes = await inventoryApi.list({
        medicine_id: selectedMedicineId.value || undefined,
        page: 1,
        page_size: 100,
        show_zero_stock: false  // 明确指定只查询有库存的批次
      })
      
      console.log('库存列表:', inventoryRes)
      console.log('库存数量:', inventoryRes.items?.length || 0)
      
      // 根据药品名称和批次号匹配
      let matchedBatch = null
      
      if (!inventoryRes.items || inventoryRes.items.length === 0) {
        console.error('库存列表为空')
        uni.showToast({
          title: '未找到库存信息',
          icon: 'none',
          duration: 3000
        })
        submitting.value = false
        return
      }
      
      if (form.value.batch_number && form.value.batch_number.trim()) {
        // 如果有批次号，精确匹配批次号
        console.log('按批次号匹配:', form.value.batch_number)
        matchedBatch = inventoryRes.items.find((batch: any) => 
          batch.medicine_name === medicineName.value && 
          batch.batch_number === form.value.batch_number
        )
        console.log('批次号匹配结果:', matchedBatch)
      } else {
        // 如果没有批次号，只匹配药品名称，选择库存最多的批次
        console.log('按药品名称匹配:', medicineName.value)
        const batches = inventoryRes.items.filter((batch: any) => {
          console.log('检查批次:', batch.medicine_name, '===', medicineName.value, '?', batch.medicine_name === medicineName.value)
          return batch.medicine_name === medicineName.value && batch.quantity > 0
        })
        
        console.log('匹配到的批次数:', batches.length)
        
        if (batches.length > 0) {
          matchedBatch = batches.reduce((max: any, batch: any) => 
            batch.quantity > max.quantity ? batch : max
          )
          console.log('选择库存最多的批次:', matchedBatch)
        }
      }
      
      if (!matchedBatch) {
        console.error('未找到匹配的批次')
        uni.showToast({
          title: form.value.batch_number ? '未找到匹配的批次' : '该药品暂无库存',
          icon: 'none',
          duration: 3000
        })
        submitting.value = false
        return
      }
      
      batchId = matchedBatch.id
      console.log('找到批次:', matchedBatch)
      
      // 检查库存是否足够
      if (matchedBatch.quantity < form.value.quantity) {
        uni.showToast({
          title: `库存不足，当前库存 ${matchedBatch.quantity}`,
          icon: 'none'
        })
        submitting.value = false
        return
      }
    }
    
    // 执行出库 - 构建请求数据
    const outboundData: any = {
      batch_id: Number(batchId),
      quantity: Number(form.value.quantity),
      reason: String(form.value.reason || '').trim()
    }
    
    // 只有当领用人有值时才添加
    if (form.value.recipient && form.value.recipient.trim()) {
      outboundData.recipient = String(form.value.recipient).trim()
    }
    
    console.log('准备出库:', JSON.stringify(outboundData))
    console.log('数据类型:', {
      batch_id: typeof outboundData.batch_id,
      quantity: typeof outboundData.quantity,
      reason: typeof outboundData.reason,
      reason_length: outboundData.reason.length
    })
    
    // 前端验证
    if (!outboundData.batch_id || outboundData.batch_id <= 0) {
      throw new Error('批次ID无效')
    }
    if (!outboundData.quantity || outboundData.quantity <= 0) {
      throw new Error('出库数量必须大于0')
    }
    if (!outboundData.reason || outboundData.reason.length === 0) {
      throw new Error('出库原因不能为空')
    }
    if (outboundData.reason.length > 200) {
      throw new Error('出库原因不能超过200字符')
    }
    
    await inventoryApi.outbound(outboundData)
    
    uni.showToast({
      title: '出库成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error: any) {
    console.error('出库失败:', error)
    console.error('错误详情:', JSON.stringify(error))
    
    let errorMessage = '出库失败，请重试'
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.data && error.data.detail) {
      errorMessage = error.data.detail
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    })
  } finally {
    submitting.value = false
  }
}

// 从本地存储接收OCR识别结果
function loadOCRResultFromStorage() {
  try {
    const result = uni.getStorageSync('ocrResult')
    
    if (result) {
      console.log('从本地存储接收到OCR识别结果:', result)
      
      // 清除本地存储，避免重复使用
      uni.removeStorageSync('ocrResult')
      
      let filledCount = 0
      
      // 填充批次号
      if (result.batch_number) {
        form.value.batch_number = result.batch_number
        filledCount++
        console.log('填充批次号:', result.batch_number)
      }
      
      // 填充药品名称
      if (result.name) {
        medicineName.value = result.name
        filledCount++
        console.log('填充药品名称:', result.name)
        
        // 尝试匹配药品
        const matchedMedicine = medicineList.value.find((m: any) => 
          m.name === result.name || 
          m.name.includes(result.name) || 
          result.name.includes(m.name)
        )
        
        if (matchedMedicine) {
          selectedMedicineId.value = matchedMedicine.id
          medicineName.value = matchedMedicine.name
          console.log('匹配到药品:', matchedMedicine.name)
        } else {
          console.log('未匹配到药品，使用识别的名称:', result.name)
        }
      }
      
      if (filledCount > 0) {
        uni.showToast({
          title: `已自动填充${filledCount}个字段`,
          icon: 'success',
          duration: 2000
        })
      } else {
        uni.showToast({
          title: '未识别到有效信息',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      console.log('本地存储中没有OCR识别结果')
    }
  } catch (error) {
    console.error('读取OCR结果失败:', error)
    uni.showToast({
      title: '识别结果读取失败',
      icon: 'none'
    })
  }
}

onMounted(() => {
  loadMedicines()
  // 延迟加载OCR结果，确保药品列表已加载
  setTimeout(() => {
    loadOCRResultFromStorage()
  }, 300)
})

// 页面显示时检查是否有扫描结果
onShow(() => {
  refreshConfig()
  // 动态设置页面标题
  uni.setNavigationBarTitle({
    title: term('outbound')
  })
  loadScanResult()
})
</script>

<style lang="scss" scoped>
.outbound-page {
  min-height: 100vh;
  background-color: #F5F7FA;
  padding-bottom: 120rpx;
}

// 快捷操作区
.quick-actions {
  padding: 24rpx;
  text-align: center;
}

.action-btn {
  width: 100%;
  height: 120rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  
  &::after {
    border: none;
  }
}

.scan-barcode-btn {
  background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
  box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.4);
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 28rpx;
}

.action-tip {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #909399;
  line-height: 1.5;
}

.form-container {
  background: #FFFFFF;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.form-item {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 28rpx;
  color: #303133;
  margin-bottom: 16rpx;
  font-weight: 600;
  
  &.required::before {
    content: '*';
    color: #F56C6C;
    margin-right: 4rpx;
  }
}

.medicine-input-group {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.medicine-name-input {
  flex: 1;
}

.select-btn {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  
  &::after {
    border: none;
  }
}

.select-icon {
  font-size: 32rpx;
}

.form-input {
  height: 80rpx;
  background: #F5F7FA;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #303133;
}

.reason-input-group {
  width: 100%;
}

.reason-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  
  .placeholder {
    color: #C0C4CC;
  }
  
  .arrow {
    font-size: 24rpx;
    color: #C0C4CC;
  }
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #F5F7FA;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  color: #303133;
  line-height: 1.6;
}

.form-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: #FFFFFF;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
  color: #FFFFFF;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  
  &::after {
    border: none;
  }
}

// 药品选择器
.picker-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.picker-content {
  width: 100%;
  height: 80vh;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #EBEEF5;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
}

.picker-close {
  font-size: 40rpx;
  color: #909399;
}

.picker-search {
  padding: 24rpx;
  border-bottom: 1rpx solid #EBEEF5;
}

.search-input {
  height: 72rpx;
  background: #F5F7FA;
  border-radius: 36rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
}

.picker-list {
  flex: 1;
  padding: 16rpx 24rpx;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #F5F7FA;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  
  &.active {
    background: #E3F2FD;
    border: 2rpx solid #409EFF;
  }
}

.medicine-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.medicine-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
}

.medicine-spec {
  font-size: 24rpx;
  color: #909399;
}

.check-icon {
  font-size: 40rpx;
  color: #409EFF;
  font-weight: bold;
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
  color: #909399;
  font-size: 28rpx;
}

// 出库原因选择器
.reason-picker-content {
  height: 50vh;
}

.reason-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  background: #F5F7FA;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  
  &.active {
    background: #E3F2FD;
    border: 2rpx solid #409EFF;
  }
}

.reason-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #303133;
}
</style>

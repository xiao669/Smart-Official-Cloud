<template>
  <view class="edit-page">
    <view class="form-container" v-if="batch">
      <view class="form-item">
        <view class="form-label">药品名称</view>
        <view class="form-value readonly">{{ batch.medicine_name }}</view>
      </view>
      
      <view class="form-item">
        <view class="form-label required">药品分类</view>
        <view class="form-input picker-input" @click="showCategoryPicker = true">
          <text :class="{ placeholder: !selectedCategory }">
            {{ selectedCategory || '请选择药品分类' }}
          </text>
          <text class="arrow">›</text>
        </view>
      </view>
      
      <view class="form-item">
        <view class="form-label required">单位</view>
        <view class="form-input picker-input" @click="showUnitPicker = true">
          <text :class="{ placeholder: !selectedUnit }">
            {{ selectedUnit || '请选择单位' }}
          </text>
          <text class="arrow">›</text>
        </view>
      </view>
      
      <!-- <view class="form-item">
        <view class="form-label">批次号</view>
        <input 
          class="form-input" 
          v-model="form.batch_number" 
          placeholder="请输入批次号（选填）"
        />
      </view>
       -->
      <view class="form-item">
        <view class="form-label required">数量</view>
        <input 
          class="form-input" 
          v-model.number="form.quantity" 
          type="number"
          placeholder="请输入数量"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label required">生产日期</view>
        <view class="date-input-group">
          <input 
            class="form-input date-input" 
            v-model="productionDateInput" 
            placeholder="格式：2024.12 或 2024.12.18"
            @blur="onProductionDateInput"
          />
          <button class="date-picker-btn" @click="openProductionDatePicker">
            <text class="picker-icon">📅</text>
          </button>
        </view>
      </view>
      
      <view class="form-item">
        <view class="form-label required">有效期</view>
        <view class="date-input-group">
          <input 
            class="form-input date-input" 
            v-model="expiryDateInput" 
            placeholder="格式：2026.12 或 2026.12.18"
            @blur="onExpiryDateInput"
          />
          <button class="date-picker-btn" @click="openExpiryDatePicker">
            <text class="picker-icon">📅</text>
          </button>
        </view>
      </view>
      
      <view class="form-item">
        <view class="form-label">备注</view>
        <textarea 
          class="form-textarea" 
          v-model="form.remark" 
          placeholder="请输入备注信息（可选）"
          maxlength="200"
        />
      </view>
    </view>
    
    <view class="form-footer">
      <button class="submit-btn" @click="handleSubmit" :loading="submitting">
        保存修改
      </button>
    </view>
    
    <!-- 生产日期选择器 -->
    <view v-if="showProductionDatePicker" class="picker-popup" @click="showProductionDatePicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择生产日期</text>
          <text class="picker-close" @click="showProductionDatePicker = false">✕</text>
        </view>
        <view class="date-picker-body">
          <picker-view 
            :value="productionDatePickerValue" 
            @change="onProductionDatePickerChange"
            class="date-picker-view"
            indicator-style="height: 88rpx;"
          >
            <picker-view-column>
              <view v-for="year in years" :key="year" class="date-picker-item">{{ year }}年</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="month in months" :key="month" class="date-picker-item">{{ month }}月</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="day in days" :key="day" class="date-picker-item">{{ day === '不选' ? '日(可选)' : day + '日' }}</view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="picker-footer">
          <button class="picker-cancel-btn" @click="showProductionDatePicker = false">取消</button>
          <button class="picker-confirm-btn" @click="confirmProductionDate">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 有效期选择器 -->
    <view v-if="showExpiryDatePicker" class="picker-popup" @click="showExpiryDatePicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择有效期</text>
          <text class="picker-close" @click="showExpiryDatePicker = false">✕</text>
        </view>
        <view class="date-picker-body">
          <picker-view 
            :value="expiryDatePickerValue" 
            @change="onExpiryDatePickerChange"
            class="date-picker-view"
            indicator-style="height: 88rpx;"
          >
            <picker-view-column>
              <view v-for="year in years" :key="year" class="date-picker-item">{{ year }}年</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="month in months" :key="month" class="date-picker-item">{{ month }}月</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="day in days" :key="day" class="date-picker-item">{{ day === '不选' ? '日(可选)' : day + '日' }}</view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="picker-footer">
          <button class="picker-cancel-btn" @click="showExpiryDatePicker = false">取消</button>
          <button class="picker-confirm-btn" @click="confirmExpiryDate">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 分类选择器 -->
    <view v-if="showCategoryPicker" class="picker-popup" @click="showCategoryPicker = false">
      <view class="picker-content simple-picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择药品分类</text>
          <text class="picker-close" @click="showCategoryPicker = false">✕</text>
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view 
            v-for="cat in categoryList" 
            :key="cat"
            class="simple-picker-item"
            :class="{ active: selectedCategory === cat }"
            @click="selectCategory(cat)"
          >
            <text>{{ cat }}</text>
            <text v-if="selectedCategory === cat" class="check-icon">✓</text>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 单位选择器 -->
    <view v-if="showUnitPicker" class="picker-popup" @click="showUnitPicker = false">
      <view class="picker-content simple-picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择单位</text>
          <text class="picker-close" @click="showUnitPicker = false">✕</text>
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view 
            v-for="unit in unitList" 
            :key="unit"
            class="simple-picker-item"
            :class="{ active: selectedUnit === unit }"
            @click="selectUnit(unit)"
          >
            <text>{{ unit }}</text>
            <text v-if="selectedUnit === unit" class="check-icon">✓</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { inventoryApi } from '../../src/api/inventory'
import { medicineApi } from '../../src/api/medicine'
import type { Batch } from '../../src/types'

const batch = ref<Batch | null>(null)
const batchId = ref(0)
const medicineId = ref(0)
const submitting = ref(false)

const form = ref({
  medicine_id: 0,
  batch_number: '',
  quantity: 0,
  production_date: '',
  expiry_date: '',
  remark: ''
})

const productionDateInput = ref('')
const expiryDateInput = ref('')

// 分类和单位选择
const showCategoryPicker = ref(false)
const showUnitPicker = ref(false)
const selectedCategory = ref('')
const selectedUnit = ref('')
const categoryList = ['中药', '西药']
const unitList = ['盒', '瓶', '支', '袋', '片', '粒', '管', '贴', '包', '罐', '桶', '箱']

// 日期选择器
const showProductionDatePicker = ref(false)
const showExpiryDatePicker = ref(false)

// 年份列表
const years = ref<number[]>([])
for (let i = 2018; i <= 2035; i++) {
  years.value.push(i)
}

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const defaultYearIndex = years.value.indexOf(currentYear) >= 0 ? years.value.indexOf(currentYear) : 0

const productionDatePickerValue = ref([defaultYearIndex, currentMonth - 1, 0])
const expiryDatePickerValue = ref([defaultYearIndex + 2, currentMonth - 1, 0])

// 月份列表
const months = ref<number[]>([])
for (let i = 1; i <= 12; i++) {
  months.value.push(i)
}

// 日期列表
const days = ref<(number | string)[]>(['不选'])
for (let i = 1; i <= 31; i++) {
  days.value.push(i)
}

// 选择分类
function selectCategory(cat: string) {
  selectedCategory.value = cat
  showCategoryPicker.value = false
}

// 选择单位
function selectUnit(unit: string) {
  selectedUnit.value = unit
  showUnitPicker.value = false
}

// 加载批次详情
async function loadBatch() {
  try {
    const data = await inventoryApi.detail(batchId.value)
    batch.value = data
    
    form.value = {
      medicine_id: data.medicine_id,
      batch_number: data.batch_number || '',
      quantity: data.quantity,
      production_date: data.production_date,
      expiry_date: data.expiry_date,
      remark: data.remark || ''
    }
    
    productionDateInput.value = data.production_date?.replace(/-/g, '.') || ''
    expiryDateInput.value = data.expiry_date?.replace(/-/g, '.') || ''
    
    // 加载药品信息获取分类和单位
    if (data.medicine_id) {
      try {
        const medicine = await medicineApi.detail(data.medicine_id)
        selectedUnit.value = medicine.unit || '盒'
        // 根据category判断分类
        selectedCategory.value = medicine.category === '中药' ? '中药' : '西药'
      } catch (e) {
        console.error('加载药品信息失败:', e)
        selectedUnit.value = '盒'
        selectedCategory.value = '西药'
      }
    }
  } catch (error) {
    console.error('加载失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 日期格式化
function formatDateInput(dateStr: string): { date: string, display: string } | null {
  if (!dateStr) return null
  dateStr = dateStr.trim()
  const parts = dateStr.split(/[.\-/]/)
  if (parts.length < 2) return null
  
  const year = parts[0].padStart(4, '0')
  const month = parts[1].padStart(2, '0')
  const day = parts.length >= 3 ? parts[2].padStart(2, '0') : '01'
  
  const yearNum = parseInt(year)
  const monthNum = parseInt(month)
  if (yearNum < 2000 || yearNum > 2100) return null
  if (monthNum < 1 || monthNum > 12) return null
  
  const fullDate = `${year}-${month}-${day}`
  const display = parts.length >= 3 ? `${year}.${month}.${day}` : `${year}.${month}`
  
  return { date: fullDate, display }
}

function onProductionDateInput() {
  const result = formatDateInput(productionDateInput.value)
  if (result) {
    form.value.production_date = result.date
    productionDateInput.value = result.display
  }
}

function onExpiryDateInput() {
  const result = formatDateInput(expiryDateInput.value)
  if (result) {
    form.value.expiry_date = result.date
    expiryDateInput.value = result.display
  }
}

function openProductionDatePicker() {
  if (form.value.production_date) {
    const parts = form.value.production_date.split('-')
    const year = parseInt(parts[0])
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])
    const yearIdx = years.value.indexOf(year)
    productionDatePickerValue.value = [
      yearIdx >= 0 ? yearIdx : defaultYearIndex,
      month - 1,
      day === 1 ? 0 : day
    ]
  }
  showProductionDatePicker.value = true
}

function openExpiryDatePicker() {
  if (form.value.expiry_date) {
    const parts = form.value.expiry_date.split('-')
    const year = parseInt(parts[0])
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])
    const yearIdx = years.value.indexOf(year)
    expiryDatePickerValue.value = [
      yearIdx >= 0 ? yearIdx : defaultYearIndex + 2,
      month - 1,
      day === 1 ? 0 : day
    ]
  }
  showExpiryDatePicker.value = true
}

function onProductionDatePickerChange(e: any) {
  productionDatePickerValue.value = e.detail.value
}

function onExpiryDatePickerChange(e: any) {
  expiryDatePickerValue.value = e.detail.value
}

function confirmProductionDate() {
  const [yearIdx, monthIdx, dayIdx] = productionDatePickerValue.value
  const year = years.value[yearIdx] || years.value[0]
  const month = months.value[monthIdx] || 1
  const day = days.value[dayIdx]
  
  if (day === '不选' || dayIdx === 0) {
    form.value.production_date = `${year}-${String(month).padStart(2, '0')}-01`
    productionDateInput.value = `${year}.${String(month).padStart(2, '0')}`
  } else {
    form.value.production_date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    productionDateInput.value = `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  }
  showProductionDatePicker.value = false
}

function confirmExpiryDate() {
  const [yearIdx, monthIdx, dayIdx] = expiryDatePickerValue.value
  const year = years.value[yearIdx] || years.value[0]
  const month = months.value[monthIdx] || 1
  const day = days.value[dayIdx]
  
  if (day === '不选' || dayIdx === 0) {
    form.value.expiry_date = `${year}-${String(month).padStart(2, '0')}-01`
    expiryDateInput.value = `${year}.${String(month).padStart(2, '0')}`
  } else {
    form.value.expiry_date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    expiryDateInput.value = `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  }
  showExpiryDatePicker.value = false
}

// 分类名称转ID
function getCategoryId(categoryName: string): number {
  return categoryName === '中药' ? 1 : 2
}

// 提交
async function handleSubmit() {
  if (!selectedCategory.value) {
    uni.showToast({ title: '请选择药品分类', icon: 'none' })
    return
  }
  if (!selectedUnit.value) {
    uni.showToast({ title: '请选择单位', icon: 'none' })
    return
  }
  if (!form.value.quantity || form.value.quantity <= 0) {
    uni.showToast({ title: '请输入正确的数量', icon: 'none' })
    return
  }
  if (!form.value.production_date) {
    uni.showToast({ title: '请选择生产日期', icon: 'none' })
    return
  }
  if (!form.value.expiry_date) {
    uni.showToast({ title: '请选择有效期', icon: 'none' })
    return
  }
  
  submitting.value = true
  try {
    // 更新药品的分类和单位
    if (form.value.medicine_id) {
      await medicineApi.update(form.value.medicine_id, {
        unit: selectedUnit.value,
        category_id: getCategoryId(selectedCategory.value)
      } as any)
    }
    
    // 更新批次信息
    await inventoryApi.update(batchId.value, form.value)
    uni.showToast({ title: '修改成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('修改失败:', error)
    uni.showToast({ title: '修改失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  if (options?.id) {
    batchId.value = parseInt(options.id)
    loadBatch()
  }
})
</script>

<style lang="scss" scoped>
.edit-page {
  min-height: 100vh;
  background-color: #F5F7FA;
  padding-bottom: 120rpx;
}

.form-container {
  background: #FFFFFF;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.form-item {
  margin-bottom: 32rpx;
  &:last-child { margin-bottom: 0; }
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

.form-value {
  font-size: 28rpx;
  color: #303133;
  padding: 20rpx 24rpx;
  background: #F5F7FA;
  border-radius: 8rpx;
  &.readonly { color: #909399; }
}

.form-input {
  height: 80rpx;
  background: #F5F7FA;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #303133;
}

.date-input-group {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.date-input { flex: 1; }

.date-picker-btn {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  &::after { border: none; }
}

.picker-icon { font-size: 32rpx; }

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #F5F7FA;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  color: #303133;
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
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  color: #FFFFFF;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  &::after { border: none; }
}

// 选择器弹窗
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
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
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

.date-picker-body {
  padding: 24rpx;
  height: 400rpx;
}

.date-picker-view {
  width: 100%;
  height: 100%;
}

.date-picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  color: #303133;
}

.picker-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  border-top: 1rpx solid #EBEEF5;
}

.picker-cancel-btn,
.picker-confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  &::after { border: none; }
}

.picker-cancel-btn {
  background: #F5F7FA;
  color: #606266;
}

.picker-confirm-btn {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  color: #FFFFFF;
}

// 简单选择器
.simple-picker-content {
  height: 50vh;
}

.picker-list {
  flex: 1;
  padding: 16rpx 24rpx;
  max-height: 60vh;
}

.simple-picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  background: #F5F7FA;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  font-size: 30rpx;
  color: #303133;
  
  &.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border: 2rpx solid #667EEA;
    color: #667EEA;
    font-weight: 600;
  }
}

.check-icon {
  font-size: 36rpx;
  color: #667EEA;
  font-weight: bold;
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .placeholder {
    color: #C0C4CC;
  }
  
  .arrow {
    font-size: 36rpx;
    color: #C0C4CC;
  }
}
</style>

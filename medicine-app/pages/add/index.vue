<template>
  <view class="add-page">
    <!-- AI识别按钮 -->
    <view class="ai-section">
      <button class="ai-btn primary" @click="handleAIRecognize" :loading="recognizing">
        <text class="ai-icon">📷</text>
        <text class="ai-text">{{ recognizing ? '识别中...' : '拍照识别' }}</text>
      </button>
      <text class="ai-tip">拍照识别{{ term('item') }}包装信息，自动填充表单</text>
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
        <text class="form-tip">温馨提示：可以手动输入新{{ term('item') }}名称，或点击右侧按钮从列表选择</text>
      </view>
      
      <view class="form-item">
        <view class="form-label required">{{ term('item') }}{{ term('category') }}</view>
        <view class="form-input picker-input" @click="showCategoryPicker = true">
          <text :class="{ placeholder: !selectedCategory }">
            {{ selectedCategory || `请选择${term('item')}${term('category')}` }}
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
      
      <view class="form-item">
        <view class="form-label">条形码</view>
        <view class="barcode-input-group">
          <input 
            class="form-input barcode-input" 
            v-model="medicineBarcode" 
            placeholder="请输入或扫描条形码（必填）"
          />
          <button class="scan-btn" @click="handleScanBarcode">
            <text class="scan-icon">📷</text>
          </button>
        </view>
        <text class="form-tip">条形码用于{{ term('outbound') }}时快速扫码识别{{ term('item') }}</text>
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
           
            @blur="onProductionDateInput"
          />
          <button class="date-picker-btn" @click="openProductionDatePicker">
            <text class="picker-icon">📅</text>
          </button>
        </view>
        <text class="form-tip">输入年月即可（如2024.12），日期可选</text>
      </view>
      
      <view class="form-item">
        <view class="form-label required">有效期</view>
        <view class="date-input-group">
          <input 
            class="form-input date-input" 
            v-model="expiryDateInput" 
         
            @blur="onExpiryDateInput"
          />
          <button class="date-picker-btn" @click="openExpiryDatePicker">
            <text class="picker-icon">📅</text>
          </button>
        </view>
        <text class="form-tip">输入年月即可（如2026.12），日期可选</text>
      </view>
      
      <view class="form-item">
        <view class="form-label">单价（元）</view>
        <input 
          class="form-input" 
          v-model.number="medicinePrice" 
          type="digit"
          :placeholder="`请输入${term('item')}单价（选填）`"
        />
        <text class="form-tip">新增{{ term('item') }}时可填写单价，已有{{ term('item') }}无需填写</text>
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
        确认添加
      </button>
    </view>
    
    <!-- 生产日期选择器 -->
    <view v-if="showProductionDatePicker" class="picker-popup" @click="showProductionDatePicker = false">
      <view class="picker-content date-picker-content" @click.stop>
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
      <view class="picker-content date-picker-content" @click.stop>
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
          <text class="picker-title">选择{{ term('item') }}{{ term('category') }}</text>
          <text class="picker-close" @click="showCategoryPicker = false">✕</text>
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view 
            v-for="cat in categoryList" 
            :key="cat.id"
            class="simple-picker-item"
            :class="{ active: selectedCategoryId === cat.id }"
            @click="selectCategory(cat)"
          >
            <text>{{ cat.name }}</text>
            <text v-if="selectedCategoryId === cat.id" class="check-icon">✓</text>
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
            :placeholder="`搜索${term('item')}名称`"
            @input="searchMedicines"
          />
        </view>
        
        <scroll-view class="picker-list" scroll-y>
          <view 
            v-for="medicine in medicineList" 
            :key="medicine.id"
            class="picker-item"
            :class="{ active: form.medicine_id === medicine.id }"
            @click="selectMedicine(medicine)"
          >
            <view class="medicine-info">
              <text class="medicine-name">{{ medicine.name }}</text>
              <text class="medicine-spec">{{ medicine.specification }}</text>
            </view>
            <text v-if="form.medicine_id === medicine.id" class="check-icon">✓</text>
          </view>
          
          <view v-if="medicineList.length === 0" class="empty-state">
            <text>暂无{{ term('item') }}数据</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { medicineApi } from '../../src/api/medicine'
import { inventoryApi } from '../../src/api/inventory'
import { ocrApi } from '../../src/api/ocr'
import type { Medicine, InboundRequest } from '../../src/types'
import { useMode } from '../../src/composables/useMode'

// 使用场景配置
const { term, refreshConfig } = useMode()

// 表单数据
const form = ref<InboundRequest>({
  medicine_id: 0,
  batch_number: '',
  quantity: 1,
  production_date: '',
  expiry_date: '',
  remark: ''
})

const submitting = ref(false)
const recognizing = ref(false)
const showMedicinePicker = ref(false)
const medicineList = ref<Medicine[]>([])
const medicineKeyword = ref('')
const medicineName = ref('')
const medicineBarcode = ref('')
const medicinePrice = ref<number | undefined>(undefined)
const productionDateInput = ref('')
const expiryDateInput = ref('')

// 分类和单位选择
const showCategoryPicker = ref(false)
const showUnitPicker = ref(false)
const selectedCategory = ref('')
const selectedUnit = ref('')
// 分类列表（从API动态获取，根据当前场景返回对应分类）
const categoryList = ref<Array<{ id: number; name: string }>>([])
const selectedCategoryId = ref(0)

// 单位列表（根据场景动态显示）
const unitConfigs: Record<string, string[]> = {
  medicine: ['盒', '瓶', '支', '袋', '片', '粒', '管', '贴', '包', '罐'],
  inventory: ['件', '个', '箱', '包', '套', '台', '只', '条', '卷', '桶'],
  food: ['份', '袋', '包', '瓶', '罐', '盒', '斤', '公斤', '克', '升']
}
const unitList = ref<string[]>([])

// 加载单位列表（根据当前场景）
function loadUnits() {
  const appMode = uni.getStorageSync('app_mode') || 'medicine'
  unitList.value = unitConfigs[appMode] || unitConfigs.medicine
  console.log('加载单位列表:', appMode, unitList.value)
}

// 加载分类列表（根据当前场景动态获取）
async function loadCategories() {
  try {
    const categories = await medicineApi.getCategories()
    categoryList.value = categories || []
    console.log('加载分类列表成功:', categoryList.value)
  } catch (error: any) {
    console.error('加载分类列表失败:', error)
    // 加载失败时使用默认分类
    categoryList.value = [
      { id: 1, name: '默认分类' }
    ]
  }
}

// 日期选择器
const showProductionDatePicker = ref(false)
const showExpiryDatePicker = ref(false)

// 生成年份列表（2018-2035）
const years = ref<number[]>([])
for (let i = 2018; i <= 2035; i++) {
  years.value.push(i)
}

// 默认选择当前年份的索引
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const defaultYearIndex = years.value.indexOf(currentYear) >= 0 ? years.value.indexOf(currentYear) : 0
const productionDatePickerValue = ref([defaultYearIndex, currentMonth - 1, 0])
const expiryDatePickerValue = ref([defaultYearIndex + 2, currentMonth - 1, 0]) // 有效期默认2年后

// 生成月份列表（1-12）
const months = ref<number[]>([])
for (let i = 1; i <= 12; i++) {
  months.value.push(i)
}

// 生成日期列表（不选, 1-31）
const days = ref<(number | string)[]>(['不选'])
for (let i = 1; i <= 31; i++) {
  days.value.push(i)
}

// 选中的药品
const selectedMedicine = computed(() => {
  return medicineList.value.find(m => m.id === form.value.medicine_id)
})

// 药品名称输入
function onMedicineNameInput() {
  // 清除选中的药品ID（因为用户手动输入了）
  form.value.medicine_id = 0
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
  // 实际应该调用 API 搜索，这里简化处理
  loadMedicines()
}

// 选择药品
function selectMedicine(medicine: Medicine) {
  form.value.medicine_id = medicine.id
  medicineName.value = medicine.name
  showMedicinePicker.value = false
}

// 选择分类
function selectCategory(cat: { id: number, name: string }) {
  selectedCategoryId.value = cat.id
  selectedCategory.value = cat.name
  showCategoryPicker.value = false
}

// 选择单位
function selectUnit(unit: string) {
  selectedUnit.value = unit
  showUnitPicker.value = false
}

// 扫描条形码 - 直接调用uni.scanCode
function handleScanBarcode() {
  uni.scanCode({
    success: (res: any) => {
      const code = res.result
      if (code) {
        medicineBarcode.value = code
        uni.showToast({
          title: '条形码已填入',
          icon: 'success'
        })
      }
    },
    fail: (err: any) => {
      if (!err.errMsg?.includes('cancel')) {
        uni.showToast({ title: '扫描失败', icon: 'none' })
      }
    }
  })
}

// 从本地存储加载扫描的条形码
function loadScannedBarcode() {
  try {
    const barcode = uni.getStorageSync('scannedBarcode')
    if (barcode) {
      medicineBarcode.value = barcode
      uni.removeStorageSync('scannedBarcode')
      uni.showToast({
        title: '条形码已填入',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('读取条形码失败:', error)
  }
}

// 格式化日期：支持 xxxx.xx 或 xxxx.xx.xx 格式
function formatDateInput(dateStr: string): { date: string, display: string } | null {
  if (!dateStr) return null
  
  // 移除所有空格
  dateStr = dateStr.trim()
  
  // 支持多种分隔符：. / -
  const parts = dateStr.split(/[.\-/]/)
  
  // 至少需要年和月
  if (parts.length < 2) return null
  
  const year = parts[0].padStart(4, '0')
  const month = parts[1].padStart(2, '0')
  // 日期可选，默认为1日
  const day = parts.length >= 3 ? parts[2].padStart(2, '0') : '01'
  
  // 验证年月有效性
  const yearNum = parseInt(year)
  const monthNum = parseInt(month)
  if (yearNum < 2000 || yearNum > 2100) return null
  if (monthNum < 1 || monthNum > 12) return null
  
  // 验证日期有效性
  if (parts.length >= 3) {
    const dayNum = parseInt(day)
    if (dayNum < 1 || dayNum > 31) return null
  }
  
  const fullDate = `${year}-${month}-${day}`
  // 显示格式：如果没有输入日，只显示年月
  const display = parts.length >= 3 ? `${year}.${month}.${day}` : `${year}.${month}`
  
  return { date: fullDate, display }
}

// 生产日期手动输入
function onProductionDateInput() {
  const result = formatDateInput(productionDateInput.value)
  if (result) {
    form.value.production_date = result.date
    productionDateInput.value = result.display
  } else if (productionDateInput.value) {
    uni.showToast({
      title: '请输入正确的年月，如 2024.12',
      icon: 'none'
    })
  }
}

// 有效期手动输入
function onExpiryDateInput() {
  const result = formatDateInput(expiryDateInput.value)
  if (result) {
    form.value.expiry_date = result.date
    expiryDateInput.value = result.display
  } else if (expiryDateInput.value) {
    uni.showToast({
      title: '请输入正确的年月，如 2026.12',
      icon: 'none'
    })
  }
}

// 打开生产日期选择器时初始化
function openProductionDatePicker() {
  // 如果已有日期，解析并设置picker值
  if (form.value.production_date) {
    const parts = form.value.production_date.split('-')
    const year = parseInt(parts[0])
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])
    
    const yearIdx = years.value.indexOf(year)
    productionDatePickerValue.value = [
      yearIdx >= 0 ? yearIdx : defaultYearIndex,
      month - 1,
      day === 1 ? 0 : day // 如果是1日，可能是默认值，显示"不选"
    ]
  } else {
    // 默认当前年月
    productionDatePickerValue.value = [defaultYearIndex, currentMonth - 1, 0]
  }
  showProductionDatePicker.value = true
}

// 打开有效期选择器时初始化
function openExpiryDatePicker() {
  // 如果已有日期，解析并设置picker值
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
  } else {
    // 默认2年后
    expiryDatePickerValue.value = [defaultYearIndex + 2, currentMonth - 1, 0]
  }
  showExpiryDatePicker.value = true
}

// 生产日期选择器值变化
function onProductionDatePickerChange(e: any) {
  const val = e.detail.value
  // 确保值在有效范围内
  productionDatePickerValue.value = [
    Math.min(Math.max(val[0] || 0, 0), years.value.length - 1),
    Math.min(Math.max(val[1] || 0, 0), 11),
    Math.min(Math.max(val[2] || 0, 0), days.value.length - 1)
  ]
}

// 有效期选择器值变化
function onExpiryDatePickerChange(e: any) {
  const val = e.detail.value
  // 确保值在有效范围内
  expiryDatePickerValue.value = [
    Math.min(Math.max(val[0] || 0, 0), years.value.length - 1),
    Math.min(Math.max(val[1] || 0, 0), 11),
    Math.min(Math.max(val[2] || 0, 0), days.value.length - 1)
  ]
}

// 确认生产日期
function confirmProductionDate() {
  const yearIndex = productionDatePickerValue.value[0] || 0
  const monthIndex = productionDatePickerValue.value[1] || 0
  const dayIndex = productionDatePickerValue.value[2] || 0
  
  const year = years.value[yearIndex] || years.value[0]
  const month = months.value[monthIndex] || 1
  const day = days.value[dayIndex]
  
  console.log('生产日期选择:', { yearIndex, monthIndex, dayIndex, year, month, day })
  
  // 如果选择了"不选"，日期默认为1日，但显示只显示年月
  if (day === '不选' || dayIndex === 0) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-01`
    form.value.production_date = dateStr
    productionDateInput.value = `${year}.${String(month).padStart(2, '0')}`
  } else {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    form.value.production_date = dateStr
    productionDateInput.value = `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  }
  
  showProductionDatePicker.value = false
}

// 确认有效期
function confirmExpiryDate() {
  const yearIndex = expiryDatePickerValue.value[0] || 0
  const monthIndex = expiryDatePickerValue.value[1] || 0
  const dayIndex = expiryDatePickerValue.value[2] || 0
  
  const year = years.value[yearIndex] || years.value[0]
  const month = months.value[monthIndex] || 1
  const day = days.value[dayIndex]
  
  console.log('有效期选择:', { yearIndex, monthIndex, dayIndex, year, month, day })
  
  // 如果选择了"不选"，日期默认为1日，但显示只显示年月
  if (day === '不选' || dayIndex === 0) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-01`
    form.value.expiry_date = dateStr
    expiryDateInput.value = `${year}.${String(month).padStart(2, '0')}`
  } else {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    form.value.expiry_date = dateStr
    expiryDateInput.value = `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  }
  
  showExpiryDatePicker.value = false
}

// 表单验证
function validateForm(): boolean {
  // 检查药品名称（手动输入或选择）
  if (!form.value.medicine_id && !medicineName.value.trim()) {
    uni.showToast({ title: '请输入或选择药品名称', icon: 'none' })
    return false
  }
  
  // 检查分类
  if (!selectedCategoryId.value) {
    uni.showToast({ title: '请选择药品分类', icon: 'none' })
    return false
  }
  
  // 检查单位
  if (!selectedUnit.value) {
    uni.showToast({ title: '请选择单位', icon: 'none' })
    return false
  }
  
  // 批次号改为选填，不再验证
  
  if (!form.value.quantity || form.value.quantity <= 0) {
    uni.showToast({ title: '请输入正确的数量', icon: 'none' })
    return false
  }
  
  if (!form.value.production_date) {
    uni.showToast({ title: '请选择生产日期', icon: 'none' })
    return false
  }
  
  if (!form.value.expiry_date) {
    uni.showToast({ title: '请选择有效期', icon: 'none' })
    return false
  }
  
  if (form.value.expiry_date <= form.value.production_date) {
    uni.showToast({ title: '有效期必须晚于生产日期', icon: 'none' })
    return false
  }
  
  return true
}

// 填充OCR识别结果到表单
async function fillFormWithOCRResult(result: any) {
  let filledCount = 0
  
  // 自动填充表单
  if (result.batch_number) {
    form.value.batch_number = result.batch_number
    filledCount++
    console.log('填充批次号:', result.batch_number)
  }
  
  if (result.production_date) {
    form.value.production_date = result.production_date
    productionDateInput.value = result.production_date.replace(/-/g, '.')
    filledCount++
    console.log('填充生产日期:', result.production_date)
  }
  
  if (result.expiry_date) {
    form.value.expiry_date = result.expiry_date
    expiryDateInput.value = result.expiry_date.replace(/-/g, '.')
    filledCount++
    console.log('填充有效期:', result.expiry_date)
  }
  
  // 如果识别到药品名称，尝试匹配或创建药品
  if (result.name) {
    console.log('识别到药品名称:', result.name)
    
    // 尝试精确匹配
    let matchedMedicine = medicineList.value.find((m: any) => m.name === result.name)
    
    // 如果精确匹配失败，尝试模糊匹配
    if (!matchedMedicine) {
      matchedMedicine = medicineList.value.find((m: any) => 
        m.name.includes(result.name) || result.name.includes(m.name)
      )
    }
    
    if (matchedMedicine) {
      form.value.medicine_id = matchedMedicine.id
      medicineName.value = matchedMedicine.name
      filledCount++
      console.log('匹配到药品:', matchedMedicine.name)
    } else {
      console.log('未找到匹配的药品，尝试自动创建')
      try {
        const code = 'MED' + Date.now()
        // 使用用户选择的分类ID，如果未选择则默认西药(2)
        const categoryId = selectedCategoryId.value || 2
        const createData: any = {
          name: result.name,
          code: code,
          category_id: categoryId,
          specification: result.specification || '未知',
          unit: selectedUnit.value || '盒',
          manufacturer: result.manufacturer || '未知'
        }
        
        // 如果填写了价格，添加到创建数据中
        if (medicinePrice.value !== undefined && medicinePrice.value > 0) {
          createData.price = medicinePrice.value
        }
        
        const newMedicine = await medicineApi.create(createData)
        
        console.log('自动创建药品成功:', newMedicine)
        await loadMedicines()
        
        form.value.medicine_id = newMedicine.id
        medicineName.value = result.name
        filledCount++
        
        uni.showToast({
          title: `已自动添加药品"${result.name}"`,
          icon: 'success',
          duration: 2000
        })
      } catch (error) {
        console.error('自动创建药品失败:', error)
        uni.showModal({
          title: '无法自动添加药品',
          content: `识别到药品"${result.name}"，但自动添加失败。请手动输入药品名称。`,
          showCancel: false
        })
      }
    }
  }
  
  return filledCount
}

// AI识别
function handleAIRecognize() {
  console.log('开始AI识别...')
  
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      try {
        console.log('图片选择成功:', res)
        
        if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
          console.log('未选择图片')
          return
        }
        
        const tempFilePath = res.tempFilePaths[0]
        console.log('图片路径:', tempFilePath)
        
        recognizing.value = true
        uni.showLoading({
          title: '识别中...',
          mask: true
        })
        
        // 上传并识别
        const uploadRes = await uni.uploadFile({
          url: 'http://192.168.3.2:8000/api/ocr/recognize',
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        
        if (uploadRes.statusCode === 200) {
          const result = JSON.parse(uploadRes.data)
          console.log('OCR识别结果:', result)
          
          // 填充表单
          const filledCount = await fillFormWithOCRResult(result)
          
          // 显示识别结果
          if (filledCount > 0) {
            uni.showToast({
              title: `识别成功，已填充${filledCount}个字段`,
              icon: 'success',
              duration: 2000
            })
          } else {
            uni.showToast({
              title: '识别成功，但未提取到有效信息',
              icon: 'none',
              duration: 2000
            })
          }
        } else {
          throw new Error('识别失败')
        }
      } catch (error: any) {
        console.error('识别处理失败:', error)
        uni.showToast({
          title: '识别失败，请重试',
          icon: 'none',
          duration: 2000
        })
      } finally {
        uni.hideLoading()
        recognizing.value = false
      }
    },
    fail: (err) => {
      console.log('图片选择失败:', err)
      recognizing.value = false
      
      // 用户取消不显示错误
      if (err.errMsg && err.errMsg.includes('cancel')) {
        console.log('用户取消选择图片')
        return
      }
      
      // 其他错误显示提示
      let errorMsg = '图片选择失败'
      if (err.errMsg && err.errMsg.includes('permission')) {
        errorMsg = '请授予相机和相册权限'
      }
      
      uni.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
    }
  })
}

// 提交表单
async function handleSubmit() {
  // 防止重复提交
  if (submitting.value) {
    console.log('正在提交中，忽略重复点击')
    return
  }
  
  if (!validateForm()) return
  
  submitting.value = true
  try {
    // 如果没有选中药品ID，说明是手动输入的新药品
    if (!form.value.medicine_id && medicineName.value.trim()) {
      console.log('手动输入新药品:', medicineName.value)
      
      // 自动创建新药品
      try {
        const code = 'MED' + Date.now()
        const createData: any = {
          name: medicineName.value.trim(),
          code: code,
          category_id: selectedCategoryId.value,  // 使用选中的分类ID
          specification: '未知',
          unit: selectedUnit.value,
          manufacturer: '未知'
        }
        
        // 如果填写了条形码，添加到创建数据中
        if (medicineBarcode.value && medicineBarcode.value.trim()) {
          createData.barcode = medicineBarcode.value.trim()
        }
        
        // 如果填写了价格，添加到创建数据中
        if (medicinePrice.value !== undefined && medicinePrice.value > 0) {
          createData.price = medicinePrice.value
        }
        
        const newMedicine = await medicineApi.create(createData)
        
        console.log('自动创建药品成功:', newMedicine)
        form.value.medicine_id = newMedicine.id
        
        uni.showToast({
          title: `已自动添加药品"${medicineName.value}"`,
          icon: 'success',
          duration: 1500
        })
        
        // 等待提示显示
        await new Promise(resolve => setTimeout(resolve, 1500))
      } catch (error) {
        console.error('自动创建药品失败:', error)
        uni.showToast({
          title: '创建药品失败，请重试',
          icon: 'none'
        })
        submitting.value = false
        return
      }
    }
    
    // 批次号为空时，保持为空，不自动生成
    // 后端会接受 null 或空字符串作为批次号
    if (!form.value.batch_number || form.value.batch_number.trim() === '') {
      form.value.batch_number = null
      console.log('批次号为空，保持为空')
    }
    
    // 如果填写了条形码，更新药品的条形码
    console.log('检查条形码:', {
      medicine_id: form.value.medicine_id,
      barcode: medicineBarcode.value
    })
    
    if (form.value.medicine_id && medicineBarcode.value && medicineBarcode.value.trim()) {
      console.log('准备更新条形码, medicine_id:', form.value.medicine_id, 'barcode:', medicineBarcode.value.trim())
      try {
        const updateResult = await medicineApi.update(form.value.medicine_id, {
          barcode: medicineBarcode.value.trim()
        })
        console.log('更新条形码成功:', updateResult)
      } catch (error: any) {
        console.error('更新条形码失败:', error)
        uni.showToast({
          title: '条形码保存失败: ' + (error.message || '未知错误'),
          icon: 'none',
          duration: 3000
        })
      }
    } else {
      console.log('跳过条形码更新: medicine_id或barcode为空')
    }
    
    // 提交入库
    await inventoryApi.inbound(form.value)
    
    uni.showToast({
      title: '添加成功',
      icon: 'success'
    })
    
    // 延迟返回
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('添加失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadMedicines()
  loadCategories()
  loadUnits()
})

// 页面显示时刷新场景配置
onShow(() => {
  refreshConfig()
  loadCategories()  // 刷新分类列表（场景可能已切换）
  loadUnits()       // 刷新单位列表（场景可能已切换）
  // 动态设置页面标题
  uni.setNavigationBarTitle({
    title: term('add')
  })
})

// 页面显示时检查是否有扫描的条形码
onShow(() => {
  loadScannedBarcode()
})
</script>

<style lang="scss" scoped>
.add-page {
  min-height: 100vh;
  background-color: #F5F7FA;
  padding-bottom: 120rpx;
}

// AI识别区域
.ai-section {
  padding: 24rpx;
  text-align: center;
}

.ai-btn {
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
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  box-shadow: 0 8rpx 24rpx rgba(14, 116, 144, 0.4);
  
  &::after {
    border: none;
  }
}

.ai-icon {
  font-size: 40rpx;
}

.ai-text {
  font-size: 28rpx;
}

.ai-tip {
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

.form-tip {
  display: block;
  font-size: 24rpx;
  color: #909399;
  margin-top: 8rpx;
  line-height: 1.5;
}

.medicine-input-group {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.medicine-name-input {
  flex: 1;
}

.barcode-input-group {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.barcode-input {
  flex: 1;
}

.scan-btn {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
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

.scan-icon {
  font-size: 32rpx;
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

.date-input-group {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.date-input {
  flex: 1;
}

.date-picker-btn {
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

.picker-icon {
  font-size: 32rpx;
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
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  color: #FFFFFF;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  
  &::after {
    border: none;
  }
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
  height: 80vh;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.date-picker-content {
  height: 60vh;
}

.simple-picker-content {
  height: 50vh;
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
    background: linear-gradient(135deg, rgba(14, 116, 144, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%);
    border: 2rpx solid #0e7490;
    color: #0e7490;
    font-weight: 600;
  }
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

// 日期选择器
.date-picker-body {
  flex: 1;
  padding: 24rpx;
  display: flex;
  align-items: center;
}

.date-picker-view {
  width: 100%;
  height: 400rpx;
}

// 日期选择器项目样式
.date-picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  color: #303133;
  text-align: center;
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
  
  &::after {
    border: none;
  }
}

.picker-cancel-btn {
  background: #F5F7FA;
  color: #606266;
}

.picker-confirm-btn {
  background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
  color: #FFFFFF;
}
</style>

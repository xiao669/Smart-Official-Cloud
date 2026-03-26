/**
 * 预警状态管理
 */
import { defineStore } from 'pinia'
import { warningApi } from '../api/warning'
import type { Warning, WarningConfig } from '../types'

interface WarningState {
  warnings: Warning[]
  unreadCount: number
  config: WarningConfig
  loading: boolean
}

export const useWarningStore = defineStore('warning', {
  state: (): WarningState => ({
    warnings: [],
    unreadCount: 0,
    config: {
      expiry_warning_days: 90,
      low_stock_threshold: 10
    },
    loading: false
  }),
  
  getters: {
    // 过期预警
    expiredWarnings: (state) => state.warnings.filter(w => w.type === 'expired'),
    
    // 临期预警
    expiryWarnings: (state) => state.warnings.filter(w => w.type === 'expiry'),
    
    // 低库存预警
    lowStockWarnings: (state) => state.warnings.filter(w => w.type === 'low_stock'),
    
    // 未读预警
    unreadWarnings: (state) => state.warnings.filter(w => !w.is_read)
  },
  
  actions: {
    /**
     * 获取预警列表
     */
    async fetchWarnings(params?: any) {
      this.loading = true
      try {
        const res = await warningApi.list(params)
        this.warnings = res.items
        this.unreadCount = res.items.filter(w => !w.is_read).length
        return res
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 标记已读
     */
    async markAsRead(id: number) {
      await warningApi.markAsRead(id)
      
      const warning = this.warnings.find(w => w.id === id)
      if (warning && !warning.is_read) {
        warning.is_read = true
        this.unreadCount--
      }
    },
    
    /**
     * 全部标记已读
     */
    async markAllAsRead() {
      await warningApi.markAllAsRead()
      
      this.warnings.forEach(w => {
        w.is_read = true
      })
      this.unreadCount = 0
    },
    
    /**
     * 检查预警
     */
    async checkWarnings() {
      const res = await warningApi.checkWarnings()
      if (res.generated_count > 0) {
        await this.fetchWarnings({ is_read: false })
      }
      return res
    },
    
    /**
     * 获取配置
     */
    async fetchConfig() {
      const config = await warningApi.getConfig()
      this.config = config
      return config
    },
    
    /**
     * 更新配置
     */
    async updateConfig(data: WarningConfig) {
      const config = await warningApi.updateConfig(data)
      this.config = config
      return config
    }
  }
})

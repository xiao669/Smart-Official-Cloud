/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { authApi } from '../api/auth'
import { tokenStorage, userStorage } from '../utils/storage'
import type { UserInfo, LoginRequest } from '../types'

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  isLoggedIn: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: tokenStorage.get(),
    userInfo: userStorage.get(),
    isLoggedIn: !!tokenStorage.get()
  }),
  
  actions: {
    /**
     * 登录
     */
    async login(data: LoginRequest) {
      try {
        const res = await authApi.login(data)
        
        this.token = res.access_token
        this.userInfo = res.user
        this.isLoggedIn = true
        
        // 保存到本地
        tokenStorage.set(res.access_token)
        userStorage.set(res.user)
        
        return res
      } catch (error) {
        throw error
      }
    },
    
    /**
     * 短信验证码登录
     */
    async smsLogin(phone: string, code: string) {
      try {
        const res = await authApi.smsLogin(phone, code)
        
        this.token = res.access_token
        this.userInfo = res.user
        this.isLoggedIn = true
        
        // 保存到本地
        tokenStorage.set(res.access_token)
        userStorage.set(res.user)
        
        return res
      } catch (error) {
        throw error
      }
    },
    
    /**
     * 退出登录
     */
    logout() {
      // 直接清除本地状态，不需要调用后端接口
      this.token = null
      this.userInfo = null
      this.isLoggedIn = false
      
      tokenStorage.remove()
      userStorage.remove()
      
      uni.reLaunch({
        url: '/pages/login/index'
      })
    },
    
    /**
     * 获取当前用户信息
     */
    async fetchUserInfo() {
      try {
        const userInfo = await authApi.getCurrentUser()
        this.userInfo = userInfo
        userStorage.set(userInfo)
        return userInfo
      } catch (error) {
        throw error
      }
    }
  }
})

<template>
  <div class="app-wrapper">
    <aside class="sidebar" :class="{ 'is-collapsed': appStore.sidebarCollapsed }">
      <Sidebar />
    </aside>
    <div class="main-wrapper">
      <header class="header">
        <Header />
      </header>
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/auth'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

// 在组件挂载时获取当前用户信息
onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      const user = await authApi.getCurrentUser()
      authStore.setUser(user)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})
</script>

<style scoped lang="scss">
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  height: 100vh;
  flex-shrink: 0;
  background: linear-gradient(180deg, #1a2332 0%, #2c3e50 100%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  &.is-collapsed {
    width: 64px;
  }
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  min-width: 0; // 防止flex子元素溢出
}

.header {
  height: 60px;
  min-height: 60px;
  flex-shrink: 0;
  background-color: var(--bg-white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 99;
}

.main-content {
  flex: 1;
  background-color: var(--bg-color);
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
}
</style>

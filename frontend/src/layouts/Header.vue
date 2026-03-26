<template>
  <div class="header-container">
    <div class="left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentRoute?.meta?.title">
          {{ currentRoute.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="right">
      <!-- 场景切换 -->
      <el-dropdown @command="handleModeChange" trigger="click">
        <div class="mode-selector" :style="{ '--mode-color': appStore.modeConfig.color }">
          <span class="mode-icon">{{ appStore.modeConfig.icon }}</span>
          <span class="mode-name">{{ appStore.modeConfig.name }}</span>
          <el-icon class="mode-arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="mode in appStore.modeList" 
              :key="mode.key"
              :command="mode.key"
              :class="{ 'is-active': appStore.currentMode === mode.key }"
            >
              <span class="mode-option">
                <span class="option-icon">{{ mode.icon }}</span>
                <span class="option-info">
                  <span class="option-name">{{ mode.name }}</span>
                  <span class="option-desc">{{ mode.description }}</span>
                </span>
                <el-icon v-if="appStore.currentMode === mode.key" class="option-check"><Check /></el-icon>
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <el-badge :value="warningCount" :hidden="warningCount === 0" class="warning-badge">
        <el-icon class="icon-btn" @click="$router.push('/warnings')"><Bell /></el-icon>
      </el-badge>
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" icon="User" />
          <span class="username">{{ authStore.user?.realname || authStore.user?.username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import type { ModeType } from '@/config/mode-config'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const warningCount = ref(0)
const currentRoute = computed(() => route)

// 切换场景
async function handleModeChange(mode: ModeType) {
  if (mode === appStore.currentMode) return
  
  try {
    await appStore.setMode(mode)
    ElMessage.success(`已切换到${appStore.modeConfig.name}`)
    
    // 刷新当前页面数据
    router.go(0)
  } catch (error) {
    ElMessage.error('切换场景失败')
  }
}

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      authStore.logout()
      router.push('/login')
    })
  } else if (command === 'profile') {
    router.push('/system/profile')
  }
}
</script>

<style scoped lang="scss">
.header-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 22px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
  
  &:hover {
    color: var(--primary-color);
    background-color: var(--bg-light);
  }
}

.right {
  display: flex;
  align-items: center;
  gap: 24px;
}

// 场景切换样式
.mode-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--mode-color) 0%, color-mix(in srgb, var(--mode-color) 80%, #000) 100%);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .mode-icon {
    font-size: 18px;
  }
  
  .mode-name {
    font-size: 14px;
    font-weight: 600;
  }
  
  .mode-arrow {
    font-size: 12px;
    transition: transform 0.3s;
  }
}

:deep(.el-dropdown-menu) {
  padding: 8px;
  min-width: 220px;
}

:deep(.el-dropdown-menu__item) {
  padding: 0;
  border-radius: 8px;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    background-color: var(--bg-light);
  }
  
  &.is-active {
    background-color: rgba(14, 116, 144, 0.1);
  }
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  width: 100%;
  
  .option-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-light);
    border-radius: 10px;
  }
  
  .option-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .option-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .option-desc {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
  
  .option-check {
    color: var(--primary-color);
    font-size: 18px;
  }
}

.warning-badge {
  :deep(.el-badge__content) {
    background-color: var(--danger-color);
    border: 2px solid var(--bg-white);
  }
}

.icon-btn {
  font-size: 28px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
  
  &:hover {
    color: var(--primary-color);
    background-color: var(--bg-light);
    transform: scale(1.1);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--bg-light);
  }
  
  .el-avatar {
    border: 2px solid var(--border-lighter);
    transition: all 0.3s ease;
  }
  
  &:hover .el-avatar {
    border-color: var(--primary-color);
  }
}

.username {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

:deep(.el-breadcrumb) {
  font-size: 14px;
  
  .el-breadcrumb__item {
    .el-breadcrumb__inner {
      color: var(--text-regular);
      font-weight: 500;
      transition: color 0.3s;
      
      &:hover {
        color: var(--primary-color);
      }
      
      &.is-link {
        color: var(--text-secondary);
      }
    }
    
    &:last-child .el-breadcrumb__inner {
      color: var(--text-primary);
      font-weight: 600;
    }
  }
}
</style>

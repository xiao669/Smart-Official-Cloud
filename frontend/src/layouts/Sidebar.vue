<template>
  <div class="sidebar-container">
    <div class="logo">
      <span v-if="!appStore.sidebarCollapsed">智管云</span>
      <span v-else>{{ appStore.modeConfig.icon }}</span>
    </div>
    <el-menu :default-active="activeMenu" :collapse="appStore.sidebarCollapsed" :collapse-transition="false"
      background-color="#0c4a6e" text-color="#b8c7ce" active-text-color="#5eead4" router>
      <el-menu-item index="/dashboard">
        <el-icon>
          <Odometer />
        </el-icon>
        <template #title>数据总览</template>
      </el-menu-item>
      <el-menu-item index="/medicines">
        <el-icon>
          <FirstAidKit />
        </el-icon>
        <template #title>{{ appStore.modeConfig.itemName }}管理</template>
      </el-menu-item>
      <el-menu-item index="/inventory">
        <el-icon>
          <Box />
        </el-icon>
        <template #title>库存管理</template>
      </el-menu-item>
      <el-menu-item index="/warnings">
        <el-icon>
          <Bell />
        </el-icon>
        <template #title>预警管理</template>
      </el-menu-item>
      <el-menu-item index="/reports">
        <el-icon>
          <DataAnalysis />
        </el-icon>
        <template #title>报表中心</template>
      </el-menu-item>

      <!-- 管理员专属菜单 - 直接显示不用下拉 -->
      <template v-if="authStore.isAdmin">
        <el-divider class="menu-divider" />
        <el-menu-item index="/system/users">
          <el-icon>
            <User />
          </el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/system/logs">
          <el-icon>
            <Document />
          </el-icon>
          <template #title>操作日志</template>
        </el-menu-item>
        <el-menu-item index="/system/settings">
          <el-icon>
            <Setting />
          </el-icon>
          <template #title>系统配置</template>
        </el-menu-item>
        <el-menu-item index="/system/sms">
          <el-icon>
            <Message />
          </el-icon>
          <template #title>短信通知</template>
        </el-menu-item>
        <el-menu-item index="/system/help">
          <el-icon>
            <QuestionFilled />
          </el-icon>
          <template #title>使用教程</template>
        </el-menu-item>
        <el-menu-item index="/system/about">
          <el-icon>
            <InfoFilled />
          </el-icon>
          <template #title>关于我们</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #0c4a6e 0%, #0e7490 100%);
  overflow-y: auto;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  min-height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  background: #0c4a6e;
  letter-spacing: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(94, 234, 212, 0.2);

  &::before {
    content: '☁️';
    margin-right: 8px;
    font-size: 22px;
    animation: pulse 2s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(94, 234, 212, 0.5), transparent);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.el-menu {
  border-right: none;
  flex: 1;
  padding: 20px 0;
  background: transparent;

  :deep(.el-menu-item) {
    margin: 6px 16px;
    border-radius: 12px;
    padding: 16px 20px;
    height: auto;
    line-height: 1.5;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #5eead4;
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }

    &:hover {
      background: linear-gradient(90deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.05)) !important;
      color: #5eead4 !important;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(94, 234, 212, 0.15);

      &::before {
        transform: scaleY(1);
      }
    }

    &.is-active {
      background: linear-gradient(90deg, rgba(94, 234, 212, 0.3), rgba(94, 234, 212, 0.1)) !important;
      color: #5eead4 !important;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(94, 234, 212, 0.2);

      &::before {
        transform: scaleY(1);
      }

      &::after {
        content: '';
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: #5eead4;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(94, 234, 212, 0.6);
      }
    }

    .el-icon {
      font-size: 20px;
      margin-right: 12px;
    }
  }

  :deep(.el-sub-menu) {
    .el-sub-menu__title {
      margin: 6px 16px;
      border-radius: 12px;
      padding: 16px 20px;
      height: auto;
      line-height: 1.5;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: linear-gradient(90deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.05)) !important;
        color: #5eead4 !important;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(94, 234, 212, 0.15);
      }

      .el-icon {
        font-size: 20px;
        margin-right: 12px;
      }
    }
  }

  :deep(.el-menu--inline) {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.2), transparent);
    border-radius: 0 12px 12px 0;
    margin: 4px 0 4px 16px;
    padding: 8px 0;

    .el-menu-item {
      margin: 4px 12px 4px 0;
      padding-left: 56px !important;

      &.is-active {
        background: linear-gradient(90deg, rgba(94, 234, 212, 0.25), rgba(94, 234, 212, 0.08)) !important;
        color: #5eead4 !important;
        font-weight: 600;
      }

      &:hover {
        background: linear-gradient(90deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.05)) !important;
        color: #5eead4 !important;
      }
    }
  }
}

/* 菜单分割线 */
.menu-divider {
  margin: 16px 24px;
  border-color: rgba(94, 234, 212, 0.2);

  :deep(.el-divider__text) {
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }
}

/* 滚动条样式 */
.sidebar-container::-webkit-scrollbar {
  width: 6px;
}

.sidebar-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar-container::-webkit-scrollbar-thumb {
  background: rgba(94, 234, 212, 0.3);
  border-radius: 3px;

  &:hover {
    background: rgba(94, 234, 212, 0.5);
  }
}
</style>

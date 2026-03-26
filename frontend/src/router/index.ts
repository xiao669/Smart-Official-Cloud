import { createRouter, createWebHistory, type RouteRecordRaw, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '数据总览', icon: 'Odometer' }
      },
      {
        path: 'medicines',
        name: 'Medicines',
        component: () => import('@/views/medicine/Index.vue'),
        meta: { title: '药品管理', icon: 'FirstAidKit' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/inventory/Index.vue'),
        meta: { title: '库存管理', icon: 'Box' }
      },
      {
        path: 'ocr-review',
        name: 'OcrReview',
        component: () => import('@/views/ocr/Index.vue'),
        meta: { title: '拍照审核', icon: 'Camera' }
      },
      {
        path: 'warnings',
        name: 'Warnings',
        component: () => import('@/views/warning/Index.vue'),
        meta: { title: '预警管理', icon: 'Bell' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/report/Index.vue'),
        meta: { title: '报表中心', icon: 'DataAnalysis' }
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/users',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'users',
            name: 'UserManagement',
            component: () => import('@/views/system/UserManagement.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'logs',
            name: 'OperationLogs',
            component: () => import('@/views/system/OperationLogs.vue'),
            meta: { title: '操作日志' }
          },
          {
            path: 'settings',
            name: 'SystemSettings',
            component: () => import('@/views/system/Settings.vue'),
            meta: { title: '系统配置' }
          },
          {
            path: 'sms',
            name: 'SmsSettings',
            component: () => import('@/views/system/SmsSettings.vue'),
            meta: { title: '短信通知' }
          },
          {
            path: 'help',
            name: 'SystemHelp',
            component: () => import('@/views/system/Help.vue'),
            meta: { title: '使用教程' }
          },
          {
            path: 'about',
            name: 'SystemAbout',
            component: () => import('@/views/system/About.vue'),
            meta: { title: '关于我们' }
          },
          {
            path: 'profile',
            name: 'UserProfile',
            component: () => import('@/views/system/Profile.vue'),
            meta: { title: '个人信息' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router

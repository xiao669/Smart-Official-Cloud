<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { initPush } from './src/utils/push'
import { getCurrentModeConfig } from './src/config/mode-config'

// 更新 tabBar 文字
function updateTabBarText() {
  const config = getCurrentModeConfig()
  const itemTerm = config.terminology.item
  
  // 更新第二个 tab（药品/商品/食品）
  uni.setTabBarItem({
    index: 1,
    text: itemTerm
  })
}

onLaunch(() => {
  console.log('App Launch')
  
  // 初始化 tabBar 文字（根据当前场景）
  // 延迟执行，确保 tabBar 已渲染
  setTimeout(() => {
    updateTabBarText()
  }, 100)
  
  // #ifdef APP-PLUS
  // 初始化推送服务
  initPush()
  // #endif
})

onShow(() => {
  console.log('App Show')
  
  // App 回到前台时更新 tabBar 文字
  updateTabBarText()
  
  // App 回到前台时清除角标
  // #ifdef APP-PLUS
  plus.runtime.setBadgeNumber(0)
  // #endif
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import './src/styles/index.scss';

/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

/* 全局隐藏滚动条 */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

page {
  -webkit-overflow-scrolling: touch;
}

/* TabBar 样式优化 */
uni-tabbar {
  height: 160rpx !important;
  border-top: 1rpx solid #EBEEF5 !important;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06) !important;
}

.uni-tabbar {
  height: 160rpx !important;
  border-top: 1rpx solid #EBEEF5 !important;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06) !important;
}

.uni-tabbar__item {
  padding: 16rpx 0 !important;
}

.uni-tabbar__bd {
  font-size: 36rpx !important;
  font-weight: 600 !important;
  margin-top: 10rpx !important;
  line-height: 1.4 !important;
}

.uni-tabbar__icon {
  width: 56rpx !important;
  height: 56rpx !important;
  font-size: 56rpx !important;
}

/* 选中状态优化 */
.uni-tabbar-item-active .uni-tabbar__bd {
  font-weight: 700 !important;
}
</style>

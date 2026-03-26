/**
 * App 版本升级工具
 * 支持整包更新和 wgt 热更新
 */

import { http } from './request'

// 版本信息接口
interface VersionInfo {
  version: string        // 版本号，如 "3.2.0"
  versionCode: number    // 版本码，如 320
  updateType: 'wgt' | 'apk' | 'none'  // 更新类型
  downloadUrl: string    // 下载地址
  updateContent: string  // 更新内容
  forceUpdate: boolean   // 是否强制更新
}

/**
 * 获取当前 App 版本信息
 */
export function getCurrentVersion(): { version: string; versionCode: number } {
  // #ifdef APP-PLUS
  const info = plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
    return {
      version: widgetInfo.version || '1.0.0',
      versionCode: parseInt(widgetInfo.versionCode || '100')
    }
  })
  
  // 同步获取
  return {
    version: plus.runtime.version || '1.0.0',
    versionCode: parseInt(plus.runtime.versionCode || '100')
  }
  // #endif
  
  // #ifndef APP-PLUS
  return { version: '1.0.0', versionCode: 100 }
  // #endif
}

/**
 * 检查更新
 */
export async function checkUpdate(showNoUpdate = false): Promise<VersionInfo | null> {
  try {
    const current = getCurrentVersion()
    
    // 调用后端接口检查版本
    const res = await http.get<VersionInfo>('/app/version/check', {
      params: {
        version: current.version,
        versionCode: current.versionCode,
        platform: uni.getSystemInfoSync().platform
      }
    })
    
    if (res.updateType === 'none') {
      if (showNoUpdate) {
        uni.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }
      return null
    }
    
    return res
  } catch (error) {
    console.error('检查更新失败:', error)
    return null
  }
}

/**
 * 显示更新弹窗
 */
export function showUpdateDialog(versionInfo: VersionInfo) {
  const content = `发现新版本 ${versionInfo.version}\n\n${versionInfo.updateContent}`
  
  if (versionInfo.forceUpdate) {
    // 强制更新，不显示取消按钮
    uni.showModal({
      title: '版本更新',
      content,
      showCancel: false,
      confirmText: '立即更新',
      success: () => {
        downloadAndInstall(versionInfo)
      }
    })
  } else {
    // 非强制更新
    uni.showModal({
      title: '版本更新',
      content,
      cancelText: '稍后更新',
      confirmText: '立即更新',
      success: (res) => {
        if (res.confirm) {
          downloadAndInstall(versionInfo)
        }
      }
    })
  }
}

/**
 * 下载并安装更新
 */
function downloadAndInstall(versionInfo: VersionInfo) {
  // #ifdef APP-PLUS
  uni.showLoading({
    title: '下载中 0%',
    mask: true
  })
  
  const downloadTask = uni.downloadFile({
    url: versionInfo.downloadUrl,
    success: (res) => {
      uni.hideLoading()
      
      if (res.statusCode === 200) {
        if (versionInfo.updateType === 'wgt') {
          // wgt 热更新
          installWgt(res.tempFilePath)
        } else {
          // apk 整包更新
          installApk(res.tempFilePath)
        }
      } else {
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({
        title: '下载失败，请检查网络',
        icon: 'none'
      })
    }
  })
  
  // 监听下载进度
  downloadTask.onProgressUpdate((res) => {
    uni.showLoading({
      title: `下载中 ${res.progress}%`,
      mask: true
    })
  })
  // #endif
}

/**
 * 安装 wgt 热更新包
 */
function installWgt(filePath: string) {
  // #ifdef APP-PLUS
  uni.showLoading({
    title: '安装中...',
    mask: true
  })
  
  plus.runtime.install(
    filePath,
    { force: true },
    () => {
      uni.hideLoading()
      uni.showModal({
        title: '更新完成',
        content: '应用已更新，是否立即重启？',
        confirmText: '立即重启',
        cancelText: '稍后重启',
        success: (res) => {
          if (res.confirm) {
            plus.runtime.restart()
          }
        }
      })
    },
    (error) => {
      uni.hideLoading()
      uni.showToast({
        title: '安装失败: ' + error.message,
        icon: 'none'
      })
    }
  )
  // #endif
}

/**
 * 安装 apk 整包
 */
function installApk(filePath: string) {
  // #ifdef APP-PLUS
  plus.runtime.install(filePath, {}, () => {
    // 安装成功
  }, (error) => {
    uni.showToast({
      title: '安装失败',
      icon: 'none'
    })
  })
  // #endif
}

/**
 * 初始化时检查更新（静默检查）
 */
export async function initCheckUpdate() {
  // #ifdef APP-PLUS
  // 延迟 3 秒检查，避免影响启动速度
  setTimeout(async () => {
    const versionInfo = await checkUpdate(false)
    if (versionInfo) {
      showUpdateDialog(versionInfo)
    }
  }, 3000)
  // #endif
}

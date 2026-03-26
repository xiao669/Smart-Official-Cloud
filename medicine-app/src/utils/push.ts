/**
 * uniPush 推送工具
 * 处理推送消息的接收、点击等事件
 */

import { http } from './request'

/**
 * 请求通知权限（Android 13+）
 */
function requestNotificationPermission() {
  // #ifdef APP-PLUS
  if (plus.os.name === 'Android') {
    // 使用 uni-app 的权限请求 API
    const permissionListener = uni.createRequestPermissionListener()
    
    permissionListener.onRequest((e) => {
      console.log('权限请求:', e)
    })
    
    permissionListener.onConfirm((e) => {
      console.log('权限确认:', e)
      permissionListener.stop()
    })
    
    permissionListener.onComplete((e) => {
      console.log('权限请求完成:', e)
      permissionListener.stop()
    })
    
    // 检查并请求通知权限
    // @ts-ignore
    plus.android.requestPermissions(
      ['android.permission.POST_NOTIFICATIONS'],
      (result: any) => {
        console.log('通知权限请求结果:', result)
        if (result.granted && result.granted.length > 0) {
          console.log('通知权限已授予')
        } else if (result.deniedAlways && result.deniedAlways.length > 0) {
          // 用户选择了"不再询问"，引导去设置页
          uni.showModal({
            title: '通知权限',
            content: '需要通知权限才能接收预警提醒，是否去设置中开启？',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                // 打开应用设置页
                const Intent = plus.android.importClass('android.content.Intent')
                const Settings = plus.android.importClass('android.provider.Settings')
                const Uri = plus.android.importClass('android.net.Uri')
                const main = plus.android.runtimeMainActivity()
                
                const intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                const uri = Uri.fromParts('package', main.getPackageName(), null)
                intent.setData(uri)
                main.startActivity(intent)
              }
            }
          })
        }
      },
      (error: any) => {
        console.error('请求通知权限失败:', error)
      }
    )
  }
  // #endif
}

// 推送消息类型
interface PushMessage {
  title?: string
  content?: string
  payload?: string | Record<string, any>
  type?: string
}

/**
 * 初始化推送服务
 */
export function initPush() {
  // #ifdef APP-PLUS
  // 先请求通知权限（Android 13+）
  requestNotificationPermission()
  
  // 获取客户端推送标识
  const clientInfo = plus.push.getClientInfo()
  console.log('推送客户端信息:', clientInfo)
  
  if (clientInfo.clientid) {
    console.log('推送 CID:', clientInfo.clientid)
    // 保存到本地
    uni.setStorageSync('push_cid', clientInfo.clientid)
    // 上报到服务器
    reportPushCid(clientInfo.clientid)
  }
  
  // 监听推送消息点击事件
  plus.push.addEventListener('click', (msg: any) => {
    console.log('点击推送消息:', msg)
    handlePushClick(msg)
  }, false)
  
  // 监听在线推送消息
  plus.push.addEventListener('receive', (msg: any) => {
    console.log('收到推送消息:', msg)
    handlePushReceive(msg)
  }, false)
  
  // 检查是否有启动时的推送消息
  checkLaunchPush()
  // #endif
}

/**
 * 上报推送 CID 到服务器
 */
async function reportPushCid(cid: string) {
  try {
    const token = uni.getStorageSync('token')
    if (!token) {
      console.log('未登录，暂不上报推送 CID')
      return
    }
    
    await http.post('/users/push-cid', { cid }, { showLoading: false, showError: false })
    console.log('推送 CID 上报成功')
  } catch (error) {
    console.error('推送 CID 上报失败:', error)
  }
}

/**
 * 处理推送消息点击
 */
function handlePushClick(msg: PushMessage) {
  // 先检查是否已登录
  const token = uni.getStorageSync('token')
  if (!token) {
    console.log('未登录，跳转到登录页')
    uni.reLaunch({ url: '/pages/login/index' })
    return
  }
  
  let payload = msg.payload
  
  // 解析 payload
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch (e) {
      // 不是 JSON 格式
    }
  }
  
  // 根据消息类型跳转
  if (payload && typeof payload === 'object') {
    const type = (payload as any).type || msg.type
    
    switch (type) {
      case 'expired':
      case 'expiry':
      case 'low_stock':
        // 跳转到预警页面
        uni.switchTab({ url: '/pages/warning/index' })
        break
      case 'medicine':
        // 跳转到药品详情
        const medicineId = (payload as any).medicine_id
        if (medicineId) {
          uni.navigateTo({ url: `/pages/medicine/detail?id=${medicineId}` })
        } else {
          uni.switchTab({ url: '/pages/medicine/list' })
        }
        break
      default:
        // 默认跳转首页
        uni.switchTab({ url: '/pages/index/index' })
    }
  } else {
    // 默认跳转预警页面
    uni.switchTab({ url: '/pages/warning/index' })
  }
}

/**
 * 处理在线收到的推送消息
 */
function handlePushReceive(msg: PushMessage) {
  // 在线时收到消息，可以显示应用内通知
  // #ifdef APP-PLUS
  // 创建本地通知（可选，因为系统已经显示了）
  // 如果不想重复显示，可以注释掉
  /*
  plus.push.createMessage(
    msg.content || '',
    msg.payload ? JSON.stringify(msg.payload) : '',
    {
      title: msg.title || '智管云'
    }
  )
  */
  // #endif
  
  // 刷新首页数据（如果在首页）
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    if (currentPage.route === 'pages/index/index') {
      // 触发首页刷新
      uni.$emit('refreshHome')
    }
  }
}

/**
 * 检查启动时是否有推送消息
 */
function checkLaunchPush() {
  // #ifdef APP-PLUS
  // 延迟检查，确保应用完全启动
  setTimeout(() => {
    // 先检查是否已登录，未登录则不处理推送跳转
    const token = uni.getStorageSync('token')
    if (!token) {
      console.log('未登录，跳过启动推送处理')
      return
    }
    
    const args = plus.runtime.arguments
    if (args) {
      console.log('启动参数:', args)
      try {
        const payload = JSON.parse(args)
        // 只处理有效的推送消息，忽略系统启动参数
        if (payload && payload.type) {
          handlePushClick({ payload })
        }
      } catch (e) {
        // 不是 JSON 格式或解析失败，忽略
      }
    }
  }, 1000)
  // #endif
}

/**
 * 获取推送 CID
 */
export function getPushCid(): string {
  // #ifdef APP-PLUS
  const clientInfo = plus.push.getClientInfo()
  return clientInfo.clientid || ''
  // #endif
  
  // #ifndef APP-PLUS
  return ''
  // #endif
}

/**
 * 清除所有推送消息
 */
export function clearAllPush() {
  // #ifdef APP-PLUS
  plus.push.clear()
  // #endif
}

/**
 * 设置角标数字（iOS）
 */
export function setBadgeNumber(num: number) {
  // #ifdef APP-PLUS
  if (plus.os.name === 'iOS') {
    plus.runtime.setBadgeNumber(num)
  }
  // #endif
}

/**
 * 智管云 - 全局应用配置
 * 统一管理版本号、应用名称等全局信息
 * 修改版本号只需要修改这个文件即可
 */

// 应用版本信息
export const APP_VERSION = '6.0.2'
export const APP_VERSION_CODE = 602

// 应用基本信息
export const APP_NAME = '智管云'
export const APP_DESCRIPTION = '智能管理 · 安全高效'

// 版权信息
export const COPYRIGHT_YEAR = 2026
export const COPYRIGHT_TEXT = `© ${COPYRIGHT_YEAR}`

// 免责声明
export const DISCLAIMER = '仅辅助管理，无收银功能，不可商用'

// 导出完整配置对象
export const AppConfig = {
  version: APP_VERSION,
  versionCode: APP_VERSION_CODE,
  name: APP_NAME,
  description: APP_DESCRIPTION,
  copyrightYear: COPYRIGHT_YEAR,
  copyrightText: COPYRIGHT_TEXT,
  disclaimer: DISCLAIMER,
  
  // 获取完整版本显示文本
  getVersionText: () => `v${APP_VERSION}`,
  
  // 获取完整版权文本
  getFullCopyright: (modeName: string) => `${COPYRIGHT_TEXT} ${modeName}系统`
}

export default AppConfig

# uniPush 2.0 离线推送配置说明

## 概述

uniPush 2.0 是 DCloud 提供的统一推送服务，支持 App 在后台或关闭状态下接收推送通知。

## 配置步骤

### 第一步：manifest.json 配置

在 HBuilderX 中打开 `manifest.json`，找到「App模块配置」：

1. ✅ 勾选 `Push(消息推送)`
2. ✅ 选择 `uniPush 2.0（全端支持）`
3. ✅ 勾选 `在线推送`
4. ✅ 勾选 `离线推送`（App 关闭后也能收到通知）

### 第二步：DCloud 开发者中心配置

1. 登录 [DCloud 开发者中心](https://dev.dcloud.net.cn/)
2. 选择你的应用
3. 点击左侧菜单「uniPush」→「uniPush 2.0」
4. 点击「申请开通」（首次需要实名认证）
5. 开通后获取以下配置信息：
   - AppID
   - AppKey
   - AppSecret
   - MasterSecret

### 第三步：后端配置

在 `backend/.env` 文件中添加：

```env
# uniPush 2.0 配置
UNIPUSH_APP_ID=你的AppID
UNIPUSH_APP_KEY=你的AppKey
UNIPUSH_APP_SECRET=你的AppSecret
UNIPUSH_MASTER_SECRET=你的MasterSecret
```

### 第四步：App 端推送监听（已完成）

已在以下文件中配置好推送监听：

- `App.vue` - 应用启动时初始化推送
- `src/utils/push.ts` - 推送工具类

功能包括：
- 自动获取推送 CID 并上报服务器
- 监听推送消息点击事件
- 根据消息类型自动跳转到对应页面
- 清除角标等

### 第五步：服务端推送

后端已创建 `backend/app/services/unipush.py`，使用方法：

```python
from app.services.unipush import unipush_service

# 推送给单个用户
await unipush_service.push_to_single(
    cid="用户的推送ID",
    title="药品预警",
    content="阿莫西林即将过期，请及时处理"
)

# 推送给所有用户
await unipush_service.push_to_all(
    title="系统通知",
    content="新版本已发布，请更新"
)
```

## 推送流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   后端服务   │────▶│  uniPush    │────▶│   手机 App  │
│  检测预警    │     │  推送服务   │     │  显示通知   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                        │
      │  1. 检测到预警                          │
      │  2. 调用 uniPush API                   │
      │                                        │
      │                    3. 推送到手机通知栏   │
      │                    4. 用户点击打开 App   │
      └────────────────────────────────────────┘
```

## 注意事项

1. **测试环境**：开发阶段使用自定义基座测试推送
2. **正式发布**：需要打正式包才能使用离线推送
3. **Android 厂商通道**：
   - 华为、小米、OPPO、vivo 等需要单独配置厂商推送
   - 在 DCloud 开发者中心配置各厂商的推送证书
4. **iOS 推送**：需要配置 APNs 证书
5. **推送限制**：
   - 免费版每天 1000 条
   - 超出需要购买套餐

## 厂商通道配置（可选，提高到达率）

### 华为推送
1. 登录华为开发者联盟
2. 创建应用，获取 AppID 和 AppSecret
3. 在 DCloud 开发者中心填入

### 小米推送
1. 登录小米开放平台
2. 创建应用，获取 AppID、AppKey、AppSecret
3. 在 DCloud 开发者中心填入

### OPPO/vivo 推送
类似流程，在各自开放平台申请

## 常见问题

### Q: 为什么收不到推送？
1. 检查是否使用自定义基座或正式包
2. 检查 DCloud 开发者中心是否开通 uniPush
3. 检查后端配置是否正确
4. 检查手机是否开启了应用通知权限

### Q: 离线推送不生效？
1. 需要配置厂商通道
2. 需要打正式包测试
3. 检查手机省电设置是否限制了后台

### Q: 推送延迟很大？
1. 配置厂商通道可以提高实时性
2. 检查网络环境

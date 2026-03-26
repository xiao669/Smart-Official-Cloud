# 药品管理移动端 APP

基于 uni-app 开发的药品过期提醒和管理应用。

## 功能特性

### 核心功能
- ✅ 药品过期预警（已过期、临期、低库存）
- ✅ 药品快速添加
- ✅ 药品列表查看和搜索
- ✅ 预警管理（分类查看、标记已读）
- ✅ 预警配置（临期天数、低库存阈值）
- ✅ 用户登录认证

### 技术栈
- **框架**: uni-app + Vue 3 + TypeScript
- **状态管理**: Pinia
- **UI**: 自定义组件
- **后端**: FastAPI（复用现有后端）

## 项目结构

```
medicine-app/
├── pages/                    # 页面目录
│   ├── index/               # 首页（预警中心）
│   ├── medicine/            # 药品列表和详情
│   ├── add/                 # 添加药品
│   ├── warning/             # 预警管理
│   ├── settings/            # 设置中心
│   └── login/               # 登录页
├── src/
│   ├── api/                 # API 接口
│   ├── store/               # 状态管理
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   └── styles/              # 全局样式
├── static/                  # 静态资源
├── App.vue                  # 应用入口
├── main.ts                  # 主入口
├── manifest.json            # 应用配置
└── pages.json               # 页面配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置后端 API

修改 `src/utils/request.ts` 中的 `BASE_URL`：

```typescript
const BASE_URL = 'http://your-backend-api.com/api'
```

### 3. 运行项目

#### H5 开发
```bash
npm run dev:h5
```

#### APP 开发
```bash
npm run dev:app
```

#### 打包
```bash
# H5 打包
npm run build:h5

# APP 打包
npm run build:app
```

## 页面说明

### 1. 首页（预警中心）
- 显示预警统计卡片（过期、临期、低库存）
- 显示最近 10 条未读预警
- 快速操作按钮（添加药品、检查预警）
- 支持下拉刷新

### 2. 药品列表
- 显示所有药品批次
- 支持搜索（药品名称、批次号）
- 支持筛选（过期、临期、正常）
- 显示状态标签和剩余天数
- 支持上拉加载更多

### 3. 添加药品
- 选择药品
- 输入批次号、数量
- 选择生产日期和有效期
- 可选备注信息
- 表单验证

### 4. 药品详情
- 显示完整药品信息
- 显示过期状态和剩余天数
- 支持快速出库操作

### 5. 预警管理
- Tab 切换不同预警类型
- 显示预警详情
- 支持标记已读
- 支持一键全部已读
- 手动检查预警

### 6. 设置中心
- 显示用户信息
- 预警配置（临期天数、低库存阈值）
- 退出登录

## API 接口

### 认证
- `POST /auth/login` - 登录
- `GET /auth/me` - 获取当前用户
- `POST /auth/logout` - 退出登录

### 药品
- `GET /medicines` - 获取药品列表
- `GET /medicines/{id}` - 获取药品详情

### 库存
- `GET /inventory` - 获取库存列表
- `GET /inventory/{id}` - 获取批次详情
- `POST /inventory/inbound` - 药品入库
- `POST /inventory/outbound` - 药品出库

### 预警
- `GET /warnings` - 获取预警列表
- `PUT /warnings/{id}/read` - 标记已读
- `PUT /warnings/read-all` - 全部标记已读
- `POST /warnings/check` - 检查预警
- `GET /warnings/config` - 获取预警配置
- `PUT /warnings/config` - 更新预警配置

### 统计
- `GET /dashboard/stats` - 获取统计数据

## 开发说明

### 1. 添加新页面

1. 在 `pages/` 目录下创建页面文件
2. 在 `pages.json` 中注册页面
3. 配置页面样式和导航栏

### 2. 添加新 API

1. 在 `src/api/` 目录下创建 API 文件
2. 使用 `http` 工具发起请求
3. 定义 TypeScript 类型

### 3. 状态管理

使用 Pinia 进行状态管理：

```typescript
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
userStore.login(data)
```

### 4. 工具函数

常用工具函数：

```typescript
import { formatDate, getDaysFromNow, getExpiryStatus } from '@/utils/date'
import { setStorage, getStorage } from '@/utils/storage'
```

## 注意事项

1. **API 地址配置**: 确保后端 API 地址正确
2. **Token 管理**: Token 存储在本地，过期自动跳转登录
3. **权限控制**: 所有 API 请求自动携带 Token
4. **错误处理**: 统一的错误提示和处理
5. **下拉刷新**: 主要列表页面支持下拉刷新
6. **上拉加载**: 列表页面支持分页加载

## 后续优化

### V1.1 版本
- [ ] 扫码添加药品功能
- [ ] OCR 识别生产日期
- [ ] 药品分类管理
- [ ] 数据导出功能

### V1.2 版本
- [ ] 本地通知提醒
- [ ] 后台定时检查
- [ ] 离线数据缓存
- [ ] 数据同步功能

### V2.0 版本
- [ ] 多用户支持
- [ ] 家庭成员共享
- [ ] 用药提醒功能
- [ ] 用药记录

## 许可证

MIT License

## 联系方式

如有问题，请联系开发团队。

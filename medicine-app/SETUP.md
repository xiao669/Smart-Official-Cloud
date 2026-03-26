# 项目启动指南

## 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

## 安装步骤

### 1. 安装依赖

```bash
cd medicine-app
npm install
```

如果安装失败，可以尝试：

```bash
# 清除缓存
npm cache clean --force

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 2. 配置后端 API

编辑 `src/utils/request.ts` 文件，修改 `BASE_URL`：

```typescript
const BASE_URL = 'http://localhost:8000/api'  // 改成你的后端地址
```

### 3. 运行项目

#### 方式一：H5 开发（推荐用于快速测试）

```bash
npm run dev:h5
```

然后在浏览器打开 `http://localhost:3000`

#### 方式二：使用 HBuilderX（推荐用于 APP 开发）

1. 下载并安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开 HBuilderX
3. 文件 → 导入 → 从本地目录导入
4. 选择 `medicine-app` 目录
5. 运行 → 运行到浏览器 或 运行到手机模拟器

## 常见问题

### 1. 缺少 index.html 错误

**错误信息**: `根目录缺少 index.html`

**解决方案**: 确保项目根目录有 `index.html` 文件（已创建）

### 2. 模块找不到错误

**错误信息**: `Cannot find module '@/xxx'`

**解决方案**: 
- 检查 `tsconfig.json` 中的 paths 配置
- 重启开发服务器
- 删除 `node_modules` 重新安装

### 3. Pinia 相关错误

**错误信息**: `Pinia is not installed`

**解决方案**: 
```bash
npm install pinia
```

### 4. uni-app 类型错误

**错误信息**: `Cannot find module '@dcloudio/types'`

**解决方案**: 
```bash
npm install @dcloudio/types --save-dev
```

### 5. 端口被占用

**错误信息**: `Port 3000 is already in use`

**解决方案**: 
- 修改 `vite.config.ts` 中的端口号
- 或者关闭占用端口的程序

## 开发建议

### 1. 使用 H5 模式快速开发

H5 模式启动快，支持热更新，适合快速开发和调试：

```bash
npm run dev:h5
```

### 2. 使用 HBuilderX 打包 APP

当功能开发完成后，使用 HBuilderX 打包成 Android APK：

1. 打开 HBuilderX
2. 发行 → 原生 App-云打包
3. 选择 Android 平台
4. 填写应用信息
5. 点击打包

### 3. 调试技巧

- 使用浏览器开发者工具调试 H5 版本
- 使用 `console.log` 输出调试信息
- 使用 uni-app 官方调试工具

## 测试账号

```
用户名: admin
密码: 123456
```

## 目录结构

```
medicine-app/
├── pages/              # 页面文件
├── src/
│   ├── api/           # API 接口
│   ├── store/         # 状态管理
│   ├── types/         # 类型定义
│   ├── utils/         # 工具函数
│   └── styles/        # 样式文件
├── static/            # 静态资源
├── index.html         # 入口 HTML
├── main.ts            # 入口 JS
├── App.vue            # 根组件
├── pages.json         # 页面配置
├── manifest.json      # 应用配置
└── package.json       # 依赖配置
```

## 下一步

1. 启动后端服务（FastAPI）
2. 启动前端项目（H5 或 HBuilderX）
3. 使用测试账号登录
4. 测试各项功能

## 技术支持

如遇到问题，请检查：
1. Node.js 版本是否正确
2. 依赖是否完整安装
3. 后端 API 是否正常运行
4. 网络连接是否正常

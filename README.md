# 智管云管理系统

面向中小型药店和小型便利店的后台管理平台，专注于药品/商品/库存管理、库存监控、预警提醒和拍照录入审核等核心功能。

## 技术栈

### 后端
- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 (异步)
- MySQL 8.0+
- JWT 认证

### 前端
- Vue 3 + TypeScript
- Vite
- Element Plus
- Pinia
- ECharts

## 项目结构

```
├── backend/          # 后端 FastAPI 项目
│   ├── app/
│   │   ├── api/      # API 路由
│   │   ├── core/     # 核心配置
│   │   ├── models/   # 数据库模型
│   │   ├── schemas/  # Pydantic 模型
│   │   ├── services/ # 业务逻辑
│   │   └── repositories/  # 数据访问
│   ├── alembic/      # 数据库迁移
│   └── tests/        # 测试
├── frontend/         # 前端 Vue 项目
│   ├── src/
│   │   ├── api/      # API 调用
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── router/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── utils/
│   │   └── views/
│   └── ...
└── mobile/           # uni-app 移动端 (待开发)
```

## 快速开始

### 一键启动（推荐）

双击运行项目根目录下的 `start-all.bat`，会自动：
1. 创建数据库（如不存在）
2. 初始化数据库表和默认数据
3. 启动后端服务
4. 启动前端服务

停止服务：运行 `stop-all.bat`

### 数据库配置

默认配置（可在 `backend/.env` 中修改）：
- 数据库: `medicine_admin`
- 用户名: `root`
- 密码: `123456`

### 手动启动

#### 后端

1. 创建 MySQL 数据库
```sql
CREATE DATABASE medicine_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置环境变量
```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库连接
```

3. 创建conda环境并安装依赖
```bash
conda create -n medicine-admin python=3.11
conda activate medicine-admin
pip install fastapi uvicorn sqlalchemy[asyncio] aiomysql python-jose[cryptography] passlib[bcrypt] openpyxl python-multipart pydantic-settings alembic
```

4. 初始化数据库
```bash
python -m app.core.init_db
```

5. 启动服务
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

或直接运行 `backend/start.bat`

API 文档: http://localhost:8000/docs

#### 前端

1. 安装依赖
```bash
cd frontend
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

或直接运行 `frontend/start.bat`

访问: http://localhost:5173

## 功能模块

- ✅ 用户认证与授权 (JWT + 角色权限)
- ✅ 数据总览看板
- ✅ 药品目录管理 (CRUD + 导入导出)
- ✅ 库存管理 (入库/出库/盘点)
- ✅ 拍照录入审核
- ✅ 预警管理
- ✅ 报表中心
- ✅ 系统管理

## 用户角色

- **管理员 (admin)**: 所有权限
- **药品管理员 (manager)**: 药品管理、库存管理、报表查看
- **操作员 (operator)**: 入库出库操作、查看权限

## 默认账号

初始化数据库后，系统会创建默认管理员账号：

- 用户名: `admin`
- 密码: `admin123`

请在首次登录后修改密码。

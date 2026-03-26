# 用户管理功能设计文档

## 概述

用户管理功能是医药管理系统的核心管理模块，允许管理员对系统用户进行全生命周期管理。本设计基于现有的 FastAPI + Vue3 + Element Plus 技术栈，遵循系统现有的架构模式和设计规范。

### 设计目标

- 提供完整的用户 CRUD 操作
- 实现基于角色的访问控制（RBAC）
- 确保数据安全和操作审计
- 提供友好的用户界面和交互体验
- 保持与现有系统架构的一致性

### 技术栈

- **后端**：Python 3.11 + FastAPI + SQLAlchemy + MySQL
- **前端**：Vue 3 + TypeScript + Element Plus + Pinia
- **认证**：JWT Token
- **密码加密**：bcrypt

## 架构设计

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Vue3)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ UserManagement│  │  UserDialog  │  │PasswordReset │      │
│  │     View      │  │   Component  │  │   Dialog     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                          │                                   │
│                   ┌──────▼──────┐                           │
│                   │   User API   │                           │
│                   │   (Axios)    │                           │
│                   └──────────────┘                           │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/JSON
┌────────────────────────────▼────────────────────────────────┐
│                      后端层 (FastAPI)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User Router │──│ User Service │──│User Repository│      │
│  │  (/api/users)│  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           │         ┌──────▼──────┐          │              │
│           │         │Auth Middleware│         │              │
│           │         │  (JWT验证)   │         │              │
│           │         └──────────────┘          │              │
│           │                                    │              │
│           └────────────────────────────────────┘              │
│                          │                                   │
│                   ┌──────▼──────┐                           │
│                   │  User Model  │                           │
│                   │ (SQLAlchemy) │                           │
│                   └──────────────┘                           │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL
                      ┌──────▼──────┐
                      │    MySQL     │
                      │   Database   │
                      └──────────────┘
```

### 分层架构

1. **表现层（Presentation Layer）**
   - Vue 组件：UserManagement.vue
   - 对话框组件：UserDialog.vue, PasswordResetDialog.vue
   - API 客户端：user.ts

2. **业务逻辑层（Business Logic Layer）**
   - 路由层：backend/app/api/users.py
   - 服务层：backend/app/services/user.py
   - 仓储层：backend/app/repositories/user.py

3. **数据访问层（Data Access Layer）**
   - 模型层：backend/app/models/user.py（已存在）
   - 数据库：MySQL

## 组件和接口

### 后端组件

#### 1. User Repository (backend/app/repositories/user.py)

数据访问层，负责与数据库交互。

**职责**：
- 执行数据库 CRUD 操作
- 处理复杂查询（搜索、筛选、分页）
- 数据持久化

**主要方法**：
```python
class UserRepository:
    async def get_by_id(user_id: int) -> User | None
    async def get_by_username(username: str) -> User | None
    async def list(skip: int, limit: int, keyword: str, user_type: str) -> tuple[list[User], int]
    async def create(user_data: dict) -> User
    async def update(user_id: int, user_data: dict) -> User
    async def delete(user_id: int) -> bool
    async def update_password(user_id: int, password_hash: str) -> bool
    async def toggle_status(user_id: int, is_active: bool) -> bool
    async def batch_toggle_status(user_ids: list[int], is_active: bool) -> int
```

#### 2. User Service (backend/app/services/user.py)

业务逻辑层，处理业务规则和验证。

**职责**：
- 业务逻辑处理
- 数据验证
- 权限检查
- 密码加密

**主要方法**：
```python
class UserService:
    async def get_user_list(page: int, page_size: int, keyword: str, user_type: str) -> dict
    async def get_user_by_id(user_id: int) -> User
    async def create_user(user_data: UserCreate, current_user: User) -> User
    async def update_user(user_id: int, user_data: UserUpdate, current_user: User) -> User
    async def delete_user(user_id: int, current_user: User) -> bool
    async def reset_password(user_id: int, new_password: str, current_user: User) -> bool
    async def toggle_user_status(user_id: int, is_active: bool, current_user: User) -> bool
    async def batch_toggle_status(user_ids: list[int], is_active: bool, current_user: User) -> dict
```

#### 3. User API Router (backend/app/api/users.py)

API 路由层，定义 RESTful 接口。

**端点设计**：
```
GET    /api/users              - 获取用户列表（分页、搜索、筛选）
GET    /api/users/{id}         - 获取单个用户详情
POST   /api/users              - 创建新用户
PUT    /api/users/{id}         - 更新用户信息
DELETE /api/users/{id}         - 删除用户
POST   /api/users/{id}/reset-password  - 重置用户密码
PATCH  /api/users/{id}/status  - 切换用户状态
POST   /api/users/batch-status - 批量切换用户状态
```

#### 4. Schemas (backend/app/schemas/user.py)

数据传输对象（DTO），定义请求和响应格式。

**主要 Schema**：
```python
class UserCreate(BaseModel):
    username: str
    password: str
    realname: str | None
    user_type: str
    department: str | None
    phone: str | None
    email: str | None

class UserUpdate(BaseModel):
    realname: str | None
    user_type: str | None
    department: str | None
    phone: str | None
    email: str | None
    password: str | None  # 可选，如果提供则更新密码

class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    page_size: int

class PasswordResetRequest(BaseModel):
    new_password: str
    confirm_password: str

class BatchStatusRequest(BaseModel):
    user_ids: list[int]
    is_active: bool
```

### 前端组件

#### 1. UserManagement View (frontend/src/views/system/UserManagement.vue)

主视图组件，用户管理页面。

**功能模块**：
- 用户列表展示（表格）
- 搜索和筛选
- 分页控制
- 操作按钮（新增、编辑、删除、重置密码、状态切换）
- 批量操作

**状态管理**：
```typescript
const users = ref<User[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const userTypeFilter = ref<string>()
const selectedUsers = ref<number[]>([])
```

#### 2. UserDialog Component (frontend/src/components/UserDialog.vue)

用户创建/编辑对话框组件。

**功能**：
- 表单输入（用户名、密码、真实姓名、用户类型、部门、手机、邮箱）
- 表单验证
- 提交处理

#### 3. PasswordResetDialog Component (frontend/src/components/PasswordResetDialog.vue)

密码重置对话框组件。

**功能**：
- 新密码输入
- 确认密码输入
- 密码强度提示
- 提交处理

#### 4. User API Client (frontend/src/api/user.ts)

前端 API 客户端，封装 HTTP 请求。

**主要方法**：
```typescript
export const userApi = {
  list: (params: UserListParams) => Promise<UserListResponse>
  getById: (id: number) => Promise<User>
  create: (data: UserCreate) => Promise<User>
  update: (id: number, data: UserUpdate) => Promise<User>
  delete: (id: number) => Promise<void>
  resetPassword: (id: number, data: PasswordResetRequest) => Promise<void>
  toggleStatus: (id: number, isActive: boolean) => Promise<void>
  batchToggleStatus: (data: BatchStatusRequest) => Promise<BatchStatusResult>
}
```

## 数据模型

### User Model（已存在）

```python
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int]                    # 主键
    username: Mapped[str]              # 用户名（唯一）
    password_hash: Mapped[str]         # 密码哈希
    realname: Mapped[str | None]       # 真实姓名
    user_type: Mapped[str]             # 用户类型：admin/manager/operator
    department: Mapped[str | None]     # 部门
    phone: Mapped[str | None]          # 手机号
    email: Mapped[str | None]          # 邮箱
    is_active: Mapped[bool]            # 是否激活
    last_login: Mapped[datetime | None]# 最后登录时间
    created_at: Mapped[datetime]       # 创建时间
```

**字段说明**：
- `username`: 3-50字符，仅包含字母、数字、下划线、连字符
- `password_hash`: bcrypt 加密后的密码
- `user_type`: 枚举值 ["admin", "manager", "operator"]
- `phone`: 11位数字（可选）
- `email`: 标准邮箱格式（可选）
- `is_active`: 默认 true

### 数据库索引

```sql
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_user_type ON users(user_type);
CREATE INDEX idx_is_active ON users(is_active);
CREATE INDEX idx_created_at ON users(created_at);
```


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1：用户名唯一性

*对于任何*两个用户，如果它们的用户名相同，则它们必须是同一个用户（相同的 ID）
**验证：需求 2.2**

### 属性 2：密码加密存储

*对于任何*用户创建或密码更新操作，存储在数据库中的密码必须是哈希加密后的值，而不是明文
**验证：需求 2.3, 3.5, 8.3**

### 属性 3：自我保护

*对于任何*删除或禁用操作，如果目标用户 ID 等于当前登录用户 ID，则操作必须被拒绝
**验证：需求 4.4, 5.5**

### 属性 4：管理员权限检查

*对于任何*用户管理操作，如果当前用户的 user_type 不是 "admin"，则操作必须被拒绝
**验证：需求 6.5**

### 属性 5：密码长度验证

*对于任何*密码输入（创建或重置），如果密码长度小于 6 个字符，则操作必须被拒绝
**验证：需求 2.6, 8.4**

### 属性 6：用户名格式验证

*对于任何*用户名输入，如果用户名包含除字母、数字、下划线、连字符之外的字符，或长度不在 3-50 之间，则操作必须被拒绝
**验证：需求 2.7, 7.1, 7.2**

### 属性 7：密码确认一致性

*对于任何*密码重置操作，如果新密码和确认密码不相等，则操作必须被拒绝
**验证：需求 8.5**

### 属性 8：禁用用户登录拒绝

*对于任何*登录尝试，如果用户的 is_active 为 false，则登录必须被拒绝
**验证：需求 5.4**

### 属性 9：批量操作排除当前用户

*对于任何*批量禁用操作，如果用户 ID 列表包含当前登录用户的 ID，则该 ID 必须被排除，不执行禁用操作
**验证：需求 10.5**

### 属性 10：搜索结果一致性

*对于任何*搜索关键词，返回的用户列表中的每个用户，其用户名、真实姓名或部门字段必须包含该关键词（不区分大小写）
**验证：需求 1.4**

## 错误处理

### 错误类型

1. **验证错误（Validation Error）**
   - HTTP 状态码：400 Bad Request
   - 场景：表单验证失败、数据格式错误
   - 示例：用户名格式不正确、密码长度不足

2. **认证错误（Authentication Error）**
   - HTTP 状态码：401 Unauthorized
   - 场景：未登录或 Token 无效
   - 示例：Token 过期、Token 格式错误

3. **权限错误（Permission Error）**
   - HTTP 状态码：403 Forbidden
   - 场景：非管理员访问用户管理功能
   - 示例：普通用户尝试创建用户

4. **资源不存在错误（Not Found Error）**
   - HTTP 状态码：404 Not Found
   - 场景：请求的用户不存在
   - 示例：编辑或删除不存在的用户

5. **冲突错误（Conflict Error）**
   - HTTP 状态码：409 Conflict
   - 场景：用户名已存在
   - 示例：创建用户时用户名重复

6. **业务逻辑错误（Business Logic Error）**
   - HTTP 状态码：422 Unprocessable Entity
   - 场景：违反业务规则
   - 示例：尝试删除自己的账户

7. **服务器错误（Server Error）**
   - HTTP 状态码：500 Internal Server Error
   - 场景：数据库连接失败、未预期的异常
   - 示例：数据库宕机

### 错误响应格式

```json
{
  "detail": "错误描述信息",
  "error_code": "ERROR_CODE",
  "field": "字段名（可选）"
}
```

### 前端错误处理策略

1. **全局错误拦截器**
   - 在 Axios 拦截器中统一处理错误
   - 根据状态码显示不同的错误提示

2. **表单验证错误**
   - 在表单字段下方显示具体错误信息
   - 使用 Element Plus 的表单验证功能

3. **操作失败提示**
   - 使用 ElMessage 显示错误消息
   - 提供重试选项（如果适用）

4. **网络错误处理**
   - 检测网络连接状态
   - 显示友好的离线提示

## 测试策略

### 单元测试

**后端单元测试**：
- 测试框架：pytest
- 覆盖范围：
  - Repository 层：数据库操作
  - Service 层：业务逻辑
  - API 层：路由处理

**测试用例示例**：
```python
# test_user_service.py
async def test_create_user_with_valid_data():
    """测试使用有效数据创建用户"""
    
async def test_create_user_with_duplicate_username():
    """测试创建重复用户名的用户应该失败"""
    
async def test_delete_self_should_fail():
    """测试删除自己的账户应该失败"""
    
async def test_non_admin_cannot_create_user():
    """测试非管理员不能创建用户"""
```

**前端单元测试**：
- 测试框架：Vitest + Vue Test Utils
- 覆盖范围：
  - 组件渲染
  - 用户交互
  - API 调用

### 集成测试

**API 集成测试**：
- 测试完整的 API 请求-响应流程
- 使用测试数据库
- 测试认证和权限

**测试场景**：
```python
async def test_user_crud_workflow():
    """测试完整的用户 CRUD 流程"""
    # 1. 创建用户
    # 2. 获取用户列表
    # 3. 更新用户信息
    # 4. 重置密码
    # 5. 禁用用户
    # 6. 删除用户
```

### 端到端测试（E2E）

- 测试框架：Playwright 或 Cypress
- 测试场景：
  - 管理员登录
  - 创建新用户
  - 编辑用户信息
  - 搜索和筛选用户
  - 批量操作
  - 删除用户

### 性能测试

**负载测试**：
- 工具：Locust 或 JMeter
- 测试指标：
  - 并发用户数：100
  - 响应时间：< 500ms (P95)
  - 吞吐量：> 100 req/s

**数据库性能**：
- 测试大量用户数据的查询性能
- 验证索引效果
- 优化慢查询

### 安全测试

**测试项目**：
1. SQL 注入防护
2. XSS 攻击防护
3. CSRF 防护
4. 密码强度验证
5. 权限绕过测试
6. Token 安全性测试

## 安全考虑

### 认证和授权

1. **JWT Token 认证**
   - Token 有效期：24小时
   - 刷新机制：Token 过期前自动刷新
   - Token 存储：LocalStorage（前端）

2. **基于角色的访问控制（RBAC）**
   - Admin：所有权限
   - Manager：除用户管理外的所有权限
   - Operator：基本操作权限

3. **权限检查中间件**
   ```python
   async def require_admin(current_user: User = Depends(get_current_user)):
       if current_user.user_type != "admin":
           raise HTTPException(status_code=403, detail="权限不足")
       return current_user
   ```

### 密码安全

1. **密码加密**
   - 算法：bcrypt
   - 工作因子：12
   - 加盐：自动

2. **密码策略**
   - 最小长度：6个字符
   - 建议：包含大小写字母、数字、特殊字符
   - 不允许常见弱密码

3. **密码重置**
   - 仅管理员可重置他人密码
   - 重置后建议用户首次登录时修改密码

### 数据保护

1. **敏感信息保护**
   - 密码哈希不返回给前端
   - 日志中不记录密码

2. **输入验证**
   - 前端验证：即时反馈
   - 后端验证：安全保障
   - 使用 Pydantic 进行数据验证

3. **SQL 注入防护**
   - 使用 SQLAlchemy ORM
   - 参数化查询
   - 避免拼接 SQL

### 审计日志

**记录内容**：
- 操作类型：创建、更新、删除、状态变更
- 操作者：用户 ID 和用户名
- 操作时间：时间戳
- 操作对象：目标用户 ID
- 操作结果：成功或失败
- IP 地址：请求来源

**日志格式**：
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "action": "create_user",
  "operator_id": 1,
  "operator_username": "admin",
  "target_user_id": 10,
  "target_username": "newuser",
  "result": "success",
  "ip_address": "192.168.1.100"
}
```

## 性能优化

### 数据库优化

1. **索引策略**
   - username：唯一索引（已有）
   - user_type：普通索引
   - is_active：普通索引
   - created_at：普通索引

2. **查询优化**
   - 使用分页减少数据传输
   - 避免 N+1 查询问题
   - 使用数据库连接池

3. **缓存策略**
   - 用户列表缓存（5分钟）
   - 用户详情缓存（10分钟）
   - 缓存失效：用户信息变更时

### 前端优化

1. **组件懒加载**
   - 对话框组件按需加载
   - 路由懒加载

2. **数据缓存**
   - 使用 Pinia 缓存用户列表
   - 避免重复请求

3. **虚拟滚动**
   - 大量数据时使用虚拟滚动
   - 提升渲染性能

4. **防抖和节流**
   - 搜索输入防抖（300ms）
   - 批量操作节流

## UI/UX 设计

### 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  用户管理                                    [+ 添加用户] │
├─────────────────────────────────────────────────────────┤
│  [搜索框]  [用户类型筛选▼]  [搜索]                      │
├─────────────────────────────────────────────────────────┤
│  ☑ 全选   [批量启用] [批量禁用]          总计：XX 个用户 │
├─────────────────────────────────────────────────────────┤
│  ☑ │ ID │ 用户名 │ 真实姓名 │ 类型 │ 部门 │ 状态 │ 操作 │
│  ☐ │ 1  │ admin  │ 管理员   │ 管理 │ IT   │ ●   │ [编辑]│
│  ☐ │ 2  │ user1  │ 张三     │ 操作 │ 药房 │ ●   │ [编辑]│
│  ☐ │ 3  │ user2  │ 李四     │ 经理 │ 仓库 │ ○   │ [编辑]│
├─────────────────────────────────────────────────────────┤
│  共 XX 条  [10条/页▼]  [<] [1] [2] [3] [>]             │
└─────────────────────────────────────────────────────────┘
```

### 颜色方案

遵循系统主题色：
- 主题色：紫色 `#667EEA`
- 成功/启用：绿色 `#52C41A`
- 警告：橙色 `#FFA726`
- 危险/禁用：红色 `#FF6B6B`
- 中性：灰色 `#909399`

### 交互设计

1. **即时反馈**
   - 操作成功：显示成功提示（2秒自动关闭）
   - 操作失败：显示错误提示（需手动关闭）
   - 加载状态：显示 Loading 动画

2. **确认对话框**
   - 删除操作：显示确认对话框
   - 批量操作：显示确认对话框
   - 危险操作：使用红色按钮

3. **表单验证**
   - 实时验证：失去焦点时验证
   - 错误提示：字段下方显示错误信息
   - 提交验证：提交前验证所有字段

4. **状态指示**
   - 启用状态：绿色圆点 ●
   - 禁用状态：灰色圆点 ○
   - 在线状态：显示最后登录时间

### 响应式设计

- 桌面端（>1200px）：完整布局
- 平板端（768px-1200px）：调整列宽
- 移动端（<768px）：卡片式布局

## 部署和维护

### 数据库迁移

使用 Alembic 进行数据库迁移：

```bash
# 创建迁移脚本
alembic revision --autogenerate -m "Add user management indexes"

# 执行迁移
alembic upgrade head
```

### 环境配置

```env
# .env
DATABASE_URL=mysql+aiomysql://root:123456@localhost:3306/medicine_admin
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
BCRYPT_ROUNDS=12
```

### 监控和日志

1. **应用监控**
   - 响应时间监控
   - 错误率监控
   - API 调用统计

2. **日志记录**
   - 应用日志：backend/logs/app.log
   - 错误日志：backend/logs/error.log
   - 审计日志：backend/logs/audit.log

3. **告警机制**
   - 错误率超过阈值时告警
   - 数据库连接失败时告警
   - 磁盘空间不足时告警

## 依赖关系

### 后端依赖

```toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
sqlalchemy = "^2.0.0"
aiomysql = "^0.2.0"
pydantic = "^2.0.0"
python-jose = "^3.3.0"
passlib = "^1.7.4"
bcrypt = "^4.0.0"
```

### 前端依赖

```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.4.0",
    "axios": "^1.5.0",
    "typescript": "^5.2.0"
  }
}
```

## 未来扩展

### 短期扩展（1-3个月）

1. **用户导入导出**
   - Excel 批量导入用户
   - 导出用户列表

2. **用户组管理**
   - 创建用户组
   - 批量分配权限

3. **操作日志查看**
   - 查看用户操作历史
   - 审计追踪

### 中期扩展（3-6个月）

1. **高级权限管理**
   - 细粒度权限控制
   - 自定义角色

2. **用户自助服务**
   - 用户修改个人信息
   - 用户修改密码

3. **多因素认证（MFA）**
   - 短信验证码
   - 邮箱验证码
   - TOTP 认证

### 长期扩展（6-12个月）

1. **单点登录（SSO）**
   - LDAP 集成
   - OAuth2 集成

2. **用户行为分析**
   - 登录统计
   - 操作频率分析
   - 异常行为检测

3. **国际化（i18n）**
   - 多语言支持
   - 时区处理

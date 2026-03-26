# Implementation Plan

## Phase 1: 项目基础架构

- [x] 1. 初始化后端项目结构


  - [x] 1.1 创建 FastAPI 项目骨架和目录结构


    - 创建 app/ 目录及子目录（api/, models/, schemas/, services/, repositories/）
    - 配置 pyproject.toml 和依赖管理
    - _Requirements: 9.1, 9.4_


  - [x] 1.2 配置数据库连接和 SQLAlchemy 异步引擎
    - 创建 database.py 配置异步数据库连接
    - 配置 Alembic 数据库迁移
    - _Requirements: 9.4_

  - [x] 1.3 实现统一错误处理和响应格式
    - 创建自定义异常类和全局异常处理器
    - 定义统一的 API 响应格式
    - _Requirements: 9.3_

  - [x] 1.4 配置 CORS 中间件
    - 配置允许的前端域名
    - _Requirements: 9.6_






- [x] 2. 初始化前端项目结构
  - [x] 2.1 创建 Vue 3 + TypeScript + Vite 项目
    - 使用 create-vue 初始化项目
    - 配置 TypeScript 和 ESLint
    - _Requirements: 10.1_

  - [x] 2.2 集成 Element Plus 和基础样式
    - 安装并配置 Element Plus
    - 创建全局样式变量
    - _Requirements: 10.1_

  - [x] 2.3 配置 Vue Router 和路由守卫
    - 定义路由结构
    - 实现认证路由守卫
    - _Requirements: 10.2_

  - [x] 2.4 配置 Pinia 状态管理
    - 创建 auth store 和 app store
    - _Requirements: 10.1_

  - [x] 2.5 封装 Axios HTTP 客户端
    - 配置请求/响应拦截器
    - 实现 token 自动附加
    - _Requirements: 10.3_

## Phase 2: 用户认证模块

- [x] 3. 实现后端认证功能
  - [x] 3.1 创建 User 数据库模型
    - 实现 User SQLAlchemy 模型
    - 创建数据库迁移脚本
    - _Requirements: 8.1_
  - [x] 3.2 实现密码哈希和 JWT 工具
    - 使用 passlib 实现密码哈希
    - 使用 python-jose 实现 JWT 生成和验证
    - _Requirements: 1.1, 1.3_
  - [ ]* 3.3 编写属性测试：JWT 往返验证
    - **Property 1: JWT Token Generation and Validation Round-Trip**
    - **Validates: Requirements 1.1, 1.3**
  - [x] 3.4 实现认证 Service 和 API 路由

    - 创建 AuthService 处理登录逻辑
    - 创建 /api/auth/login 端点
    - _Requirements: 1.1, 1.2_
  - [ ]* 3.5 编写属性测试：无效凭证拒绝
    - **Property 2: Invalid Credentials Rejection**
    - **Validates: Requirements 1.2**
  - [x] 3.6 实现角色权限中间件


    - 创建权限依赖注入函数
    - 实现角色检查装饰器
    - _Requirements: 1.4, 1.5, 1.6_
  - [ ]* 3.7 编写属性测试：角色访问控制
    - **Property 3: Role-Based Access Control**
    - **Validates: Requirements 1.4, 1.5, 1.6**



- [x] 4. 实现前端登录功能
  - [x] 4.1 创建登录页面组件
    - 实现登录表单和验证
    - 处理登录响应和 token 存储
    - _Requirements: 1.1_
  - [x] 4.2 实现主布局组件
    - 创建 MainLayout、Sidebar、Header 组件
    - 实现响应式侧边栏
    - _Requirements: 10.1_
  - [ ]* 4.3 编写前端单元测试
    - 测试登录表单验证
    - 测试 token 存储逻辑
    - _Requirements: 1.1_

- [ ] 5. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: 药品管理模块

- [x] 6. 实现药品后端功能
  - [x] 6.1 创建 Medicine 和 MedicineCategory 数据库模型
    - 实现 SQLAlchemy 模型
    - 创建数据库迁移脚本
    - _Requirements: 3.1, 3.7_

  - [x] 6.2 实现药品 Repository 层
    - 创建 MedicineRepository 类
    - 实现分页、搜索、排序查询
    - _Requirements: 3.1_

  - [x] 6.3 实现药品 Service 层
    - 创建 MedicineService 类
    - 实现 CRUD 业务逻辑
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ]* 6.4 编写属性测试：药品 CRUD 往返
    - **Property 5: Medicine CRUD Round-Trip**
    - **Validates: Requirements 3.2, 3.3**
  - [ ]* 6.5 编写属性测试：软删除保留
    - **Property 6: Soft Delete Preservation**
    - **Validates: Requirements 3.4**
  - [x] 6.6 实现药品 API 路由


    - 创建 /api/medicines 端点（GET, POST, PUT, DELETE）
    - 创建 /api/categories 端点
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7_
  - [ ]* 6.7 编写属性测试：分页一致性
    - **Property 4: Pagination Consistency**
    - **Validates: Requirements 3.1**


  - [ ] 6.8 实现 Excel 导入导出功能
    - 使用 openpyxl 处理 Excel 文件
    - 实现 /api/medicines/import 和 /api/medicines/export 端点
    - _Requirements: 3.5, 3.6_
  - [ ]* 6.9 编写属性测试：Excel 导入导出往返
    - **Property 7: Excel Import/Export Round-Trip**
    - **Validates: Requirements 3.5, 3.6**

- [x] 7. 实现药品前端功能
  - [x] 7.1 创建药品列表页面
    - 实现数据表格、分页、搜索
    - 实现排序功能
    - _Requirements: 3.1, 10.4_
  - [x] 7.2 创建药品表单组件
    - 实现新增/编辑表单
    - 实现表单验证
    - _Requirements: 3.2, 3.3, 10.5_
  - [x] 7.3 实现导入导出功能
    - 创建导入对话框组件
    - 实现文件上传和下载
    - _Requirements: 3.5, 3.6_
  - [ ]* 7.4 编写前端单元测试
    - 测试药品表格组件
    - 测试表单验证逻辑
    - _Requirements: 3.1, 3.2_

- [ ] 8. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: 库存管理模块

- [x] 9. 实现库存后端功能
  - [x] 9.1 创建 Batch 和 Transaction 数据库模型
    - 实现 SQLAlchemy 模型
    - 创建数据库迁移脚本
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 9.2 实现库存 Repository 层
    - 创建 BatchRepository 和 TransactionRepository
    - 实现库存查询和更新方法
    - _Requirements: 4.1, 4.5_
  - [x] 9.3 实现库存 Service 层
    - 创建 InventoryService 类
    - 实现入库、出库业务逻辑
    - _Requirements: 4.2, 4.3, 4.4_
  - [ ]* 9.4 编写属性测试：库存数量不变量
    - **Property 8: Inventory Quantity Invariant**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  - [ ]* 9.5 编写属性测试：出库数量约束
    - **Property 9: Outbound Quantity Constraint**
    - **Validates: Requirements 4.4**
  - [x] 9.6 实现库存 API 路由
    - 创建 /api/inventory 端点
    - 创建 /api/inventory/inbound 和 /api/inventory/outbound 端点
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 9.7 实现盘点功能
    - 创建 Stocktake 和 StocktakeItem 模型
    - 实现盘点 Service 和 API
    - _Requirements: 4.6, 4.7_
  - [ ]* 9.8 编写属性测试：盘点差异计算
    - **Property 10: Stocktake Discrepancy Calculation**
    - **Validates: Requirements 4.6, 4.7**

- [x] 10. 实现库存前端功能
  - [x] 10.1 创建库存列表页面
    - 实现库存表格和批次详情
    - _Requirements: 4.1, 4.5_
  - [x] 10.2 创建入库/出库表单组件
    - 实现入库表单
    - 实现出库表单和数量验证
    - _Requirements: 4.2, 4.3, 4.4_
  - [ ] 10.3 创建盘点管理页面
    - 实现盘点任务创建和结果录入
    - _Requirements: 4.6, 4.7_
  - [ ]* 10.4 编写前端单元测试
    - 测试库存组件
    - 测试数量验证逻辑
    - _Requirements: 4.2, 4.3_

- [ ] 11. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: OCR 审核模块

- [x] 12. 实现 OCR 审核后端功能
  - [x] 12.1 创建 OcrRecord 数据库模型
    - 实现 SQLAlchemy 模型
    - 创建数据库迁移脚本
    - _Requirements: 5.1_
  - [x] 12.2 实现 OCR 审核 Service 层
    - 创建 OcrService 类
    - 实现审核通过、驳回逻辑
    - _Requirements: 5.3, 5.4, 5.5_
  - [ ]* 12.3 编写属性测试：OCR 审核状态转换
    - **Property 11: OCR Review Status Transition**
    - **Validates: Requirements 5.3, 5.4, 5.5**
  - [x] 12.4 实现 OCR 审核 API 路由
    - 创建 /api/ocr/pending 端点
    - 创建 /api/ocr/review/{id} 端点
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 13. 实现 OCR 审核前端功能
  - [x] 13.1 创建审核列表页面
    - 实现待审核列表
    - _Requirements: 5.1_
  - [x] 13.2 创建审核详情组件
    - 实现图片预览和 OCR 结果展示
    - 实现数据修正表单
    - _Requirements: 5.2, 5.4_
  - [x] 13.3 实现审核操作功能
    - 实现通过和驳回按钮
    - _Requirements: 5.3, 5.5_

## Phase 6: 预警管理模块

- [x] 14. 实现预警后端功能
  - [x] 14.1 创建 Warning 和 WarningConfig 数据库模型
    - 实现 SQLAlchemy 模型
    - 创建数据库迁移脚本
    - _Requirements: 6.1, 6.2_
  - [x] 14.2 实现预警 Service 层
    - 创建 WarningService 类
    - 实现预警检查和生成逻辑
    - _Requirements: 6.3, 6.4_
  - [ ]* 14.3 编写属性测试：临期预警生成
    - **Property 12: Expiry Warning Generation**
    - **Validates: Requirements 6.1, 6.3**
  - [ ]* 14.4 编写属性测试：低库存预警生成
    - **Property 13: Low Stock Warning Generation**
    - **Validates: Requirements 6.2, 6.4**
  - [x] 14.5 实现预警 API 路由
    - 创建 /api/warnings 端点
    - 创建 /api/warnings/config 端点
    - _Requirements: 6.1, 6.2, 6.5, 6.6_
  - [ ]* 14.6 编写属性测试：预警过滤正确性
    - **Property 14: Warning Filter Correctness**
    - **Validates: Requirements 6.5**

- [x] 15. 实现预警前端功能
  - [x] 15.1 创建预警列表页面
    - 实现预警列表和过滤
    - _Requirements: 6.5_
  - [x] 15.2 创建预警配置页面
    - 实现配置表单
    - _Requirements: 6.1, 6.2_
  - [x] 15.3 实现预警标记已读功能
    - _Requirements: 6.6_

- [ ] 16. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: 仪表盘和报表模块

- [x] 17. 实现仪表盘后端功能
  - [x] 17.1 实现仪表盘 Service 层
    - 创建 DashboardService 类
    - 实现统计数据聚合
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 17.2 实现仪表盘 API 路由
    - 创建 /api/dashboard/summary 端点
    - 创建 /api/dashboard/charts 端点
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 17.3 编写属性测试：仪表盘预警限制
    - **Property 19: Dashboard Warning Limit**
    - **Validates: Requirements 2.4**

- [x] 18. 实现报表后端功能
  - [x] 18.1 实现报表 Service 层
    - 创建 ReportService 类
    - 实现各类报表生成逻辑
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 18.2 编写属性测试：报表日期范围过滤
    - **Property 15: Report Date Range Filtering**
    - **Validates: Requirements 7.3**
  - [x] 18.3 实现报表 API 路由
    - 创建 /api/reports/inventory 端点
    - 创建 /api/reports/expiry 端点
    - 创建 /api/reports/transactions 端点
    - 创建 /api/reports/stocktake 端点
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 19. 实现仪表盘和报表前端功能
  - [x] 19.1 创建仪表盘页面
    - 实现统计卡片组件
    - 集成 ECharts 图表
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 19.2 创建预警列表组件
    - 实现最近预警展示
    - _Requirements: 2.4_
  - [x] 19.3 创建报表中心页面
    - 实现报表选择和展示
    - 实现报表导出功能
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

## Phase 8: 系统管理模块

- [x] 20. 实现系统管理后端功能
  - [x] 20.1 实现用户管理 Service 和 API
    - 创建 UserService 类
    - 实现用户 CRUD API
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 20.2 编写属性测试：用户停用阻止登录
    - **Property 16: User Deactivation Prevents Login**
    - **Validates: Requirements 8.3**
  - [x] 20.3 创建 OperationLog 数据库模型
    - 实现 SQLAlchemy 模型
    - 创建数据库迁移脚本
    - _Requirements: 8.4_
  - [ ] 20.4 实现操作日志中间件
    - 创建日志记录装饰器
    - 实现关键操作自动记录
    - _Requirements: 8.4_
  - [ ]* 20.5 编写属性测试：审计日志完整性
    - **Property 17: Audit Log Completeness**
    - **Validates: Requirements 8.4**
  - [x] 20.6 实现操作日志 API 路由
    - 创建 /api/logs 端点
    - _Requirements: 8.5_
  - [x] 20.7 实现系统配置 API
    - 创建 /api/settings 端点
    - _Requirements: 8.6_

- [x] 21. 实现系统管理前端功能
  - [x] 21.1 创建用户管理页面
    - 实现用户列表和表单
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 21.2 创建操作日志页面
    - 实现日志列表和过滤
    - _Requirements: 8.5_
  - [x] 21.3 创建系统配置页面
    - 实现配置表单
    - _Requirements: 8.6_

## Phase 9: API 验证和集成测试

- [ ] 22. 实现 API 验证测试
  - [ ]* 22.1 编写属性测试：Pydantic 验证拒绝
    - **Property 18: Pydantic Validation Rejection**
    - **Validates: Requirements 9.2**
  - [ ]* 22.2 编写 API 集成测试
    - 测试完整的 API 工作流
    - 测试错误处理
    - _Requirements: 9.3_

- [ ] 23. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

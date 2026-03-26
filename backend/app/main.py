"""FastAPI 应用入口"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.security_middleware import SecurityMiddleware
from app.core.anti_crawler import AntiCrawlerMiddleware
from app.api import auth, dashboard, medicines, inventory, ocr, warnings, reports, system, trace_code, users, notifications, app_version, sms


# 后台任务：定时清理旧预警
async def cleanup_old_warnings_task():
    """每天自动清理30天前的已读预警"""
    from app.core.database import async_session_maker
    from app.services.warning import WarningService
    
    while True:
        try:
            # 每24小时执行一次
            await asyncio.sleep(24 * 60 * 60)
            
            async with async_session_maker() as db:
                service = WarningService(db)
                count = await service.cleanup_old_warnings(days=30)
                if count > 0:
                    print(f"[定时任务] 已自动清理 {count} 条30天前的已读预警")
        except Exception as e:
            print(f"[定时任务] 清理旧预警失败: {e}")


# 后台任务：定时发送短信预警
async def auto_sms_notification_task():
    """每天定时发送短信预警通知
    
    根据用户配置的通知时间发送短信
    默认每天早上9点检查并发送
    """
    from datetime import datetime
    from app.core.database import async_session_maker
    from app.services.sms_notification import SmsNotificationService
    from app.models.user import User
    from app.models.sms import SmsConfig
    from sqlalchemy import select
    
    while True:
        try:
            # 每小时检查一次
            await asyncio.sleep(60 * 60)
            
            current_hour = datetime.now().strftime("%H:00")
            
            async with async_session_maker() as db:
                # 获取所有开启短信通知的用户
                result = await db.execute(
                    select(SmsConfig, User)
                    .join(User, SmsConfig.user_id == User.id)
                    .where(
                        SmsConfig.sms_enabled == True,
                        SmsConfig.notify_time == current_hour
                    )
                )
                configs = result.all()
                
                if not configs:
                    continue
                
                print(f"[定时短信] {current_hour} 开始发送短信通知，共 {len(configs)} 个用户")
                
                for sms_config, user in configs:
                    try:
                        service = SmsNotificationService(db)
                        result = await service.send_batch_warnings_sms(user.id)
                        
                        if result["sent"] > 0:
                            print(f"[定时短信] 用户 {user.username} 发送成功 {result['sent']} 条")
                    except Exception as e:
                        print(f"[定时短信] 用户 {user.username} 发送失败: {e}")
                        
        except Exception as e:
            print(f"[定时任务] 短信通知任务异常: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    print("[启动] 药品管理系统后端启动中...")
    
    # 启动时先清理一次旧预警
    try:
        from app.core.database import async_session_maker
        from app.services.warning import WarningService
        
        async with async_session_maker() as db:
            service = WarningService(db)
            count = await service.cleanup_old_warnings(days=30)
            if count > 0:
                print(f"[启动] 已清理 {count} 条30天前的已读预警")
    except Exception as e:
        print(f"[启动] 清理旧预警失败: {e}")
    
    # 启动后台清理任务
    cleanup_task = asyncio.create_task(cleanup_old_warnings_task())
    
    # 启动短信自动推送任务
    sms_task = asyncio.create_task(auto_sms_notification_task())
    print("[启动] 短信自动推送任务已启动")
    
    yield
    
    # 关闭时执行
    cleanup_task.cancel()
    sms_task.cancel()
    print("[关闭] 药品管理系统后端已关闭")

app = FastAPI(
    title=settings.APP_NAME,
    description="医药管理系统后端 API",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,  # 生产环境禁用文档
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,  # 生命周期管理
)

# 注册安全中间件（顺序很重要，最先添加的最后执行）
# 1. GZip压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 2. 反爬虫中间件（行为分析、指纹识别、蜜罐陷阱等）
app.add_middleware(AntiCrawlerMiddleware)

# 3. 安全中间件（速率限制、IP黑名单、请求验证等）
app.add_middleware(SecurityMiddleware)

# 4. 可信主机中间件（防止Host头攻击）
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )

# 5. CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,  # 预检请求缓存10分钟
)

# 注册异常处理器
register_exception_handlers(app)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["仪表盘"])
app.include_router(medicines.router, prefix="/api/medicines", tags=["药品管理"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["库存管理"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR识别"])
app.include_router(trace_code.router, prefix="/api/trace-code", tags=["追溯码查询"])
app.include_router(warnings.router, prefix="/api/warnings", tags=["预警管理"])
app.include_router(reports.router, prefix="/api/reports", tags=["报表"])
app.include_router(system.router, prefix="/api/system", tags=["系统管理"])
app.include_router(users.router, prefix="/api/users", tags=["用户管理"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["推送通知"])
app.include_router(app_version.router, prefix="/api/app", tags=["App版本"])
app.include_router(sms.router, prefix="/api", tags=["短信通知"])


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy"}

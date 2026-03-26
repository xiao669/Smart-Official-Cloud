"""应用配置"""
import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置类"""
    
    APP_NAME: str = "医药管理系统"
    DEBUG: bool = False
    
    # 数据库配置
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "medicine_admin"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # JWT 配置 - 生产环境必须修改 SECRET_KEY
    SECRET_KEY: str = secrets.token_urlsafe(32)  # 自动生成安全密钥
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8小时，更安全
    
    # CORS 配置 - 生产环境需要配置具体域名
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://192.168.3.2:3000",
        "http://192.168.3.2:5173",
    ]
    
    # 可信主机配置 - 防止Host头攻击
    ALLOWED_HOSTS: list[str] = [
        "localhost",
        "127.0.0.1",
        "192.168.3.2",
    ]
    
    # 安全配置
    # 速率限制
    RATE_LIMIT_PER_MINUTE: int = 100  # 每分钟最大请求数
    LOGIN_RATE_LIMIT: int = 5  # 登录接口每分钟最大尝试次数
    
    # 登录失败锁定
    MAX_LOGIN_ATTEMPTS: int = 5  # 最大登录失败次数
    LOCKOUT_DURATION_MINUTES: int = 15  # 锁定时间（分钟）
    
    # 密码策略
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_DIGIT: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True
    
    # 阿里云短信配置
    ALIYUN_SMS_ACCESS_KEY_ID: str = ""
    ALIYUN_SMS_ACCESS_KEY_SECRET: str = ""
    ALIYUN_SMS_SIGN_NAME: str = "药品管理系统"  # 短信签名
    ALIYUN_SMS_TEMPLATE_CODE: str = ""  # 临期预警模板
    ALIYUN_SMS_EXPIRED_TEMPLATE_CODE: str = ""  # 已过期模板（可选）
    ALIYUN_SMS_LOW_STOCK_TEMPLATE_CODE: str = ""  # 低库存模板（可选）
    
    # 短信通知配置
    SMS_ENABLED: bool = False  # 是否启用短信通知
    SMS_DAILY_LIMIT: int = 10  # 每用户每天短信上限
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

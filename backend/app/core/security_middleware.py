"""
安全中间件 - 全面的安全防护
包含：速率限制、IP黑名单、安全头部、请求验证等
"""
import time
import re
import hashlib
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Callable
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging

# 配置日志
logger = logging.getLogger("security")


class RateLimiter:
    """
    滑动窗口速率限制器
    防止暴力破解和DDoS攻击
    """
    def __init__(self):
        # 存储请求记录: {ip: [(timestamp, endpoint), ...]}
        self.requests: dict[str, list[tuple[float, str]]] = defaultdict(list)
        # 全局限制: 每分钟最大请求数
        self.global_limit = 100
        self.global_window = 60  # 秒
        # 登录接口限制: 每分钟最大尝试次数
        self.login_limit = 5
        self.login_window = 60
        # 敏感接口限制
        self.sensitive_limit = 20
        self.sensitive_window = 60
        # 敏感接口列表
        self.sensitive_endpoints = [
            "/api/auth/login",
            "/api/users",
            "/api/system",
        ]
    
    def _clean_old_requests(self, ip: str, window: int):
        """清理过期的请求记录"""
        now = time.time()
        self.requests[ip] = [
            (ts, ep) for ts, ep in self.requests[ip]
            if now - ts < window
        ]
    
    def is_rate_limited(self, ip: str, endpoint: str) -> tuple[bool, str]:
        """
        检查是否超过速率限制
        返回: (是否限制, 原因)
        """
        now = time.time()
        
        # 清理旧记录
        self._clean_old_requests(ip, max(self.global_window, self.login_window))
        
        # 记录当前请求
        self.requests[ip].append((now, endpoint))
        
        # 检查登录接口限制
        if "/api/auth/login" in endpoint:
            login_requests = [
                (ts, ep) for ts, ep in self.requests[ip]
                if now - ts < self.login_window and "/api/auth/login" in ep
            ]
            if len(login_requests) > self.login_limit:
                return True, f"登录尝试过于频繁，请 {self.login_window} 秒后重试"
        
        # 检查敏感接口限制
        for sensitive_ep in self.sensitive_endpoints:
            if sensitive_ep in endpoint:
                sensitive_requests = [
                    (ts, ep) for ts, ep in self.requests[ip]
                    if now - ts < self.sensitive_window and sensitive_ep in ep
                ]
                if len(sensitive_requests) > self.sensitive_limit:
                    return True, f"请求过于频繁，请稍后重试"
        
        # 检查全局限制
        recent_requests = [
            (ts, ep) for ts, ep in self.requests[ip]
            if now - ts < self.global_window
        ]
        if len(recent_requests) > self.global_limit:
            return True, "请求过于频繁，请稍后重试"
        
        return False, ""


class LoginAttemptTracker:
    """
    登录失败追踪器
    防止暴力破解密码
    """
    def __init__(self):
        # 存储失败记录: {username: [(timestamp, ip), ...]}
        self.failed_attempts: dict[str, list[tuple[float, str]]] = defaultdict(list)
        # 锁定的账户: {username: unlock_time}
        self.locked_accounts: dict[str, float] = {}
        # 配置
        self.max_attempts = 5  # 最大失败次数
        self.lockout_duration = 900  # 锁定时间（秒）= 15分钟
        self.attempt_window = 300  # 统计窗口（秒）= 5分钟
    
    def record_failed_attempt(self, username: str, ip: str):
        """记录登录失败"""
        now = time.time()
        self.failed_attempts[username].append((now, ip))
        
        # 清理旧记录
        self.failed_attempts[username] = [
            (ts, ip) for ts, ip in self.failed_attempts[username]
            if now - ts < self.attempt_window
        ]
        
        # 检查是否需要锁定
        if len(self.failed_attempts[username]) >= self.max_attempts:
            self.locked_accounts[username] = now + self.lockout_duration
            logger.warning(f"账户 {username} 因多次登录失败被锁定，IP: {ip}")
    
    def is_locked(self, username: str) -> tuple[bool, int]:
        """
        检查账户是否被锁定
        返回: (是否锁定, 剩余锁定秒数)
        """
        if username not in self.locked_accounts:
            return False, 0
        
        unlock_time = self.locked_accounts[username]
        now = time.time()
        
        if now >= unlock_time:
            # 解锁
            del self.locked_accounts[username]
            self.failed_attempts[username] = []
            return False, 0
        
        return True, int(unlock_time - now)
    
    def clear_attempts(self, username: str):
        """登录成功后清除失败记录"""
        self.failed_attempts[username] = []
        if username in self.locked_accounts:
            del self.locked_accounts[username]


class IPBlacklist:
    """
    IP黑名单管理
    自动封禁恶意IP
    """
    def __init__(self):
        # 永久黑名单
        self.permanent_blacklist: set[str] = set()
        # 临时黑名单: {ip: unblock_time}
        self.temp_blacklist: dict[str, float] = {}
        # 可疑行为计数: {ip: count}
        self.suspicious_count: dict[str, int] = defaultdict(int)
        # 配置
        self.auto_block_threshold = 10  # 可疑行为阈值
        self.temp_block_duration = 3600  # 临时封禁时间（秒）= 1小时
    
    def add_permanent(self, ip: str):
        """添加到永久黑名单"""
        self.permanent_blacklist.add(ip)
        logger.warning(f"IP {ip} 已添加到永久黑名单")
    
    def add_temporary(self, ip: str, duration: int = None):
        """添加到临时黑名单"""
        if duration is None:
            duration = self.temp_block_duration
        self.temp_blacklist[ip] = time.time() + duration
        logger.warning(f"IP {ip} 已添加到临时黑名单，时长 {duration} 秒")
    
    def record_suspicious(self, ip: str):
        """记录可疑行为"""
        self.suspicious_count[ip] += 1
        if self.suspicious_count[ip] >= self.auto_block_threshold:
            self.add_temporary(ip)
            self.suspicious_count[ip] = 0
    
    def is_blocked(self, ip: str) -> bool:
        """检查IP是否被封禁"""
        # 检查永久黑名单
        if ip in self.permanent_blacklist:
            return True
        
        # 检查临时黑名单
        if ip in self.temp_blacklist:
            if time.time() >= self.temp_blacklist[ip]:
                del self.temp_blacklist[ip]
                return False
            return True
        
        return False


class RequestValidator:
    """
    请求验证器
    防止SQL注入、XSS等攻击
    """
    # SQL注入特征
    SQL_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)",
        r"(--|#|/\*|\*/)",
        r"(\bOR\b\s+\d+\s*=\s*\d+)",
        r"(\bAND\b\s+\d+\s*=\s*\d+)",
        r"(;.*--)",
        r"(\bEXEC\b|\bEXECUTE\b)",
        r"(\bxp_\w+)",
    ]
    
    # XSS特征
    XSS_PATTERNS = [
        r"<script[^>]*>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
    ]
    
    # 路径遍历特征
    PATH_TRAVERSAL_PATTERNS = [
        r"\.\./",
        r"\.\.\\",
        r"%2e%2e%2f",
        r"%2e%2e/",
        r"\.%2e/",
    ]
    
    def __init__(self):
        self.sql_regex = [re.compile(p, re.IGNORECASE) for p in self.SQL_PATTERNS]
        self.xss_regex = [re.compile(p, re.IGNORECASE) for p in self.XSS_PATTERNS]
        self.path_regex = [re.compile(p, re.IGNORECASE) for p in self.PATH_TRAVERSAL_PATTERNS]
    
    def check_sql_injection(self, value: str) -> bool:
        """检查SQL注入"""
        for pattern in self.sql_regex:
            if pattern.search(value):
                return True
        return False
    
    def check_xss(self, value: str) -> bool:
        """检查XSS攻击"""
        for pattern in self.xss_regex:
            if pattern.search(value):
                return True
        return False
    
    def check_path_traversal(self, value: str) -> bool:
        """检查路径遍历"""
        for pattern in self.path_regex:
            if pattern.search(value):
                return True
        return False
    
    def validate(self, value: str) -> tuple[bool, str]:
        """
        验证输入
        返回: (是否安全, 攻击类型)
        """
        if self.check_sql_injection(value):
            return False, "SQL注入"
        if self.check_xss(value):
            return False, "XSS攻击"
        if self.check_path_traversal(value):
            return False, "路径遍历"
        return True, ""


# 全局实例
rate_limiter = RateLimiter()
login_tracker = LoginAttemptTracker()
ip_blacklist = IPBlacklist()
request_validator = RequestValidator()


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    安全中间件
    集成所有安全检查
    """
    
    # 白名单路径（不进行某些检查）
    WHITELIST_PATHS = [
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
    ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 获取客户端IP
        client_ip = self._get_client_ip(request)
        path = request.url.path
        
        # 1. IP黑名单检查
        if ip_blacklist.is_blocked(client_ip):
            logger.warning(f"被封禁的IP尝试访问: {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "访问被拒绝"}
            )
        
        # 白名单路径跳过部分检查
        if not any(path.startswith(wp) for wp in self.WHITELIST_PATHS):
            # 2. 速率限制检查
            is_limited, reason = rate_limiter.is_rate_limited(client_ip, path)
            if is_limited:
                logger.warning(f"速率限制触发: {client_ip} - {path}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": reason}
                )
            
            # 3. 请求参数验证
            try:
                # 检查查询参数
                for key, value in request.query_params.items():
                    is_safe, attack_type = request_validator.validate(value)
                    if not is_safe:
                        logger.warning(f"检测到{attack_type}: {client_ip} - {path} - {key}={value}")
                        ip_blacklist.record_suspicious(client_ip)
                        return JSONResponse(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            content={"detail": "请求包含非法字符"}
                        )
            except Exception as e:
                logger.error(f"请求验证错误: {e}")
        
        # 4. 调用下一个处理器
        response = await call_next(request)
        
        # 5. 添加安全响应头
        response = self._add_security_headers(response)
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """获取真实客户端IP"""
        # 优先从代理头获取
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # 直接连接的IP
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _add_security_headers(self, response: Response) -> Response:
        """添加安全响应头"""
        # 防止点击劫持
        response.headers["X-Frame-Options"] = "DENY"
        # 防止MIME类型嗅探
        response.headers["X-Content-Type-Options"] = "nosniff"
        # XSS保护
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # 内容安全策略
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        # 引用策略
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # 权限策略
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        # 严格传输安全（生产环境启用HTTPS后使用）
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


class AuditLogger:
    """
    审计日志记录器
    记录敏感操作
    """
    def __init__(self):
        self.logger = logging.getLogger("audit")
        # 配置审计日志处理器
        handler = logging.FileHandler("audit.log", encoding="utf-8")
        handler.setFormatter(logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s"
        ))
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_login(self, username: str, ip: str, success: bool):
        """记录登录事件"""
        status_text = "成功" if success else "失败"
        self.logger.info(f"登录{status_text}: 用户={username}, IP={ip}")
    
    def log_sensitive_action(self, user_id: int, action: str, details: str, ip: str):
        """记录敏感操作"""
        self.logger.info(f"敏感操作: 用户ID={user_id}, 操作={action}, 详情={details}, IP={ip}")
    
    def log_security_event(self, event_type: str, details: str, ip: str):
        """记录安全事件"""
        self.logger.warning(f"安全事件: 类型={event_type}, 详情={details}, IP={ip}")


# 全局审计日志实例
audit_logger = AuditLogger()


class PasswordValidator:
    """
    密码强度验证器
    确保用户使用强密码
    """
    def __init__(self):
        self.min_length = 8
        self.require_uppercase = True
        self.require_lowercase = True
        self.require_digit = True
        self.require_special = True
        self.special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        # 常见弱密码列表
        self.weak_passwords = {
            "password", "123456", "12345678", "qwerty", "abc123",
            "password123", "admin123", "letmein", "welcome",
            "monkey", "dragon", "master", "login", "admin",
        }
    
    def validate(self, password: str) -> tuple[bool, list[str]]:
        """
        验证密码强度
        返回: (是否通过, 错误列表)
        """
        errors = []
        
        # 检查长度
        if len(password) < self.min_length:
            errors.append(f"密码长度至少 {self.min_length} 位")
        
        # 检查大写字母
        if self.require_uppercase and not any(c.isupper() for c in password):
            errors.append("密码必须包含大写字母")
        
        # 检查小写字母
        if self.require_lowercase and not any(c.islower() for c in password):
            errors.append("密码必须包含小写字母")
        
        # 检查数字
        if self.require_digit and not any(c.isdigit() for c in password):
            errors.append("密码必须包含数字")
        
        # 检查特殊字符
        if self.require_special and not any(c in self.special_chars for c in password):
            errors.append(f"密码必须包含特殊字符 ({self.special_chars})")
        
        # 检查弱密码
        if password.lower() in self.weak_passwords:
            errors.append("密码过于简单，请使用更复杂的密码")
        
        return len(errors) == 0, errors


# 全局密码验证器实例
password_validator = PasswordValidator()

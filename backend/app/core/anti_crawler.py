"""
高级反爬虫系统
包含：行为分析、指纹识别、蜜罐陷阱、动态令牌、请求签名验证等
"""
import time
import hashlib
import hmac
import secrets
import re
import json
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional, Callable
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger("anti_crawler")


class DeviceFingerprint:
    """
    设备指纹识别
    通过多维度特征识别唯一设备
    """
    def __init__(self):
        # 已知指纹: {fingerprint: {first_seen, last_seen, request_count, is_suspicious}}
        self.fingerprints: dict[str, dict] = {}
        # 指纹黑名单
        self.blacklisted_fingerprints: set[str] = set()
    
    def generate_fingerprint(self, request: Request) -> str:
        """生成设备指纹"""
        components = [
            request.headers.get("User-Agent", ""),
            request.headers.get("Accept-Language", ""),
            request.headers.get("Accept-Encoding", ""),
            request.headers.get("Accept", ""),
            request.headers.get("Connection", ""),
            # 屏幕信息（如果前端传递）
            request.headers.get("X-Screen-Resolution", ""),
            request.headers.get("X-Timezone", ""),
            request.headers.get("X-Platform", ""),
        ]
        
        fingerprint_str = "|".join(components)
        return hashlib.sha256(fingerprint_str.encode()).hexdigest()[:32]
    
    def record_request(self, fingerprint: str, ip: str):
        """记录请求"""
        now = time.time()
        
        if fingerprint not in self.fingerprints:
            self.fingerprints[fingerprint] = {
                "first_seen": now,
                "last_seen": now,
                "request_count": 1,
                "ips": {ip},
                "is_suspicious": False
            }
        else:
            fp_data = self.fingerprints[fingerprint]
            fp_data["last_seen"] = now
            fp_data["request_count"] += 1
            fp_data["ips"].add(ip)
            
            # 检测可疑行为：同一指纹来自多个IP
            if len(fp_data["ips"]) > 5:
                fp_data["is_suspicious"] = True
    
    def is_blacklisted(self, fingerprint: str) -> bool:
        """检查指纹是否在黑名单"""
        return fingerprint in self.blacklisted_fingerprints
    
    def blacklist(self, fingerprint: str):
        """将指纹加入黑名单"""
        self.blacklisted_fingerprints.add(fingerprint)
        logger.warning(f"设备指纹已加入黑名单: {fingerprint}")


class BehaviorAnalyzer:
    """
    行为分析引擎
    检测异常访问模式
    """
    def __init__(self):
        # 访问记录: {ip: [(timestamp, path, method), ...]}
        self.access_logs: dict[str, list] = defaultdict(list)
        # 行为评分: {ip: score}  分数越高越可疑
        self.behavior_scores: dict[str, float] = defaultdict(float)
        # 配置
        self.window_size = 300  # 5分钟窗口
        self.max_score = 100  # 最大分数
        self.block_threshold = 80  # 封禁阈值
    
    def record_access(self, ip: str, path: str, method: str, 
                      response_time: float, status_code: int):
        """记录访问"""
        now = time.time()
        self.access_logs[ip].append({
            "timestamp": now,
            "path": path,
            "method": method,
            "response_time": response_time,
            "status_code": status_code
        })
        
        # 清理旧记录
        self.access_logs[ip] = [
            log for log in self.access_logs[ip]
            if now - log["timestamp"] < self.window_size
        ]
    
    def analyze(self, ip: str) -> tuple[float, list[str]]:
        """
        分析行为并返回可疑分数
        返回: (分数, 可疑原因列表)
        """
        logs = self.access_logs[ip]
        if not logs:
            return 0, []
        
        score = 0
        reasons = []
        now = time.time()
        
        # 1. 请求频率分析
        request_count = len(logs)
        if request_count > 60:  # 5分钟内超过60次
            score += 20
            reasons.append(f"高频请求: {request_count}次/5分钟")
        
        # 2. 请求间隔分析（机器人通常间隔非常规律）
        if len(logs) >= 10:
            intervals = []
            for i in range(1, len(logs)):
                intervals.append(logs[i]["timestamp"] - logs[i-1]["timestamp"])
            
            if intervals:
                avg_interval = sum(intervals) / len(intervals)
                variance = sum((i - avg_interval) ** 2 for i in intervals) / len(intervals)
                
                # 间隔过于规律（方差很小）
                if variance < 0.1 and avg_interval < 2:
                    score += 25
                    reasons.append(f"请求间隔过于规律: 方差={variance:.4f}")
        
        # 3. 路径访问模式分析
        paths = [log["path"] for log in logs]
        unique_paths = set(paths)
        
        # 顺序访问（爬虫特征）
        if len(unique_paths) > 10:
            sequential_count = 0
            for i in range(1, len(paths)):
                if paths[i] != paths[i-1]:
                    sequential_count += 1
            
            if sequential_count / len(paths) > 0.9:
                score += 15
                reasons.append("顺序访问模式")
        
        # 4. 错误率分析
        error_count = sum(1 for log in logs if log["status_code"] >= 400)
        if request_count > 0:
            error_rate = error_count / request_count
            if error_rate > 0.3:
                score += 20
                reasons.append(f"高错误率: {error_rate:.1%}")
        
        # 5. 响应时间分析（机器人通常不等待）
        response_times = [log["response_time"] for log in logs if log["response_time"] > 0]
        if response_times:
            avg_response = sum(response_times) / len(response_times)
            # 平均响应时间极短可能是机器人
            if avg_response < 0.05 and request_count > 20:
                score += 10
                reasons.append(f"响应处理过快: {avg_response:.3f}秒")
        
        # 6. 敏感路径访问
        sensitive_paths = ["/api/users", "/api/system", "/api/auth"]
        sensitive_count = sum(1 for log in logs 
                            if any(sp in log["path"] for sp in sensitive_paths))
        if sensitive_count > 10:
            score += 15
            reasons.append(f"频繁访问敏感接口: {sensitive_count}次")
        
        # 更新分数
        self.behavior_scores[ip] = min(score, self.max_score)
        
        return score, reasons
    
    def should_block(self, ip: str) -> bool:
        """判断是否应该封禁"""
        return self.behavior_scores.get(ip, 0) >= self.block_threshold


class UserAgentAnalyzer:
    """
    User-Agent 分析器
    检测爬虫和自动化工具
    """
    # 已知爬虫UA特征
    CRAWLER_PATTERNS = [
        r"bot", r"spider", r"crawler", r"scraper",
        r"python-requests", r"python-urllib", r"python/",
        r"curl", r"wget", r"httpie",
        r"postman", r"insomnia",
        r"phantomjs", r"headless",
        r"selenium", r"puppeteer", r"playwright",
        r"scrapy", r"beautifulsoup",
        r"java/", r"apache-httpclient",
        r"go-http-client", r"okhttp",
        r"libwww", r"lwp-", r"mechanize",
    ]
    
    # 合法浏览器特征
    BROWSER_PATTERNS = [
        r"Mozilla/5\.0.*Chrome/\d+",
        r"Mozilla/5\.0.*Firefox/\d+",
        r"Mozilla/5\.0.*Safari/\d+",
        r"Mozilla/5\.0.*Edge/\d+",
    ]
    
    def __init__(self):
        self.crawler_regex = [re.compile(p, re.IGNORECASE) for p in self.CRAWLER_PATTERNS]
        self.browser_regex = [re.compile(p, re.IGNORECASE) for p in self.BROWSER_PATTERNS]
    
    def analyze(self, user_agent: str) -> tuple[bool, str]:
        """
        分析User-Agent
        返回: (是否可疑, 原因)
        """
        if not user_agent:
            # 缺少UA但不直接判定为爬虫，只是可疑
            return False, ""
        
        # 检查是否是已知爬虫工具
        for pattern in self.crawler_regex:
            if pattern.search(user_agent):
                return True, f"检测到爬虫特征: {pattern.pattern}"
        
        # 不再强制要求是标准浏览器，因为移动端App等也是合法客户端
        # 只有明确的爬虫特征才判定为可疑
        
        # 检查UA长度（过短可疑，但不是决定性因素）
        if len(user_agent) < 10:
            return True, "User-Agent过短"
        if len(user_agent) > 500:
            return True, "User-Agent过长"
        
        return False, ""


class HoneypotTrap:
    """
    蜜罐陷阱
    设置隐藏链接捕获爬虫
    """
    def __init__(self):
        # 蜜罐路径
        self.honeypot_paths = [
            "/api/admin/secret",
            "/api/internal/data",
            "/api/private/users",
            "/api/hidden/config",
            "/.env",
            "/config.json",
            "/admin.php",
            "/wp-admin",
            "/phpinfo.php",
        ]
        # 触发蜜罐的IP
        self.trapped_ips: dict[str, list] = defaultdict(list)
    
    def is_honeypot(self, path: str) -> bool:
        """检查是否是蜜罐路径"""
        return any(hp in path.lower() for hp in self.honeypot_paths)
    
    def record_trap(self, ip: str, path: str):
        """记录触发蜜罐"""
        self.trapped_ips[ip].append({
            "timestamp": time.time(),
            "path": path
        })
        logger.warning(f"蜜罐触发: IP={ip}, 路径={path}")
    
    def is_trapped(self, ip: str) -> bool:
        """检查IP是否触发过蜜罐"""
        return len(self.trapped_ips.get(ip, [])) > 0
    
    def get_trap_count(self, ip: str) -> int:
        """获取触发次数"""
        return len(self.trapped_ips.get(ip, []))


class RequestSignatureValidator:
    """
    请求签名验证
    防止请求伪造和重放攻击
    """
    def __init__(self):
        # 签名密钥（生产环境应从配置读取）
        self.secret_key = secrets.token_hex(32)
        # 已使用的nonce（防止重放）
        self.used_nonces: dict[str, float] = {}
        # nonce有效期（秒）
        self.nonce_ttl = 300  # 5分钟
        # 时间戳容差（秒）
        self.timestamp_tolerance = 60  # 1分钟
    
    def generate_signature(self, method: str, path: str, timestamp: int, nonce: str) -> str:
        """生成请求签名"""
        message = f"{method}|{path}|{timestamp}|{nonce}"
        return hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
    
    def validate_signature(self, request: Request) -> tuple[bool, str]:
        """
        验证请求签名
        返回: (是否有效, 错误原因)
        """
        # 获取签名相关头
        signature = request.headers.get("X-Signature")
        timestamp_str = request.headers.get("X-Timestamp")
        nonce = request.headers.get("X-Nonce")
        
        # 检查必要参数
        if not all([signature, timestamp_str, nonce]):
            return False, "缺少签名参数"
        
        try:
            timestamp = int(timestamp_str)
        except ValueError:
            return False, "时间戳格式错误"
        
        # 检查时间戳
        now = int(time.time())
        if abs(now - timestamp) > self.timestamp_tolerance:
            return False, "请求已过期"
        
        # 检查nonce是否已使用（防止重放）
        self._clean_old_nonces()
        if nonce in self.used_nonces:
            return False, "重复请求"
        
        # 验证签名
        expected_signature = self.generate_signature(
            request.method,
            request.url.path,
            timestamp,
            nonce
        )
        
        if not hmac.compare_digest(signature, expected_signature):
            return False, "签名无效"
        
        # 记录nonce
        self.used_nonces[nonce] = time.time()
        
        return True, ""
    
    def _clean_old_nonces(self):
        """清理过期的nonce"""
        now = time.time()
        self.used_nonces = {
            k: v for k, v in self.used_nonces.items()
            if now - v < self.nonce_ttl
        }


class DynamicTokenManager:
    """
    动态令牌管理
    为每个会话生成动态验证令牌
    """
    def __init__(self):
        # 活跃令牌: {token: {created_at, ip, fingerprint, uses}}
        self.tokens: dict[str, dict] = {}
        # 令牌有效期（秒）
        self.token_ttl = 3600  # 1小时
        # 单个令牌最大使用次数
        self.max_uses = 1000
    
    def generate_token(self, ip: str, fingerprint: str) -> str:
        """生成动态令牌"""
        token = secrets.token_urlsafe(32)
        self.tokens[token] = {
            "created_at": time.time(),
            "ip": ip,
            "fingerprint": fingerprint,
            "uses": 0
        }
        return token
    
    def validate_token(self, token: str, ip: str, fingerprint: str) -> tuple[bool, str]:
        """
        验证动态令牌
        返回: (是否有效, 错误原因)
        """
        if not token:
            return False, "缺少动态令牌"
        
        if token not in self.tokens:
            return False, "无效令牌"
        
        token_data = self.tokens[token]
        now = time.time()
        
        # 检查是否过期
        if now - token_data["created_at"] > self.token_ttl:
            del self.tokens[token]
            return False, "令牌已过期"
        
        # 检查使用次数
        if token_data["uses"] >= self.max_uses:
            del self.tokens[token]
            return False, "令牌使用次数超限"
        
        # 检查IP和指纹是否匹配
        if token_data["ip"] != ip:
            return False, "IP不匹配"
        
        if token_data["fingerprint"] != fingerprint:
            return False, "设备指纹不匹配"
        
        # 更新使用次数
        token_data["uses"] += 1
        
        return True, ""
    
    def revoke_token(self, token: str):
        """撤销令牌"""
        if token in self.tokens:
            del self.tokens[token]
    
    def cleanup(self):
        """清理过期令牌"""
        now = time.time()
        self.tokens = {
            k: v for k, v in self.tokens.items()
            if now - v["created_at"] < self.token_ttl
        }


class CrawlerScoreCard:
    """
    爬虫评分卡
    综合多个维度评估是否为爬虫
    """
    def __init__(self):
        # 评分权重 - 调整为更合理的值，避免误伤正常用户
        self.weights = {
            "ua_suspicious": 30,      # UA可疑（爬虫UA特征明显）
            "behavior_score": 25,     # 行为分数
            "fingerprint_suspicious": 10,  # 指纹可疑
            "honeypot_triggered": 50,  # 触发蜜罐（最重要的指标）
            "no_cookies": 0,          # 无Cookie（API请求正常没有Cookie，不扣分）
            "no_referer": 0,          # 无Referer（API请求正常没有Referer，不扣分）
            "abnormal_headers": 10,   # 异常请求头
        }
        # 封禁阈值 - 提高到80，减少误伤
        self.block_threshold = 80
    
    def calculate_score(
        self,
        ua_suspicious: bool,
        behavior_score: float,
        fingerprint_suspicious: bool,
        honeypot_triggered: bool,
        has_cookies: bool,
        has_referer: bool,
        abnormal_headers: bool
    ) -> tuple[int, list[str]]:
        """
        计算爬虫评分
        返回: (总分, 扣分原因)
        """
        score = 0
        reasons = []
        
        if ua_suspicious:
            score += self.weights["ua_suspicious"]
            reasons.append("User-Agent可疑")
        
        # 行为分数按比例计算
        behavior_contribution = int(behavior_score / 100 * self.weights["behavior_score"])
        if behavior_contribution > 0:
            score += behavior_contribution
            reasons.append(f"行为异常(+{behavior_contribution})")
        
        if fingerprint_suspicious:
            score += self.weights["fingerprint_suspicious"]
            reasons.append("设备指纹可疑")
        
        if honeypot_triggered:
            score += self.weights["honeypot_triggered"]
            reasons.append("触发蜜罐陷阱")
        
        if not has_cookies:
            score += self.weights["no_cookies"]
            reasons.append("无Cookie")
        
        if not has_referer:
            score += self.weights["no_referer"]
            reasons.append("无Referer")
        
        if abnormal_headers:
            score += self.weights["abnormal_headers"]
            reasons.append("请求头异常")
        
        return score, reasons
    
    def should_block(self, score: int) -> bool:
        """判断是否应该封禁"""
        return score >= self.block_threshold


# 全局实例
device_fingerprint = DeviceFingerprint()
behavior_analyzer = BehaviorAnalyzer()
ua_analyzer = UserAgentAnalyzer()
honeypot = HoneypotTrap()
signature_validator = RequestSignatureValidator()
token_manager = DynamicTokenManager()
crawler_scorecard = CrawlerScoreCard()


class AntiCrawlerMiddleware(BaseHTTPMiddleware):
    """
    反爬虫中间件
    集成所有反爬虫检测
    """
    
    # 白名单路径
    WHITELIST_PATHS = [
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/api/auth/login",  # 登录接口需要放行
    ]
    
    # 需要签名验证的路径
    SIGNATURE_REQUIRED_PATHS = [
        "/api/medicines",
        "/api/inventory",
        "/api/users",
    ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        path = request.url.path
        method = request.method
        
        # 获取客户端信息
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("User-Agent", "")
        fingerprint = device_fingerprint.generate_fingerprint(request)
        
        # 白名单路径跳过检查
        if any(path.startswith(wp) for wp in self.WHITELIST_PATHS):
            response = await call_next(request)
            return response
        
        # 带有有效Authorization头的请求，降低检测严格度
        # 因为已经通过了JWT认证，是合法用户
        has_auth = bool(request.headers.get("Authorization"))
        if has_auth:
            # 已认证用户只检测蜜罐和明显的爬虫UA，跳过其他检测
            if honeypot.is_honeypot(path):
                honeypot.record_trap(client_ip, path)
                return JSONResponse(status_code=200, content={"data": []})
            
            if honeypot.get_trap_count(client_ip) >= 3:  # 已认证用户容忍度更高
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "访问被拒绝"}
                )
            
            # 只检测明显的爬虫UA
            ua_suspicious, _ = ua_analyzer.analyze(user_agent)
            if ua_suspicious:
                logger.warning(f"已认证用户使用可疑UA: IP={client_ip}, UA={user_agent}")
            
            # 已认证用户直接放行
            response = await call_next(request)
            return response
        
        # 1. 蜜罐检测
        if honeypot.is_honeypot(path):
            honeypot.record_trap(client_ip, path)
            logger.warning(f"蜜罐触发: IP={client_ip}, 路径={path}")
            # 返回假数据迷惑爬虫
            return JSONResponse(
                status_code=200,
                content={"data": [], "message": "success"}
            )
        
        # 检查是否已触发蜜罐
        if honeypot.get_trap_count(client_ip) >= 2:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "访问被拒绝"}
            )
        
        # 2. 设备指纹检查
        if device_fingerprint.is_blacklisted(fingerprint):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "访问被拒绝"}
            )
        device_fingerprint.record_request(fingerprint, client_ip)
        
        # 3. User-Agent分析
        ua_suspicious, ua_reason = ua_analyzer.analyze(user_agent)
        
        # 4. 请求头异常检测
        abnormal_headers = self._check_abnormal_headers(request)
        
        # 5. 计算爬虫评分
        behavior_score, _ = behavior_analyzer.analyze(client_ip)
        fp_data = device_fingerprint.fingerprints.get(fingerprint, {})
        
        crawler_score, reasons = crawler_scorecard.calculate_score(
            ua_suspicious=ua_suspicious,
            behavior_score=behavior_score,
            fingerprint_suspicious=fp_data.get("is_suspicious", False),
            honeypot_triggered=honeypot.is_trapped(client_ip),
            has_cookies=bool(request.cookies),
            has_referer=bool(request.headers.get("Referer")),
            abnormal_headers=abnormal_headers
        )
        
        # 6. 判断是否封禁
        if crawler_scorecard.should_block(crawler_score):
            logger.warning(
                f"检测到爬虫: IP={client_ip}, 分数={crawler_score}, "
                f"原因={reasons}"
            )
            # 将指纹加入黑名单
            device_fingerprint.blacklist(fingerprint)
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "访问被拒绝"}
            )
        
        # 7. 执行请求
        response = await call_next(request)
        
        # 8. 记录访问行为
        response_time = time.time() - start_time
        behavior_analyzer.record_access(
            client_ip, path, method, response_time, response.status_code
        )
        
        # 9. 添加反爬虫响应头
        response.headers["X-Crawler-Score"] = str(crawler_score)
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """获取真实客户端IP"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        if request.client:
            return request.client.host
        return "unknown"
    
    def _check_abnormal_headers(self, request: Request) -> bool:
        """检查异常请求头 - 只检测明显的异常，避免误伤正常API请求"""
        headers = request.headers
        
        # API请求通常只需要Authorization和Content-Type，不强制要求浏览器头
        # 只有完全没有任何标准头才认为异常
        has_any_standard_header = any([
            headers.get("Accept"),
            headers.get("Content-Type"),
            headers.get("Authorization"),
            headers.get("User-Agent"),
        ])
        
        if not has_any_standard_header:
            return True
        
        # 检查Connection头是否有明显异常值
        connection = headers.get("Connection", "")
        if connection and connection.lower() not in ["keep-alive", "close", ""]:
            return True
        
        return False

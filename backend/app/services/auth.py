"""认证服务"""
import random
import string
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.exceptions import AuthenticationError
from app.core.security_middleware import login_tracker, audit_logger
from app.schemas.auth import LoginResponse, UserResponse, SmsCodeResponse


# 验证码存储（生产环境应使用Redis）
_sms_codes: dict[str, dict] = {}


class AuthService:
    """认证服务类"""
    
    def __init__(self, db: AsyncSession, client_ip: str = "unknown"):
        self.db = db
        self.client_ip = client_ip
    
    async def authenticate(self, username: str, password: str) -> LoginResponse:
        """用户认证（带安全防护）"""
        # 1. 检查账户是否被锁定
        is_locked, remaining_seconds = login_tracker.is_locked(username)
        if is_locked:
            audit_logger.log_login(username, self.client_ip, False)
            raise AuthenticationError(
                f"账户已被锁定，请 {remaining_seconds // 60 + 1} 分钟后重试"
            )
        
        # 2. 查询用户
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # 记录失败尝试（即使用户不存在也记录，防止用户名枚举）
            login_tracker.record_failed_attempt(username, self.client_ip)
            audit_logger.log_login(username, self.client_ip, False)
            raise AuthenticationError("用户名或密码错误")
        
        if not user.is_active:
            audit_logger.log_login(username, self.client_ip, False)
            raise AuthenticationError("用户已被禁用")
        
        # 3. 验证密码
        if not verify_password(password, user.password_hash):
            login_tracker.record_failed_attempt(username, self.client_ip)
            audit_logger.log_login(username, self.client_ip, False)
            raise AuthenticationError("用户名或密码错误")
        
        # 4. 登录成功，清除失败记录
        login_tracker.clear_attempts(username)
        audit_logger.log_login(username, self.client_ip, True)
        
        # 5. 更新最后登录时间
        user.last_login = datetime.utcnow()
        await self.db.commit()
        
        # 6. 生成 token
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "user_type": user.user_type
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user)
        )
    
    async def get_user_by_id(self, user_id: int) -> User | None:
        """根据 ID 获取用户"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    

    async def create_user(
        self,
        username: str,
        password: str,
        realname: str | None = None,
        user_type: str = "operator",
        department: str | None = None,
        phone: str | None = None,
        email: str | None = None
    ) -> User:
        """创建用户"""
        user = User(
            username=username,
            password_hash=get_password_hash(password),
            realname=realname,
            user_type=user_type,
            department=department,
            phone=phone,
            email=email
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_user_by_phone(self, phone: str) -> User | None:
        """根据手机号获取用户"""
        result = await self.db.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalar_one_or_none()

    async def send_sms_code(self, phone: str) -> SmsCodeResponse:
        """发送短信验证码
        
        1. 检查手机号是否在数据库中存在
        2. 生成验证码并存储
        3. 调用短信API发送（如果已配置）
        """
        # 检查手机号是否存在
        user = await self.get_user_by_phone(phone)
        if not user:
            raise AuthenticationError("该手机号未注册，请联系管理员")
        
        if not user.is_active:
            raise AuthenticationError("用户已被禁用")
        
        # 检查发送频率（60秒内不能重复发送）
        if phone in _sms_codes:
            last_send = _sms_codes[phone].get("send_time")
            if last_send and (datetime.now() - last_send).seconds < 60:
                remaining = 60 - (datetime.now() - last_send).seconds
                raise AuthenticationError(f"请{remaining}秒后再试")
        
        # 生成6位验证码
        code = ''.join(random.choices(string.digits, k=6))
        
        # 存储验证码（5分钟有效）
        _sms_codes[phone] = {
            "code": code,
            "send_time": datetime.now(),
            "expire_time": datetime.now() + timedelta(minutes=5),
            "attempts": 0
        }
        
        # 尝试发送短信（如果配置了短信服务）
        sms_sent = False
        try:
            from app.services.sms import get_sms_service_from_db
            sms_service = await get_sms_service_from_db(self.db)
            
            if sms_service.access_key_id and sms_service.access_key_secret:
                # 发送验证码短信
                result = await sms_service.send_sms(
                    phone,
                    {"code": code},
                    sms_service.template_code  # 使用配置的模板
                )
                sms_sent = result.get("success", False)
        except Exception as e:
            print(f"发送短信失败: {e}")
        
        # 开发模式：返回验证码（生产环境应该去掉）
        return SmsCodeResponse(
            success=True,
            message="验证码已发送" if sms_sent else "验证码已生成（短信服务未配置，请查看控制台）",
            code=code if not sms_sent else None  # 短信未发送时返回验证码供测试
        )

    async def authenticate_by_sms(self, phone: str, code: str) -> LoginResponse:
        """短信验证码登录"""
        # 检查验证码
        if phone not in _sms_codes:
            raise AuthenticationError("请先获取验证码")
        
        code_info = _sms_codes[phone]
        
        # 检查是否过期
        if datetime.now() > code_info["expire_time"]:
            del _sms_codes[phone]
            raise AuthenticationError("验证码已过期，请重新获取")
        
        # 检查尝试次数（最多5次）
        if code_info["attempts"] >= 5:
            del _sms_codes[phone]
            raise AuthenticationError("验证码错误次数过多，请重新获取")
        
        # 验证码校验
        if code_info["code"] != code:
            code_info["attempts"] += 1
            remaining = 5 - code_info["attempts"]
            raise AuthenticationError(f"验证码错误，还剩{remaining}次机会")
        
        # 验证成功，删除验证码
        del _sms_codes[phone]
        
        # 获取用户
        user = await self.get_user_by_phone(phone)
        if not user:
            raise AuthenticationError("用户不存在")
        
        if not user.is_active:
            raise AuthenticationError("用户已被禁用")
        
        # 记录登录
        audit_logger.log_login(user.username, self.client_ip, True)
        
        # 更新最后登录时间
        user.last_login = datetime.utcnow()
        await self.db.commit()
        
        # 生成 token
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "user_type": user.user_type
        }
        access_token = create_access_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user)
        )

    async def update_user_mode(self, user_id: int, mode: str) -> UserResponse:
        """更新用户的使用场景"""
        from app.utils.mode_tables import validate_mode
        
        # 验证场景是否有效
        if not validate_mode(mode):
            raise AuthenticationError(f"无效的使用场景: {mode}")
        
        # 获取用户
        user = await self.get_user_by_id(user_id)
        if not user:
            raise AuthenticationError("用户不存在")
        
        # 更新场景
        user.current_mode = mode
        await self.db.commit()
        await self.db.refresh(user)
        
        return UserResponse.model_validate(user)

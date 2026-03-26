"""安全工具：密码哈希和 JWT"""
from datetime import datetime, timedelta
from typing import Any
import hashlib
import secrets

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

# 使用 bcrypt 进行密码哈希（更安全）
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    # 兼容旧的 SHA256 哈希（用于迁移）
    if hashed_password.startswith("sha256:"):
        salt, hash_value = hashed_password[7:].split(":")
        new_hash = hashlib.sha256((salt + plain_password).encode()).hexdigest()
        return new_hash == hash_value
    
    # 使用 bcrypt 验证
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """生成密码哈希（使用 bcrypt）"""
    return pwd_context.hash(password)


def needs_rehash(hashed_password: str) -> bool:
    """检查密码是否需要重新哈希（从旧算法迁移）"""
    if hashed_password.startswith("sha256:"):
        return True
    return pwd_context.needs_update(hashed_password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """创建 JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 添加额外的安全声明
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),  # 签发时间
        "type": "access"  # token类型
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    """解码 JWT token"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={"require_exp": True}  # 强制要求过期时间
        )
        
        # 验证token类型
        if payload.get("type") != "access":
            return None
        
        return payload
    except JWTError:
        return None


def generate_secure_token(length: int = 32) -> str:
    """生成安全的随机token"""
    return secrets.token_urlsafe(length)

"""
uniPush 2.0 推送服务
用于向 App 发送离线推送通知
"""
import httpx
import hashlib
import time
from typing import Optional, List
from ..core.config import settings


class UniPushService:
    """uniPush 2.0 推送服务"""
    
    # uniPush 服务端 API 地址
    BASE_URL = "https://restapi.getui.com/v2"
    
    def __init__(self):
        # 从配置读取（需要在 .env 中配置）
        self.app_id = getattr(settings, 'UNIPUSH_APP_ID', '')
        self.app_key = getattr(settings, 'UNIPUSH_APP_KEY', '')
        self.app_secret = getattr(settings, 'UNIPUSH_APP_SECRET', '')
        self.master_secret = getattr(settings, 'UNIPUSH_MASTER_SECRET', '')
        self._token: Optional[str] = None
        self._token_expire: int = 0
    
    async def _get_auth_token(self) -> str:
        """获取鉴权 token"""
        # 检查 token 是否有效
        if self._token and time.time() < self._token_expire - 60:
            return self._token
        
        timestamp = str(int(time.time() * 1000))
        sign = hashlib.sha256(
            f"{self.app_key}{timestamp}{self.master_secret}".encode()
        ).hexdigest()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/{self.app_id}/auth",
                json={
                    "sign": sign,
                    "timestamp": timestamp,
                    "appkey": self.app_key
                }
            )
            result = response.json()
            
            if result.get("code") == 0:
                self._token = result["data"]["token"]
                # token 有效期 24 小时
                self._token_expire = int(time.time()) + 86400
                return self._token
            else:
                raise Exception(f"获取 uniPush token 失败: {result}")
    
    async def push_to_single(
        self,
        cid: str,
        title: str,
        content: str,
        payload: Optional[dict] = None
    ) -> dict:
        """
        推送给单个用户
        
        Args:
            cid: 客户端推送 ID（从 App 端获取）
            title: 通知标题
            content: 通知内容
            payload: 自定义数据
        """
        token = await self._get_auth_token()
        
        message = {
            "request_id": f"req_{int(time.time() * 1000)}",
            "audience": {
                "cid": [cid]
            },
            "push_message": {
                "notification": {
                    "title": title,
                    "body": content,
                    "click_type": "startapp"
                }
            }
        }
        
        if payload:
            message["push_message"]["notification"]["payload"] = str(payload)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/{self.app_id}/push/single/cid",
                headers={"token": token},
                json=message
            )
            return response.json()
    
    async def push_to_all(
        self,
        title: str,
        content: str,
        payload: Optional[dict] = None
    ) -> dict:
        """
        推送给所有用户
        
        Args:
            title: 通知标题
            content: 通知内容
            payload: 自定义数据
        """
        token = await self._get_auth_token()
        
        message = {
            "request_id": f"req_{int(time.time() * 1000)}",
            "audience": "all",
            "push_message": {
                "notification": {
                    "title": title,
                    "body": content,
                    "click_type": "startapp"
                }
            }
        }
        
        if payload:
            message["push_message"]["notification"]["payload"] = str(payload)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/{self.app_id}/push/all",
                headers={"token": token},
                json=message
            )
            return response.json()
    
    async def push_to_list(
        self,
        cid_list: List[str],
        title: str,
        content: str,
        payload: Optional[dict] = None
    ) -> dict:
        """
        推送给多个用户
        
        Args:
            cid_list: 客户端推送 ID 列表
            title: 通知标题
            content: 通知内容
            payload: 自定义数据
        """
        token = await self._get_auth_token()
        
        message = {
            "request_id": f"req_{int(time.time() * 1000)}",
            "audience": {
                "cid": cid_list
            },
            "push_message": {
                "notification": {
                    "title": title,
                    "body": content,
                    "click_type": "startapp"
                }
            }
        }
        
        if payload:
            message["push_message"]["notification"]["payload"] = str(payload)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/{self.app_id}/push/list/cid",
                headers={"token": token},
                json=message
            )
            return response.json()


# 单例
unipush_service = UniPushService()

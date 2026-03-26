"""
阿里云短信服务
用于发送临期药品预警短信通知
"""
import json
import hmac
import hashlib
import base64
import urllib.parse
import uuid
from datetime import datetime
from typing import Optional
import httpx


class AliyunSmsService:
    """阿里云短信服务"""
    
    # 阿里云短信API地址
    API_URL = "https://dysmsapi.aliyuncs.com"
    
    def __init__(
        self,
        access_key_id: str = "",
        access_key_secret: str = "",
        sign_name: str = "",
        template_code: str = "",
        expired_template_code: str = "",
        low_stock_template_code: str = ""
    ):
        self.access_key_id = access_key_id
        self.access_key_secret = access_key_secret
        self.sign_name = sign_name
        self.template_code = template_code
        self.expired_template_code = expired_template_code
        self.low_stock_template_code = low_stock_template_code
    
    def _percent_encode(self, s: str) -> str:
        """URL编码"""
        return urllib.parse.quote(str(s), safe='~')
    
    def _sign(self, params: dict) -> str:
        """生成签名"""
        # 按参数名排序
        sorted_params = sorted(params.items())
        
        # 构造待签名字符串
        query_string = '&'.join([
            f"{self._percent_encode(k)}={self._percent_encode(v)}"
            for k, v in sorted_params
        ])
        
        string_to_sign = f"GET&%2F&{self._percent_encode(query_string)}"
        
        # HMAC-SHA1签名
        key = f"{self.access_key_secret}&"
        signature = hmac.new(
            key.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha1
        ).digest()
        
        return base64.b64encode(signature).decode('utf-8')
    
    async def send_sms(
        self,
        phone_number: str,
        template_param: dict,
        template_code: Optional[str] = None
    ) -> dict:
        """
        发送短信
        
        Args:
            phone_number: 手机号码
            template_param: 模板参数，如 {"name": "阿莫西林", "days": "7"}
            template_code: 短信模板ID，不传则使用默认模板
        
        Returns:
            发送结果
        """
        if not self.access_key_id or not self.access_key_secret:
            return {
                "success": False,
                "message": "短信服务未配置，请先配置阿里云短信API密钥",
                "code": "CONFIG_ERROR"
            }
        
        if not phone_number:
            return {
                "success": False,
                "message": "手机号码不能为空",
                "code": "INVALID_PHONE"
            }
        
        # 构造请求参数
        params = {
            "AccessKeyId": self.access_key_id,
            "Action": "SendSms",
            "Format": "JSON",
            "PhoneNumbers": phone_number,
            "RegionId": "cn-hangzhou",
            "SignName": self.sign_name or "药品管理系统",
            "SignatureMethod": "HMAC-SHA1",
            "SignatureNonce": str(uuid.uuid4()),
            "SignatureVersion": "1.0",
            "TemplateCode": template_code or self.template_code or "SMS_123456789",
            "TemplateParam": json.dumps(template_param, ensure_ascii=False),
            "Timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "Version": "2017-05-25",
        }
        
        # 生成签名
        params["Signature"] = self._sign(params)
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.API_URL, params=params)
                result = response.json()
                
                if result.get("Code") == "OK":
                    return {
                        "success": True,
                        "message": "短信发送成功",
                        "code": "OK",
                        "biz_id": result.get("BizId"),
                        "request_id": result.get("RequestId")
                    }
                else:
                    return {
                        "success": False,
                        "message": result.get("Message", "短信发送失败"),
                        "code": result.get("Code", "UNKNOWN_ERROR"),
                        "request_id": result.get("RequestId")
                    }
        except Exception as e:
            return {
                "success": False,
                "message": f"短信发送异常: {str(e)}",
                "code": "EXCEPTION"
            }
    
    async def send_expiry_warning(
        self,
        phone_number: str,
        medicine_name: str,
        days_left: int,
        batch_number: str = ""
    ) -> dict:
        """
        发送临期预警短信
        
        Args:
            phone_number: 手机号码
            medicine_name: 药品名称
            days_left: 剩余天数
            batch_number: 批次号
        """
        # 截断药品名称，避免超长
        if len(medicine_name) > 10:
            medicine_name = medicine_name[:10] + "..."
        
        template_param = {
            "name": medicine_name,
            "days": str(abs(days_left)),
            "batch": batch_number[:10] if batch_number else "未知"
        }
        
        return await self.send_sms(phone_number, template_param)
    
    async def send_expired_warning(
        self,
        phone_number: str,
        medicine_name: str,
        expired_days: int
    ) -> dict:
        """
        发送已过期预警短信
        """
        if len(medicine_name) > 10:
            medicine_name = medicine_name[:10] + "..."
        
        template_param = {
            "name": medicine_name,
            "days": str(abs(expired_days)),
            "status": "已过期"
        }
        
        # 使用过期模板（如果有单独配置的话）
        return await self.send_sms(
            phone_number, 
            template_param,
            self.expired_template_code or self.template_code
        )
    
    async def send_low_stock_warning(
        self,
        phone_number: str,
        medicine_name: str,
        current_stock: int
    ) -> dict:
        """
        发送低库存预警短信
        """
        if len(medicine_name) > 10:
            medicine_name = medicine_name[:10] + "..."
        
        template_param = {
            "name": medicine_name,
            "stock": str(current_stock)
        }
        
        # 使用低库存模板（如果有单独配置的话）
        return await self.send_sms(
            phone_number,
            template_param,
            self.low_stock_template_code or self.template_code
        )


async def get_sms_service_from_db(db) -> AliyunSmsService:
    """从数据库获取配置并创建短信服务实例"""
    from sqlalchemy import select
    from app.models.sms import SmsApiConfig
    
    result = await db.execute(select(SmsApiConfig))
    configs = {c.config_key: c.config_value for c in result.scalars().all()}
    
    return AliyunSmsService(
        access_key_id=configs.get("access_key_id", ""),
        access_key_secret=configs.get("access_key_secret", ""),
        sign_name=configs.get("sign_name", ""),
        template_code=configs.get("template_code", ""),
        expired_template_code=configs.get("expired_template_code", ""),
        low_stock_template_code=configs.get("low_stock_template_code", "")
    )

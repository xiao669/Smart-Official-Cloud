"""阿里健康开放平台API服务"""
import time
import hashlib
import hmac
import json
import requests
from typing import Dict, Any, Optional
from datetime import datetime


class AliHealthAPI:
    """阿里健康开放平台API客户端"""
    
    def __init__(self, app_key: str, app_secret: str):
        """
        初始化阿里健康API客户端
        
        Args:
            app_key: 应用Key
            app_secret: 应用密钥
        """
        self.app_key = app_key
        self.app_secret = app_secret
        self.gateway_url = "https://eco.taobao.com/router/rest"
        self.format = "json"
        self.version = "2.0"
        self.sign_method = "hmac"
    
    def _generate_sign(self, params: Dict[str, Any]) -> str:
        """
        生成API签名
        
        Args:
            params: 请求参数
            
        Returns:
            签名字符串
        """
        # 1. 参数排序
        sorted_params = sorted(params.items())
        
        # 2. 拼接参数
        param_str = ""
        for key, value in sorted_params:
            if value is not None:
                param_str += f"{key}{value}"
        
        # 3. 计算签名
        sign = hmac.new(
            self.app_secret.encode('utf-8'),
            param_str.encode('utf-8'),
            hashlib.md5
        ).hexdigest().upper()
        
        return sign
    
    def _build_common_params(self, method: str) -> Dict[str, Any]:
        """
        构建公共参数
        
        Args:
            method: API方法名
            
        Returns:
            公共参数字典
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return {
            "app_key": self.app_key,
            "method": method,
            "format": self.format,
            "v": self.version,
            "sign_method": self.sign_method,
            "timestamp": timestamp
        }
    
    def call_api(self, method: str, biz_params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        调用阿里健康API
        
        Args:
            method: API方法名
            biz_params: 业务参数
            
        Returns:
            API响应数据
        """
        try:
            # 1. 构建公共参数
            params = self._build_common_params(method)
            
            # 2. 添加业务参数
            params.update(biz_params)
            
            # 3. 生成签名
            params["sign"] = self._generate_sign(params)
            
            # 4. 发送请求
            response = requests.post(
                self.gateway_url,
                data=params,
                timeout=30
            )
            
            # 5. 解析响应
            if response.status_code == 200:
                result = response.json()
                return result
            else:
                print(f"API调用失败: HTTP {response.status_code}")
                return None
                
        except Exception as e:
            print(f"API调用异常: {e}")
            return None
    
    def query_bill_detail(self, bill_code: str, ref_ent_id: str, show_code: bool = True) -> Optional[Dict[str, Any]]:
        """
        查询单据详情（根据追溯码查询药品信息）
        
        API: alibaba.alihealth.drugtrace.top.bill.query.billdetail
        
        Args:
            bill_code: 单据号（追溯码）
            ref_ent_id: 本企业ID
            show_code: 是否显示追溯码
            
        Returns:
            单据详情
        """
        method = "alibaba.alihealth.drugtrace.top.bill.query.billdetail"
        
        biz_params = {
            "bill_code": bill_code,
            "ref_ent_id": ref_ent_id,
            "show_code": str(show_code).lower()
        }
        
        result = self.call_api(method, biz_params)
        
        if result and "result" in result:
            return result["result"]
        
        return None
    
    def query_drug_info(self, trace_code: str) -> Optional[Dict[str, Any]]:
        """
        通过追溯码查询药品信息（简化接口）
        
        Args:
            trace_code: 追溯码
            
        Returns:
            药品信息
        """
        # 注意：ref_ent_id需要从配置中获取
        # 这是你的企业在阿里健康平台的ID
        ref_ent_id = "your_enterprise_id"  # 需要配置
        
        result = self.query_bill_detail(trace_code, ref_ent_id, True)
        
        if result:
            return self._format_drug_info(result)
        
        return None
    
    def _format_drug_info(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        格式化药品信息
        
        Args:
            raw_data: 原始API响应数据
            
        Returns:
            格式化后的药品信息
        """
        try:
            # 根据实际API响应结构调整
            return {
                "trace_code": raw_data.get("billCode"),
                "name": raw_data.get("drugName"),
                "specification": raw_data.get("spec"),
                "manufacturer": raw_data.get("manufacturer"),
                "approval_number": raw_data.get("approvalNumber"),
                "batch_number": raw_data.get("batchNumber"),
                "production_date": raw_data.get("productionDate"),
                "expiry_date": raw_data.get("expiryDate"),
                "source": "alihealth_api"
            }
        except Exception as e:
            print(f"格式化数据失败: {e}")
            return {}


# 使用示例
if __name__ == "__main__":
    # 配置你的App Key和App Secret
    app_key = "your_app_key"
    app_secret = "your_app_secret"
    
    # 创建API客户端
    client = AliHealthAPI(app_key, app_secret)
    
    # 查询追溯码信息
    trace_code = "12345678901234567890"
    result = client.query_drug_info(trace_code)
    
    if result:
        print("查询成功:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("查询失败")

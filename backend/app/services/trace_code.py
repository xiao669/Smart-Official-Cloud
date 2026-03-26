"""药品追溯码查询服务"""
import os
import requests
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class TraceCodeService:
    """药品追溯码查询服务类"""
    
    def __init__(self):
        # 阿里健康API配置
        self.ali_health_app_key = os.getenv("ALI_HEALTH_APP_KEY")
        self.ali_health_app_secret = os.getenv("ALI_HEALTH_APP_SECRET")
        self.ali_health_ent_id = os.getenv("ALI_HEALTH_ENT_ID")
        
        # 国家药监局追溯平台
        self.nmpa_url = "http://app1.nmpa.gov.cn/data_nmpa/face3/base.jsp"
        
    def query_by_trace_code(self, trace_code: str) -> Optional[Dict[str, Any]]:
        """
        通过追溯码查询药品信息
        
        Args:
            trace_code: 20位追溯码
            
        Returns:
            药品信息字典，查询失败返回None
        """
        try:
            # 方法1: 尝试解析追溯码格式
            parsed_info = self._parse_trace_code(trace_code)
            if parsed_info:
                return parsed_info
            
            # 方法2: 调用阿里健康API（需要配置）
            # ali_info = self._query_ali_health(trace_code)
            # if ali_info:
            #     return ali_info
            
            # 方法3: 调用国家药监局API（需要配置）
            # nmpa_info = self._query_nmpa(trace_code)
            # if nmpa_info:
            #     return nmpa_info
            
            return None
            
        except Exception as e:
            print(f"查询追溯码失败: {e}")
            return None
    
    def _parse_trace_code(self, trace_code: str) -> Optional[Dict[str, Any]]:
        """
        解析追溯码格式
        
        追溯码格式（20位）：
        - 前8位：企业代码
        - 中间8位：产品代码
        - 后4位：序列号
        
        注意：这只是基本解析，无法获取详细药品信息
        """
        if not trace_code or len(trace_code) != 20:
            return None
        
        try:
            return {
                "trace_code": trace_code,
                "enterprise_code": trace_code[:8],
                "product_code": trace_code[8:16],
                "serial_number": trace_code[16:20],
                "source": "local_parse"
            }
        except Exception as e:
            print(f"解析追溯码失败: {e}")
            return None
    
    def _query_ali_health(self, trace_code: str) -> Optional[Dict[str, Any]]:
        """
        调用阿里健康API查询
        
        注意：需要申请阿里健康企业账号和API密钥
        文档：https://open.taobao.com/
        """
        try:
            # 检查是否配置了API密钥
            if not all([self.ali_health_app_key, self.ali_health_app_secret, self.ali_health_ent_id]):
                print("阿里健康API未配置，跳过")
                return None
            
            # 导入阿里健康API客户端
            from app.services.alihealth_api import AliHealthAPI
            
            # 创建API客户端
            client = AliHealthAPI(self.ali_health_app_key, self.ali_health_app_secret)
            
            # 查询单据详情
            result = client.query_bill_detail(
                bill_code=trace_code,
                ref_ent_id=self.ali_health_ent_id,
                show_code=True
            )
            
            if result:
                return self._format_ali_health_response(result)
            
            return None
            
        except Exception as e:
            print(f"调用阿里健康API失败: {e}")
            return None
    
    def _query_nmpa(self, trace_code: str) -> Optional[Dict[str, Any]]:
        """
        调用国家药监局API查询
        
        注意：需要申请国家药监局API权限
        """
        try:
            # TODO: 实现国家药监局API调用
            return None
            
        except Exception as e:
            print(f"调用国家药监局API失败: {e}")
            return None
    
    def _format_ali_health_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """格式化阿里健康API响应"""
        try:
            return {
                "trace_code": response.get("traceCode"),
                "name": response.get("drugName"),
                "specification": response.get("spec"),
                "manufacturer": response.get("manufacturer"),
                "approval_number": response.get("approvalNumber"),
                "batch_number": response.get("batchNumber"),
                "production_date": response.get("productionDate"),
                "expiry_date": response.get("expiryDate"),
                "source": "ali_health"
            }
        except Exception as e:
            print(f"格式化响应失败: {e}")
            return {}
    
    def validate_trace_code(self, trace_code: str) -> bool:
        """
        验证追溯码格式是否正确
        
        Args:
            trace_code: 追溯码
            
        Returns:
            是否有效
        """
        if not trace_code:
            return False
        
        # 去除空格和特殊字符
        trace_code = trace_code.strip().replace("-", "").replace(" ", "")
        
        # 检查长度（通常是20位）
        if len(trace_code) != 20:
            return False
        
        # 检查是否全是数字
        if not trace_code.isdigit():
            return False
        
        return True

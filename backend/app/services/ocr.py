"""
OCR识别服务 - 药品信息识别
"""
import base64
import re
import json
from datetime import datetime
from typing import Dict, Optional
import requests
from app.services.deepseek_ai import DeepSeekAIService


class OCRService:
    """OCR识别服务类"""
    
    def __init__(self):
        # 百度OCR API配置（需要在百度云申请）
        # 访问：https://cloud.baidu.com/product/ocr
        # TODO: 请在下方填入你的百度OCR API密钥
        self.api_key = ""  # 替换为实际的API Key
        self.secret_key = ""  # 替换为实际的Secret Key
        self.access_token = None
        
        # 开发模式标志（当API Key未配置时自动使用模拟数据）
        self.is_dev_mode = (self.api_key == "YOUR_API_KEY")
        
        # DeepSeek AI服务（用于智能解析）
        self.ai_service = DeepSeekAIService()
    
    def get_access_token(self) -> str:
        """获取百度OCR访问令牌"""
        if self.access_token:
            return self.access_token
        
        url = "https://aip.baidubce.com/oauth/2.0/token"
        params = {
            "grant_type": "client_credentials",
            "client_id": self.api_key,
            "client_secret": self.secret_key
        }
        
        try:
            response = requests.post(url, params=params)
            result = response.json()
            self.access_token = result.get("access_token")
            return self.access_token
        except Exception as e:
            print(f"获取access_token失败: {e}")
            return ""
    
    def recognize_medicine(self, image_base64: str) -> Dict:
        """
        识别药品包装信息
        
        Args:
            image_base64: 图片的base64编码
            
        Returns:
            识别结果字典
        """
        # 开发模式：模拟识别结果
        if self.is_dev_mode:
            print("⚠️  使用开发模式（模拟数据）")
            print("💡 要启用真实识别，请在 backend/app/services/ocr.py 中配置百度OCR API密钥")
            return self._mock_recognition()
        
        # 实际调用百度OCR API
        access_token = self.get_access_token()
        if not access_token:
            return {"error": "无法获取访问令牌"}
        
        url = f"https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token={access_token}"
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'image': image_base64
        }
        
        try:
            response = requests.post(url, headers=headers, data=data)
            result = response.json()
            
            if 'words_result' in result:
                # 提取原始文字
                text_lines = [item['words'] for item in result['words_result']]
                raw_text = '\n'.join(text_lines)
                
                # 基础OCR解析
                ocr_result = self._parse_medicine_info(result['words_result'])
                
                # 使用DeepSeek AI增强识别结果
                enhanced_result = self.ai_service.enhance_ocr_result(ocr_result, raw_text)
                
                print(f"📊 OCR基础识别: {ocr_result}")
                print(f"🤖 AI增强结果: {enhanced_result}")
                
                return enhanced_result
            else:
                return {"error": "识别失败"}
        
        except Exception as e:
            print(f"OCR识别失败: {e}")
            return {"error": str(e)}
    
    def _parse_medicine_info(self, words_result: list) -> Dict:
        """
        解析OCR识别的文字，提取药品信息
        
        Args:
            words_result: OCR识别的文字列表
            
        Returns:
            解析后的药品信息
        """
        text_lines = [item['words'] for item in words_result]
        all_text = '\n'.join(text_lines)
        
        medicine_info = {
            'name': None,
            'specification': None,
            'manufacturer': None,
            'approval_number': None,
            'production_date': None,
            'expiry_date': None,
            'batch_number': None
        }
        
        # 提取药品名称（通常在前几行，字号较大）
        if text_lines:
            medicine_info['name'] = text_lines[0]
        
        # 提取规格
        spec_pattern = r'规格[：:]\s*(.+)'
        spec_match = re.search(spec_pattern, all_text)
        if spec_match:
            medicine_info['specification'] = spec_match.group(1).strip()
        
        # 提取生产企业
        manu_patterns = [
            r'生产企业[：:]\s*(.+)',
            r'生产厂家[：:]\s*(.+)',
            r'制造商[：:]\s*(.+)'
        ]
        for pattern in manu_patterns:
            match = re.search(pattern, all_text)
            if match:
                medicine_info['manufacturer'] = match.group(1).strip()
                break
        
        # 提取批准文号
        approval_pattern = r'批准文号[：:]\s*(.+)'
        approval_match = re.search(approval_pattern, all_text)
        if approval_match:
            medicine_info['approval_number'] = approval_match.group(1).strip()
        
        # 提取生产日期
        prod_patterns = [
            r'生产日期[：:]\s*(\d{4}[-./年]\d{1,2}[-./月]\d{1,2}[日]?)',
            r'生产日期[：:]\s*(\d{8})'
        ]
        for pattern in prod_patterns:
            match = re.search(pattern, all_text)
            if match:
                medicine_info['production_date'] = self._parse_date(match.group(1))
                break
        
        # 提取有效期
        expiry_patterns = [
            r'有效期[至到][：:]\s*(\d{4}[-./年]\d{1,2}[-./月]\d{1,2}[日]?)',
            r'有效期[：:]\s*(\d{4}[-./年]\d{1,2}[-./月]\d{1,2}[日]?)',
            r'失效期[：:]\s*(\d{4}[-./年]\d{1,2}[-./月]\d{1,2}[日]?)'
        ]
        for pattern in expiry_patterns:
            match = re.search(pattern, all_text)
            if match:
                medicine_info['expiry_date'] = self._parse_date(match.group(1))
                break
        
        # 提取批号
        batch_patterns = [
            r'批号[：:]\s*([A-Z0-9]+)',
            r'批次[：:]\s*([A-Z0-9]+)'
        ]
        for pattern in batch_patterns:
            match = re.search(pattern, all_text)
            if match:
                medicine_info['batch_number'] = match.group(1).strip()
                break
        
        return medicine_info
    
    def _parse_date(self, date_str: str) -> Optional[str]:
        """
        解析日期字符串，转换为标准格式
        
        Args:
            date_str: 日期字符串
            
        Returns:
            标准格式日期 YYYY-MM-DD
        """
        # 移除中文字符
        date_str = date_str.replace('年', '-').replace('月', '-').replace('日', '')
        date_str = date_str.replace('.', '-').replace('/', '-')
        
        try:
            # 尝试解析8位数字格式 YYYYMMDD
            if len(date_str) == 8 and date_str.isdigit():
                return f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
            
            # 尝试解析标准格式
            parts = date_str.split('-')
            if len(parts) == 3:
                year, month, day = parts
                return f"{year.zfill(4)}-{month.zfill(2)}-{day.zfill(2)}"
        
        except Exception as e:
            print(f"日期解析失败: {e}")
        
        return None
    
    def merge_recognition_results(self, results: list) -> Dict:
        """
        合并多张图片的识别结果
        
        Args:
            results: 多个识别结果列表
            
        Returns:
            合并后的识别结果
        """
        if not results:
            return {}
        
        if len(results) == 1:
            return results[0].dict() if hasattr(results[0], 'dict') else results[0]
        
        # 使用DeepSeek AI智能合并结果
        try:
            # 构建提示词
            results_text = "\n\n".join([
                f"图片{idx + 1}识别结果：\n{self._format_result(r)}"
                for idx, r in enumerate(results)
            ])
            
            prompt = f"""
以下是对同一个药品包装拍摄的多张照片的OCR识别结果。请智能合并这些结果，选择最准确、最完整的信息。

{results_text}

合并规则：
1. 如果某个字段在多个结果中都有值，选择最完整、最合理的那个
2. 如果某个字段只在一个结果中有值，直接使用
3. 药品名称应该是最核心的信息，优先选择最清晰的
4. 日期格式统一为YYYY-MM-DD
5. 如果某个字段在所有结果中都没有，返回null

请以JSON格式返回合并后的结果：
{{
  "name": "药品名称",
  "specification": "规格",
  "manufacturer": "生产企业",
  "approval_number": "批准文号",
  "production_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD",
  "batch_number": "批号"
}}
"""
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.ai_service.api_key}'
            }
            
            data = {
                'model': self.ai_service.model,
                'messages': [
                    {
                        'role': 'system',
                        'content': '你是一个专业的药品信息合并助手。你的任务是从多个OCR识别结果中智能合并出最准确的药品信息。'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.1,
                'max_tokens': 500
            }
            
            response = requests.post(
                self.ai_service.api_url,
                headers=headers,
                json=data,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                merged = json.loads(content)
                print(f"✅ AI合并成功: {merged}")
                return merged
            else:
                print(f"❌ AI合并失败，使用简单合并")
                return self._simple_merge(results)
        
        except Exception as e:
            print(f"❌ AI合并失败: {e}，使用简单合并")
            return self._simple_merge(results)
    
    def _simple_merge(self, results: list) -> Dict:
        """
        简单合并策略：选择非空值最多的结果
        """
        merged = {}
        fields = ['name', 'specification', 'manufacturer', 'approval_number', 
                  'production_date', 'expiry_date', 'batch_number']
        
        for field in fields:
            # 收集所有非空值
            values = []
            for r in results:
                r_dict = r.dict() if hasattr(r, 'dict') else r
                value = r_dict.get(field)
                if value and value != 'null':
                    values.append(value)
            
            # 选择出现最多的值
            if values:
                merged[field] = max(set(values), key=values.count)
            else:
                merged[field] = None
        
        return merged
    
    def _format_result(self, result) -> str:
        """格式化识别结果为文本"""
        r_dict = result.dict() if hasattr(result, 'dict') else result
        lines = []
        for key, value in r_dict.items():
            if value and value != 'null' and key != 'error':
                lines.append(f"  {key}: {value}")
        return '\n'.join(lines) if lines else "  (无有效信息)"
    
    def _mock_recognition(self) -> Dict:
        """
        模拟识别结果（开发测试用）
        """
        return {
            'name': '阿莫西林胶囊',
            'specification': '0.25g×24粒',
            'manufacturer': '某某制药有限公司',
            'approval_number': '国药准字H12345678',
            'production_date': '2024-01-15',
            'expiry_date': '2026-01-14',
            'batch_number': 'PH202401001'
        }

    def scan_barcode(self, image_base64: str) -> Dict:
        """
        扫描条形码/二维码
        
        Args:
            image_base64: base64编码的图片
            
        Returns:
            识别结果 {'barcode': '条码内容', 'type': '类型'}
        """
        try:
            # 获取access token
            access_token = self.get_access_token()
            if not access_token:
                return {'barcode': None, 'type': None, 'error': 'API未配置'}
            
            # 调用百度OCR条码识别API
            url = f"https://aip.baidubce.com/rest/2.0/ocr/v1/qrcode?access_token={access_token}"
            
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            data = {'image': image_base64}
            
            response = requests.post(url, headers=headers, data=data, timeout=10)
            result = response.json()
            
            print(f"百度条码识别原始结果: {result}")
            
            # 解析结果
            if 'codes_result' in result and len(result['codes_result']) > 0:
                # 获取第一个识别到的码
                code_info = result['codes_result'][0]
                barcode_text = code_info.get('text', [''])[0] if isinstance(code_info.get('text'), list) else code_info.get('text', '')
                code_type = code_info.get('type', 'unknown')
                
                if barcode_text:
                    print(f"✅ 识别到条码: {barcode_text}, 类型: {code_type}")
                    return {
                        'barcode': barcode_text,
                        'type': 'qrcode' if 'QR' in code_type.upper() else 'barcode',
                        'error': None
                    }
            
            # 未识别到条码
            return {'barcode': None, 'type': None, 'error': None}
            
        except Exception as e:
            print(f"❌ 条码识别异常: {e}")
            return {'barcode': None, 'type': None, 'error': str(e)}

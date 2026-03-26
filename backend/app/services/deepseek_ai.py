"""
DeepSeek AI服务 - 智能解析OCR识别结果
"""
import requests
import json
from typing import Dict, Optional


class DeepSeekAIService:
    """DeepSeek AI服务类"""
    
    def __init__(self):
        # DeepSeek API配置
        # 访问：https://platform.deepseek.com/
        self.api_key = "sk-d642998f183f482b915bbe663d9b52c8"  # 替换为实际的API Key
        self.api_url = "https://api.deepseek.com/v1/chat/completions"
        self.model = "deepseek-chat"
        
        # 开发模式标志
        self.is_dev_mode = (self.api_key == "YOUR_DEEPSEEK_API_KEY")
    
    def parse_medicine_info(self, ocr_text: str) -> Dict:
        """
        使用DeepSeek AI智能解析OCR识别的文字
        
        Args:
            ocr_text: OCR识别的原始文字
            
        Returns:
            解析后的药品信息
        """
        if self.is_dev_mode:
            print("⚠️  DeepSeek AI未配置，跳过智能解析")
            return {}
        
        try:
            # 构建提示词
            prompt = self._build_prompt(ocr_text)
            
            # 调用DeepSeek API
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            }
            
            data = {
                'model': self.model,
                'messages': [
                    {
                        'role': 'system',
                        'content': '你是一个专业的药品信息提取助手。你的任务是从OCR识别的文字中准确提取药品相关信息。'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.1,  # 降低温度以提高准确性
                'max_tokens': 500
            }
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # 解析JSON结果
                medicine_info = json.loads(content)
                print(f"✅ DeepSeek AI解析成功: {medicine_info}")
                return medicine_info
            else:
                print(f"❌ DeepSeek API调用失败: {response.status_code}")
                return {}
        
        except Exception as e:
            print(f"❌ DeepSeek AI解析失败: {e}")
            return {}
    
    def _build_prompt(self, ocr_text: str) -> str:
        """构建提示词"""
        prompt = f"""
请从以下OCR识别的文字中提取药品信息。这些文字来自药品包装盒。

OCR识别文字：
{ocr_text}

请提取以下信息（如果文字中没有，则返回null）：
1. name: 药品名称（通常是最大最显眼的文字，如"阿莫西林胶囊"）
2. specification: 规格（如"0.25g×24粒"、"10mg×20片"）
3. manufacturer: 生产企业/厂家
4. approval_number: 批准文号（通常以"国药准字"开头）
5. production_date: 生产日期（格式：YYYY-MM-DD）
6. expiry_date: 有效期至（格式：YYYY-MM-DD）
7. batch_number: 批号/批次号

注意事项：
- 药品名称通常是最显眼的文字，不包含规格信息
- 日期格式统一为YYYY-MM-DD
- 批号通常是字母+数字的组合
- 如果某个字段无法确定，返回null
- 不要包含任何解释，只返回JSON

请以JSON格式返回结果：
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
        return prompt
    
    def enhance_ocr_result(self, ocr_result: Dict, raw_text: str) -> Dict:
        """
        增强OCR识别结果
        
        Args:
            ocr_result: 原始OCR识别结果
            raw_text: OCR识别的原始文字
            
        Returns:
            增强后的识别结果
        """
        if self.is_dev_mode:
            return ocr_result
        
        # 使用AI解析
        ai_result = self.parse_medicine_info(raw_text)
        
        # 合并结果（AI结果优先，但保留OCR的非空值）
        enhanced = ocr_result.copy()
        
        for key, value in ai_result.items():
            if value and value != "null":
                # AI识别到了值，使用AI的结果
                enhanced[key] = value
            elif key not in enhanced or not enhanced[key]:
                # OCR没有识别到，使用AI的结果（即使是null）
                enhanced[key] = value
        
        return enhanced

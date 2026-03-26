"""OCR识别路由"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.ocr import OCRService
from app.api.deps import CurrentUser
import base64

router = APIRouter()


class OCRResponse(BaseModel):
    """OCR识别响应"""
    name: str | None = None
    specification: str | None = None
    manufacturer: str | None = None
    approval_number: str | None = None
    production_date: str | None = None
    expiry_date: str | None = None
    batch_number: str | None = None
    error: str | None = None


class BatchOCRResponse(BaseModel):
    """批量OCR识别响应"""
    success: bool
    total: int
    results: list[OCRResponse]
    merged_result: OCRResponse | None = None


@router.post("/recognize", response_model=OCRResponse)
async def recognize_medicine(
    file: UploadFile = File(...),
    current_user: CurrentUser = None
):
    """
    识别药品包装信息
    
    上传药品包装图片，自动识别药品信息
    """
    try:
        print(f"📸 收到OCR识别请求，文件名: {file.filename}")
        
        # 读取图片内容
        contents = await file.read()
        print(f"📊 图片大小: {len(contents)} bytes")
        
        # 转换为base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # 调用OCR服务
        ocr_service = OCRService()
        result = ocr_service.recognize_medicine(image_base64)
        
        print(f"✅ OCR识别结果: {result}")
        
        return OCRResponse(**result)
    
    except Exception as e:
        print(f"❌ OCR识别失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"识别失败: {str(e)}")


@router.post("/recognize-batch", response_model=BatchOCRResponse)
async def recognize_medicine_batch(
    files: list[UploadFile] = File(...),
    current_user: CurrentUser = None
):
    """
    批量识别药品包装信息
    
    上传多张药品包装图片，自动识别并合并信息
    """
    try:
        print(f"📸 收到批量OCR识别请求，图片数量: {len(files)}")
        
        ocr_service = OCRService()
        results = []
        
        # 逐个识别图片
        for idx, file in enumerate(files):
            print(f"📷 识别第 {idx + 1}/{len(files)} 张图片: {file.filename}")
            
            # 读取图片内容
            contents = await file.read()
            image_base64 = base64.b64encode(contents).decode('utf-8')
            
            # 调用OCR服务
            result = ocr_service.recognize_medicine(image_base64)
            results.append(OCRResponse(**result))
            
            print(f"✅ 第 {idx + 1} 张识别完成: {result.get('name', 'Unknown')}")
        
        # 使用AI合并多张图片的识别结果
        merged_result = ocr_service.merge_recognition_results(results)
        
        print(f"🤖 AI合并结果: {merged_result}")
        
        return BatchOCRResponse(
            success=True,
            total=len(files),
            results=results,
            merged_result=OCRResponse(**merged_result) if merged_result else None
        )
    
    except Exception as e:
        print(f"❌ 批量OCR识别失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"批量识别失败: {str(e)}")


class BarcodeScanResponse(BaseModel):
    """条码扫描响应"""
    barcode: str | None = None
    type: str | None = None  # 'qrcode' 或 'barcode'
    error: str | None = None


@router.post("/scan-barcode", response_model=BarcodeScanResponse)
async def scan_barcode(
    file: UploadFile = File(...),
    current_user: CurrentUser = None
):
    """
    扫描条形码/二维码
    
    上传图片，识别其中的条形码或二维码
    """
    try:
        print(f"📷 收到条码扫描请求，文件名: {file.filename}")
        
        # 读取图片内容
        contents = await file.read()
        print(f"📊 图片大小: {len(contents)} bytes")
        
        # 转换为base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # 调用OCR服务识别条码
        ocr_service = OCRService()
        result = ocr_service.scan_barcode(image_base64)
        
        print(f"✅ 条码识别结果: {result}")
        
        return BarcodeScanResponse(**result)
    
    except Exception as e:
        print(f"❌ 条码识别失败: {str(e)}")
        # 返回空结果而不是抛出异常，让前端继续扫描
        return BarcodeScanResponse(barcode=None, error=str(e))

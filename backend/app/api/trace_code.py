"""追溯码查询API"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.deps import CurrentUser
from app.services.trace_code import TraceCodeService

router = APIRouter()


class TraceCodeQuery(BaseModel):
    """追溯码查询请求"""
    trace_code: str


class TraceCodeResponse(BaseModel):
    """追溯码查询响应"""
    trace_code: str
    enterprise_code: str | None = None
    product_code: str | None = None
    serial_number: str | None = None
    name: str | None = None
    specification: str | None = None
    manufacturer: str | None = None
    approval_number: str | None = None
    batch_number: str | None = None
    production_date: str | None = None
    expiry_date: str | None = None
    source: str


@router.post("/query", response_model=TraceCodeResponse)
async def query_trace_code(data: TraceCodeQuery, current_user: CurrentUser):
    """
    查询追溯码信息
    
    Args:
        data: 追溯码查询请求
        current_user: 当前用户
        
    Returns:
        追溯码信息
    """
    service = TraceCodeService()
    
    # 验证追溯码格式
    if not service.validate_trace_code(data.trace_code):
        raise HTTPException(status_code=400, detail="追溯码格式不正确，应为20位数字")
    
    # 查询追溯码信息
    result = service.query_by_trace_code(data.trace_code)
    
    if not result:
        raise HTTPException(status_code=404, detail="未找到追溯码信息")
    
    return TraceCodeResponse(**result)


@router.post("/validate")
async def validate_trace_code(data: TraceCodeQuery, current_user: CurrentUser):
    """
    验证追溯码格式
    
    Args:
        data: 追溯码查询请求
        current_user: 当前用户
        
    Returns:
        验证结果
    """
    service = TraceCodeService()
    is_valid = service.validate_trace_code(data.trace_code)
    
    return {
        "valid": is_valid,
        "trace_code": data.trace_code,
        "message": "追溯码格式正确" if is_valid else "追溯码格式不正确"
    }

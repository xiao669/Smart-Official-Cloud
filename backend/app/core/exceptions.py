"""自定义异常和全局异常处理器"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """统一错误响应格式"""
    code: str
    message: str
    details: dict | None = None


class AppException(Exception):
    """应用基础异常类"""
    
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    """资源不存在异常"""
    
    def __init__(self, resource: str, id: int | str):
        super().__init__(
            code="NOT_FOUND",
            message=f"{resource} with id {id} not found",
            status_code=404
        )


class ValidationError(AppException):
    """数据验证异常"""
    
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422
        )
        self.details = details


class AuthenticationError(AppException):
    """认证异常"""
    
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(
            code="AUTHENTICATION_ERROR",
            message=message,
            status_code=401
        )


class AuthorizationError(AppException):
    """授权异常"""
    
    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            code="AUTHORIZATION_ERROR",
            message=message,
            status_code=403
        )


class BusinessError(AppException):
    """业务逻辑异常"""
    
    def __init__(self, code: str, message: str):
        super().__init__(code=code, message=message, status_code=400)


def register_exception_handlers(app: FastAPI) -> None:
    """注册全局异常处理器"""
    
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                code=exc.code,
                message=exc.message,
                details=getattr(exc, 'details', None)
            ).model_dump()
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        # 提取更友好的错误信息
        errors = exc.errors()
        error_messages = []
        for error in errors:
            field = ".".join(str(loc) for loc in error.get("loc", []))
            msg = error.get("msg", "验证失败")
            error_messages.append(f"{field}: {msg}")
        
        friendly_message = "; ".join(error_messages) if error_messages else "请求参数验证失败"
        
        print(f"[验证错误] {request.url.path}: {friendly_message}")
        print(f"[验证错误详情] {errors}")
        
        return JSONResponse(
            status_code=422,
            content=ErrorResponse(
                code="VALIDATION_ERROR",
                message=friendly_message,
                details={"errors": errors}
            ).model_dump()
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                code="INTERNAL_ERROR",
                message="An internal error occurred"
            ).model_dump()
        )

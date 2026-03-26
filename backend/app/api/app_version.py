"""App 版本管理路由"""
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()

# 当前最新版本配置（实际项目中应该存数据库）
LATEST_VERSION = {
    "version": "3.2.0",
    "versionCode": 320,
    "downloadUrl": "http://your-server.com/app/medicine-app-3.2.0.apk",
    "wgtUrl": "http://your-server.com/app/medicine-app-3.2.0.wgt",
    "updateContent": "1. 修复已知问题\n2. 优化用户体验",
    "forceUpdate": False,
    "minVersion": 300  # 最低支持版本，低于此版本强制更新
}


class VersionCheckResponse(BaseModel):
    version: str
    versionCode: int
    updateType: str  # 'wgt', 'apk', 'none'
    downloadUrl: str
    updateContent: str
    forceUpdate: bool


@router.get("/version/check", response_model=VersionCheckResponse)
async def check_version(
    version: str = Query(..., description="当前版本号"),
    versionCode: int = Query(..., description="当前版本码"),
    platform: str = Query("android", description="平台")
):
    """
    检查 App 版本更新
    
    返回更新类型：
    - none: 无需更新
    - wgt: 热更新（只更新前端资源）
    - apk: 整包更新（需要重新安装）
    """
    current_code = versionCode
    latest_code = LATEST_VERSION["versionCode"]
    
    # 无需更新
    if current_code >= latest_code:
        return VersionCheckResponse(
            version=LATEST_VERSION["version"],
            versionCode=latest_code,
            updateType="none",
            downloadUrl="",
            updateContent="",
            forceUpdate=False
        )
    
    # 判断是否强制更新
    force_update = current_code < LATEST_VERSION["minVersion"]
    
    # 判断更新类型
    # 主版本号变化用整包更新，否则用热更新
    current_major = current_code // 100
    latest_major = latest_code // 100
    
    if current_major < latest_major:
        # 主版本变化，整包更新
        update_type = "apk"
        download_url = LATEST_VERSION["downloadUrl"]
    else:
        # 小版本变化，热更新
        update_type = "wgt"
        download_url = LATEST_VERSION["wgtUrl"]
    
    return VersionCheckResponse(
        version=LATEST_VERSION["version"],
        versionCode=latest_code,
        updateType=update_type,
        downloadUrl=download_url,
        updateContent=LATEST_VERSION["updateContent"],
        forceUpdate=force_update
    )

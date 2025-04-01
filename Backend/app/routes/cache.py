from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.cache import set_cache, get_cache, invalidate_cache
from fastapi import FastAPI

router = APIRouter()

class CacheUpdateRequest(BaseModel):
    key: str
    value: dict
    expiration: int = 3600

async def get_app():
    from app.main import app  # Import here to avoid circular imports
    return app

@router.post("/update")
async def update_cache(request: CacheUpdateRequest, app: FastAPI = Depends(get_app)):
    success = await set_cache(app, request.key, request.value, request.expiration)
    return {"success": success, "key": request.key, "message": "Cache updated" if success else "Cache update failed"}

@router.delete("/invalidate")
async def invalidate_cache_endpoint(key: str, app: FastAPI = Depends(get_app)):
    success = await invalidate_cache(app, key)
    return {"success": success, "key": key, "message": "Cache invalidated" if success else "Cache invalidation failed"}

@router.get("/get")
async def get_cache_endpoint(key: str, app: FastAPI = Depends(get_app)):
    data = await get_cache(app, key)
    if data:
        return {"source": "cache", "data": data}
    return {"source": "cache", "data": None, "message": "No data found in cache"}
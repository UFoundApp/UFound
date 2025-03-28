from fastapi import APIRouter
from pydantic import BaseModel
from app.cache import set_cache, get_cache, invalidate_cache

router = APIRouter()

# Define a Pydantic model for the request body
class CacheUpdateRequest(BaseModel):
    key: str
    value: dict
    expiration: int = 3600  # Optional, defaults to 3600

@router.post("/update")
async def update_cache(request: CacheUpdateRequest):
    success = await set_cache(request.key, request.value, request.expiration)
    return {"success": success, "key": request.key, "message": "Cache updated" if success else "Cache update failed"}

@router.delete("/invalidate")
async def invalidate_cache_endpoint(key: str):
    success = await invalidate_cache(key)
    return {"success": success, "key": key, "message": "Cache invalidated" if success else "Cache invalidation failed"}

@router.get("/get")
async def get_cache_endpoint(key: str):
    data = await get_cache(key)
    if data:
        return {"source": "cache", "data": data}
    return {"source": "cache", "data": None, "message": "No data found in cache"}
from fastapi import APIRouter
from app.cache import set_cache, get_cache, invalidate_cache

router = APIRouter(prefix="/api/cache", tags=["cache"])

@router.post("/update")
async def update_cache(key: str, value: dict, expiration: int = 3600):
    success = await set_cache(key, value, expiration)
    return {"success": success, "key": key, "message": "Cache updated" if success else "Cache update failed"}

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
from fastapi import FastAPI
import json

# These functions now depend on the app instance
async def set_cache(app: FastAPI, key: str, value: dict, expiration: int = 3600):
    if app.state.redis:
        try:
            await app.state.redis.setex(key, expiration, json.dumps(value))
            print(f"Cached data for key: {key}")
            return True
        except Exception as e:
            print(f"Failed to set cache: {e}")
            return False
    return False

async def get_cache(app: FastAPI, key: str):
    if app.state.redis:
        try:
            cached = await app.state.redis.get(key)
            if cached:
                print(f"Cache hit for key: {key}")
                return json.loads(cached)
            print(f"Cache miss for key: {key}")
            return None
        except Exception as e:
            print(f"Failed to get cache: {e}")
            return None
    return None

async def invalidate_cache(app: FastAPI, key: str):
    """Remove a specific key from the cache."""
    if app.state.redis:
        try:
            await app.state.redis.delete(key)
            print(f"Invalidated cache for key: {key}")
            return True
        except Exception as e:
            print(f"Failed to invalidate cache: {e}")
            return False
    return False
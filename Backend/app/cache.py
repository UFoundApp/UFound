import redis.asyncio as redis
import os
import json
from dotenv import load_dotenv

load_dotenv()

redis_client = None

async def init_redis():
    global redis_client
    if os.getenv("USE_REDIS", "false").lower() == "true":
        try:
            redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST", "redis"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                password=os.getenv("REDIS_PASS", None),
                decode_responses=True
            )
            await redis_client.ping()
            print("Redis connected successfully")
        except Exception as e:
            print(f"Redis connection failed: {e}")
            redis_client = None

async def close_redis():
    if redis_client:
        await redis_client.close()

async def set_cache(key: str, value: dict, expiration: int = 3600):
    if redis_client:
        try:
            await redis_client.setex(key, expiration, json.dumps(value))
            print(f"Cached data for key: {key}")
            return True
        except Exception as e:
            print(f"Failed to set cache: {e}")
            return False
    return False

async def get_cache(key: str):
    if redis_client:
        try:
            cached = await redis_client.get(key)
            if cached:
                print(f"Cache hit for key: {key}")
                return json.loads(cached)
            print(f"Cache miss for key: {key}")
            return None
        except Exception as e:
            print(f"Failed to get cache: {e}")
            return None
    return None

async def invalidate_cache(key: str):
    """Remove a specific key from the cache."""
    if redis_client:
        try:
            await redis_client.delete(key)
            print(f"Invalidated cache for key: {key}")
            return True
        except Exception as e:
            print(f"Failed to invalidate cache: {e}")
            return False
    return False
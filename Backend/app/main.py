from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from app.db import test_connection, db
from app.models.posts import PostModel, CommentModel
from app.models.user import UserModel
from app.models.courses import CourseModel, ReviewModel
from app.models.professor import ProfessorModel, ProfessorReviewModel
from app.routes.posts import router as post_router
from app.routes.courses import router as course_router
from app.routes.professors import router as professor_router
from app.routes.cache import router as cache_router
from app.routes.auth import router as auth_router
from app.routes.userProfile import router as profile_router
from app.routes.search import router as search_router
import redis.asyncio as redis
import os
import json
import hashlib
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()
app.state.redis = None

async def init_redis():
    if os.getenv("USE_REDIS", "false").lower() == "true":
        try:
            app.state.redis = redis.Redis(
                host=os.getenv("REDIS_HOST", "redis"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                #password=os.getenv("REDIS_PASS", None),
                decode_responses=True
            )
            await app.state.redis.ping()
            # clear the cache on startup
            await app.state.redis.flushdb()
            logger.info("Redis cache cleared on startup")
            logger.info("Redis connected successfully")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            app.state.redis = None

async def close_redis():
    if app.state.redis:
        await app.state.redis.close()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StarletteCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info(f"Processing request: {request.method} {request.url}")
        
        if not app.state.redis:
            logger.info("Redis not initialized, skipping cache")
            return await call_next(request)

        # Generate cache key for GET equivalent
        get_cache_key = hashlib.md5(f"GET:{request.url}".encode()).hexdigest()

        # Invalidate cache for non-GET requests
        if request.method != "GET":
            try:
                await app.state.redis.delete(get_cache_key)
                logger.info(f"Invalidated cache for GET equivalent: {get_cache_key}")
            except Exception as e:
                logger.error(f"Failed to invalidate cache: {e}")
            response = await call_next(request)
            logger.info(f"Response headers: {response.headers}")
            return response

        # Cache logic for GET requests
        cache_key = hashlib.md5(f"{request.method}:{request.url}".encode()).hexdigest()

        try:
            cached = await app.state.redis.get(cache_key)
            if cached:
                logger.info(f"Cache hit for {cache_key}")
                cached_data = json.loads(cached)
                response = JSONResponse(
                    content=json.loads(cached_data["body"]),
                    status_code=cached_data["status"]
                )
                response.headers.update({
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                })
                logger.info(f"Cache response headers: {response.headers}")
                return response
        except Exception as e:
            logger.error(f"Redis error on get: {e}, proceeding without cache")

        logger.info(f"Cache miss for {cache_key}")
        response = await call_next(request)

        if response.status_code == 200 and response.headers.get("content-type") == "application/json":
            body = b"".join([chunk async for chunk in response.body_iterator])
            response_body = body.decode("utf-8")
            if response_body:
                try:
                    json.loads(response_body)
                    cache_data = {
                        "status": response.status_code,
                        "body": response_body
                    }
                    await app.state.redis.setex(cache_key, 3600, json.dumps(cache_data))
                    logger.info(f"Cached response for {cache_key}")
                    response = JSONResponse(content=json.loads(response_body), status_code=200)
                    response.headers.update({
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "*",
                    })
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON response for {cache_key}, not caching")
            else:
                logger.info(f"Empty response body for {cache_key}, not caching")
        
        logger.info(f"Final response headers: {response.headers}")
        return response
app.add_middleware(StarletteCacheMiddleware)

app.include_router(auth_router, prefix="/auth")

async def init_db():
    await init_beanie(db, document_models=[
        PostModel,
        UserModel,
        CourseModel,
        ProfessorModel,
        ProfessorReviewModel
    ])

@app.on_event("startup")
async def startup():
    await test_connection()
    await init_db()
    await init_redis()

@app.on_event("shutdown")
async def shutdown_event():
    await close_redis()

app.include_router(post_router, prefix="/api", tags=["Posts"])
app.include_router(course_router, prefix="/api", tags=["Courses"])
app.include_router(professor_router, prefix="/api", tags=["Professors"])
app.include_router(cache_router, prefix="/api/cache", tags=["Cache"])
app.include_router(profile_router, prefix="/api")
app.include_router(search_router)

@app.get("/")
async def root():
    return {"message": "UFound API is running!"}



from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.db import test_connection, db
from app.models.posts import PostModel, CommentModel  # Ensure correct import
from app.models.user import UserModel
from app.models.courses import CourseModel, ReviewModel
from app.models.professor import ProfessorModel, ProfessorReviewModel

from app.routes.posts import router as post_router 
from app.routes.courses import router as course_router
from app.routes.professors import router as professor_router
from app.routes.cache import router as cache_router

from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router  # Import auth routes
from app.routes.userProfile import router as profile_router
from app.routes.search import router as search_router

from app.cache import init_redis, close_redis, redis_client, set_cache, get_cache, invalidate_cache
import hashlib
import json
from typing import Callable

app = FastAPI()


origins = [
    "http://localhost:3000",  # Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ✅ Allows React frontend to communicate
    allow_credentials=True,
    allow_methods=["*"],  # ✅ Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # ✅ Allows all headers
)

# Middleware for caching with Redis
@app.middleware("http")
async def cache_middleware(request: Request, call_next: Callable) -> Response:
    # Skip caching if redis_client is not initialized
    if not redis_client:
        return await call_next(request)

    # Get the request method
    method = request.method

    # Base cache key starts with method and URL
    cache_key_base = f"{method}:{request.url}"

    # Generate cache key
    if method in ["POST", "PUT", "PATCH", "DELETE"]:
        body = await request.body()
        body_str = body.decode("utf-8") if body else ""  # Handle empty body
        cache_key = hashlib.md5(f"{cache_key_base}:{body_str}".encode()).hexdigest()
    else:
        cache_key = hashlib.md5(cache_key_base.encode()).hexdigest()

    # Check Redis for cached response
    try:
        cached = await get_cache(cache_key)
        if cached:
            print(f"Cache hit for {cache_key}")
            cached_data = json.loads(cached)
            return JSONResponse(content=cached_data["body"], status_code=cached_data["status"])
    except Exception as e:
        print(f"Redis error on get: {e}, proceeding without cache")
        return await call_next(request)

    # Cache miss: process the request
    print(f"Cache miss for {cache_key}")
    response = await call_next(request)

    # Cache the response if successful (status 200)
    if response.status_code == 200:
        body = [section async for section in response.body_iterator]
        response_body = b"".join(body).decode("utf-8")
        cache_data = {
            "status": response.status_code,
            "body": response_body
        }
        try:
            await set_cache(cache_key, cache_data)
            print(f"Cached response for {cache_key}")
        except Exception as e:
            print(f"Failed to cache response: {e}")

    return response

app.include_router(auth_router, prefix="/auth")  # Include authentication routes

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



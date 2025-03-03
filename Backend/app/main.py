from fastapi import FastAPI
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

from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router  # Import auth routes
from app.routes.userProfile import router as profile_router

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

app.include_router(auth_router, prefix="/auth")  # Include authentication routes

async def init_db():
    await init_beanie(db, document_models=[
        PostModel, 
        UserModel, 
        CommentModel, 
        CourseModel, 
        ProfessorModel, 
        ProfessorReviewModel
    ])

@app.on_event("startup")
async def startup():
    await test_connection()
    await init_db()
 
app.include_router(post_router, prefix="/api", tags=["Posts"])
app.include_router(course_router, prefix="/api", tags=["Courses"])
app.include_router(professor_router, prefix="/api", tags=["Professors"])
app.include_router(profile_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "UFound API is running!"}

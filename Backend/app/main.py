from fastapi import FastAPI
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.db import test_connection, db
from app.models.posts import PostModel, CommentModel  # Ensure correct import
from app.models.user import UserModel
from app.routes.posts import router as post_router 
from fastapi.middleware.cors import CORSMiddleware

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


async def init_db():
    await init_beanie(db, document_models=[PostModel, UserModel, CommentModel])  # Register discussion model

@app.on_event("startup")
async def startup():
    await test_connection()
    await init_db()
 
app.include_router(post_router, prefix="/api", tags=["Posts"])

@app.get("/")
async def root():
    return {"message": "UFound API is running!"}

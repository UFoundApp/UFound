from fastapi import FastAPI
from app.db import test_connection
from app.routes.auth import router as auth_router # Import auth routes
from app.db import db
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (frontend requests)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(auth_router, prefix="/auth") # Include authentication routes


@app.on_event("startup")
async def startup():
    await test_connection()

@app.get("/")
async def root():
    return {"message": "UTM Blinds API is running!"}

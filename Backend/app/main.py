from fastapi import FastAPI
from app.db import test_connection

app = FastAPI()

@app.on_event("startup")
async def startup():
    await test_connection()

@app.get("/")
async def root():
    return {"message": "UTM Blinds API is running!"}

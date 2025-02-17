from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

# Get MongoDB URI from .env
uri = os.getenv("MONGO_URI")


# Connect to MongoDB
client = AsyncIOMotorClient(uri)
db = client["UFound"]  

# Collection for storing users and verification codes
users_collection = db["users"]
verification_codes_collection = db["verification_codes"]


# Function to test MongoDB connection
async def   test_connection():
    try:
        # List all collections to check if the connection works
        collections = await db.list_collection_names()
        print("✅MongoDB connected successfully! Collections:", collections)
    except Exception as e:
        print(" MongoDB connection failed:", str(e))

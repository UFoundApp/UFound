from fastapi import APIRouter, HTTPException
from app.db import verification_codes_collection, users_collection
from app.registerUtils import generate_verification_code, send_verification_email, hash_password
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

class EmailRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

class RegisterUserRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    username: str

class UpdatePasswordRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    username: str

class PasswordCheckRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    identifier: str  # Can be either email or username
    password: str

async def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login")
async def login_user(request: LoginRequest):
    # Check if user exists by email or username
    user = await users_collection.find_one(
        {"$or": [{"email": request.identifier}, {"username": request.identifier}]}
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify the password
    if not await verify_password(request.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {"message": "Login successful", "username": user["username"], "email": user["email"]}

@router.post("/send-verification-code")
async def send_verification(request: EmailRequest):
    # Validate email domain
    if not request.email.endswith("@mail.utoronto.ca"):
        raise HTTPException(status_code=400, detail="Only @mail.utoronto.ca emails are allowed")

    # Generate a 6-digit verification code
    verification_code = generate_verification_code()

    # Store in MongoDB with expiration time (5 min)
    expiration_time = datetime.utcnow() + timedelta(minutes=5)
    await verification_codes_collection.insert_one({
        "email": request.email,
        "code": verification_code,
        "expires_at": expiration_time
    })

    # Send the email
    if send_verification_email(request.email, verification_code):
        return {"message": "Verification code sent"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")

@router.post("/verify-code")
async def verify_code(request: VerifyCodeRequest):
    # Find the latest verification code for the given email
    record = await verification_codes_collection.find_one(
        {"email": request.email},
        sort=[("_id", -1)]  # Get the most recent code
    )

    if not record:
        raise HTTPException(status_code=400, detail="No verification code found for this email")

    # Check if the code has expired
    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired")

    # Check if the code matches
    if record["code"] != request.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    return {"message": "Email verified successfully"}

@router.post("/register")
async def register_user(request: RegisterUserRequest):
    # Check if the email has been verified
    verification_record = await verification_codes_collection.find_one(
        {"email": request.email},
        sort=[("_id", -1)]
    )

    if not verification_record:
        raise HTTPException(status_code=400, detail="Email has not been verified")

    # Ensure passwords match
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check if username is unique
    existing_user = await users_collection.find_one({"username": request.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username is already taken")

    # Hash the password before storing
    hashed_password = hash_password(request.password)

    # Store the user in MongoDB
    user_data = {
        "email": request.email,
        "username": request.username,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }
    await users_collection.insert_one(user_data)

    return {"message": "User registered successfully"}

@router.post("/update-password")
async def update_password(request: UpdatePasswordRequest):
    # Check if the email has been verified
    verification_record = await verification_codes_collection.find_one(
        {"email": request.email},
        sort=[("_id", -1)]
    )

    if not verification_record:
        raise HTTPException(status_code=400, detail="Email has not been verified")
    
    # Ensure passwords match
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Hash the password before storing
    hashed_password = hash_password(request.password)

    # Update the user's password in MongoDB
    await users_collection.update_one(
        {"email": request.email},
        {"$set": {"password": hashed_password, "username": request.username}}
    )

    return {"message": "Password updated successfully"}

# Verify if a user exists in the database
@router.post("/verify-user-exists")
async def verify_user_exists(request: EmailRequest):
    user = await users_collection.find_one({"email": request.email})
    if user:
        return {"exists": True}
    else:
        return {"exists": False}
    
@router.post("/get-username")
async def get_user_data(request: EmailRequest):
    user = await users_collection.find_one({"email": request.email})

    if user:
        return {"username": user["username"]}
    else:
        return {"username": None}
    
@router.post("/check-password")
async def check_password(request: PasswordCheckRequest):
    user = await users_collection.find_one({"email": request.email})
    pass_user = user["password"]

    request_pass = hash_password(request.password)

    # Check if the code matches
    if pass_user == request_pass:
        return {"status": False}
    else:
        return {"status": True}
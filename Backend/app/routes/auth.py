from fastapi import APIRouter, HTTPException
from app.db import verification_codes_collection, users_collection
from app.registerUtils import generate_verification_code, send_verification_email, hash_password
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from passlib.context import CryptContext
from app.models.user import UserModel


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
    user = await UserModel.find_one(
        {"$or": [{"email": request.identifier}, {"username": request.identifier}]}
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not await verify_password(request.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    # Include the user's ID in the response
    return {
        "message": "Login successful", 
        "username": user.username, 
        "email": user.email,
        "id": str(user.id)  # Convert UUID to string
    }

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

    # Update the record to mark the email as verified
    await verification_codes_collection.update_one(
        {"_id": record["_id"]},  # Find the exact record
        {"$set": {"verified": True}}  # Set verified to True
    )

    return {"message": "Email verified successfully"}

@router.post("/register")
async def register_user(request: RegisterUserRequest):
    # Check if email has been verified
    verification_record = await verification_codes_collection.find_one(
        {"email": request.email},
        sort=[("_id", -1)]
    )

    if not verification_record or not verification_record.get("verified", False):
        raise HTTPException(status_code=400, detail="Email has not been verified")

    # Check if email is unique
    existing_email = await UserModel.find_one(UserModel.email == request.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Check if username is unique
    existing_user = await UserModel.find_one(UserModel.username == request.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username is already taken")

    # Ensure passwords match
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Hash the password before storing
    hashed_password = hash_password(request.password)

    # Create and insert new user 
    new_user = UserModel(
        email=request.email,
        username=request.username,
        password=hashed_password,
        created_at=datetime.utcnow()
    )
    await new_user.insert()

    return {"message": "User registered successfully"}


@router.post("/update-password")
async def update_password(request: UpdatePasswordRequest):
    user = await UserModel.find_one(UserModel.email == request.email)

    if not user:
        raise HTTPException(status_code=404, detail="Email is not registered")

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
    user.password = hashed_password
    await user.save()  # Saves the updated user password

    return {"message": "Password updated successfully"}

# Verify if a user exists in the database
@router.post("/verify-user-exists")
async def verify_user_exists(request: EmailRequest):
    user = await UserModel.find_one(UserModel.email == request.email)
    return {"exists": bool(user)}

    
@router.post("/get-username")
async def get_user_data(request: EmailRequest):
    user = await UserModel.find_one(UserModel.email == request.email)
    return {"username": user.username if user else None}

    
@router.post("/check-password")
async def check_password(request: PasswordCheckRequest):
    user = await UserModel.find_one(UserModel.email == request.email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if verify_password(request.password, user.password):
        return {"status": True}  # Correct password
    else:
        return {"status": False}  # Incorrect password

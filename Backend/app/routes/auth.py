from fastapi import APIRouter, HTTPException, Response, Request, Depends
from app.db import verification_codes_collection, users_collection
from app.registerUtils import generate_verification_code, send_verification_email, hash_password
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from app.models.user import UserModel
from dotenv import load_dotenv
import os
import jwt
#temp

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

ACCESS_SECRET_KEY = os.getenv("JWT_SECRET")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 2

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

# Function to generate JWT token
def create_token(data: dict, expires_delta: timedelta, secret_key: str):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)

def create_access_token(data: dict):
    return create_token(data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES), ACCESS_SECRET_KEY)

def create_refresh_token(data: dict):
    return create_token(data, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS), REFRESH_SECRET_KEY)


@router.post("/login")
async def login_user(request: LoginRequest, response: Response):
    user = await UserModel.find_one({"$or": [{"email": request.identifier}, {"username": request.identifier}]})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not await verify_password(request.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    print(f"Generated Access Token: {access_token}")  # Debugging
    print(f"Generated Refresh Token: {refresh_token}")  # Debugging

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,  # 🔹 MUST BE False for local development
        samesite="None",  # 🔹 CHANGE FROM "None" (which requires HTTPS)
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    response.set_cookie(
        key="refresh_token",
        value=f"Bearer {refresh_token}",
        httponly=True,
        secure=True,
        samesite="None",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return {"message": "Login successful", "username": user.username, "email": user.email}


# Logout - Clear the cookie
@router.post("/logout")
async def logout(response: Response):
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        samesite="None",
        secure=True,
        max_age=0, 
        expires=0  
    )
    response.set_cookie(
        key="refresh_token",
        value="",
        httponly=True,
        samesite="None",
        secure=True,
        max_age=0,
        expires=0
    )
    return {"message": "Logged out successfully"}



async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    
    if not token:
        return None  

    if not token.startswith("Bearer "):
        print("Invalid token format:", token) 
        return None

    try:
        token = token.split(" ")[1]
        payload = jwt.decode(token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if not email:
            return None 

        user = await UserModel.find_one(UserModel.email == email)
        if not user:
            return None

        return user

    except jwt.ExpiredSignatureError:
        return None 
    except jwt.PyJWTError:
        print("Invalid access token")
        return None



# Protect an Endpoint
@router.get("/me")
async def get_user_info(current_user: UserModel = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return {
        "id": str(current_user.id),  # Convert UUID to string for JSON
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "posts": current_user.posts,
        "comments": [(comment_id) for comment_id in current_user.comments]  # Convert UUIDs to strings
    }

@router.post("/send-verification-code")
async def send_verification(request: EmailRequest):
    # Validate email domain
    # if not request.email.endswith("@mail.utoronto.ca"):
    #     raise HTTPException(status_code=400, detail="Only @mail.utoronto.ca emails are allowed")

    # Generate a 6-digit verification code
    verification_code = generate_verification_code()

    # Store in MongoDB with expiration time (5 min)
    expiration_time = datetime.now(timezone.utc) + timedelta(minutes=5)
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

    expires_at = record["expires_at"]

    # 🔵 Fix: Normalize to UTC if tzinfo is missing
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    # Check if the code has expired
    if expires_at < datetime.now(timezone.utc):
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
async def register_user(request: RegisterUserRequest, response: Response):
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
        created_at=datetime.now(timezone.utc)
    )
    await new_user.insert()

    # Generate JWT token and set it in a cookie
    access_token = create_access_token(data={"sub": new_user.email})

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="None",
        secure=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert minutes to seconds
    )

    return {"message": "User registered and logged in successfully", "username": new_user.username}

@router.get("/check-refresh")
async def check_refresh_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return Response(status_code=204)
    return {"message": "Refresh token exists"}

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

@router.post("/refresh-token")
async def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return Response(status_code=401)
    if refresh_token.startswith("Bearer "): # case probably won't happen
        refresh_token = refresh_token.split(" ")[1]

    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await UserModel.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        new_access_token = create_access_token(data={"sub": user.email})

        response.set_cookie(
            key="access_token",
            value=f"Bearer {new_access_token}",
            httponly=True,
            secure=True,
            samesite="None",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        return {"message": "Access token refreshed"}

    except jwt.ExpiredSignatureError:
        raise Response(status_code=401)
    except jwt.PyJWTError:
        raise Response(status_code=401)


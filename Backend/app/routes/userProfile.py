from fastapi import APIRouter, HTTPException
from app.models.posts import PostModel
from app.models.user import UserModel
from beanie import PydanticObjectId

router = APIRouter()

@router.get("/profile/{username}")
async def get_user_profile(username: str):
    user = await UserModel.find_one(UserModel.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch complete post objects for each post ID
    posts = []
    for post_id in user.posts:
        try:
            post = await PostModel.get(PydanticObjectId(post_id))
            if post:
                posts.append(post)
        except:
            continue
    
    # Sort posts by created_at
    posts.sort(key=lambda x: x.created_at, reverse=True)
    
    # Create response with user data and complete post objects
    user_data = user.dict()
    user_data['posts'] = posts
    return user_data

@router.put("/profile/{username}")
async def update_user_profile(username: str, profile_data: dict):
    user = await UserModel.find_one(UserModel.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update allowed fields
    if "bio" in profile_data:
        user.bio = profile_data["bio"]
    if "username" in profile_data:
        # Check if new username is already taken
        if profile_data["username"] != username:
            existing_user = await UserModel.find_one(UserModel.username == profile_data["username"])
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already taken")
        user.username = profile_data["username"]
    
    await user.save()
    return user

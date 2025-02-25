from fastapi import APIRouter, HTTPException
from app.models.posts import PostModel
from app.models.user import UserModel
from beanie import PydanticObjectId  # Needed for MongoDB ObjectId
from uuid import UUID

router = APIRouter()

# Create a new post
@router.post("/posts", response_model=PostModel)
async def create_post(post: PostModel):
    # First, create the post
    await post.insert()
    
    # Get the user and update their posts array
    if hasattr(post, 'author_id'):
        user = await UserModel.find_one(UserModel.id == post.author_id)
        if user:
            user.posts.append(str(post.id))  # Add the post ID to user's posts array
            await user.save()
    
    return post

# Get all posts
@router.get("/posts")
async def get_posts():
    posts = await PostModel.find_all().to_list()
    return posts

# Get a single post by ID
@router.get("/posts/{post_id}", response_model=PostModel)
async def get_post(post_id: PydanticObjectId):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/posts/{post_id}/like")
async def like_post(post_id: PydanticObjectId, user_id: UUID):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if user_id in post.likes:
        raise HTTPException(status_code=400, detail="User already liked this post")

    post.likes.append(user_id)
    await post.save()
    return {"message": "Post liked", "likes_count": len(post.likes)}

@router.post("/posts/{post_id}/unlike")
async def unlike_post(post_id: PydanticObjectId, user_id: UUID):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if user_id not in post.likes:
        raise HTTPException(status_code=400, detail="User has not liked this post")

    post.likes.remove(user_id)
    await post.save()
    return {"message": "Post unliked", "likes_count": len(post.likes)}
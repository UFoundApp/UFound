from fastapi import APIRouter, HTTPException
from app.models.posts import PostModel
from beanie import PydanticObjectId  # Needed for MongoDB ObjectId

router = APIRouter()

# Create a new post
@router.post("/posts", response_model=PostModel)
async def create_post(post: PostModel):
    await post.insert()
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

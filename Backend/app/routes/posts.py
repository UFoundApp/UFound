from fastapi import APIRouter, HTTPException, Body
from app.models.posts import PostModel, CommentModel
from beanie import PydanticObjectId  # Needed for MongoDB ObjectId
from uuid import UUID, uuid4
from bson import ObjectId
from app.models.user import UserModel
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter()


class CommentRequest(BaseModel):
    author_id: UUID
    content: str
    parent_id: Optional[UUID] = None

class LikeRequest(BaseModel):
    user_id: UUID

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

def find_comment_by_id(comments: List[CommentModel], comment_id: UUID) -> Optional[CommentModel]:
    for c in comments:
        if c.id == comment_id:
            return c
        found = find_comment_by_id(c.replies, comment_id)
        if found:
            return found
    return None

@router.post("/posts/{post_id}/comment")
async def add_comment(post_id: PydanticObjectId, request: CommentRequest = Body(...)):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    user = await UserModel.find_one(UserModel.id == request.author_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_comment = CommentModel(
        id=uuid4(),
        content=request.content,
        author_id=request.author_id,
        author_name=user.username,
        created_at=datetime.utcnow(),
        parent_id=request.parent_id,
        replies=[]
    )

    if request.parent_id:
        parent_comment = find_comment_by_id(post.comments, request.parent_id)
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        parent_comment.replies.append(new_comment)
    else:
        post.comments.append(new_comment)

    await post.save()
    return {"message": "Comment added successfully", "comment": new_comment}



@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: PydanticObjectId):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    def fetch_replies(comment: CommentModel):
        """ Recursively fetch replies for a comment """
        return {
            "id": comment.id,
            "content": comment.content,
            "author_id": comment.author_id,
            "author_name": comment.author_name,
            "created_at": comment.created_at,
            "parent_id": comment.parent_id,
            "replies": [fetch_replies(reply) for reply in comment.replies],  # 🔥 Recursive call
        }

    # Convert top-level comments to include nested replies
    comments_with_replies = [fetch_replies(comment) for comment in post.comments if comment.parent_id is None]

    return {"comments": comments_with_replies}

@router.post("/posts/{post_id}/comments/{comment_id}/like")
async def like_comment(post_id: PydanticObjectId, comment_id: UUID, request: LikeRequest):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    def find_comment(comments):
        for comment in comments:
            if comment.id == comment_id:
                return comment
            found = find_comment(comment.replies)
            if found:
                return found
        return None

    comment = find_comment(post.comments)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # ✅ Ensure comment.likes is a list before modifying it
    if comment.likes is None:
        comment.likes = []

    if request.user_id in comment.likes:
        raise HTTPException(status_code=400, detail="User already liked this comment")

    comment.likes.append(request.user_id)
    await post.save()
    return {"message": "Comment liked", "likes_count": len(comment.likes)}

@router.post("/posts/{post_id}/comments/{comment_id}/unlike")
async def unlike_comment(post_id: PydanticObjectId, comment_id: UUID, request: LikeRequest):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    def find_comment(comments):
        for comment in comments:
            if comment.id == comment_id:
                return comment
            found = find_comment(comment.replies)
            if found:
                return found
        return None

    comment = find_comment(post.comments)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.likes is None:
        comment.likes = []

    if request.user_id not in comment.likes:
        raise HTTPException(status_code=400, detail="User has not liked this comment")

    comment.likes.remove(request.user_id)
    await post.save()
    return {"message": "Comment unliked", "likes_count": len(comment.likes)}

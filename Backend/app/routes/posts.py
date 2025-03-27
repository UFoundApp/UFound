from fastapi import APIRouter, HTTPException, Body
from app.models.posts import PostModel, CommentModel, ReportDetail
from app.models.user import UserModel
from beanie import PydanticObjectId  # Needed for MongoDB ObjectId
from uuid import UUID, uuid4
from bson import ObjectId
from app.models.user import UserModel
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter()
REPORT_THRESHOLD = 3
DELETED_USER_ID = UUID("00000000-0000-0000-0000-000000000000")


class CommentRequest(BaseModel):
    author_id: UUID
    content: str
    parent_id: Optional[UUID] = None

class LikeRequest(BaseModel):
    user_id: UUID

class ReportRequest(BaseModel):
    user_id: UUID
    reason: str 

@router.delete("/admin/posts/{post_id}")
async def delete_post(post_id: str):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await post.delete()
    return {"message": "Post deleted"}

@router.post("/admin/posts/{post_id}/unflag")
async def unflag_post(post_id: str):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.reports = []
    post.flagged = False
    await post.save()
    return {"message": "Post unflagged"}

@router.post("/admin/posts/{post_id}/comments/{comment_id}/delete")
async def delete_comment(post_id: str, comment_id: str):
    post = await PostModel.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    original_length = len(post.comments)
    post.comments = [comment for comment in post.comments if str(comment.id) != comment_id]

    if len(post.comments) == original_length:
        raise HTTPException(status_code=404, detail="Comment not found")

    await post.save()
    return {"message": "Comment permanently deleted"}


@router.post("/admin/posts/{post_id}/comments/{comment_id}/unflag")
async def unflag_comment(post_id: str, comment_id: str):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    updated = False
    for comment in post.comments:
        if str(comment.id) == comment_id:  # ensure proper comparison
            comment.flagged = False
            comment.reports = []
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Comment not found")

    await post.save()
    return {"message": "Comment unflagged"}


@router.get("/admin/flagged/comments")
async def get_flagged_comments():
    posts = await PostModel.find().to_list()
    flagged_comments = []
    for post in posts:
        for i, comment in enumerate(post.comments):
            if comment.flagged:
                flagged_comments.append({
                    "post_id": str(post.id),
                    "comment_index": i,
                    "comment": comment
                })
    return flagged_comments


@router.get("/admin/flagged/posts")
async def get_flagged_posts():
    return await PostModel.find(PostModel.flagged == True).to_list()

@router.get("/posts/flagged-comments")
async def get_flagged_comments():
    flagged_comments = []

    # Get all posts
    posts = list(posts_collection.find({}))

    for post in posts:
        post_id = str(post["_id"])
        post_title = post.get("title", "")
        post_content = post.get("content", "")
        comments = post.get("comments", [])

        for comment in comments:
            # ✅ Use the boolean flag to check if this comment is flagged
            if comment.get("flagged", False):
                flagged_comments.append({
                    "post_id": post_id,
                    "post_title": post_title,
                    "post_content": post_content,
                    "comment_id": comment["id"],
                    "comment": comment
                })

    return flagged_comments


@router.post("/posts/{post_id}/comments/{comment_idx}/report")
async def report_comment(post_id: PydanticObjectId, comment_idx: int, report: ReportRequest):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        comment = post.comments[comment_idx]
    except IndexError:
        raise HTTPException(status_code=404, detail="Comment not found")

    if any(r.user_id == report.user_id for r in comment.reports):
        raise HTTPException(status_code=400, detail="You have already reported this comment")

    user = await UserModel.get(report.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    comment.reports.append(ReportDetail(user_id=report.user_id, reason=report.reason, user_name=user.username))
    
    if len(comment.reports) >= 1:
        comment.flagged = True

    await post.save()
    return {"message": "Comment reported", "reports": len(comment.reports)}

@router.post("/posts/{post_id}/report")
async def report_post(post_id: PydanticObjectId, report: ReportRequest):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # prevent duplicate reports by same user
    if any(r.user_id == report.user_id for r in post.reports):
        raise HTTPException(status_code=400, detail="You have already reported this post")
    user = await UserModel.get(report.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    post.reports.append(ReportDetail(user_id=report.user_id, reason=report.reason, user_name=user.username))

    # Example threshold logic (optional)
    if len(post.reports) >= 1:
        post.flagged = True

    await post.save()
    return {"message": "Post reported", "reports": len(post.reports)}

# Create a new post
@router.post("/posts", response_model=PostModel)
async def create_post(post: PostModel):
    # Initialize views to 0 if not provided
    if not hasattr(post, 'views') or post.views is None:
        post.views = 0
        
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
        created_at=datetime.now(timezone.utc),
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
        """ Recursively fetch replies for a comment, including likes count """
        return {
        "id": comment.id,
        "content": comment.content,
        "author_id": comment.author_id,
        "author_name": comment.author_name,
        "created_at": comment.created_at,
        "parent_id": comment.parent_id,
        "likes": [str(like) for like in comment.likes] if comment.likes else [],
        "likes_count": len(comment.likes) if comment.likes else 0,
        "replies": [fetch_replies(reply) for reply in comment.replies],
    }

    # Convert top-level comments to include nested replies and likes
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

# Update the view increment endpoint
@router.post("/posts/{post_id}/view")
async def increment_view(post_id: PydanticObjectId):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Initialize views if it doesn't exist
    if not hasattr(post, 'views') or post.views is None:
        post.views = 0
    
    # Increment view count
    post.views += 1
    await post.save()
    
    # Return the updated view count
    return {"success": True, "views": post.views}

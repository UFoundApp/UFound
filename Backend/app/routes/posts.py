from fastapi import APIRouter, HTTPException, Body, Request
from app.models.posts import PostModel, CommentModel, ReportDetail
from app.models.user import UserModel
from beanie import PydanticObjectId  # Needed for MongoDB ObjectId
from uuid import UUID, uuid4
from bson import ObjectId
from app.models.user import UserModel
from app.routes.auth import get_current_user
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
from fastapi import Depends


router = APIRouter()
REPORT_THRESHOLD = 3
DELETED_USER_ID = UUID("00000000-0000-0000-0000-000000000000")


class CommentRequest(BaseModel):
    content: str
    parent_id: Optional[UUID] = None

class LikeRequest(BaseModel):
    user_id: UUID

class PostCreateRequest(BaseModel):
    title: str
    content: str
      
class ReportRequest(BaseModel):
    user_id: UUID
    reason: str 

def find_comment_and_apply_action(comments, comment_id, action):
    for comment in comments:
        if str(comment.id) == str(comment_id):
            return action(comment)
        if comment.replies:
            result = find_comment_and_apply_action(comment.replies, comment_id, action)
            if result:
                return result
    return None

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
async def delete_nested_comment(post_id: str, comment_id: str):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    def remove_comment(comments):
        for i, c in enumerate(comments):
            if str(c.id) == comment_id:
                comments.pop(i)
                return True
            if remove_comment(c.replies):
                return True
        return False

    deleted = remove_comment(post.comments)

    if not deleted:
        raise HTTPException(status_code=404, detail="Comment not found")

    await post.save()
    return {"message": "Nested comment deleted"}




@router.post("/admin/posts/{post_id}/comments/{comment_id}/unflag")
async def unflag_nested_comment(post_id: str, comment_id: str):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    def unflag_comment(comments):
        for c in comments:
            if str(c.id) == comment_id:
                c.flagged = False
                c.reports = []
                return True
            if unflag_comment(c.replies):
                return True
        return False

    updated = unflag_comment(post.comments)

    if not updated:
        raise HTTPException(status_code=404, detail="Comment not found")

    await post.save()
    return {"message": "Nested comment unflagged"}



def extract_flagged_comments(comments, post_id, results):
    for comment in comments:
        if comment.flagged:
            results.append({
                "post_id": str(post_id),
                "comment": comment.dict()
            })
        if comment.replies:
            extract_flagged_comments(comment.replies, post_id, results)

@router.get("/admin/flagged/comments")
async def get_flagged_comments():
    posts = await PostModel.find_all().to_list()
    results = []
    for post in posts:
        extract_flagged_comments(post.comments, post.id, results)
    return results



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
            # Use the boolean flag to check if this comment is flagged
            if comment.get("flagged", False):
                flagged_comments.append({
                    "post_id": post_id,
                    "post_title": post_title,
                    "post_content": post_content,
                    "comment_id": comment["id"],
                    "comment": comment
                })

    return flagged_comments


@router.post("/posts/{post_id}/comments/{comment_id}/report")
async def report_comment(post_id: PydanticObjectId, comment_id: str, report: ReportRequest):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user = await UserModel.get(report.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    def apply_report(comment):
        if any(r.user_id == report.user_id for r in comment.reports):
            raise HTTPException(status_code=400, detail="You already reported this comment")
        comment.reports.append(ReportDetail(user_id=report.user_id, reason=report.reason, user_name=user.username))
        comment.flagged = True
        return True
    
    if not find_comment_and_apply_action(post.comments, comment_id, apply_report):
        raise HTTPException(status_code=404, detail="Comment not found")
    
    await post.save()
    return {"message": "Comment reported"}


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
async def create_post(request: Request, post_data: PostCreateRequest = Body(...)):
    current_user = await get_current_user(request)
    print("Current user:", current_user)
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    post = PostModel(
        title=post_data.title,
        content=post_data.content,
        created_at=datetime.now(timezone.utc),
        author_id=current_user.id,
        likes=[],
        comments=[],
        views=0
    )
    await post.insert()
    
    # Get the user and update their posts array
    user = await UserModel.find_one(UserModel.id == current_user.id)
    if user:
        user.posts.append(str(post.id))
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
async def like_post(post_id: PydanticObjectId, request: Request):

    current_user = await get_current_user(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = current_user.id

    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if user_id in post.likes:
        raise HTTPException(status_code=400, detail="User already liked this post")

    post.likes.append(user_id)
    await post.save()
    return {"message": "Post liked", "likes_count": len(post.likes)}

@router.post("/posts/{post_id}/unlike")
async def unlike_post(post_id: PydanticObjectId, request: Request):
    current_user = await get_current_user(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = current_user.id

    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if user_id not in post.likes:
        raise HTTPException(status_code=400, detail="User has not liked this post")

    post.likes.remove(user_id)
    await post.save()
    return {"message": "Post unliked", "likes_count": len(post.likes)}

@router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    # Fetch the post from the database (adjust as needed for your ORM)
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Delete the post (this may vary based on your database/ORM)
    await post.delete()
    
    return {"message": "Post deleted successfully"}

def find_comment_by_id(comments: List[CommentModel], comment_id: UUID) -> Optional[CommentModel]:
    for c in comments:
        if c.id == comment_id:
            return c
        found = find_comment_by_id(c.replies, comment_id)
        if found:
            return found
    return None

@router.post("/posts/{post_id}/comment")
async def add_comment(post_id: PydanticObjectId, request: Request, comment_data: CommentRequest = Body(...)):
    current_user = await get_current_user(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated") 

    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = CommentModel(
        id=uuid4(),
        content=comment_data.content,
        author_id=current_user.id,
        author_name=current_user.username,
        created_at=datetime.now(timezone.utc),
        parent_id=comment_data.parent_id,
        replies=[]
    )

    if comment_data.parent_id:
        parent_comment = find_comment_by_id(post.comments, comment_data.parent_id)
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

@router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(post_id: str, comment_id: str, user=Depends(get_current_user)):
    post = await PostModel.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Recursive function to find the comment and its parent list
    def find_and_remove(comments, comment_id):
        for idx, comment in enumerate(comments):
            if str(comment.id) == comment_id:
                return idx, comments
            if comment.replies:
                result = find_and_remove(comment.replies, comment_id)
                if result is not None:
                    return result
        return None

    result = find_and_remove(post.comments, comment_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    idx, parent_list = result
    comment_to_delete = parent_list[idx]
        
    # Remove the comment
    parent_list.pop(idx)
    await post.save()
    
    return {"message": "Comment deleted successfully"}


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

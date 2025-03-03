from fastapi import APIRouter
from app.models.posts import PostModel

router = APIRouter(prefix="/api") 

@router.get("/search")  
async def searchPosts(query: str):
    query = query.lower()
    posts = await PostModel.find_all().to_list()
    postsList = []
    
    for post in posts:
        if query in post.title.lower() or query in post.content.lower():
            postsList.append(post)
    
    return {
        "posts": postsList,  
        "reviews": []
    }

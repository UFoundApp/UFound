from fastapi import APIRouter
from Backend.app.models.posts import PostModel

router = APIRouter(prefix="/api") 

@router.get("/search?")  
async def searchPosts(query: str):
    query = query.lower()
    print("QUERY", query)
    posts = await PostModel.find_all().to_list()
    postsList = []
    
    print("QUERY", query)
    print("POSTS", posts)
    
    for post in posts:
        if query in post.title.lower() or query in post.content.lower():
            postsList.append(post)
    
    return {
        "posts": postsList,  
        "reviews": []
    }

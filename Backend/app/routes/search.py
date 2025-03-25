from fastapi import APIRouter
from app.models.posts import PostModel
from app.models.professor import ProfessorModel
from app.models.courses import CourseModel

router = APIRouter(prefix="/api") 

@router.get("/search/posts")  
async def searchPosts(query: str):
    query = query.lower()
    posts = await PostModel.find_all().to_list()
    postsList = []
    
    for post in posts:
        if query in post.title.lower() or query in post.content.lower():
            postsList.append(post)
    
    return {
        "posts": postsList
    }

@router.get("/search/professors")  
async def searchPosts(query: str):
    query = query.lower()
    profs = await ProfessorModel.find_all().to_list()
    profList = []
    
    for prof in profs:
        if query in prof.name.lower() or query in prof.department.lower():
            profList.append(prof)
    
    return {
        "professors": profList
    }

@router.get("/search/courses")  
async def searchPosts(query: str):
    query = query.lower()
    courses = await CourseModel.find_all().to_list()
    courseList = []
    
    for course in courses:
        if query in course.title.lower() or query in course.description.lower():
            courseList.append(course)
    
    return {
        "courses": courseList
    }

@router.get("/search/suggestions")
async def get_search_suggestions(query: str, type: str):
    query = query.lower()
    
    if type == "posts":
        posts = await PostModel.find({
            "title": {"$regex": query, "$options": "i"}
        }).limit(5).to_list()
        return posts
        
    elif type == "courses":
        courses = await CourseModel.find({
            "title": {"$regex": f"^{query}", "$options": "i"}
        }).limit(5).to_list()
        return courses
        
    elif type == "professors":
        professors = await ProfessorModel.find({
            "name": {"$regex": query, "$options": "i"}
        }).limit(5).to_list()
        return professors
        
    return []

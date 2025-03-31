from fastapi import APIRouter
from app.models.posts import PostModel
from app.models.professor import ProfessorModel
from app.models.courses import CourseModel
from fuzzywuzzy import fuzz
from typing import List, Dict
import re

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
async def searchProfessors(query: str):
    query = query.lower()
    profs = await ProfessorModel.find_all().to_list()
    profList = []
    
    for prof in profs:
        if query in prof.name.lower():
            # Convert ObjectIds to strings for JSON serialization
            prof_dict = {
                "_id": str(prof.id),
                "name": prof.name,
                "department": prof.department,
                "ratings": prof.ratings.dict() if prof.ratings else None,
                "current_courses": [str(course_id) for course_id in prof.current_courses]
            }
            profList.append(prof_dict)
    
    return {
        "professors": profList
    }

@router.get("/search/courses")  
async def searchPosts(query: str):
    query = query.lower()
    courses = await CourseModel.find_all().to_list()
    courseList = []
    
    for course in courses:
        if query in course.title.lower():
            courseList.append(course)
    
    return {
        "courses": courseList
    }

def fuzzy_match(query: str, text: str, threshold: int = 60) -> bool:
    # Direct match check
    if query.lower() in text.lower():
        return True
    
    # Fuzzy match check
    ratio = fuzz.partial_ratio(query.lower(), text.lower())
    return ratio >= threshold

@router.get("/search/suggestions")
async def get_search_suggestions(query: str, type: str):
    if not query:
        return []
        
    query = query.lower()
    results = []
    
    try:
        if type == "posts":
            # Keep fuzzy matching for posts
            posts = await PostModel.find_all().to_list()
            matched_posts = []
            
            for post in posts:
                title_ratio = fuzz.partial_ratio(query, post.title.lower())
                content_ratio = fuzz.partial_ratio(query, post.content.lower())
                max_ratio = max(title_ratio, content_ratio)
                
                if max_ratio > 60:  # Threshold for fuzzy matching
                    matched_posts.append({
                        'post': post,
                        'ratio': max_ratio
                    })
            
            # Sort by relevance and get top 5
            matched_posts.sort(key=lambda x: x['ratio'], reverse=True)
            results = [p['post'] for p in matched_posts[:5]]
            
        elif type == "courses":
            # Simple prefix matching for courses
            courses = await CourseModel.find({
                "title": {"$regex": f"^{query}", "$options": "i"}
            }).limit(5).to_list()
            results = courses
            
        elif type == "professors":
            # Simple prefix matching for professors with proper field mapping
            professors = await ProfessorModel.find({
                "$or": [
                    {"name": {"$regex": f"^{query}", "$options": "i"}},
                    {"department": {"$regex": f"^{query}", "$options": "i"}}
                ]
            }).limit(5).to_list()
            
            # Map the fields to match what frontend expects
            results = [{
                "name": prof.name,
                "department": prof.department,
                "_id": str(prof.id)  # Ensure ID is included and converted to string
            } for prof in professors]
            
        return results[:5]  # Limit to 5 suggestions
        
    except Exception as e:
        print(f"Error in search suggestions: {e}")
        return []

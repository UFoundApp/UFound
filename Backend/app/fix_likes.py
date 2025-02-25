import asyncio
from app.models.posts import PostModel
from app.db import init_db  # Import your database connection function if needed

async def fix_existing_posts():
    await init_db()  # Ensure database connection is established if using Beanie
    posts = await PostModel.find().to_list()
    for post in posts:
        if isinstance(post.likes, int):  # If likes is stored as an int
            post.likes = []
            await post.save()

if __name__ == "__main__":
    asyncio.run(fix_existing_posts())

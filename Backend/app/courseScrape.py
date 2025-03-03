import re
import requests
from bs4 import BeautifulSoup
from app.models.courses import CourseModel
from datetime import datetime

BASE_URL = "https://utm.calendar.utoronto.ca/course-search"
PAGE_PARAM = "?page="  # Pagination format


# Function to extract only course codes from a text
def extract_course_info(text):
    """Extracts everything after the colon in prerequisite or exclusion text and ensures proper spacing."""
    if not text or text == "N/A":
        return "N/A"

    extracted_text = text.split(":", 1)[-1].strip()
    return extracted_text.replace("or", " or ").replace("and", " and ")  # Take everything after the first colon""


# Function to clean distribution requirement text
def clean_distribution(text):
    """Extracts only the topic (e.g., 'Science' instead of 'Distribution Requirement: Science')."""
    if not text or text == "N/A":
        return ""

    return text.split(":")[-1].strip()  # Take the part after the colon


# Function to get the last page number
def last_page(url):
    # Fetch the first page
    response = requests.get(BASE_URL)
    # Parse the HTML
    soup = BeautifulSoup(response.text, "html.parser")

    last_page_link = soup.find("a", title="Go to last page")

    if last_page_link:
        href = last_page_link.get("href", "")
        match = re.search(r"page=(\d+)", href)
        if match:
            num = int(match.group(1))
            return num
        else:
            return None


# Function to scrape a single page
async def scrape_page(url):
    page_to_scrape = requests.get(url)
    soup = BeautifulSoup(page_to_scrape.text, "html.parser")

    # Find the main container holding all courses
    view_content = soup.find("div", class_="view-content")
    if not view_content:
        print("Error: 'view-content' div not found")
        return []

    # Find all course containers inside view-content
    courses = view_content.find_all("div", class_="views-row")
    scraped_data = []

    for course in courses:
        title_element = course.find("h3")
        title = title_element.text.strip() if title_element else None
        if not title:
            continue

        # Extract Raw Data
        description = course.find("div", class_="views-field views-field-field-desc").get_text(strip=True) \
            if course.find("div", class_="views-field views-field-field-desc") else "N/A"

        prereq_text = course.find("span", class_="views-field views-field-field-prerequisite").get_text(strip=True) \
            if course.find("span", class_="views-field views-field-field-prerequisite") else "N/A"

        exclusion_text = course.find("span", class_="views-field views-field-field-exclusion").get_text(strip=True) \
            if course.find("span", class_="views-field views-field-field-exclusion") else "N/A"

        distribution_text = course.find("span",
                                        class_="views-field views-field-field-distribution-requirements").get_text(
            strip=True) \
            if course.find("span", class_="views-field views-field-field-distribution-requirements") else "N/A"

        # Process Extracted Data
        prereqs = extract_course_info(prereq_text)  # Convert to comma-separated string
        exclusions = extract_course_info(exclusion_text)  # Convert to comma-separated string
        distribution = clean_distribution(distribution_text)  # Keep only the topic

        # check if the course already exists in the database
        exisiting_course = await CourseModel.find_one(CourseModel.title == title)
        if exisiting_course:
            continue

        # Construct course info
        course_info = CourseModel(
            title=title,
            description=description,
            prerequisites=prereqs,
            exclusions=exclusions,
            distribution=distribution,
            reviews=[],
            professors=[],
            ratings=None,
            likes=[],
            created_at=datetime.now()
        )

        # Insert course into database
        await course_info.insert()
        scraped_data.append(course_info)

    return scraped_data


# Function to scrape all pages recursively
async def scrape_all_pages():
    page_number = 0
    last_page_num = last_page(BASE_URL)

    while page_number < last_page_num:
        page_url = BASE_URL + PAGE_PARAM + str(page_number) if page_number >= 0 else BASE_URL
        print(f"\nScraping Page {page_number + 1} -> {page_url}")

        await scrape_page(page_url)
        page_number += 1
    
    print("\nScraping Complete!")

import requests
import xml.etree.ElementTree as ET

def get_courses_by_professor(name: str):
    url = "https://api.easi.utoronto.ca/ttb/getPageableCourses"

    headers = {
        "Content-Type": "application/json",
        "Origin": "https://ttb.utoronto.ca",
        "Referer": "https://ttb.utoronto.ca/",
        "User-Agent": "Mozilla/5.0"
    }

    payload = {
        "availableSpace": False,
        "campuses": [],
        "courseCodeAndTitleProps": {
            "courseCode": "",
            "courseTitle": "",
            "courseSectionCode": ""
        },
        "courseLevels": [],
        "creditWeights": [],
        "dayPreferences": [],
        "deliveryModes": [],
        "departmentProps": [],
        "direction": "asc",
        "divisions": ["ERIN"],  # UTM
        "instructor": name,
        "page": 1,
        "pageSize": 100,
        "requirementProps": [],
        "sessions": ["20249", "20251", "20249-20251"],  # Fall 2024 + Winter 2025
        "timePreferences": [],
        "waitListable": False
    }

    try:
        res = requests.post(url, headers=headers, json=payload)
        root = ET.fromstring(res.text)

        results = []
        for course in root.findall(".//courses"):
            code = course.find("code").text if course.find("code") is not None else None
            session = course.find("sessions/sessions").text if course.find("sessions/sessions") is not None else None

            if code and session:
                results.append({
                    "code": code,
                    "session": session  # e.g. "20251" = winter, "20249" = fall
                })

        return results
    except Exception as e:
        print(f"⚠️ Failed to fetch courses for {name}: {e}")
        return []
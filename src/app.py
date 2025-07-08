"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path
import json
import shutil
from typing import Optional

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# Create resumes directory if it doesn't exist
resumes_dir = current_dir / "resumes"
resumes_dir.mkdir(exist_ok=True)
app.mount("/resumes", StaticFiles(directory=str(resumes_dir)), name="resumes")

# In-memory student profiles database
students = {}

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Soccer Team": {
        "description": "Join the school soccer team and compete in matches",
        "schedule": "Tuesdays and Thursdays, 4:00 PM - 5:30 PM",
        "max_participants": 22,
        "participants": ["liam@mergington.edu", "noah@mergington.edu"]
    },
    "Basketball Team": {
        "description": "Practice and play basketball with the school team",
        "schedule": "Wednesdays and Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 15,
        "participants": ["ava@mergington.edu", "mia@mergington.edu"]
    },
    "Art Club": {
        "description": "Explore your creativity through painting and drawing",
        "schedule": "Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 15,
        "participants": ["amelia@mergington.edu", "harper@mergington.edu"]
    },
    "Drama Club": {
        "description": "Act, direct, and produce plays and performances",
        "schedule": "Mondays and Wednesdays, 4:00 PM - 5:30 PM",
        "max_participants": 20,
        "participants": ["ella@mergington.edu", "scarlett@mergington.edu"]
    },
    "Math Club": {
        "description": "Solve challenging problems and participate in math competitions",
        "schedule": "Tuesdays, 3:30 PM - 4:30 PM",
        "max_participants": 10,
        "participants": ["james@mergington.edu", "benjamin@mergington.edu"]
    },
    "Debate Team": {
        "description": "Develop public speaking and argumentation skills",
        "schedule": "Fridays, 4:00 PM - 5:30 PM",
        "max_participants": 12,
        "participants": ["charlotte@mergington.edu", "henry@mergington.edu"]
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Validate student is not already signed up
    if email in activity["participants"]:
        raise HTTPException(
            status_code=400,
            detail="Student is already signed up"
        )

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


@app.delete("/activities/{activity_name}/unregister")
def unregister_from_activity(activity_name: str, email: str):
    """Unregister a student from an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Validate student is signed up
    if email not in activity["participants"]:
        raise HTTPException(
            status_code=400,
            detail="Student is not signed up for this activity"
        )

    # Remove student
    activity["participants"].remove(email)
    return {"message": f"Unregistered {email} from {activity_name}"}


@app.get("/students/{email}")
def get_student_profile(email: str):
    """Get a student's profile information"""
    if email not in students:
        # Return empty profile if student doesn't exist
        return {
            "email": email,
            "name": "",
            "grade": "",
            "resume_file": None,
            "resume_url": None,
            "resume_type": None
        }
    return students[email]


@app.post("/students/{email}/profile")
def update_student_profile(email: str, name: str = Form(...), grade: str = Form(...)):
    """Update a student's profile information"""
    if email not in students:
        students[email] = {
            "email": email,
            "name": name,
            "grade": grade,
            "resume_file": None,
            "resume_url": None,
            "resume_type": None
        }
    else:
        students[email]["name"] = name
        students[email]["grade"] = grade
    
    return {"message": f"Profile updated for {email}", "profile": students[email]}


@app.post("/students/{email}/resume/upload")
def upload_resume(email: str, file: UploadFile = File(...)):
    """Upload a resume file for a student"""
    # Validate file type
    allowed_types = ["application/pdf", "application/msword", 
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF and Word documents are allowed."
        )
    
    # Create student profile if it doesn't exist
    if email not in students:
        students[email] = {
            "email": email,
            "name": "",
            "grade": "",
            "resume_file": None,
            "resume_url": None,
            "resume_type": None
        }
    
    # Save file
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    safe_filename = f"{email.replace('@', '_').replace('.', '_')}.{file_extension}"
    file_path = resumes_dir / safe_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update student profile
    students[email]["resume_file"] = safe_filename
    students[email]["resume_url"] = None  # Clear URL if file is uploaded
    students[email]["resume_type"] = "file"
    
    return {
        "message": f"Resume uploaded successfully for {email}",
        "filename": safe_filename,
        "profile": students[email]
    }


@app.post("/students/{email}/resume/link")
def link_resume_url(email: str, resume_url: str = Form(...)):
    """Link a resume URL for a student"""
    # Basic URL validation
    if not (resume_url.startswith("http://") or resume_url.startswith("https://")):
        raise HTTPException(
            status_code=400,
            detail="Invalid URL. URL must start with http:// or https://"
        )
    
    # Create student profile if it doesn't exist
    if email not in students:
        students[email] = {
            "email": email,
            "name": "",
            "grade": "",
            "resume_file": None,
            "resume_url": None,
            "resume_type": None
        }
    
    # Update student profile
    students[email]["resume_url"] = resume_url
    students[email]["resume_file"] = None  # Clear file if URL is linked
    students[email]["resume_type"] = "url"
    
    return {
        "message": f"Resume URL linked successfully for {email}",
        "url": resume_url,
        "profile": students[email]
    }


@app.delete("/students/{email}/resume")
def delete_resume(email: str):
    """Delete a student's resume"""
    if email not in students:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student = students[email]
    
    # Delete file if it exists
    if student.get("resume_file"):
        file_path = resumes_dir / student["resume_file"]
        if file_path.exists():
            file_path.unlink()
    
    # Clear resume information
    students[email]["resume_file"] = None
    students[email]["resume_url"] = None
    students[email]["resume_type"] = None
    
    return {"message": f"Resume deleted for {email}", "profile": students[email]}

# Load activities from JSON file
activities_file = os.path.join(current_dir, "activities.json")
with open(activities_file, "r") as f:
    activities = json.load(f)

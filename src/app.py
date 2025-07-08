"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import os
from pathlib import Path
import json
import hashlib
from typing import Optional

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Request models
class LoginRequest(BaseModel):
    username: str
    password: str

# Security scheme
security = HTTPBearer(auto_error=False)

# Simple in-memory session store (in production, use Redis or database)
active_sessions = {}

def generate_session_token(username: str) -> str:
    """Generate a simple session token"""
    import time
    return hashlib.sha256(f"{username}:{time.time()}".encode()).hexdigest()

def verify_teacher_session(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[str]:
    """Verify if the request has a valid teacher session"""
    if not credentials:
        return None
    
    token = credentials.credentials
    if token in active_sessions:
        return active_sessions[token]
    return None

def require_teacher_auth(current_user: Optional[str] = Depends(verify_teacher_session)) -> str:
    """Require teacher authentication for protected endpoints"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Teacher authentication required")
    return current_user

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

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


@app.post("/auth/login")
def login(request: LoginRequest):
    """Login endpoint for teachers"""
    try:
        # Load teacher credentials
        teachers_file = os.path.join(current_dir, "teachers.json")
        with open(teachers_file, "r") as f:
            teachers = json.load(f)
        
        # Check credentials
        if request.username in teachers and teachers[request.username]["password"] == request.password:
            # Create session token
            token = generate_session_token(request.username)
            active_sessions[token] = request.username
            
            return {
                "message": "Login successful",
                "token": token,
                "name": teachers[request.username]["name"]
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Authentication system not configured")


@app.post("/auth/logout")
def logout(current_user: str = Depends(require_teacher_auth)):
    """Logout endpoint for teachers"""
    # Remove session token
    token_to_remove = None
    for token, user in active_sessions.items():
        if user == current_user:
            token_to_remove = token
            break
    
    if token_to_remove:
        del active_sessions[token_to_remove]
    
    return {"message": "Logged out successfully"}


@app.get("/auth/status")
def auth_status(current_user: Optional[str] = Depends(verify_teacher_session)):
    """Check authentication status"""
    if current_user:
        # Get teacher name
        teachers_file = os.path.join(current_dir, "teachers.json")
        with open(teachers_file, "r") as f:
            teachers = json.load(f)
        
        return {
            "authenticated": True,
            "username": current_user,
            "name": teachers.get(current_user, {}).get("name", current_user)
        }
    else:
        return {"authenticated": False}


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str, current_user: str = Depends(require_teacher_auth)):
    """Sign up a student for an activity (teacher only)"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Check if activity is full
    if len(activity["participants"]) >= activity["max_participants"]:
        raise HTTPException(
            status_code=400,
            detail="Activity is full"
        )

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
def unregister_from_activity(activity_name: str, email: str, current_user: str = Depends(require_teacher_auth)):
    """Unregister a student from an activity (teacher only)"""
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

# Load activities from JSON file
activities_file = os.path.join(current_dir, "activities.json")
with open(activities_file, "r") as f:
    activities = json.load(f)

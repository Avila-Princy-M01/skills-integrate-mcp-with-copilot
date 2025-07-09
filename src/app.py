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

# Load activities from JSON file
activities_file = os.path.join(current_dir, "activities.json")
with open(activities_file, "r") as f:
    activities = json.load(f)


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
 copilot/fix-3



@app.get("/participation-highlights")
def get_participation_highlights():
    """Get user participation statistics for highlighting active contributors"""
    # Count participation for each user
    user_participation = {}
    
    for activity_name, activity_data in activities.items():
        for participant in activity_data["participants"]:
            if participant not in user_participation:
                user_participation[participant] = {
                    "email": participant,
                    "activities": [],
                    "total_activities": 0
                }
            user_participation[participant]["activities"].append(activity_name)
            user_participation[participant]["total_activities"] += 1
    
    # Sort users by participation count (descending)
    sorted_participants = sorted(
        user_participation.values(),
        key=lambda x: x["total_activities"],
        reverse=True
    )
    
    # Get top 5 most active participants
    top_participants = sorted_participants[:5]
    
    # Calculate some general statistics
    total_participants = len(user_participation)
    total_activities = len(activities)
    
    return {
        "top_participants": top_participants,
        "total_participants": total_participants,
        "total_activities": total_activities
    }

# Load activities from JSON file
activities_file = os.path.join(current_dir, "activities.json")
with open(activities_file, "r") as f:
    activities = json.load(f)
 main

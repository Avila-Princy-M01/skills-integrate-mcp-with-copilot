"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
 copilot/fix-11
from pydantic import BaseModel
import os
from pathlib import Path
import json
import uuid
from datetime import datetime
from typing import Optional, List

 copilot/fix-8
from pydantic import BaseModel
from typing import List, Optional

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
 main
import os
from pathlib import Path
import json
import hashlib
from typing import Optional
 main

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

 copilot/fix-8
# Pydantic models for user profiles
class Profile(BaseModel):
    email: str
    name: str
    grade_level: str
    achievements: List[str] = []
    roles: List[str] = []
    skills: List[str] = []
    extracurricular_activities: List[str] = []
    leadership_roles: List[str] = []

class ProfileCreate(BaseModel):
    email: str
    name: str
    grade_level: str
    achievements: List[str] = []
    roles: List[str] = []
    skills: List[str] = []
    extracurricular_activities: List[str] = []
    leadership_roles: List[str] = []

# In-memory profiles database
profiles = {}

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

 copilot/fix-11
# In-memory teams database
teams = {}

# Pydantic models for team management
class Task(BaseModel):
    id: str
    title: str
    description: str
    assigned_to: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed
    created_at: str
    due_date: Optional[str] = None

class Team(BaseModel):
    id: str
    name: str
    description: str
    leader: str
    members: List[str]
    created_at: str
    tasks: List[Task] = []

class CreateTeamRequest(BaseModel):
    name: str
    description: str
    leader: str

class CreateTaskRequest(BaseModel):
    title: str
    description: str
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None

class UpdateTaskRequest(BaseModel):
    status: str

# Load activities from JSON file
activities_file = os.path.join(current_dir, "activities.json")
with open(activities_file, "r") as f:
    activities = json.load(f)
 main
 main


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


# Profile endpoints
@app.get("/profiles")
def get_profiles():
    """Get all profiles"""
    return profiles


@app.get("/profiles/{email}")
def get_profile(email: str):
    """Get a specific profile by email"""
    if email not in profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profiles[email]


@app.post("/profiles")
def create_profile(profile: ProfileCreate):
    """Create a new profile"""
    if profile.email in profiles:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    profiles[profile.email] = profile.dict()
    return {"message": f"Profile created for {profile.email}"}


@app.put("/profiles/{email}")
def update_profile(email: str, profile: ProfileCreate):
    """Update an existing profile"""
    if email not in profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profiles[email] = profile.dict()
    return {"message": f"Profile updated for {email}"}


@app.delete("/profiles/{email}")
def delete_profile(email: str):
    """Delete a profile"""
    if email not in profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    del profiles[email]
    return {"message": f"Profile deleted for {email}"}


# Team Management Endpoints

@app.get("/teams")
def get_teams():
    """Get all teams"""
    return teams

@app.post("/teams")
def create_team(team_request: CreateTeamRequest):
    """Create a new team"""
    team_id = str(uuid.uuid4())
    
    # Check if team name already exists
    for team in teams.values():
        if team["name"] == team_request.name:
            raise HTTPException(status_code=400, detail="Team name already exists")
    
    new_team = Team(
        id=team_id,
        name=team_request.name,
        description=team_request.description,
        leader=team_request.leader,
        members=[team_request.leader],  # Leader is automatically a member
        created_at=datetime.now().isoformat(),
        tasks=[]
    )
    
    teams[team_id] = new_team.dict()
    return {"message": f"Team '{team_request.name}' created successfully", "team_id": team_id}

@app.get("/teams/{team_id}")
def get_team(team_id: str):
    """Get a specific team"""
    if team_id not in teams:
        raise HTTPException(status_code=404, detail="Team not found")
    return teams[team_id]

@app.post("/teams/{team_id}/members")
def add_team_member(team_id: str, email: str):
    """Add a member to a team"""
    if team_id not in teams:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = teams[team_id]
    if email in team["members"]:
        raise HTTPException(status_code=400, detail="Member already in team")
    
    team["members"].append(email)
    return {"message": f"Added {email} to team {team['name']}"}

@app.delete("/teams/{team_id}/members")
def remove_team_member(team_id: str, email: str):
    """Remove a member from a team"""
    if team_id not in teams:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = teams[team_id]
    if email not in team["members"]:
        raise HTTPException(status_code=400, detail="Member not in team")
    
    if email == team["leader"]:
        raise HTTPException(status_code=400, detail="Cannot remove team leader")
    
    team["members"].remove(email)
    return {"message": f"Removed {email} from team {team['name']}"}

@app.post("/teams/{team_id}/tasks")
def create_task(team_id: str, task_request: CreateTaskRequest):
    """Create a new task for a team"""
    if team_id not in teams:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = teams[team_id]
    task_id = str(uuid.uuid4())
    
    # Validate assigned_to is a team member if provided
    if task_request.assigned_to and task_request.assigned_to not in team["members"]:
        raise HTTPException(status_code=400, detail="Assigned person must be a team member")
    
    new_task = Task(
        id=task_id,
        title=task_request.title,
        description=task_request.description,
        assigned_to=task_request.assigned_to,
        created_at=datetime.now().isoformat(),
        due_date=task_request.due_date,
        status="pending"
    )
    
    team["tasks"].append(new_task.dict())
    return {"message": f"Task '{task_request.title}' created successfully", "task_id": task_id}

@app.get("/teams/{team_id}/tasks")
def get_team_tasks(team_id: str):
    """Get all tasks for a team"""
    if team_id not in teams:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return teams[team_id]["tasks"]

@app.put("/teams/{team_id}/tasks/{task_id}")
def update_task_status(team_id: str, task_id: str, update_request: UpdateTaskRequest):
    """Update a task's status"""
    if team_id not in teams:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = teams[team_id]
    task = None
    for t in team["tasks"]:
        if t["id"] == task_id:
            task = t
            break
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    valid_statuses = ["pending", "in_progress", "completed"]
    if update_request.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    task["status"] = update_request.status
    return {"message": f"Task status updated to {update_request.status}"}

@app.delete("/teams/{team_id}/tasks/{task_id}")
def delete_task(team_id: str, task_id: str):
    """Delete a task from a team"""
    if team_id not in teams:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = teams[team_id]
    task_index = None
    for i, t in enumerate(team["tasks"]):
        if t["id"] == task_id:
            task_index = i
            break
    
    if task_index is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_title = team["tasks"][task_index]["title"]
    del team["tasks"][task_index]
    return {"message": f"Task '{task_title}' deleted successfully"}

# Load activities from JSON file
activities_file = os.path.join(current_dir, "activities.json")
with open(activities_file, "r") as f:
    activities = json.load(f)
 copilot/fix-8

# Load profiles from JSON file (create if doesn't exist)
profiles_file = os.path.join(current_dir, "profiles.json")
try:
    with open(profiles_file, "r") as f:
        profiles = json.load(f)
except FileNotFoundError:
    profiles = {}
    # Create empty profiles.json file
    with open(profiles_file, "w") as f:
        json.dump(profiles, f, indent=2)

 main
 main

# Mergington High School Activities API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities.

## Features

- View all available extracurricular activities
- Sign up for activities
- Create and manage student profiles
- View student profiles showcasing achievements, roles, and skills

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

### Activities
| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Sign up for an activity                                             |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Unregister from an activity                                       |

### User Profiles
| Method | Endpoint                    | Description                   |
| ------ | --------------------------- | ----------------------------- |
| GET    | `/profiles`                 | Get all user profiles         |
| GET    | `/profiles/{email}`         | Get a specific user profile   |
| POST   | `/profiles`                 | Create a new user profile     |
| PUT    | `/profiles/{email}`         | Update an existing profile    |
| DELETE | `/profiles/{email}`         | Delete a user profile         |

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:
   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

3. **User Profiles** - Uses email as identifier:
   - Name
   - Grade level
   - Achievements (list)
   - Roles (list)
   - Skills (list)
   - Extracurricular activities (list)
   - Leadership roles (list)

All data is stored in memory and persisted to JSON files, which means data will be reset when the server restarts.

# Mergington High School Activities API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities.

## Features

- View all available extracurricular activities
- Sign up for activities
- **NEW**: Student profile management with name, email, and grade level
- **NEW**: Resume upload functionality (PDF and Word documents)
- **NEW**: Resume URL linking capability
- **NEW**: Resume management (view, delete, update)

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn python-multipart
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Sign up for an activity                                             |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Unregister from an activity                                        |
| GET    | `/students/{email}`                                               | Get student profile information                                      |
| POST   | `/students/{email}/profile`                                       | Update student profile (name, grade)                                |
| POST   | `/students/{email}/resume/upload`                                 | Upload resume file (PDF, DOC, DOCX)                                 |
| POST   | `/students/{email}/resume/link`                                   | Link resume URL                                                      |
| DELETE | `/students/{email}/resume`                                        | Delete student resume                                                |

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
   - Resume file (uploaded PDF/Word documents)
   - Resume URL (linked external resume)
   - Resume type (file or URL)

All data is stored in memory, which means data will be reset when the server restarts.

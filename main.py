
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

# Register SQLAlchemy models
import models

# Phase 1 Routers
from routers import (
    users,
    workouts,
    progress,
    goals,
    analytics,
    notifications,
)

# Phase 2 Routers
from routers import (
    workout_plans,
    exercises,
    progress_comparison,
    streaks,
    badges,
    personalized_dashboard,
)

# Phase 3 Routers
from routers import (
    meals,
    water,
    ai_suggestions,
    workout_timer,
    activity_sync,
    advanced_analytics,
    reminders,
)


# Create Database Tables
Base.metadata.create_all(bind=engine)


# FastAPI Application
app = FastAPI(
    title="FitTrack - Fitness & Workout Management Platform",
    description=(
        "FitTrack Phase 3 API. "
        "Includes user authentication, workout tracking, "
        "goals, progress, workout plans, exercise library, "
        "streaks, badges, personalized dashboard, "
        "nutrition tracking, water intake tracking, "
        "AI-style workout recommendations, workout timer, "
        "manual activity sync, advanced analytics "
        "and reminders."
    ),
    version="3.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Phase 1 Router Registration
app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(progress.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(notifications.router)


# Phase 2 Router Registration
app.include_router(workout_plans.router)
app.include_router(exercises.router)
app.include_router(progress_comparison.router)
app.include_router(streaks.router)
app.include_router(badges.router)
app.include_router(personalized_dashboard.router)


# Phase 3 Router Registration
app.include_router(meals.router)
app.include_router(water.router)
app.include_router(ai_suggestions.router)
app.include_router(workout_timer.router)
app.include_router(activity_sync.router)
app.include_router(advanced_analytics.router)
app.include_router(reminders.router)


# Home Endpoint
@app.get("/", tags=["Health Check"])
def home():
    return {
        "application": "FitTrack",
        "version": "3.0.0",
        "phase": "Phase 3",
        "status": "Running",
        "message": "FitTrack Phase 3 API is running successfully"
    }


# Health Check Endpoint
@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "service": "FitTrack API",
        "version": "3.0.0"
    }

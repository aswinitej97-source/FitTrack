
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

# Import models to register database tables
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

# Create database tables
Base.metadata.create_all(bind=engine)

# FastAPI Application
app = FastAPI(
    title="FitTrack - Fitness & Workout Management Platform",
    description=(
        "FitTrack Phase 1 & Phase 2 API. "
        "Fitness tracking, workout scheduling, "
        "exercise library, progress comparison, "
        "streak tracking, achievement badges "
        "and personalized dashboard."
    ),
    version="2.0.0"
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

# Phase 1 Routers
app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(progress.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(notifications.router)

# Phase 2 Routers
app.include_router(workout_plans.router)
app.include_router(exercises.router)
app.include_router(progress_comparison.router)
app.include_router(streaks.router)
app.include_router(badges.router)
app.include_router(personalized_dashboard.router)


@app.get("/", tags=["Health Check"])
def home():
    return {
        "application": "FitTrack",
        "version": "2.0.0",
        "phase": "Phase 1 & Phase 2",
        "status": "Running",
        "message": "FitTrack API is running successfully"
    }


@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "service": "FitTrack API"
    }

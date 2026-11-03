
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models

from routers import (
    users,
    workouts,
    progress,
    goals,
    analytics,
    notifications,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FitTrack - Fitness & Workout Management Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(progress.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(notifications.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to FitTrack API",
        "status": "Running"
    }

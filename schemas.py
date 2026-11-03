
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# MODULE 1: USER AUTHENTICATION

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# MODULE 2: WORKOUT MANAGEMENT

class WorkoutCreate(BaseModel):
    workout_name: str = Field(min_length=1, max_length=100)
    category: Literal["Cardio", "Strength", "Yoga"]
    duration: int = Field(gt=0)
    calories_burned: float = Field(ge=0)
    workout_date: date


class WorkoutUpdate(BaseModel):
    workout_name: str | None = None
    category: Literal["Cardio", "Strength", "Yoga"] | None = None
    duration: int | None = Field(default=None, gt=0)
    calories_burned: float | None = Field(default=None, ge=0)
    workout_date: date | None = None


class WorkoutResponse(WorkoutCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# MODULE 3: DAILY PROGRESS

class ProgressResponse(BaseModel):
    date: date
    total_workouts: int
    total_calories: float


# MODULE 4: GOAL MANAGEMENT

class GoalCreate(BaseModel):
    goal_type: Literal["Weight Loss", "Muscle Gain", "Steps"]
    target_value: float = Field(gt=0)
    current_value: float = Field(default=0, ge=0)
    deadline: date


class GoalUpdate(BaseModel):
    current_value: float = Field(ge=0)


class GoalResponse(GoalCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# MODULE 6: NOTIFICATIONS

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

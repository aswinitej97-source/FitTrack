
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict, EmailStr


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class WorkoutCreate(BaseModel):
    workout_name: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=30)
    duration: int = Field(gt=0)
    calories_burned: float = Field(default=0, ge=0)
    workout_date: date


class WorkoutUpdate(BaseModel):
    workout_name: str | None = Field(
        default=None, min_length=1, max_length=100
    )
    category: str | None = Field(
        default=None, min_length=1, max_length=30
    )
    duration: int | None = Field(default=None, gt=0)
    calories_burned: float | None = Field(default=None, ge=0)
    workout_date: date | None = None


class WorkoutResponse(WorkoutCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProgressCreate(BaseModel):
    total_workouts: int = Field(default=0, ge=0)
    total_calories: float = Field(default=0, ge=0)
    date: date


class ProgressResponse(ProgressCreate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class GoalCreate(BaseModel):
    goal_type: str = Field(min_length=1, max_length=30)
    target_value: float = Field(gt=0)
    current_value: float = Field(default=0, ge=0)
    deadline: date


class GoalUpdate(BaseModel):
    goal_type: str | None = Field(
        default=None, min_length=1, max_length=30
    )
    target_value: float | None = Field(default=None, gt=0)
    current_value: float | None = Field(default=None, ge=0)
    deadline: date | None = None


class GoalResponse(GoalCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    message: str = Field(min_length=1, max_length=500)


class NotificationResponse(NotificationCreate):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkoutPlanCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str | None = Field(
        default=None, max_length=500
    )
    scheduled_date: date


class WorkoutPlanResponse(WorkoutPlanCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    category: Literal["Cardio", "Strength", "Yoga"]
    description: str | None = Field(
        default=None, max_length=500
    )
    duration: int = Field(gt=0)


class ExerciseResponse(ExerciseCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StreakResponse(BaseModel):
    id: int
    user_id: int
    current_streak: int
    longest_streak: int
    last_workout_date: date | None

    model_config = ConfigDict(from_attributes=True)


class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str | None
    icon: str | None

    model_config = ConfigDict(from_attributes=True)


class UserBadgeResponse(BaseModel):
    id: int
    user_id: int
    badge_id: int
    earned_at: datetime
    badge: BadgeResponse

    model_config = ConfigDict(from_attributes=True)


from datetime import date as DateType, datetime
from enum import Enum
from typing import Literal, Optional

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
    workout_date: DateType


class WorkoutUpdate(BaseModel):
    workout_name: Optional[str] = Field(
        default=None, min_length=1, max_length=100
    )
    category: Optional[str] = Field(
        default=None, min_length=1, max_length=30
    )
    duration: Optional[int] = Field(default=None, gt=0)
    calories_burned: Optional[float] = Field(default=None, ge=0)
    workout_date: Optional[DateType] = None


class WorkoutResponse(WorkoutCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



class ProgressCreate(BaseModel):
    total_workouts: int = Field(default=0, ge=0)
    total_calories: float = Field(default=0, ge=0)
    date: DateType


class ProgressResponse(ProgressCreate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)




class GoalCreate(BaseModel):
    goal_type: str = Field(min_length=1, max_length=30)
    target_value: float = Field(gt=0)
    current_value: float = Field(default=0, ge=0)
    deadline: DateType


class GoalUpdate(BaseModel):
    goal_type: Optional[str] = Field(
        default=None, min_length=1, max_length=30
    )
    target_value: Optional[float] = Field(default=None, gt=0)
    current_value: Optional[float] = Field(default=None, ge=0)
    deadline: Optional[DateType] = None


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
    description: Optional[str] = Field(
        default=None, max_length=500
    )
    scheduled_date: DateType


class WorkoutPlanResponse(WorkoutPlanCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)




class ExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    category: Literal["Cardio", "Strength", "Yoga"]
    description: Optional[str] = Field(
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
    last_workout_date: Optional[DateType]

    model_config = ConfigDict(from_attributes=True)




class BadgeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class UserBadgeResponse(BaseModel):
    id: int
    user_id: int
    badge_id: int
    earned_at: datetime
    badge: BadgeResponse

    model_config = ConfigDict(from_attributes=True)




class MealType(str, Enum):
    BREAKFAST = "Breakfast"
    LUNCH = "Lunch"
    DINNER = "Dinner"
    SNACKS = "Snacks"


class MealCreate(BaseModel):
    meal_type: MealType
    food_name: str = Field(min_length=1, max_length=150)
    calories: float = Field(ge=0)
    protein: float = Field(default=0, ge=0)
    carbs: float = Field(default=0, ge=0)
    fats: float = Field(default=0, ge=0)


class MealResponse(MealCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



class WaterCreate(BaseModel):
    quantity: int = Field(gt=0, le=10000)
    date: Optional[DateType] = None


class WaterResponse(BaseModel):
    id: int
    user_id: int
    quantity: int
    date: DateType

    model_config = ConfigDict(from_attributes=True)

from datetime import time as TimeType
from typing import Literal


class ReminderCreate(BaseModel):
    reminder_type: Literal["Workout", "Meal", "Water"]
    title: str = Field(min_length=1, max_length=150)
    reminder_time: TimeType
    is_active: bool = True


class ReminderResponse(BaseModel):
    id: int
    user_id: int
    reminder_type: str
    title: str
    reminder_time: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


from datetime import date as DateType

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import User, Workout
from auth import get_current_user

router = APIRouter(
    prefix="/workout-timer",
    tags=["Workout Timer"]
)


class TimerWorkoutCreate(BaseModel):
    workout_name: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=30)
    duration_seconds: int = Field(gt=0, le=86400)


@router.post("/complete", status_code=201)
def complete_workout(
    data: TimerWorkoutCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    duration_minutes = max(
        1, round(data.duration_seconds / 60)
    )

    calorie_rates = {
        "cardio": 8,
        "strength": 5,
        "yoga": 3,
        "walking": 4,
        "running": 10
    }

    rate = calorie_rates.get(
        data.category.lower(), 5
    )

    calories_burned = round(
        (data.duration_seconds / 60) * rate, 2
    )

    workout = Workout(
        user_id=user.id,
        workout_name=data.workout_name,
        category=data.category,
        duration=duration_minutes,
        calories_burned=calories_burned,
        workout_date=DateType.today()
    )

    db.add(workout)
    db.commit()
    db.refresh(workout)

    return {
        "message": "Workout completed successfully",
        "workout_id": workout.id,
        "duration_seconds": data.duration_seconds,
        "duration_minutes": duration_minutes,
        "estimated_calories_burned": calories_burned
    }

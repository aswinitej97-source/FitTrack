
from datetime import date as DateType
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import User, Workout
from auth import get_current_user

router = APIRouter(
    prefix="/activity-sync",
    tags=["Activity Sync"]
)


class ActivitySyncCreate(BaseModel):
    source: Literal["Manual", "Google Fit", "Apple Health"]
    steps: int = Field(ge=0, le=100000)
    duration_minutes: int = Field(ge=0, le=1440)
    activity_date: DateType


@router.post("/manual")
def sync_activity(
    data: ActivitySyncCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    estimated_calories = round(
        data.steps * 0.04, 2
    )

    workout = Workout(
        user_id=user.id,
        workout_name=f"{data.source} Activity",
        category="Walking",
        duration=max(1, data.duration_minutes),
        calories_burned=estimated_calories,
        workout_date=data.activity_date
    )

    db.add(workout)
    db.commit()
    db.refresh(workout)

    return {
        "message": "Manual activity imported successfully",
        "source_label": data.source,
        "steps": data.steps,
        "estimated_calories": estimated_calories,
        "workout_id": workout.id
    }

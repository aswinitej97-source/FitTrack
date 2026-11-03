
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Workout, User
from schemas import ProgressResponse
from auth import get_current_user

router = APIRouter(prefix="/progress", tags=["Daily Progress"])


@router.get("/daily", response_model=ProgressResponse)
def daily_progress(
    target_date: date | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    selected_date = target_date or date.today()

    total_workouts, total_calories = db.query(
        func.count(Workout.id),
        func.coalesce(func.sum(Workout.calories_burned), 0)
    ).filter(
        Workout.user_id == user.id,
        Workout.workout_date == selected_date
    ).one()

    return {
        "date": selected_date,
        "total_workouts": total_workouts,
        "total_calories": float(total_calories)
    }


from datetime import date, timedelta
from calendar import monthrange

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Workout
from routers.users import get_current_user

router = APIRouter(
    prefix="/progress-comparison",
    tags=["Progress Comparison"]
)


def get_stats(db, user_id, start_date, end_date):
    count, duration, calories = (
        db.query(
            func.count(Workout.id),
            func.coalesce(func.sum(Workout.duration), 0),
            func.coalesce(func.sum(Workout.calories_burned), 0)
        )
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= end_date
        )
        .one()
    )

    return {
        "total_workouts": count,
        "total_duration": duration,
        "total_calories": round(float(calories), 2)
    }


def compare_periods(current, previous):
    result = {}

    for key in current:
        old = previous[key]
        new = current[key]

        if old == 0:
            change = 100.0 if new > 0 else 0.0
        else:
            change = round(((new - old) / old) * 100, 2)

        result[key] = {
            "current": new,
            "previous": old,
            "change_percentage": change
        }

    return result


@router.get("/weekly")
def weekly_comparison(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()
    start = today - timedelta(days=today.weekday())
    previous_start = start - timedelta(days=7)

    current = get_stats(db, current_user.id, start, today)
    previous = get_stats(
        db, current_user.id,
        previous_start, start - timedelta(days=1)
    )

    return compare_periods(current, previous)


@router.get("/monthly")
def monthly_comparison(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()
    start = today.replace(day=1)
    previous_end = start - timedelta(days=1)
    previous_start = previous_end.replace(day=1)

    current = get_stats(db, current_user.id, start, today)
    previous = get_stats(
        db, current_user.id,
        previous_start, previous_end
    )

    return compare_periods(current, previous)

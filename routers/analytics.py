
from datetime import date, timedelta
from calendar import monthrange

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Workout, User
from auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Reports & Analytics"])


def get_summary(db, user_id, start_date, end_date):
    result = db.query(
        func.count(Workout.id),
        func.coalesce(func.sum(Workout.calories_burned), 0),
        func.coalesce(func.sum(Workout.duration), 0)
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= end_date
    ).one()

    return {
        "total_workouts": result[0],
        "total_calories": float(result[1]),
        "total_duration": int(result[2])
    }


# WEEKLY REPORT
@router.get("/weekly")
def weekly_report(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    today = date.today()
    start_date = today - timedelta(days=6)

    summary = get_summary(db, user.id, start_date, today)

    return {
        "start_date": start_date,
        "end_date": today,
        **summary
    }


# MONTHLY REPORT
@router.get("/monthly")
def monthly_report(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    today = date.today()
    start_date = today.replace(day=1)
    last_day = monthrange(today.year, today.month)[1]
    end_date = today.replace(day=last_day)

    summary = get_summary(db, user.id, start_date, end_date)

    return {
        "month": today.strftime("%B %Y"),
        **summary
    }


# CALORIES TRACKING
@router.get("/calories")
def calories_tracking(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    results = db.query(
        Workout.workout_date,
        func.sum(Workout.calories_burned)
    ).filter(
        Workout.user_id == user.id
    ).group_by(
        Workout.workout_date
    ).order_by(
        Workout.workout_date
    ).all()

    return [
        {
            "date": str(workout_date),
            "calories": float(calories)
        }
        for workout_date, calories in results
    ]

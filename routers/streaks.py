
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Workout, Streak
from routers.users import get_current_user

router = APIRouter(
    prefix="/streaks",
    tags=["Streak Tracking"]
)


@router.get("/me")
def get_my_streak(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    workout_dates = [
        row[0] for row in (
            db.query(Workout.workout_date)
            .filter(Workout.user_id == current_user.id)
            .distinct()
            .order_by(Workout.workout_date.desc())
            .all()
        )
        if row[0] <= date.today()
    ]

    today = date.today()
    current_streak = 0
    longest_streak = 0
    running_streak = 0
    previous_date = None

    for workout_date in workout_dates:
        if previous_date is None:
            running_streak = 1
        elif previous_date - workout_date == timedelta(days=1):
            running_streak += 1
        else:
            running_streak = 1

        longest_streak = max(longest_streak, running_streak)
        previous_date = workout_date

    if workout_dates and workout_dates[0] >= today - timedelta(days=1):
        expected_date = workout_dates[0]

        for workout_date in workout_dates:
            if workout_date != expected_date:
                break
            current_streak += 1
            expected_date -= timedelta(days=1)

    streak = db.query(Streak).filter(
        Streak.user_id == current_user.id
    ).first()

    if not streak:
        streak = Streak(user_id=current_user.id)
        db.add(streak)

    streak.current_streak = current_streak
    streak.longest_streak = max(
        streak.longest_streak or 0,
        longest_streak
    )
    streak.last_workout_date = (
        workout_dates[0] if workout_dates else None
    )

    db.commit()
    db.refresh(streak)

    return {
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "last_workout_date": streak.last_workout_date,
        "status": "Active" if current_streak > 0 else "Inactive"
    }

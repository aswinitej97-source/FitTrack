
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Workout, WorkoutPlan, Goal, UserBadge
from routers.users import get_current_user
from routers.streaks import get_my_streak

router = APIRouter(
    prefix="/personalized-dashboard",
    tags=["Personalized Dashboard"]
)


@router.get("/")
def personalized_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user.id
    today = date.today()

    # Daily workout summary
    total_workouts, total_duration, total_calories = (
        db.query(
            func.count(Workout.id),
            func.coalesce(func.sum(Workout.duration), 0),
            func.coalesce(func.sum(Workout.calories_burned), 0)
        )
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date == today
        )
        .one()
    )

    daily_summary = {
        "date": today.isoformat(),
        "total_workouts": total_workouts,
        "total_duration": total_duration,
        "calories_burned": round(float(total_calories), 2)
    }

    # Upcoming scheduled workouts
    upcoming_plans = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.user_id == user_id,
            WorkoutPlan.scheduled_date >= today
        )
        .order_by(WorkoutPlan.scheduled_date)
        .limit(5)
        .all()
    )

    upcoming_workouts = [
        {
            "id": plan.id,
            "title": plan.title,
            "description": plan.description,
            "scheduled_date": plan.scheduled_date.isoformat()
        }
        for plan in upcoming_plans
    ]

    # Goal progress
    goals = db.query(Goal).filter(
        Goal.user_id == user_id
    ).all()

    goal_progress = [
        {
            "id": goal.id,
            "goal_type": goal.goal_type,
            "target_value": goal.target_value,
            "current_value": goal.current_value,
            "progress_percentage": round(
                min(
                    (goal.current_value / goal.target_value) * 100,
                    100
                ), 2
            ) if goal.target_value > 0 else 0
        }
        for goal in goals
    ]

    # Streak status
    streak_status = get_my_streak(
        db=db,
        current_user=current_user
    )

    # Achievement count
    total_badges = db.query(func.count(UserBadge.id)).filter(
        UserBadge.user_id == user_id
    ).scalar() or 0

    return {
        "username": current_user.username,
        "daily_summary": daily_summary,
        "upcoming_workouts": upcoming_workouts,
        "goal_progress": goal_progress,
        "streak_status": streak_status,
        "total_badges": total_badges
    }

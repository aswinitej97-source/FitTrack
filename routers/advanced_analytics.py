
from datetime import date, timedelta
from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, Workout, Goal
from auth import get_current_user

router = APIRouter(
    prefix="/advanced-analytics",
    tags=["Advanced Analytics"]
)


@router.get("/dashboard")
def advanced_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    today = date.today()
    month_start = today - timedelta(days=29)
    week_start = today - timedelta(days=6)

    workouts = db.query(Workout).filter(
        Workout.user_id == user.id,
        Workout.workout_date >= month_start,
        Workout.workout_date <= today
    ).all()

    goals = db.query(Goal).filter(
        Goal.user_id == user.id
    ).all()

    weekly_workouts = [
        w for w in workouts
        if w.workout_date >= week_start
    ]

    daily_counts = defaultdict(int)
    daily_calories = defaultdict(float)

    for workout in workouts:
        key = workout.workout_date.isoformat()
        daily_counts[key] += 1
        daily_calories[key] += workout.calories_burned or 0

    weekly_trend = []
    monthly_trend = []

    for days_ago in range(6, -1, -1):
        day = today - timedelta(days=days_ago)
        key = day.isoformat()
        weekly_trend.append({
            "date": key,
            "workouts": daily_counts[key],
            "calories": round(daily_calories[key], 2)
        })

    for days_ago in range(29, -1, -1):
        day = today - timedelta(days=days_ago)
        key = day.isoformat()
        monthly_trend.append({
            "date": key,
            "workouts": daily_counts[key],
            "calories": round(daily_calories[key], 2)
        })

    completed_goals = sum(
        1 for goal in goals
        if goal.current_value >= goal.target_value
    )

    goal_completion_rate = (
        round(completed_goals / len(goals) * 100, 2)
        if goals else 0
    )

    active_days = len({
        w.workout_date for w in workouts
    })

    consistency_rate = round(
        active_days / 30 * 100, 2
    )

    total_calories = sum(
        w.calories_burned or 0 for w in workouts
    )

    total_duration = sum(
        w.duration or 0 for w in workouts
    )

    insights = []

    if not workouts:
        insights.append(
            "Start logging workouts to unlock performance insights."
        )
    elif consistency_rate >= 70:
        insights.append(
            "Excellent workout consistency over the last 30 days!"
        )
    else:
        insights.append(
            "Try exercising regularly to improve your consistency."
        )

    if goals and goal_completion_rate == 100:
        insights.append(
            "Congratulations! All your goals are completed."
        )

    return {
        "user_id": user.id,
        "period": "Last 30 days",
        "total_workouts": len(workouts),
        "weekly_workouts": len(weekly_workouts),
        "total_calories_burned": round(total_calories, 2),
        "total_duration_minutes": total_duration,
        "active_days": active_days,
        "workout_consistency_percentage": consistency_rate,
        "total_goals": len(goals),
        "completed_goals": completed_goals,
        "goal_completion_rate": goal_completion_rate,
        "weekly_trend": weekly_trend,
        "monthly_trend": monthly_trend,
        "performance_insights": insights
    }

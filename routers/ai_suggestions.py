
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, Workout, Goal, Streak
from auth import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI Workout Suggestions"]
)


WORKOUT_LIBRARY = {
    "weight_loss": [
        {
            "name": "Brisk Walking",
            "category": "Cardio",
            "duration": 30,
            "difficulty": "Beginner"
        },
        {
            "name": "HIIT Workout",
            "category": "Cardio",
            "duration": 20,
            "difficulty": "Intermediate"
        }
    ],
    "muscle_gain": [
        {
            "name": "Strength Training",
            "category": "Strength",
            "duration": 40,
            "difficulty": "Intermediate"
        },
        {
            "name": "Bodyweight Exercises",
            "category": "Strength",
            "duration": 25,
            "difficulty": "Beginner"
        }
    ],
    "general_fitness": [
        {
            "name": "Full Body Workout",
            "category": "Strength",
            "duration": 30,
            "difficulty": "Beginner"
        },
        {
            "name": "Yoga and Stretching",
            "category": "Yoga",
            "duration": 20,
            "difficulty": "Beginner"
        }
    ]
}


@router.get("/recommendations")
def get_workout_recommendations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    workouts = db.query(Workout).filter(
        Workout.user_id == user.id
    ).order_by(
        Workout.workout_date.desc()
    ).limit(10).all()

    goals = db.query(Goal).filter(
        Goal.user_id == user.id
    ).all()

    streak = db.query(Streak).filter(
        Streak.user_id == user.id
    ).first()

    goal_types = [
        goal.goal_type.lower().replace(" ", "_")
        for goal in goals
    ]

    if any(
        goal in ("weight_loss", "fat_loss")
        for goal in goal_types
    ):
        selected_goal = "weight_loss"

    elif any(
        goal in ("muscle_gain", "strength")
        for goal in goal_types
    ):
        selected_goal = "muscle_gain"

    else:
        selected_goal = "general_fitness"

    recommendations = [
        item.copy()
        for item in WORKOUT_LIBRARY[selected_goal]
    ]

    average_duration = (
        sum(w.duration for w in workouts) / len(workouts)
        if workouts else 0
    )

    current_streak = (
        streak.current_streak if streak else 0
    )

    for workout in recommendations:
        if average_duration and average_duration < 20:
            workout["duration"] = min(
                workout["duration"], 20
            )

        workout["reason"] = (
            f"Recommended based on your "
            f"{selected_goal.replace('_', ' ')} goal "
            f"and workout history."
        )

    return {
        "user_id": user.id,
        "goal": selected_goal,
        "recent_workouts": len(workouts),
        "average_duration": round(average_duration, 2),
        "current_streak": current_streak,
        "recommendations": recommendations
    }

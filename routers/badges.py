
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Badge, UserBadge, Workout, Goal
from routers.users import get_current_user
from routers.streaks import get_my_streak

router = APIRouter(
    prefix="/badges",
    tags=["Achievement Badges"]
)

BADGE_RULES = [
    ("First Workout", "Complete your first workout", "medal"),
    ("Workout Champion", "Complete 10 workouts", "trophy"),
    ("Fitness Master", "Complete 50 workouts", "award"),
    ("3 Day Streak", "Maintain a 3-day streak", "flame"),
    ("7 Day Streak", "Maintain a 7-day streak", "zap"),
    ("Goal Achiever", "Complete your first goal", "target"),
]


@router.get("/")
def get_all_badges(db: Session = Depends(get_db)):
    return db.query(Badge).order_by(Badge.id).all()


@router.post("/check")
def check_achievements(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    for name, description, icon in BADGE_RULES:
        badge = db.query(Badge).filter(
            Badge.name == name
        ).first()

        if not badge:
            badge = Badge(
                name=name,
                description=description,
                icon=icon
            )
            db.add(badge)

    db.commit()

    workout_count = db.query(func.count(Workout.id)).filter(
        Workout.user_id == current_user.id
    ).scalar() or 0

    completed_goals = db.query(func.count(Goal.id)).filter(
        Goal.user_id == current_user.id,
        Goal.current_value >= Goal.target_value,
        Goal.target_value > 0
    ).scalar() or 0

    streak_info = get_my_streak(
        db=db,
        current_user=current_user
    )
    longest_streak = streak_info["longest_streak"]

    earned_names = []

    if workout_count >= 1:
        earned_names.append("First Workout")
    if workout_count >= 10:
        earned_names.append("Workout Champion")
    if workout_count >= 50:
        earned_names.append("Fitness Master")
    if longest_streak >= 3:
        earned_names.append("3 Day Streak")
    if longest_streak >= 7:
        earned_names.append("7 Day Streak")
    if completed_goals >= 1:
        earned_names.append("Goal Achiever")

    new_badges = []

    for name in earned_names:
        badge = db.query(Badge).filter(
            Badge.name == name
        ).first()

        existing = db.query(UserBadge).filter(
            UserBadge.user_id == current_user.id,
            UserBadge.badge_id == badge.id
        ).first()

        if not existing:
            db.add(UserBadge(
                user_id=current_user.id,
                badge_id=badge.id
            ))
            new_badges.append(name)

    db.commit()

    return {
        "message": "Achievements checked successfully",
        "new_badges": new_badges,
        "total_eligible_badges": len(earned_names)
    }


@router.get("/my-badges")
def get_my_badges(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(UserBadge).filter(
        UserBadge.user_id == current_user.id
    ).all()

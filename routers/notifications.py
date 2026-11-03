
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Notification, Workout, Goal, User
from schemas import NotificationResponse
from auth import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# GET USER NOTIFICATIONS
@router.get("/", response_model=list[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Notification).filter(
        Notification.user_id == user.id
    ).order_by(Notification.created_at.desc()).all()


# CREATE WORKOUT REMINDER
@router.post("/reminder")
def create_reminder(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    today = date.today()

    workout_exists = db.query(Workout).filter(
        Workout.user_id == user.id,
        Workout.workout_date == today
    ).first()

    if workout_exists:
        return {"message": "Today's workout already completed"}

    reminder = Notification(
        user_id=user.id,
        title="Daily Workout Reminder",
        message="Don't forget to complete your workout today!"
    )

    db.add(reminder)
    db.commit()

    return {"message": "Workout reminder created"}


# CREATE GOAL PROGRESS ALERTS
@router.post("/goal-alerts")
def goal_alerts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    goals = db.query(Goal).filter(
        Goal.user_id == user.id
    ).all()

    count = 0

    for goal in goals:
        if goal.current_value >= goal.target_value:
            notification = Notification(
                user_id=user.id,
                title="Goal Achieved!",
                message=f"You achieved your {goal.goal_type} goal!"
            )
            db.add(notification)
            count += 1

    db.commit()

    return {"message": f"{count} goal alerts created"}


# MARK NOTIFICATION AS READ
@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True
    db.commit()

    return {"message": "Notification marked as read"}

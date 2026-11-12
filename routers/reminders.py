
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Reminder, User
from schemas import ReminderCreate, ReminderResponse
from auth import get_current_user

router = APIRouter(
    prefix="/reminders",
    tags=["Reminders & Alerts"]
)


@router.post("/", response_model=ReminderResponse, status_code=201)
def create_reminder(
    data: ReminderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    reminder = Reminder(
        user_id=user.id,
        reminder_type=data.reminder_type,
        title=data.title,
        reminder_time=data.reminder_time.strftime("%H:%M"),
        is_active=data.is_active
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return reminder


@router.get("/", response_model=list[ReminderResponse])
def get_reminders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Reminder).filter(
        Reminder.user_id == user.id
    ).order_by(Reminder.id.desc()).all()


@router.get("/alerts")
def get_due_alerts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    current_time = now.strftime("%H:%M")

    reminders = db.query(Reminder).filter(
        Reminder.user_id == user.id,
        Reminder.is_active.is_(True),
        Reminder.reminder_time <= current_time
    ).all()

    return {
        "date": now.date().isoformat(),
        "timezone": "UTC",
        "total_alerts": len(reminders),
        "alerts": [
            {
                "id": r.id,
                "type": r.reminder_type,
                "title": r.title,
                "reminder_time": r.reminder_time
            }
            for r in reminders
        ]
    }


@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    data: ReminderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == user.id
    ).first()

    if not reminder:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found"
        )

    reminder.reminder_type = data.reminder_type
    reminder.title = data.title
    reminder.reminder_time = data.reminder_time.strftime("%H:%M")
    reminder.is_active = data.is_active

    db.commit()
    db.refresh(reminder)

    return reminder


@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == user.id
    ).first()

    if not reminder:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found"
        )

    db.delete(reminder)
    db.commit()

    return {"message": "Reminder deleted successfully"}


from datetime import date as DateType

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import WaterTracking, User
from schemas import WaterCreate, WaterResponse
from auth import get_current_user

router = APIRouter(
    prefix="/water",
    tags=["Water Intake Tracker"]
)

DAILY_GOAL_ML = 2000


# Add Water Intake
@router.post("/", response_model=WaterResponse, status_code=201)
def add_water(
    data: WaterCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    water = WaterTracking(
        user_id=user.id,
        quantity=data.quantity,
        date=data.date or DateType.today()
    )

    db.add(water)
    db.commit()
    db.refresh(water)

    return water


# View Water History
@router.get("/", response_model=list[WaterResponse])
def get_water_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(WaterTracking).filter(
        WaterTracking.user_id == user.id
    ).order_by(
        WaterTracking.date.desc(),
        WaterTracking.id.desc()
    ).all()


# Daily Water Summary
@router.get("/daily-summary")
def daily_water_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    today = DateType.today()

    total = db.query(
        func.coalesce(func.sum(WaterTracking.quantity), 0)
    ).filter(
        WaterTracking.user_id == user.id,
        WaterTracking.date == today
    ).scalar()

    total = int(total)

    return {
        "date": today.isoformat(),
        "total_ml": total,
        "total_liters": round(total / 1000, 2),
        "daily_goal_ml": DAILY_GOAL_ML,
        "remaining_ml": max(0, DAILY_GOAL_ML - total),
        "progress_percentage": round(
            min(100, total / DAILY_GOAL_ML * 100), 2
        ),
        "goal_completed": total >= DAILY_GOAL_ML
    }


# Delete Water Entry
@router.delete("/{water_id}")
def delete_water(
    water_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    water = db.query(WaterTracking).filter(
        WaterTracking.id == water_id,
        WaterTracking.user_id == user.id
    ).first()

    if not water:
        raise HTTPException(
            status_code=404,
            detail="Water entry not found"
        )

    db.delete(water)
    db.commit()

    return {"message": "Water entry deleted successfully"}

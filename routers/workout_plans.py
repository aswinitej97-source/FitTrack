
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import WorkoutPlan
from schemas import WorkoutPlanCreate, WorkoutPlanResponse

router = APIRouter(
    prefix="/workout-plans",
    tags=["Workout Plans"]
)


# Replace this import only if your existing auth
# dependency has a different name or location.
from routers.users import get_current_user


@router.post(
    "/",
    response_model=WorkoutPlanResponse,
    status_code=status.HTTP_201_CREATED
)
def create_workout_plan(
    data: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if data.scheduled_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Cannot schedule workouts in the past"
        )

    plan = WorkoutPlan(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        scheduled_date=data.scheduled_date
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get(
    "/",
    response_model=list[WorkoutPlanResponse]
)
def get_workout_plans(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(WorkoutPlan)
        .filter(WorkoutPlan.user_id == current_user.id)
        .order_by(WorkoutPlan.scheduled_date)
        .all()
    )


@router.get(
    "/upcoming",
    response_model=list[WorkoutPlanResponse]
)
def get_upcoming_workouts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.user_id == current_user.id,
            WorkoutPlan.scheduled_date >= date.today()
        )
        .order_by(WorkoutPlan.scheduled_date)
        .all()
    )

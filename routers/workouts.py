
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Workout, User
from schemas import WorkoutCreate, WorkoutUpdate, WorkoutResponse
from auth import get_current_user

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.post("/", response_model=WorkoutResponse, status_code=201)
def add_workout(
    data: WorkoutCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    workout = Workout(user_id=user.id, **data.model_dump())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.get("/", response_model=list[WorkoutResponse])
def get_workouts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Workout).filter(
        Workout.user_id == user.id
    ).all()


@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: int,
    data: WorkoutUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == user.id
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(workout, key, value)

    db.commit()
    db.refresh(workout)
    return workout


@router.delete("/{workout_id}")
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == user.id
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    db.delete(workout)
    db.commit()
    return {"message": "Workout deleted successfully"}

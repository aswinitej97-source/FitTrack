
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import Exercise
from schemas import ExerciseResponse

router = APIRouter(
    prefix="/exercises",
    tags=["Exercise Library"]
)


@router.get("/", response_model=list[ExerciseResponse])
def get_exercises(
    search: str | None = Query(default=None, max_length=100),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Exercise)

    if search:
        query = query.filter(
            or_(
                Exercise.name.ilike(f"%{search}%"),
                Exercise.description.ilike(f"%{search}%")
            )
        )

    if category:
        query = query.filter(Exercise.category == category)

    return query.order_by(Exercise.name).all()


@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db)
):
    from fastapi import HTTPException

    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id
    ).first()

    if not exercise:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found"
        )

    return exercise


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Goal, User
from schemas import GoalCreate, GoalUpdate, GoalResponse
from auth import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])


# CREATE GOAL
@router.post("/", response_model=GoalResponse, status_code=201)
def create_goal(
    data: GoalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    goal = Goal(user_id=user.id, **data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


# GET USER GOALS
@router.get("/", response_model=list[GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Goal).filter(
        Goal.user_id == user.id
    ).all()


# UPDATE GOAL PROGRESS
@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    data: GoalUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal.current_value = data.current_value
    db.commit()
    db.refresh(goal)
    return goal


# DELETE GOAL
@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()

    return {"message": "Goal deleted successfully"}

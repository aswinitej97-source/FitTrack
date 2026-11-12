
from datetime import datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Meal, User
from schemas import MealCreate, MealResponse
from auth import get_current_user

router = APIRouter(prefix="/meals", tags=["Nutrition & Meals"])


# Add Meal
@router.post("/", response_model=MealResponse, status_code=201)
def add_meal(
    data: MealCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    meal = Meal(user_id=user.id, **data.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


# View All Meals
@router.get("/", response_model=list[MealResponse])
def get_meals(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Meal).filter(
        Meal.user_id == user.id
    ).order_by(Meal.created_at.desc()).all()


# Daily Nutrition Summary
@router.get("/daily-summary")
def daily_nutrition_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    today = datetime.utcnow().date()
    start = datetime.combine(today, time.min)
    end = start + timedelta(days=1)

    meals = db.query(Meal).filter(
        Meal.user_id == user.id,
        Meal.created_at >= start,
        Meal.created_at < end
    ).all()

    return {
        "date": today.isoformat(),
        "total_meals": len(meals),
        "total_calories": round(sum(m.calories for m in meals), 2),
        "total_protein": round(sum(m.protein for m in meals), 2),
        "total_carbs": round(sum(m.carbs for m in meals), 2),
        "total_fats": round(sum(m.fats for m in meals), 2)
    }


# Delete Meal
@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    meal = db.query(Meal).filter(
        Meal.id == meal_id,
        Meal.user_id == user.id
    ).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found"
        )

    db.delete(meal)
    db.commit()

    return {"message": "Meal deleted successfully"}

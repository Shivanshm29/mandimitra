from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.farmer_repo import FarmerRepository
from app.schemas.farmer_profile import FarmerProfileUpdate
from app.models.farmer_profile import FarmerProfile

class FarmerService:
    @staticmethod
    def get_profile_by_user_id(db: Session, user_id: int) -> FarmerProfile:
        profile = FarmerRepository.get_by_user_id(db, user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farmer profile not found for this account."
            )
        return profile

    @staticmethod
    def update_profile(db: Session, user_id: int, data: FarmerProfileUpdate) -> FarmerProfile:
        profile = FarmerRepository.get_by_user_id(db, user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farmer profile not found for this account."
            )
        
        update_dict = data.model_dump(exclude_unset=True)
        updated = FarmerRepository.update(db, profile, update_dict)
        db.commit()
        db.refresh(updated)
        return updated


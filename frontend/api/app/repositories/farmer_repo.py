from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.farmer_profile import FarmerProfile

class FarmerRepository:
    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> Optional[FarmerProfile]:
        return db.scalar(select(FarmerProfile).where(FarmerProfile.user_id == user_id))

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        display_name: str,
        district: str,
        village: str,
        state: str = "Maharashtra",
        locality: Optional[str] = None,
        phone_number: Optional[str] = None,
        preferred_language: str = "mr-IN",
        commonly_grown_crops: Optional[Any] = None,
        frequently_sold_commodities: Optional[Any] = None,
    ) -> FarmerProfile:
        profile = FarmerProfile(
            user_id=user_id,
            display_name=display_name,
            district=district,
            village=village,
            state=state,
            locality=locality,
            phone_number=phone_number,
            preferred_language=preferred_language,
            commonly_grown_crops=commonly_grown_crops or [],
            frequently_sold_commodities=frequently_sold_commodities or []
        )
        db.add(profile)
        db.flush()
        return profile

    @staticmethod
    def update(db: Session, profile: FarmerProfile, update_data: Dict[str, Any]) -> FarmerProfile:
        for key, value in update_data.items():
            if value is not None and hasattr(profile, key):
                setattr(profile, key, value)
        db.flush()
        return profile


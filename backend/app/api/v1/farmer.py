from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.farmer_profile import FarmerProfileRead, FarmerProfileUpdate
from app.services.farmer_service import FarmerService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/farmer", tags=["Farmer Profile"])

@router.get("/profile", response_model=FarmerProfileRead)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the authenticated farmer's profile."""
    profile = FarmerService.get_profile_by_user_id(db, current_user.id)
    return FarmerProfileRead.model_validate(profile)

@router.put("/profile", response_model=FarmerProfileRead)
def update_profile(
    update_data: FarmerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update farmer demographic, geographic or language preferences."""
    profile = FarmerService.update_profile(db, current_user.id, update_data)
    return FarmerProfileRead.model_validate(profile)


from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.farmer_repo import FarmerRepository
from app.schemas.selling_lot import SellingLotCreate, SellingLotRead, SellingLotUpdate
from app.services.selling_lot_service import SellingLotService

router = APIRouter(prefix="/lots", tags=["Farmer Selling Lots"])

@router.get("", response_model=List[SellingLotRead])
def get_farmer_lots(
    status_filter: Optional[str] = Query(None, alias="status", description="AVAILABLE, PARTIALLY_SOLD, SOLD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all produce lots maintained by the authenticated farmer."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        return []
    return SellingLotService.get_lots(db, profile.id, status_filter)

@router.post("", response_model=SellingLotRead, status_code=status.HTTP_201_CREATED)
def create_selling_lot(
    data: SellingLotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new harvest produce lot available for sale."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        profile = FarmerRepository.create(
            db=db,
            user_id=current_user.id,
            display_name=current_user.username,
            district="Maharashtra",
            village="Default"
        )
    return SellingLotService.create_lot(db, profile.id, data)

@router.get("/{lot_id}", response_model=SellingLotRead)
def get_lot_details(
    lot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details for a specific produce lot."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    farmer_id = profile.id if profile else 0
    return SellingLotService.get_lot_by_id(db, farmer_id, lot_id)

@router.put("/{lot_id}", response_model=SellingLotRead)
def update_selling_lot(
    lot_id: int,
    data: SellingLotUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update lot details or quantity."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    farmer_id = profile.id if profile else 0
    return SellingLotService.update_lot(db, farmer_id, lot_id, data)

@router.delete("/{lot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_selling_lot(
    lot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a selling lot (allowed only if no sales have occurred from this lot)."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    farmer_id = profile.id if profile else 0
    SellingLotService.delete_lot(db, farmer_id, lot_id)
    return None


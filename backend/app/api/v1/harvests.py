from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.repositories.farmer_repo import FarmerRepository
from app.schemas.harvest import (
    HarvestRecordCreate,
    HarvestRecordUpdate,
    HarvestRecordRead,
    CreateSellingLotFromHarvest,
)
from app.schemas.selling_lot import SellingLotRead
from app.services.harvest_service import HarvestService

router = APIRouter(prefix="/harvests", tags=["Harvest Records"])

def get_farmer_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FarmerProfile:
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer profile not initialized."
        )
    return profile

@router.get("", response_model=List[HarvestRecordRead])
def get_harvests(
    profile: FarmerProfile = Depends(get_farmer_profile),
    db: Session = Depends(get_db)
):
    """Retrieve all harvest records for the authenticated farmer."""
    return HarvestService.get_harvests(db, profile.id)

@router.post("", response_model=HarvestRecordRead, status_code=status.HTTP_201_CREATED)
def create_harvest(
    data: HarvestRecordCreate,
    profile: FarmerProfile = Depends(get_farmer_profile),
    db: Session = Depends(get_db)
):
    """Register a new harvest record."""
    return HarvestService.create_harvest(db, profile.id, data)

@router.get("/{harvest_id}", response_model=HarvestRecordRead)
def get_harvest(
    harvest_id: int,
    profile: FarmerProfile = Depends(get_farmer_profile),
    db: Session = Depends(get_db)
):
    """Retrieve a specific harvest record."""
    return HarvestService.get_harvest_by_id(db, profile.id, harvest_id)

@router.put("/{harvest_id}", response_model=HarvestRecordRead)
def update_harvest(
    harvest_id: int,
    data: HarvestRecordUpdate,
    profile: FarmerProfile = Depends(get_farmer_profile),
    db: Session = Depends(get_db)
):
    """Update an existing harvest record."""
    return HarvestService.update_harvest(db, profile.id, harvest_id, data)

@router.delete("/{harvest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_harvest(
    harvest_id: int,
    profile: FarmerProfile = Depends(get_farmer_profile),
    db: Session = Depends(get_db)
):
    """Delete a harvest record if no selling lots depend on it."""
    HarvestService.delete_harvest(db, profile.id, harvest_id)

@router.post("/{harvest_id}/create-lot", response_model=SellingLotRead, status_code=status.HTTP_201_CREATED)
def create_selling_lot_from_harvest(
    harvest_id: int,
    data: CreateSellingLotFromHarvest,
    profile: FarmerProfile = Depends(get_farmer_profile),
    db: Session = Depends(get_db)
):
    """Create a selling lot directly from a harvest record, automatically deducting remaining harvested stock."""
    return HarvestService.create_selling_lot_from_harvest(db, profile.id, harvest_id, data)

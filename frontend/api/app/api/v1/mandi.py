from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User
from app.repositories.farmer_repo import FarmerRepository
from app.schemas.mandi import (
    MarketPriceRead,
    RecommendationRequest,
    RecommendationResponse,
    PriceAlertCreate,
    PriceAlertRead,
)
from app.services.mandi_service import MandiService

router = APIRouter(prefix="/mandi", tags=["Mandi Intelligence"])

@router.get("/prices", response_model=List[MarketPriceRead])
def get_mandi_prices(
    commodity: Optional[str] = Query(None, description="Filter by crop/commodity"),
    district: Optional[str] = Query(None, description="Filter by district"),
    market_name: Optional[str] = Query(None, description="Filter by APMC market"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Fetch genuine government-reported mandi prices."""
    return MandiService.get_prices(db, commodity, district, market_name, limit)

@router.get("/commodities", response_model=List[str])
def get_commodities(db: Session = Depends(get_db)):
    """List of all available commodities in reported records."""
    return MandiService.get_commodities(db)

@router.get("/markets")
def get_markets(db: Session = Depends(get_db)):
    """List of distinct APMC mandis available."""
    return MandiService.get_markets(db)

@router.post("/recommendations", response_model=RecommendationResponse)
def get_selling_recommendations(
    request: RecommendationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Compute data-driven selling recommendations across accessible mandis."""
    farmer_id = None
    if current_user:
        profile = FarmerRepository.get_by_user_id(db, current_user.id)
        if profile:
            farmer_id = profile.id
    return MandiService.get_recommendations(db, request, farmer_id=farmer_id)

@router.get("/alerts", response_model=List[PriceAlertRead])
def get_price_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch all active and past price alerts defined by farmer."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        return []
    return MandiService.get_price_alerts(db, profile.id)

@router.post("/alerts", response_model=PriceAlertRead, status_code=status.HTTP_201_CREATED)
def create_price_alert(
    data: PriceAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set a target mandi price alert for a commodity."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        profile = FarmerRepository.create(
            db=db,
            user_id=current_user.id,
            display_name=current_user.username,
            district="Maharashtra",
            village="Default"
        )
    return MandiService.create_price_alert(db, profile.id, data)

@router.delete("/alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_price_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a price alert."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    farmer_id = profile.id if profile else 0
    success = MandiService.delete_price_alert(db, farmer_id, alert_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Price alert not found")
    return None



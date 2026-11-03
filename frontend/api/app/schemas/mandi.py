from datetime import date, datetime
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class MarketPriceRead(BaseModel):
    id: int
    state: str
    district: str
    market_name: str
    commodity: str
    variety: str
    arrival_date: date
    min_price: Decimal
    max_price: Decimal
    modal_price: Decimal
    arrivals_volume: Optional[Decimal] = None
    data_source: str
    reported_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RecommendationRequest(BaseModel):
    commodity: str = Field(..., min_length=2, description="Commodity name (e.g. Onion, Soybean)")
    quantity: Decimal = Field(..., gt=0, description="Quantity in Quintals")
    variety: Optional[str] = Field("Standard", description="Variety name")
    quality_grade: Optional[str] = Field(None, description="Quality grade, e.g. Grade A, FAQ")
    harvest_id: Optional[int] = Field(None, description="Optional HarvestRecord ID")
    lot_id: Optional[int] = Field(None, description="Optional SellingLot ID")
    farmer_district: Optional[str] = Field(None, description="Farmer district for local market matching")
    sort_by: Optional[str] = Field("price", description="Sort by: price, location, date")

class MandiRecommendationItem(BaseModel):
    market_name: str
    district: str
    min_price: Decimal
    max_price: Decimal
    modal_price: Decimal
    estimated_gross: Decimal
    min_estimated_gross: Decimal
    max_estimated_gross: Decimal
    price_difference_per_quintal: Decimal
    rank: int
    arrivals_volume: Optional[Decimal] = None
    data_source: str
    arrival_date: date
    reported_at: Optional[datetime] = None
    is_best_price: bool = False
    is_convenient_local: bool = False
    is_best_overall: bool = False
    recommendation_reason: str

class RecommendationResponse(BaseModel):
    commodity: str
    quantity: Decimal
    variety: Optional[str] = None
    quality_grade: Optional[str] = None
    farmer_district: Optional[str] = None
    harvest_id: Optional[int] = None
    lot_id: Optional[int] = None
    lot_code: Optional[str] = None
    
    best_market: str
    best_modal_price: Decimal
    highest_potential_gross: Decimal
    potential_extra_gain: Decimal
    
    best_price_market: Optional[str] = None
    convenient_market: Optional[str] = None
    best_overall_market: Optional[str] = None
    
    recommendations: List[MandiRecommendationItem]
    reasoning: str
    data_disclaimer: str = (
        "Modal price is an official APMC benchmark from AGMARKNET / MSAMB and not a guaranteed trader offer. "
        "Estimated gross realization does not include statutory deductions, which are calculated on actual sales."
    )

class PriceAlertCreate(BaseModel):
    commodity: str = Field(..., min_length=2, max_length=100)
    target_modal_price: Decimal = Field(..., gt=0, description="Target price threshold in INR")
    condition: str = Field("ABOVE", description="ABOVE or BELOW")
    market_name: Optional[str] = Field(None, max_length=150)

class PriceAlertRead(BaseModel):
    id: int
    farmer_id: int
    commodity: str
    target_modal_price: Decimal
    condition: str
    market_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



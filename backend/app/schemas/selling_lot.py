from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class SellingLotCreate(BaseModel):
    commodity: str = Field(..., min_length=2, max_length=100)
    variety: Optional[str] = Field("Standard", max_length=100)
    total_quantity: Decimal = Field(..., gt=0, description="Total produce quantity (e.g. in Quintals)")
    quantity_unit: str = Field("Quintal", max_length=20)
    quality_grade: Optional[str] = Field(None, max_length=50)
    harvest_date: Optional[date] = None
    expected_rate: Optional[Decimal] = Field(None, gt=0, description="Expected minimum price per unit")
    notes: Optional[str] = None

class SellingLotUpdate(BaseModel):
    commodity: Optional[str] = None
    variety: Optional[str] = None
    total_quantity: Optional[Decimal] = Field(None, gt=0)
    quantity_unit: Optional[str] = None
    quality_grade: Optional[str] = None
    harvest_date: Optional[date] = None
    expected_rate: Optional[Decimal] = None
    notes: Optional[str] = None

class SellingLotRead(BaseModel):
    id: int
    farmer_id: int
    lot_code: str
    commodity: str
    variety: str
    total_quantity: Decimal
    available_quantity: Decimal
    sold_quantity: Decimal
    quantity_unit: str
    quality_grade: Optional[str] = None
    status: str
    harvest_date: Optional[date] = None
    expected_rate: Optional[Decimal] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class HarvestRecordCreate(BaseModel):
    commodity: str = Field(..., min_length=2, max_length=100)
    variety: Optional[str] = Field("Standard", max_length=100)
    harvest_date: date
    harvested_quantity: Decimal = Field(..., gt=0, description="Total harvested produce quantity")
    quantity_unit: str = Field("Quintal", max_length=20)
    quality_grade: Optional[str] = Field(None, max_length=50)
    storage_location: Optional[str] = Field(None, max_length=150)
    notes: Optional[str] = None

class HarvestRecordUpdate(BaseModel):
    commodity: Optional[str] = None
    variety: Optional[str] = None
    harvest_date: Optional[date] = None
    harvested_quantity: Optional[Decimal] = Field(None, gt=0)
    quantity_unit: Optional[str] = None
    quality_grade: Optional[str] = None
    storage_location: Optional[str] = None
    notes: Optional[str] = None

class CreateSellingLotFromHarvest(BaseModel):
    lot_quantity: Decimal = Field(..., gt=0, description="Quantity to allocate to this selling lot")
    expected_rate: Optional[Decimal] = Field(None, gt=0)
    notes: Optional[str] = None

class HarvestRecordRead(BaseModel):
    id: int
    farmer_id: int
    commodity: str
    variety: str
    harvest_date: date
    harvested_quantity: Decimal
    remaining_quantity: Decimal
    quantity_unit: str
    quality_grade: Optional[str] = None
    storage_location: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


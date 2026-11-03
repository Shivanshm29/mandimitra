from datetime import datetime
from typing import Optional, Literal, List, Any
from pydantic import BaseModel, Field, ConfigDict

SupportedLanguage = Literal["mr-IN", "hi-IN", "en-IN"]

class FarmerProfileBase(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=150, description="Farmer's full display name")
    phone_number: Optional[str] = Field(None, max_length=20, description="Optional contact phone number")
    state: str = Field("Maharashtra", max_length=100)
    district: str = Field(..., min_length=2, max_length=100, description="District name in Maharashtra")
    village: str = Field(..., min_length=2, max_length=150, description="Village or town")
    locality: Optional[str] = Field(None, max_length=255, description="Optional neighborhood or landmark")
    preferred_language: SupportedLanguage = Field("mr-IN", description="Preferred Indic language")
    commonly_grown_crops: Optional[List[Any]] = Field(default_factory=list, description="List of crops usually cultivated")
    frequently_sold_commodities: Optional[List[str]] = Field(default_factory=list, description="List of commodities frequently sold")

class FarmerProfileCreate(FarmerProfileBase):
    pass

class FarmerProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone_number: Optional[str] = Field(None, max_length=20)
    state: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, min_length=2, max_length=100)
    village: Optional[str] = Field(None, min_length=2, max_length=150)
    locality: Optional[str] = Field(None, max_length=255)
    preferred_language: Optional[SupportedLanguage] = None
    commonly_grown_crops: Optional[List[Any]] = None
    frequently_sold_commodities: Optional[List[str]] = None

class FarmerProfileRead(FarmerProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


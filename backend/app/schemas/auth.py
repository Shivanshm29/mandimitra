from typing import Optional, List, Any
from pydantic import BaseModel, Field
from app.schemas.user import UserRead
from app.schemas.farmer_profile import FarmerProfileRead, SupportedLanguage

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_\-]+$")
    password: str = Field(..., min_length=6, max_length=128)
    display_name: str = Field(..., min_length=2, max_length=150)
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    state: str = Field("Maharashtra", max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    village: str = Field(..., min_length=2, max_length=150)
    locality: Optional[str] = Field(None, max_length=255)
    preferred_language: SupportedLanguage = Field("mr-IN")
    commonly_grown_crops: Optional[List[Any]] = None
    frequently_sold_commodities: Optional[List[str]] = None

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
    profile: Optional[FarmerProfileRead] = None

class AuthMeResponse(UserRead):
    profile: Optional[FarmerProfileRead] = None


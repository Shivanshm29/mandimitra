from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, AuthMeResponse
from app.schemas.user import UserRead
from app.schemas.farmer_profile import FarmerProfileRead
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.farmer_repo import FarmerRepository

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new farmer account and associated profile."""
    user, profile, access_token = AuthService.register_farmer(db, data)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user),
        profile=FarmerProfileRead.model_validate(profile) if profile else None
    )

@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticate with username and password to obtain an access token."""
    user, access_token = AuthService.authenticate_user(db, data.username, data.password)
    profile = FarmerRepository.get_by_user_id(db, user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user),
        profile=FarmerProfileRead.model_validate(profile) if profile else None
    )

@router.get("/me", response_model=AuthMeResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch profile information for the authenticated user."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    return AuthMeResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        phone_number=current_user.phone_number,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        created_at=current_user.created_at,
        profile=FarmerProfileRead.model_validate(profile) if profile else None
    )


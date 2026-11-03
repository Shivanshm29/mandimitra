from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.user_repo import UserRepository
from app.repositories.farmer_repo import FarmerRepository
from app.schemas.auth import RegisterRequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User

class AuthService:
    @staticmethod
    def register_farmer(db: Session, data: RegisterRequest) -> tuple[User, any, str]:
        # Check username uniqueness
        existing_user = UserRepository.get_by_username(db, data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already registered."
            )

        # Check optional phone number uniqueness
        if data.phone_number:
            existing_phone = UserRepository.get_by_phone(db, data.phone_number)
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number is already associated with an account."
                )

        # Check optional email uniqueness
        if data.email:
            existing_email = UserRepository.get_by_email(db, data.email)
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email address is already associated with an account."
                )

        # Hash password and create user
        hashed = get_password_hash(data.password)
        user = UserRepository.create(
            db=db,
            username=data.username,
            hashed_password=hashed,
            email=data.email,
            phone_number=data.phone_number
        )

        # Create farmer profile
        profile = FarmerRepository.create(
            db=db,
            user_id=user.id,
            display_name=data.display_name,
            district=data.district,
            village=data.village,
            state=data.state,
            locality=data.locality,
            phone_number=data.phone_number,
            preferred_language=data.preferred_language,
            commonly_grown_crops=data.commonly_grown_crops,
            frequently_sold_commodities=data.frequently_sold_commodities
        )

        db.commit()
        db.refresh(user)
        db.refresh(profile)

        # Generate access token
        access_token = create_access_token(subject=user.id)
        return user, profile, access_token

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> tuple[User, str]:
        user = UserRepository.get_by_username(db, username)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )

        access_token = create_access_token(subject=user.id)
        return user, access_token


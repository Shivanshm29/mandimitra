import os
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import decode_access_token
from app.repositories.user_repo import UserRepository
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.repositories.farmer_repo import FarmerRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        user_id = int(payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token subject.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        # If running in serverless environment (e.g. Vercel), auto-restore user and profile from verified JWT claims
        username = payload.get("username")
        if username and os.environ.get("VERCEL"):
            from app.models.farmer_profile import FarmerProfile
            user = User(
                id=user_id,
                username=username,
                hashed_password="$2b$12$e0X4V8PzL0O3R1M5T9W2J.dummyhashforvercelephemeralstate0",
                is_active=True,
                is_superuser=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            prof = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
            if not prof:
                prof = FarmerProfile(
                    user_id=user.id,
                    display_name=payload.get("display_name", username),
                    state=payload.get("state", "Maharashtra"),
                    district=payload.get("district", "Nashik"),
                    village=payload.get("village", "Pimpalgaon Baswant"),
                    preferred_language=payload.get("preferred_language", "mr-IN"),
                    commonly_grown_crops=[{"commodity": "Onion", "variety": "Red Garwa"}]
                )
                db.add(prof)
                db.commit()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive."
        )
        
    return user

def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = int(payload["sub"])
    except ValueError:
        return None
    user = UserRepository.get_by_id(db, user_id)
    if not user or not user.is_active:
        return None
    return user

def get_current_farmer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> FarmerProfile:
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found."
        )
    return profile


from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User

class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.scalar(select(User).where(User.id == user_id))

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        return db.scalar(select(User).where(User.username == username))

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        if not email:
            return None
        return db.scalar(select(User).where(User.email == email))

    @staticmethod
    def get_by_phone(db: Session, phone: str) -> Optional[User]:
        if not phone:
            return None
        return db.scalar(select(User).where(User.phone_number == phone))

    @staticmethod
    def create(
        db: Session,
        username: str,
        hashed_password: str,
        email: Optional[str] = None,
        phone_number: Optional[str] = None,
        is_superuser: bool = False
    ) -> User:
        user = User(
            username=username,
            hashed_password=hashed_password,
            email=email,
            phone_number=phone_number,
            is_active=True,
            is_superuser=is_superuser
        )
        db.add(user)
        db.flush()
        return user


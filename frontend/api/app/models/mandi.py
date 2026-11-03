from datetime import date, datetime, timezone
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Numeric, Date, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    state: Mapped[str] = mapped_column(String(100), default="Maharashtra", index=True, nullable=False)
    district: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    market_name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    variety: Mapped[str] = mapped_column(String(100), default="Local/Standard", nullable=False)
    
    arrival_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    min_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    max_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    modal_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    arrivals_volume: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True) # in quintals or tonnes
    
    data_source: Mapped[str] = mapped_column(String(100), default="AGMARKNET / MSAMB", nullable=False)
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    market_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    target_modal_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    condition: Mapped[str] = mapped_column(String(20), default="ABOVE", nullable=False) # ABOVE, BELOW
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )



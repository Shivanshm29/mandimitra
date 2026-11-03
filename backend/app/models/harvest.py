from datetime import date, datetime, timezone
from typing import List, Optional
from decimal import Decimal
from sqlalchemy import String, Numeric, Date, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

class HarvestRecord(Base):
    __tablename__ = "harvest_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(Integer, ForeignKey("farmer_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    
    commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    variety: Mapped[str] = mapped_column(String(100), default="Standard", nullable=False)
    harvest_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    harvested_quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    remaining_quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    quantity_unit: Mapped[str] = mapped_column(String(20), default="Quintal", nullable=False)
    
    quality_grade: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    storage_location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    farmer: Mapped["FarmerProfile"] = relationship("FarmerProfile", backref="harvest_records")
    selling_lots: Mapped[List["SellingLot"]] = relationship("SellingLot", back_populates="harvest")


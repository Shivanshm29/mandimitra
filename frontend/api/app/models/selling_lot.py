from datetime import date, datetime, timezone
from typing import List, Optional
from decimal import Decimal
from sqlalchemy import String, Numeric, Date, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

class SellingLot(Base):
    __tablename__ = "selling_lots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(Integer, ForeignKey("farmer_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    harvest_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("harvest_records.id", ondelete="SET NULL"), index=True, nullable=True)
    lot_code: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # e.g. LOT-001
    
    commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    variety: Mapped[str] = mapped_column(String(100), default="Standard", nullable=False)
    quality_grade: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # e.g. Grade A, FAQ
    
    total_quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    available_quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    sold_quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    quantity_unit: Mapped[str] = mapped_column(String(20), default="Quintal", nullable=False)
    
    status: Mapped[str] = mapped_column(String(30), default="AVAILABLE", index=True, nullable=False) # AVAILABLE, PARTIALLY_SOLD, SOLD
    harvest_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    expected_rate: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
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

    sales: Mapped[List["Sale"]] = relationship("Sale", back_populates="lot")
    harvest: Mapped[Optional["HarvestRecord"]] = relationship("HarvestRecord", back_populates="selling_lots")


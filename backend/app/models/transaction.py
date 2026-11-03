from datetime import date, datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Numeric, Date, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.selling_lot import SellingLot
    from app.models.payment_allocation import PaymentAllocation

class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(Integer, ForeignKey("farmer_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    lot_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("selling_lots.id", ondelete="SET NULL"), index=True, nullable=True)
    
    trader_name: Mapped[str] = mapped_column(String(150), nullable=False)
    market_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    variety: Mapped[str] = mapped_column(String(100), default="Standard", nullable=False)
    
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    quantity_unit: Mapped[str] = mapped_column(String(20), default="Quintal", nullable=False)
    rate_per_unit: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    net_receivable: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    amount_received: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    outstanding_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    
    status: Mapped[str] = mapped_column(String(20), default="PENDING", index=True, nullable=False) # PENDING, PARTIAL, SETTLED
    sale_date: Mapped[date] = mapped_column(Date, index=True, default=date.today, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evidence_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    evidence_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # IMAGE, VIDEO, DOCUMENT
    audio_note_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
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

    lot: Mapped[Optional["SellingLot"]] = relationship("SellingLot", back_populates="sales")
    deductions: Mapped[List["SaleDeduction"]] = relationship(
        "SaleDeduction",
        back_populates="sale",
        cascade="all, delete-orphan"
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment",
        back_populates="sale"
    )
    allocations: Mapped[List["PaymentAllocation"]] = relationship(
        "PaymentAllocation",
        back_populates="sale",
        cascade="all, delete-orphan"
    )
    documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="sale"
    )

class SaleDeduction(Base):
    __tablename__ = "sale_deductions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    sale_id: Mapped[int] = mapped_column(Integer, ForeignKey("sales.id", ondelete="CASCADE"), index=True, nullable=False)
    
    deduction_type: Mapped[str] = mapped_column(String(50), nullable=False) # MANDI_CESS, WEIGHING_FEE, HAMALI, COMMISSION, OTHER
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    sale: Mapped["Sale"] = relationship("Sale", back_populates="deductions")

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(Integer, ForeignKey("farmer_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    sale_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("sales.id", ondelete="SET NULL"), index=True, nullable=True)
    
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    payment_mode: Mapped[str] = mapped_column(String(30), default="CASH", nullable=False) # CASH, UPI, CHEQUE, BANK_TRANSFER
    payment_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    reference_note: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    evidence_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    evidence_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    audio_note_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    sale: Mapped[Optional["Sale"]] = relationship("Sale", back_populates="payments")
    allocations: Mapped[List["PaymentAllocation"]] = relationship("PaymentAllocation", back_populates="payment", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(Integer, ForeignKey("farmer_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    sale_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("sales.id", ondelete="SET NULL"), index=True, nullable=True)
    
    document_type: Mapped[str] = mapped_column(String(50), default="WEIGHING_SLIP", nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ocr_extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    sale: Mapped[Optional["Sale"]] = relationship("Sale", back_populates="documents")


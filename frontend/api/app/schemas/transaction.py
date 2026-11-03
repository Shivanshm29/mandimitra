from datetime import date, datetime
from typing import List, Optional, Dict
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class DeductionCreate(BaseModel):
    deduction_type: str = Field(..., description="MANDI_CESS, WEIGHING_FEE, HAMALI, COMMISSION, OTHER")
    amount: Decimal = Field(..., ge=0, description="Deduction amount in INR")
    description: Optional[str] = None

class DeductionRead(BaseModel):
    id: int
    sale_id: int
    deduction_type: str
    amount: Decimal
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SaleCreate(BaseModel):
    trader_name: str = Field(..., min_length=2, max_length=150)
    market_name: Optional[str] = Field(None, max_length=150)
    commodity: str = Field(..., min_length=2, max_length=100)
    variety: Optional[str] = Field("Standard", max_length=100)
    lot_id: Optional[int] = Field(None, description="Associated selling lot ID")
    quantity: Decimal = Field(..., gt=0, description="Quantity in Quintals")
    quantity_unit: str = Field("Quintal", max_length=20)
    rate_per_unit: Decimal = Field(..., gt=0, description="Rate per unit in INR")
    sale_date: Optional[date] = Field(default_factory=date.today)
    deductions: Optional[List[DeductionCreate]] = Field(default_factory=list)
    initial_payment_received: Optional[Decimal] = Field(default=Decimal("0.00"), ge=0)
    notes: Optional[str] = None
    evidence_url: Optional[str] = None
    evidence_type: Optional[str] = None  # IMAGE, VIDEO, DOCUMENT
    audio_note_url: Optional[str] = None

class SaleRead(BaseModel):
    id: int
    farmer_id: int
    lot_id: Optional[int] = None
    trader_name: str
    market_name: Optional[str] = None
    commodity: str
    variety: str
    quantity: Decimal
    quantity_unit: str
    rate_per_unit: Decimal
    gross_amount: Decimal
    total_deductions: Decimal
    net_receivable: Decimal
    amount_received: Decimal
    outstanding_balance: Decimal
    status: str
    sale_date: date
    notes: Optional[str] = None
    evidence_url: Optional[str] = None
    evidence_type: Optional[str] = None
    audio_note_url: Optional[str] = None
    created_at: datetime
    deductions: List[DeductionRead] = []

    model_config = ConfigDict(from_attributes=True)

class PaymentAllocationCreate(BaseModel):
    sale_id: int
    amount: Decimal = Field(..., gt=0)

class PaymentAllocationRead(BaseModel):
    id: int
    payment_id: int
    sale_id: int
    allocated_amount: Decimal

    model_config = ConfigDict(from_attributes=True)

class PaymentCreate(BaseModel):
    sale_id: Optional[int] = Field(None, description="Optional single sale ID to allocate payment to")
    allocations: Optional[List[PaymentAllocationCreate]] = Field(None, description="Multiple sale allocations")
    amount: Decimal = Field(..., gt=0, description="Payment amount in INR")
    payment_mode: str = Field("CASH", description="CASH, UPI, CHEQUE, BANK_TRANSFER")
    payment_date: Optional[date] = Field(default_factory=date.today)
    reference_note: Optional[str] = None
    evidence_url: Optional[str] = None
    evidence_type: Optional[str] = None
    audio_note_url: Optional[str] = None

class PaymentRead(BaseModel):
    id: int
    farmer_id: int
    sale_id: Optional[int] = None
    amount: Decimal
    payment_mode: str
    payment_date: date
    reference_note: Optional[str] = None
    evidence_url: Optional[str] = None
    evidence_type: Optional[str] = None
    audio_note_url: Optional[str] = None
    created_at: datetime
    allocations: List[PaymentAllocationRead] = []

    model_config = ConfigDict(from_attributes=True)

class FinanceSummaryResponse(BaseModel):
    total_sales_count: int
    total_gross_amount: Decimal
    total_deductions: Decimal
    total_net_receivable: Decimal
    total_received: Decimal
    total_outstanding: Decimal
    settled_sales_count: int
    pending_sales_count: int
    deductions_breakdown: Dict[str, Decimal]


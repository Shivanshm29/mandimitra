from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.farmer_repo import FarmerRepository
from app.schemas.transaction import (
    SaleCreate,
    SaleRead,
    PaymentCreate,
    PaymentRead,
    FinanceSummaryResponse,
)
from app.schemas.profit_coach import ProfitCoachResponse
from app.services.transaction_service import TransactionService
from app.services.profit_coach_service import ProfitCoachService

router = APIRouter(tags=["Transactions & Payments"])

@router.get("/sales", response_model=List[SaleRead])
def get_sales(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all sales transactions recorded by the authenticated farmer."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        return []
    return TransactionService.get_sales(db, profile.id)

@router.post("/sales", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
def create_sale(
    data: SaleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record an agricultural sale with itemized deductions and optional initial payment."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        # Auto-create basic profile if missing
        profile = FarmerRepository.create(
            db=db,
            user_id=current_user.id,
            display_name=current_user.username,
            district="Maharashtra",
            village="Default"
        )
    return TransactionService.create_sale(db, profile.id, data)

@router.get("/sales/{sale_id}", response_model=SaleRead)
def get_sale_details(
    sale_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details and itemized deductions for a specific sale."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    farmer_id = profile.id if profile else 0
    return TransactionService.get_sale_by_id(db, farmer_id, sale_id)

@router.get("/payments", response_model=List[PaymentRead])
def get_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List payment receipts and installment history."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    if not profile:
        return []
    return TransactionService.get_payments(db, profile.id)

@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def record_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record an installment payment against a sale or general trader receipt."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    farmer_id = profile.id if profile else 0
    return TransactionService.record_payment(db, farmer_id, data)

@router.get("/finance/summary", response_model=FinanceSummaryResponse)
def get_finance_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get profit, sales, deductions, and receivables summary."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    farmer_id = profile.id if profile else 0
    return TransactionService.get_finance_summary(db, farmer_id)

@router.get("/finance/profit-coach", response_model=ProfitCoachResponse)
def get_profit_coach_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Intelligent Profit Coach analyzing debtor priorities, price benchmarks, and deduction audits."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    return ProfitCoachService.analyze(db, profile)



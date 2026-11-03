from typing import List, Optional, Dict
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from fastapi import HTTPException, status

from app.models.transaction import Sale, SaleDeduction, Payment
from app.models.selling_lot import SellingLot
from app.models.payment_allocation import PaymentAllocation
from app.schemas.transaction import (
    SaleCreate,
    PaymentCreate,
    FinanceSummaryResponse,
)

class TransactionService:
    @staticmethod
    def create_sale(db: Session, farmer_id: int, data: SaleCreate) -> Sale:
        gross_amount = (data.quantity * data.rate_per_unit).quantize(Decimal("0.01"))
        
        # Calculate total deductions
        total_deductions = Decimal("0.00")
        if data.deductions:
            for d in data.deductions:
                total_deductions += d.amount
        total_deductions = total_deductions.quantize(Decimal("0.01"))

        if total_deductions > gross_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Total deductions cannot exceed gross sale amount."
            )

        net_receivable = (gross_amount - total_deductions).quantize(Decimal("0.01"))
        amount_received = (data.initial_payment_received or Decimal("0.00")).quantize(Decimal("0.01"))
        outstanding_balance = (net_receivable - amount_received).quantize(Decimal("0.01"))

        # Check and update linked selling lot if provided
        lot = None
        if data.lot_id:
            lot = db.scalar(
                select(SellingLot).where(SellingLot.farmer_id == farmer_id, SellingLot.id == data.lot_id)
            )
            if not lot:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Specified selling lot not found."
                )
            sale_qty = data.quantity.quantize(Decimal("0.01"))
            if sale_qty > lot.available_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient available produce in {lot.lot_code}. Requested: {sale_qty} {lot.quantity_unit}, Available: {lot.available_quantity} {lot.quantity_unit}."
                )
            # Deduct from lot inventory
            lot.available_quantity = (lot.available_quantity - sale_qty).quantize(Decimal("0.01"))
            lot.sold_quantity = (lot.sold_quantity + sale_qty).quantize(Decimal("0.01"))
            if lot.available_quantity == Decimal("0.00"):
                lot.status = "SOLD"
            else:
                lot.status = "PARTIALLY_SOLD"

        # Determine sale payment status
        if outstanding_balance <= Decimal("0.00"):
            status_val = "SETTLED"
        elif amount_received > Decimal("0.00"):
            status_val = "PARTIAL"
        else:
            status_val = "PENDING"

        sale = Sale(
            farmer_id=farmer_id,
            lot_id=data.lot_id,
            trader_name=data.trader_name.strip(),
            market_name=data.market_name.strip() if data.market_name else None,
            commodity=data.commodity.strip(),
            variety=data.variety.strip() if data.variety else "Standard",
            quantity=data.quantity,
            quantity_unit=data.quantity_unit,
            rate_per_unit=data.rate_per_unit,
            gross_amount=gross_amount,
            total_deductions=total_deductions,
            net_receivable=net_receivable,
            amount_received=amount_received,
            outstanding_balance=outstanding_balance,
            status=status_val,
            sale_date=data.sale_date,
            notes=data.notes,
            evidence_url=data.evidence_url,
            evidence_type=data.evidence_type,
            audio_note_url=data.audio_note_url
        )
        db.add(sale)
        db.flush()

        # Add deductions
        if data.deductions:
            for d in data.deductions:
                ded = SaleDeduction(
                    sale_id=sale.id,
                    deduction_type=d.deduction_type.strip(),
                    amount=d.amount.quantize(Decimal("0.01")),
                    description=d.description
                )
                db.add(ded)

        # Add initial payment record if amount > 0
        if amount_received > Decimal("0.00"):
            payment = Payment(
                farmer_id=farmer_id,
                sale_id=sale.id,
                amount=amount_received,
                payment_mode="CASH",
                payment_date=data.sale_date,
                reference_note="Initial payment on sale date"
            )
            db.add(payment)
            db.flush()

            # Record allocation
            alloc = PaymentAllocation(
                payment_id=payment.id,
                sale_id=sale.id,
                allocated_amount=amount_received
            )
            db.add(alloc)

        db.commit()
        db.refresh(sale)
        return sale

    @staticmethod
    def get_sales(db: Session, farmer_id: int) -> List[Sale]:
        stmt = (
            select(Sale)
            .where(Sale.farmer_id == farmer_id)
            .order_by(desc(Sale.sale_date), desc(Sale.id))
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_sale_by_id(db: Session, farmer_id: int, sale_id: int) -> Sale:
        stmt = select(Sale).where(Sale.farmer_id == farmer_id, Sale.id == sale_id)
        sale = db.scalar(stmt)
        if not sale:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sale record not found."
            )
        return sale

    @staticmethod
    def record_payment(db: Session, farmer_id: int, data: PaymentCreate) -> Payment:
        pay_amount = data.amount.quantize(Decimal("0.01"))

        # Duplicate payment detection: check same farmer, amount, mode, and date within same reference
        if data.reference_note:
            dup = db.scalar(
                select(Payment).where(
                    Payment.farmer_id == farmer_id,
                    Payment.amount == pay_amount,
                    Payment.payment_mode == data.payment_mode,
                    Payment.payment_date == data.payment_date,
                    Payment.reference_note == data.reference_note
                )
            )
            if dup:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Potential duplicate payment detected with identical amount, mode, date and reference note."
                )

        payment = Payment(
            farmer_id=farmer_id,
            sale_id=data.sale_id,
            amount=pay_amount,
            payment_mode=data.payment_mode,
            payment_date=data.payment_date,
            reference_note=data.reference_note,
            evidence_url=data.evidence_url,
            evidence_type=data.evidence_type,
            audio_note_url=data.audio_note_url
        )
        db.add(payment)
        db.flush()

        # Handle multi-sale allocations or single sale allocation
        allocations_to_process = []
        if data.allocations:
            allocations_to_process = data.allocations
        elif data.sale_id:
            allocations_to_process = [{"sale_id": data.sale_id, "amount": pay_amount}]

        total_allocated = Decimal("0.00")
        for item in allocations_to_process:
            sid = item.sale_id if hasattr(item, "sale_id") else item["sale_id"]
            amt = (item.amount if hasattr(item, "amount") else item["amount"]).quantize(Decimal("0.01"))

            sale = db.scalar(select(Sale).where(Sale.farmer_id == farmer_id, Sale.id == sid))
            if not sale:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Sale #{sid} for allocation not found."
                )

            # Prevent over-allocation
            if amt > sale.outstanding_balance:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Allocated amount (₹{amt}) exceeds outstanding balance (₹{sale.outstanding_balance}) on Sale #{sid}."
                )

            alloc = PaymentAllocation(
                payment_id=payment.id,
                sale_id=sid,
                allocated_amount=amt
            )
            db.add(alloc)

            # Update sale balance
            sale.amount_received = (sale.amount_received + amt).quantize(Decimal("0.01"))
            sale.outstanding_balance = (sale.net_receivable - sale.amount_received).quantize(Decimal("0.01"))
            if sale.outstanding_balance <= Decimal("0.00"):
                sale.status = "SETTLED"
            else:
                sale.status = "PARTIAL"

            total_allocated += amt

        if allocations_to_process and total_allocated > pay_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Total allocated amount (₹{total_allocated}) cannot exceed total payment amount (₹{pay_amount})."
            )

        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    def get_payments(db: Session, farmer_id: int) -> List[Payment]:
        stmt = (
            select(Payment)
            .where(Payment.farmer_id == farmer_id)
            .order_by(desc(Payment.payment_date), desc(Payment.id))
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_finance_summary(db: Session, farmer_id: int) -> FinanceSummaryResponse:
        sales = list(db.scalars(select(Sale).where(Sale.farmer_id == farmer_id)).all())

        total_gross = Decimal("0.00")
        total_deductions = Decimal("0.00")
        total_net = Decimal("0.00")
        total_received = Decimal("0.00")
        total_outstanding = Decimal("0.00")
        settled_count = 0
        pending_count = 0

        deductions_breakdown: Dict[str, Decimal] = {}

        for s in sales:
            total_gross += s.gross_amount
            total_deductions += s.total_deductions
            total_net += s.net_receivable
            total_received += s.amount_received
            total_outstanding += s.outstanding_balance
            
            if s.status == "SETTLED":
                settled_count += 1
            else:
                pending_count += 1

            for d in s.deductions:
                dtype = d.deduction_type
                deductions_breakdown[dtype] = deductions_breakdown.get(dtype, Decimal("0.00")) + d.amount

        return FinanceSummaryResponse(
            total_sales_count=len(sales),
            total_gross_amount=total_gross.quantize(Decimal("0.01")),
            total_deductions=total_deductions.quantize(Decimal("0.01")),
            total_net_receivable=total_net.quantize(Decimal("0.01")),
            total_received=total_received.quantize(Decimal("0.01")),
            total_outstanding=total_outstanding.quantize(Decimal("0.01")),
            settled_sales_count=settled_count,
            pending_sales_count=pending_count,
            deductions_breakdown=deductions_breakdown
        )


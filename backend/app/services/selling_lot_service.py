from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status

from app.models.selling_lot import SellingLot
from app.schemas.selling_lot import SellingLotCreate, SellingLotUpdate

class SellingLotService:
    @staticmethod
    def create_lot(db: Session, farmer_id: int, data: SellingLotCreate) -> SellingLot:
        # Generate next lot code for this farmer e.g. LOT-001
        count = db.scalar(
            select(func.count(SellingLot.id)).where(SellingLot.farmer_id == farmer_id)
        ) or 0
        lot_code = f"LOT-{(count + 1):03d}"

        total_qty = data.total_quantity.quantize(Decimal("0.01"))

        lot = SellingLot(
            farmer_id=farmer_id,
            lot_code=lot_code,
            commodity=data.commodity.strip(),
            variety=data.variety.strip() if data.variety else "Standard",
            quality_grade=data.quality_grade.strip() if data.quality_grade else None,
            total_quantity=total_qty,
            available_quantity=total_qty,
            sold_quantity=Decimal("0.00"),
            quantity_unit=data.quantity_unit.strip() if data.quantity_unit else "Quintal",
            status="AVAILABLE",
            harvest_date=data.harvest_date,
            expected_rate=data.expected_rate.quantize(Decimal("0.01")) if data.expected_rate else None,
            notes=data.notes.strip() if data.notes else None
        )
        db.add(lot)
        db.commit()
        db.refresh(lot)
        return lot

    @staticmethod
    def get_lots(db: Session, farmer_id: int, status_filter: Optional[str] = None) -> List[SellingLot]:
        stmt = select(SellingLot).where(SellingLot.farmer_id == farmer_id)
        if status_filter:
            stmt = stmt.where(SellingLot.status == status_filter.upper())
        stmt = stmt.order_by(desc(SellingLot.id))
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_lot_by_id(db: Session, farmer_id: int, lot_id: int) -> SellingLot:
        stmt = select(SellingLot).where(SellingLot.farmer_id == farmer_id, SellingLot.id == lot_id)
        lot = db.scalar(stmt)
        if not lot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selling lot not found."
            )
        return lot

    @staticmethod
    def update_lot(db: Session, farmer_id: int, lot_id: int, data: SellingLotUpdate) -> SellingLot:
        lot = SellingLotService.get_lot_by_id(db, farmer_id, lot_id)
        
        # If total_quantity is being updated, verify it is not less than already sold quantity
        if data.total_quantity is not None:
            new_total = data.total_quantity.quantize(Decimal("0.01"))
            if new_total < lot.sold_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Total quantity cannot be less than already sold quantity ({lot.sold_quantity} {lot.quantity_unit})."
                )
            lot.total_quantity = new_total
            lot.available_quantity = (new_total - lot.sold_quantity).quantize(Decimal("0.01"))
            if lot.available_quantity == Decimal("0.00"):
                lot.status = "SOLD"
            elif lot.sold_quantity > Decimal("0.00"):
                lot.status = "PARTIALLY_SOLD"
            else:
                lot.status = "AVAILABLE"

        update_dict = data.model_dump(exclude_unset=True, exclude={"total_quantity"})
        for k, v in update_dict.items():
            if v is not None and hasattr(lot, k):
                setattr(lot, k, v)

        db.commit()
        db.refresh(lot)
        return lot

    @staticmethod
    def delete_lot(db: Session, farmer_id: int, lot_id: int) -> bool:
        lot = SellingLotService.get_lot_by_id(db, farmer_id, lot_id)
        if lot.sold_quantity > Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete lot with recorded sales ({lot.sold_quantity} {lot.quantity_unit} already sold)."
            )
        db.delete(lot)
        db.commit()
        return True


from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status

from app.models.harvest import HarvestRecord
from app.models.selling_lot import SellingLot
from app.schemas.harvest import HarvestRecordCreate, HarvestRecordUpdate, CreateSellingLotFromHarvest

class HarvestService:
    @staticmethod
    def create_harvest(db: Session, farmer_id: int, data: HarvestRecordCreate) -> HarvestRecord:
        harvested_qty = data.harvested_quantity.quantize(Decimal("0.01"))
        
        harvest = HarvestRecord(
            farmer_id=farmer_id,
            commodity=data.commodity.strip(),
            variety=data.variety.strip() if data.variety else "Standard",
            harvest_date=data.harvest_date,
            harvested_quantity=harvested_qty,
            remaining_quantity=harvested_qty,
            quantity_unit=data.quantity_unit.strip() if data.quantity_unit else "Quintal",
            quality_grade=data.quality_grade.strip() if data.quality_grade else None,
            storage_location=data.storage_location.strip() if data.storage_location else None,
            notes=data.notes.strip() if data.notes else None,
        )
        db.add(harvest)
        db.commit()
        db.refresh(harvest)
        return harvest

    @staticmethod
    def get_harvests(db: Session, farmer_id: int) -> List[HarvestRecord]:
        stmt = select(HarvestRecord).where(HarvestRecord.farmer_id == farmer_id).order_by(desc(HarvestRecord.id))
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_harvest_by_id(db: Session, farmer_id: int, harvest_id: int) -> HarvestRecord:
        stmt = select(HarvestRecord).where(HarvestRecord.farmer_id == farmer_id, HarvestRecord.id == harvest_id)
        harvest = db.scalar(stmt)
        if not harvest:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Harvest record not found."
            )
        return harvest

    @staticmethod
    def update_harvest(db: Session, farmer_id: int, harvest_id: int, data: HarvestRecordUpdate) -> HarvestRecord:
        harvest = HarvestService.get_harvest_by_id(db, farmer_id, harvest_id)

        # Calculate quantity already allocated to selling lots
        allocated_to_lots = db.scalar(
            select(func.coalesce(func.sum(SellingLot.total_quantity), 0)).where(SellingLot.harvest_id == harvest_id)
        ) or Decimal("0.00")
        allocated_to_lots = Decimal(str(allocated_to_lots))

        if data.harvested_quantity is not None:
            new_qty = data.harvested_quantity.quantize(Decimal("0.01"))
            if new_qty < allocated_to_lots:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Harvested quantity cannot be less than already allocated selling lots ({allocated_to_lots} {harvest.quantity_unit})."
                )
            harvest.harvested_quantity = new_qty
            harvest.remaining_quantity = (new_qty - allocated_to_lots).quantize(Decimal("0.01"))

        update_dict = data.model_dump(exclude_unset=True, exclude={"harvested_quantity"})
        for k, v in update_dict.items():
            if v is not None and hasattr(harvest, k):
                setattr(harvest, k, v)

        db.commit()
        db.refresh(harvest)
        return harvest

    @staticmethod
    def delete_harvest(db: Session, farmer_id: int, harvest_id: int) -> bool:
        harvest = HarvestService.get_harvest_by_id(db, farmer_id, harvest_id)
        # Check if any selling lots are created from this harvest
        lot_count = db.scalar(
            select(func.count(SellingLot.id)).where(SellingLot.harvest_id == harvest_id)
        ) or 0
        if lot_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete harvest record with {lot_count} active selling lot(s)."
            )
        db.delete(harvest)
        db.commit()
        return True

    @staticmethod
    def create_selling_lot_from_harvest(
        db: Session, farmer_id: int, harvest_id: int, data: CreateSellingLotFromHarvest
    ) -> SellingLot:
        harvest = HarvestService.get_harvest_by_id(db, farmer_id, harvest_id)
        lot_qty = data.lot_quantity.quantize(Decimal("0.01"))

        if lot_qty > harvest.remaining_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested lot quantity ({lot_qty} {harvest.quantity_unit}) exceeds remaining harvested stock ({harvest.remaining_quantity} {harvest.quantity_unit})."
            )

        # Generate lot code
        count = db.scalar(
            select(func.count(SellingLot.id)).where(SellingLot.farmer_id == farmer_id)
        ) or 0
        lot_code = f"LOT-{(count + 1):03d}"

        lot = SellingLot(
            farmer_id=farmer_id,
            harvest_id=harvest.id,
            lot_code=lot_code,
            commodity=harvest.commodity,
            variety=harvest.variety,
            quality_grade=harvest.quality_grade,
            total_quantity=lot_qty,
            available_quantity=lot_qty,
            sold_quantity=Decimal("0.00"),
            quantity_unit=harvest.quantity_unit,
            status="AVAILABLE",
            harvest_date=harvest.harvest_date,
            expected_rate=data.expected_rate.quantize(Decimal("0.01")) if data.expected_rate else None,
            notes=data.notes.strip() if data.notes else None,
        )
        db.add(lot)

        # Deduct from harvest remaining quantity
        harvest.remaining_quantity = (harvest.remaining_quantity - lot_qty).quantize(Decimal("0.01"))

        db.commit()
        db.refresh(lot)
        return lot


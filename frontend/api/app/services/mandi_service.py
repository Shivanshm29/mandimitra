from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.models.mandi import MarketPrice, PriceAlert
from app.models.harvest import HarvestRecord
from app.models.selling_lot import SellingLot
from app.models.farmer_profile import FarmerProfile
from app.schemas.mandi import (
    MandiRecommendationItem,
    RecommendationResponse,
    RecommendationRequest,
    PriceAlertCreate,
)

class MandiService:
    @staticmethod
    def get_prices(
        db: Session,
        commodity: Optional[str] = None,
        district: Optional[str] = None,
        market_name: Optional[str] = None,
        limit: int = 50
    ) -> List[MarketPrice]:
        stmt = select(MarketPrice)
        if commodity:
            stmt = stmt.where(func.lower(MarketPrice.commodity) == commodity.strip().lower())
        if district:
            stmt = stmt.where(func.lower(MarketPrice.district) == district.strip().lower())
        if market_name:
            stmt = stmt.where(func.lower(MarketPrice.market_name) == market_name.strip().lower())
        
        # Sort by latest arrival date and highest modal price
        stmt = stmt.order_by(desc(MarketPrice.arrival_date), desc(MarketPrice.modal_price)).limit(limit)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_commodities(db: Session) -> List[str]:
        stmt = select(MarketPrice.commodity).distinct().order_by(MarketPrice.commodity)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_markets(db: Session) -> List[dict]:
        stmt = select(
            MarketPrice.market_name,
            MarketPrice.district,
            MarketPrice.state
        ).distinct().order_by(MarketPrice.market_name)
        rows = db.execute(stmt).all()
        return [{"market_name": r[0], "district": r[1], "state": r[2]} for r in rows]

    @staticmethod
    def get_recommendations(
        db: Session,
        request: RecommendationRequest,
        farmer_id: Optional[int] = None
    ) -> RecommendationResponse:
        commodity = request.commodity.strip()
        quantity = request.quantity
        variety = request.variety.strip() if request.variety else "Standard"
        quality_grade = request.quality_grade
        lot_code: Optional[str] = None
        farmer_district = request.farmer_district.strip() if request.farmer_district else None

        # 1. Resolve lot or harvest details if IDs are provided
        if request.lot_id:
            lot = db.scalar(select(SellingLot).where(SellingLot.id == request.lot_id))
            if lot:
                commodity = lot.commodity
                quantity = lot.available_quantity
                variety = lot.variety or variety
                quality_grade = lot.quality_grade or quality_grade
                lot_code = lot.lot_code
                if not farmer_district:
                    profile = db.scalar(select(FarmerProfile).where(FarmerProfile.id == lot.farmer_id))
                    if profile:
                        farmer_district = profile.district

        elif request.harvest_id:
            harvest = db.scalar(select(HarvestRecord).where(HarvestRecord.id == request.harvest_id))
            if harvest:
                commodity = harvest.commodity
                quantity = harvest.remaining_quantity
                variety = harvest.variety or variety
                quality_grade = harvest.quality_grade or quality_grade
                if not farmer_district:
                    profile = db.scalar(select(FarmerProfile).where(FarmerProfile.id == harvest.farmer_id))
                    if profile:
                        farmer_district = profile.district

        if not farmer_district and farmer_id:
            profile = db.scalar(select(FarmerProfile).where(FarmerProfile.id == farmer_id))
            if profile:
                farmer_district = profile.district

        commodity_clean = commodity.lower()
        stmt = (
            select(MarketPrice)
            .where(func.lower(MarketPrice.commodity) == commodity_clean)
            .order_by(desc(MarketPrice.arrival_date), desc(MarketPrice.modal_price))
        )
        records = list(db.scalars(stmt).all())

        # If variety is specified (and not a generic placeholder), look for variety compatibility
        has_variety_filter = variety.lower() not in ["standard", "local/standard", "default", "all", ""]
        if has_variety_filter and records:
            variety_tokens = [t.lower() for t in variety.replace("/", " ").replace("-", " ").split() if len(t) > 2]
            variety_matched = [
                r for r in records
                if any(tok in r.variety.lower() for tok in variety_tokens)
            ]
            if variety_matched:
                records = variety_matched

        # Deduplicate to latest entry per APMC market
        seen_markets = set()
        latest_records: List[MarketPrice] = []
        for r in records:
            if r.market_name not in seen_markets:
                seen_markets.add(r.market_name)
                latest_records.append(r)

        if not latest_records:
            # Fallback if commodity has no direct rates
            fallback_stmt = select(MarketPrice).order_by(desc(MarketPrice.arrival_date)).limit(5)
            latest_records = list(db.scalars(fallback_stmt).all())

        # Sort descending by modal_price
        latest_records.sort(key=lambda x: x.modal_price, reverse=True)

        best_price_record = latest_records[0]
        best_modal = best_price_record.modal_price
        highest_potential_gross = (best_modal * quantity).quantize(Decimal("0.01"))

        worst_modal = latest_records[-1].modal_price if len(latest_records) > 1 else best_modal
        potential_extra_gain = ((best_modal - worst_modal) * quantity).quantize(Decimal("0.01"))

        # Determine Local Convenient Market
        convenient_record: Optional[MarketPrice] = None
        if farmer_district:
            local_matches = [r for r in latest_records if r.district.lower() == farmer_district.lower()]
            if local_matches:
                # Top modal price in farmer's home district
                convenient_record = max(local_matches, key=lambda x: x.modal_price)

        if not convenient_record:
            convenient_record = best_price_record

        # Determine Best Overall Match:
        # If convenient local market is within ₹100/Qtl or 5% of the absolute top market,
        # choose the local market to eliminate transport complexity.
        # Otherwise, choose the absolute best price market.
        best_overall_record = best_price_record
        if convenient_record and convenient_record != best_price_record:
            price_gap = best_price_record.modal_price - convenient_record.modal_price
            if price_gap <= Decimal("100.00") or (price_gap / best_price_record.modal_price) < Decimal("0.04"):
                best_overall_record = convenient_record

        # Generate recommendation items
        recommendations: List[MandiRecommendationItem] = []
        for rank, rec in enumerate(latest_records, start=1):
            est_gross = (rec.modal_price * quantity).quantize(Decimal("0.01"))
            min_gross = (rec.min_price * quantity).quantize(Decimal("0.01"))
            max_gross = (rec.max_price * quantity).quantize(Decimal("0.01"))
            diff = (best_modal - rec.modal_price).quantize(Decimal("0.01"))

            is_bp = rec.market_name == best_price_record.market_name
            is_cl = rec.market_name == convenient_record.market_name
            is_bo = rec.market_name == best_overall_record.market_name

            # Generate natural explanation for each mandi
            if is_bo and is_bp and is_cl:
                reason = f"सर्वोत्तम पर्याय: आपल्या {rec.district} जिल्ह्यातच सर्वाधिक मोडल दर (₹{rec.modal_price}/Qtl) व कमाल उत्पन्न."
            elif is_bo:
                reason = f"सर्वोत्तम शिफारस: चांगला मोडल दर (₹{rec.modal_price}/Qtl), स्थानिक सुलभता आणि विश्वासार्ह आवक."
            elif is_bp:
                reason = f"सर्वोच्च मोडल दर: AGMARKNET अहवालानुसार सर्वाधिक दर (₹{rec.modal_price}/Qtl) देणारी मुख्य बाजार समिती."
            elif is_cl:
                reason = f"स्थानिक सोयीस्कर पर्याय: आपल्या {rec.district} जिल्ह्यातील सर्वात जवळची प्रमुख APMC बाजार समिती."
            elif diff <= Decimal("50.00"):
                reason = f"फायदेशीर पर्याय: सर्वोच्च दरापेक्षा केवळ ₹{diff}/Qtl चा फरक."
            else:
                reason = f"{rec.district} येथील अधिकृत बाजार समिती दर (AGMARKNET नोंदणीकृत)."

            recommendations.append(
                MandiRecommendationItem(
                    market_name=rec.market_name,
                    district=rec.district,
                    min_price=rec.min_price,
                    max_price=rec.max_price,
                    modal_price=rec.modal_price,
                    estimated_gross=est_gross,
                    min_estimated_gross=min_gross,
                    max_estimated_gross=max_gross,
                    price_difference_per_quintal=diff,
                    rank=rank,
                    arrivals_volume=rec.arrivals_volume,
                    data_source=rec.data_source,
                    arrival_date=rec.arrival_date,
                    reported_at=rec.reported_at,
                    is_best_price=is_bp,
                    is_convenient_local=is_cl,
                    is_best_overall=is_bo,
                    recommendation_reason=reason
                )
            )

        # Apply user sorting if requested
        sort_by = (request.sort_by or "price").lower()
        if sort_by == "location" and farmer_district:
            recommendations.sort(
                key=lambda x: (
                    0 if x.district.lower() == farmer_district.lower() else 1,
                    -x.modal_price
                )
            )
            for idx, item in enumerate(recommendations, start=1):
                item.rank = idx
        elif sort_by == "date":
            recommendations.sort(key=lambda x: (x.arrival_date, x.modal_price), reverse=True)
            for idx, item in enumerate(recommendations, start=1):
                item.rank = idx

        # High level summary reasoning
        reasoning = (
            f"Based on government-reported AGMARKNET rates, {best_price_record.market_name} in {best_price_record.district} "
            f"reports the highest modal price of ₹{best_modal}/Quintal for {commodity}. "
            f"Selling {quantity} Quintals yields an estimated gross realization of ₹{highest_potential_gross:,.2f}, "
            f"giving up to ₹{potential_extra_gain:,.2f} more revenue than lower-priced accessible markets."
        )
        if convenient_record and convenient_record.market_name != best_price_record.market_name:
            reasoning += (
                f" In your home district ({farmer_district}), {convenient_record.market_name} offers ₹{convenient_record.modal_price}/Quintal "
                f"with an estimated gross realization of ₹{(convenient_record.modal_price * quantity):,.2f}."
            )

        return RecommendationResponse(
            commodity=commodity,
            quantity=quantity,
            variety=variety,
            quality_grade=quality_grade,
            farmer_district=farmer_district,
            harvest_id=request.harvest_id,
            lot_id=request.lot_id,
            lot_code=lot_code,
            best_market=best_price_record.market_name,
            best_modal_price=best_modal,
            highest_potential_gross=highest_potential_gross,
            potential_extra_gain=potential_extra_gain,
            best_price_market=best_price_record.market_name,
            convenient_market=convenient_record.market_name if convenient_record else None,
            best_overall_market=best_overall_record.market_name if best_overall_record else None,
            recommendations=recommendations,
            reasoning=reasoning
        )

    @staticmethod
    def create_price_alert(db: Session, farmer_id: int, data: PriceAlertCreate) -> PriceAlert:
        alert = PriceAlert(
            farmer_id=farmer_id,
            commodity=data.commodity.strip(),
            target_modal_price=data.target_modal_price,
            condition=data.condition.upper(),
            market_name=data.market_name.strip() if data.market_name else None,
            is_active=True
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def get_price_alerts(db: Session, farmer_id: int) -> List[PriceAlert]:
        stmt = (
            select(PriceAlert)
            .where(PriceAlert.farmer_id == farmer_id)
            .order_by(desc(PriceAlert.created_at))
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def delete_price_alert(db: Session, farmer_id: int, alert_id: int) -> bool:
        alert = db.scalar(
            select(PriceAlert).where(PriceAlert.farmer_id == farmer_id, PriceAlert.id == alert_id)
        )
        if not alert:
            return False
        db.delete(alert)
        db.commit()
        return True



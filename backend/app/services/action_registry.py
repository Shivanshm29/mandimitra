from typing import Dict, Any, Optional, List
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from fastapi import HTTPException, status

from app.models.farmer_profile import FarmerProfile
from app.models.selling_lot import SellingLot
from app.models.transaction import Sale, Payment
from app.models.mandi import MarketPrice, PriceAlert
from app.repositories.farmer_repo import FarmerRepository
from app.services.selling_lot_service import SellingLotService
from app.services.transaction_service import TransactionService
from app.services.mandi_service import MandiService
from app.services.profit_coach_service import ProfitCoachService
from app.schemas.selling_lot import SellingLotCreate
from app.schemas.transaction import SaleCreate, PaymentCreate, DeductionCreate, PaymentAllocationCreate
from app.schemas.mandi import RecommendationRequest, PriceAlertCreate

class ActionRegistry:
    """Centralized, secure action registry for Universal Sarvam AI Assistant."""

    @staticmethod
    def get_action_definitions() -> List[Dict[str, Any]]:
        return [
            {
                "name": "get_mandi_prices",
                "description": "Look up government-reported APMC mandi prices for a commodity and optional district/market.",
                "category": "READ",
                "parameters": {
                    "commodity": {"type": "string", "description": "e.g. Onion, Soybean, Cotton"},
                    "district": {"type": "string", "description": "District name (e.g. Nashik, Pune)"},
                    "market_name": {"type": "string", "description": "APMC name (e.g. Lasalgaon)"}
                }
            },
            {
                "name": "get_selling_recommendations",
                "description": "Compare markets and recommend the best APMC mandis with highest modal rate for a crop.",
                "category": "READ",
                "parameters": {
                    "commodity": {"type": "string", "description": "Crop name"},
                    "quantity": {"type": "number", "description": "Harvest quantity in Quintals"}
                }
            },
            {
                "name": "get_farmer_profile",
                "description": "Fetch current farmer profile, location, language and commonly grown crops.",
                "category": "READ",
                "parameters": {}
            },
            {
                "name": "get_selling_lots",
                "description": "View available and partially sold produce lots maintained by the farmer.",
                "category": "READ",
                "parameters": {
                    "status": {"type": "string", "description": "AVAILABLE, PARTIALLY_SOLD, or SOLD"}
                }
            },
            {
                "name": "get_sales_history",
                "description": "View recorded sales transactions and trader details.",
                "category": "READ",
                "parameters": {
                    "limit": {"type": "integer", "description": "Number of records"}
                }
            },
            {
                "name": "get_finance_summary",
                "description": "Get total sales value, received amounts, and outstanding balances.",
                "category": "READ",
                "parameters": {}
            },
            {
                "name": "get_profit_coach",
                "description": "Get intelligent profit coach report: trader debtor priorities, price benchmarks, and deduction audits.",
                "category": "READ",
                "parameters": {}
            },
            {
                "name": "create_selling_lot",
                "description": "Create a new harvest produce lot available for sale.",
                "category": "WRITE_REQUIRES_CONFIRMATION",
                "parameters": {
                    "commodity": {"type": "string", "description": "Crop name"},
                    "variety": {"type": "string", "description": "Variety or Standard"},
                    "total_quantity": {"type": "number", "description": "Total quantity in Quintals"},
                    "quality_grade": {"type": "string", "description": "Grade A, B or standard"},
                    "storage_location": {"type": "string", "description": "Warehouse or farm location"}
                }
            },
            {
                "name": "record_sale",
                "description": "Record an agricultural sale to a trader with rate, quantity, and deductions.",
                "category": "WRITE_REQUIRES_CONFIRMATION",
                "parameters": {
                    "trader_name": {"type": "string", "description": "Name of trader / firm"},
                    "market_name": {"type": "string", "description": "APMC market name"},
                    "commodity": {"type": "string", "description": "Crop name"},
                    "variety": {"type": "string", "description": "Crop variety"},
                    "quantity": {"type": "number", "description": "Weight in Quintals"},
                    "rate_per_unit": {"type": "number", "description": "Rate per Quintal in INR"},
                    "lot_id": {"type": "integer", "description": "Optional produce lot ID to deduct from"},
                    "initial_payment_received": {"type": "number", "description": "Amount received on spot"}
                }
            },
            {
                "name": "record_payment",
                "description": "Record a payment installment from a trader against a sale or outstanding balance.",
                "category": "WRITE_REQUIRES_CONFIRMATION",
                "parameters": {
                    "amount": {"type": "number", "description": "Payment amount in INR"},
                    "payment_mode": {"type": "string", "description": "CASH, UPI, CHEQUE, BANK_TRANSFER"},
                    "sale_id": {"type": "integer", "description": "Optional specific sale ID"},
                    "reference_note": {"type": "string", "description": "Receipt/UPI reference note"}
                }
            },
            {
                "name": "update_farmer_crops",
                "description": "Add or update the farmer's commonly grown crops in their profile.",
                "category": "WRITE_REQUIRES_CONFIRMATION",
                "parameters": {
                    "crops": {"type": "array", "description": "List of crop objects e.g. [{'commodity': 'Onion', 'variety': 'Red'}]"}
                }
            },
            {
                "name": "navigate_to",
                "description": "Navigate user interface to a specific page or section.",
                "category": "UI_ACTION",
                "parameters": {
                    "route": {"type": "string", "description": "Target path e.g. /mandi-intelligence, /transactions, /payments, /profit-coach"}
                }
            },
            {
                "name": "switch_language",
                "description": "Switch the global interface language for the farmer.",
                "category": "UI_ACTION",
                "parameters": {
                    "language": {"type": "string", "description": "mr-IN (Marathi), hi-IN (Hindi), en-IN (English)"}
                }
            }
        ]

    @staticmethod
    def execute_read_action(db: Session, farmer_profile: Optional[FarmerProfile], action_name: str, params: Dict[str, Any]) -> Any:
        farmer_id = farmer_profile.id if farmer_profile else 0

        if action_name == "get_mandi_prices":
            prices = MandiService.get_prices(
                db=db,
                commodity=params.get("commodity"),
                district=params.get("district"),
                market_name=params.get("market_name"),
                limit=params.get("limit", 10)
            )
            return [
                {
                    "market": p.market_name,
                    "district": p.district,
                    "commodity": p.commodity,
                    "modal_price": str(p.modal_price),
                    "min_price": str(p.min_price),
                    "max_price": str(p.max_price),
                    "date": str(p.arrival_date)
                }
                for p in prices
            ]

        elif action_name == "get_selling_recommendations":
            comm = params.get("commodity") or "Onion"
            qty = Decimal(str(params.get("quantity") or "10.00"))
            rec = MandiService.get_recommendations(db, RecommendationRequest(commodity=comm, quantity=qty))
            return {
                "commodity": rec.commodity,
                "best_market": rec.best_market,
                "best_modal_price": str(rec.best_modal_price),
                "estimated_gross": str(rec.highest_potential_gross),
                "reasoning": rec.reasoning,
                "markets": [
                    {
                        "market": m.market_name,
                        "district": m.district,
                        "modal_price": str(m.modal_price),
                        "rank": m.rank
                    }
                    for m in rec.recommendations[:4]
                ]
            }

        elif action_name == "get_farmer_profile":
            if not farmer_profile:
                return {"message": "Farmer profile not yet created."}
            return {
                "name": farmer_profile.display_name,
                "village": farmer_profile.village,
                "district": farmer_profile.district,
                "language": farmer_profile.preferred_language,
                "crops": farmer_profile.commonly_grown_crops or []
            }

        elif action_name == "get_selling_lots":
            lots = SellingLotService.get_lots(db, farmer_id, params.get("status"))
            return [
                {
                    "lot_code": l.lot_code,
                    "commodity": l.commodity,
                    "available_qty": str(l.available_quantity),
                    "total_qty": str(l.total_quantity),
                    "status": l.status
                }
                for l in lots
            ]

        elif action_name == "get_finance_summary":
            summary = TransactionService.get_finance_summary(db, farmer_id)
            return {
                "total_gross": str(summary.total_gross_amount),
                "total_received": str(summary.total_received),
                "total_outstanding": str(summary.total_outstanding),
                "total_sales": summary.total_sales_count,
                "pending_sales": summary.pending_sales_count
            }

        elif action_name == "get_profit_coach":
            analysis = ProfitCoachService.analyze(db, farmer_profile)
            return {
                "collection_rate": str(analysis.collection_rate_percent),
                "outstanding": str(analysis.total_outstanding_receivable),
                "top_debtors": [
                    {"name": d.trader_name, "pending": str(d.outstanding_amount)}
                    for d in analysis.trader_debtors[:3]
                ],
                "actionable_recommendations": analysis.actionable_recommendations
            }

        return None

    @staticmethod
    def execute_write_action(db: Session, farmer_profile: FarmerProfile, action_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Executes a confirmed WRITE action on behalf of the authenticated farmer."""
        farmer_id = farmer_profile.id

        if action_name == "create_selling_lot":
            payload = SellingLotCreate(
                commodity=str(params.get("commodity") or "Onion"),
                variety=str(params.get("variety") or "Standard"),
                quality_grade=params.get("quality_grade"),
                total_quantity=Decimal(str(params.get("total_quantity") or "10.00")),
                storage_location=params.get("storage_location")
            )
            lot = SellingLotService.create_lot(db, farmer_id, payload)
            return {
                "status": "SUCCESS",
                "message": f"लॉट {lot.lot_code} यशस्वीरित्या तयार झाला.",
                "lot_code": lot.lot_code,
                "commodity": lot.commodity,
                "available_quantity": str(lot.available_quantity)
            }

        elif action_name == "record_sale":
            # 1. Resolve Selling Lot: support lot_id (integer), lot_code (e.g. 'LOT-001'), or active commodity match
            lot: Optional[SellingLot] = None
            lot_param = params.get("lot_id") or params.get("lot_code")
            if lot_param is not None and str(lot_param).strip():
                raw_str = str(lot_param).strip()
                if raw_str.isdigit():
                    lot = db.scalar(
                        select(SellingLot).where(SellingLot.farmer_id == farmer_id, SellingLot.id == int(raw_str))
                    )
                if not lot:
                    lot = db.scalar(
                        select(SellingLot).where(SellingLot.farmer_id == farmer_id, SellingLot.lot_code == raw_str)
                    )

            comm_name = str(params.get("commodity") or (lot.commodity if lot else "Onion")).strip()
            if not lot and comm_name:
                # Attempt to match active lot with remaining inventory for this commodity
                lot = db.scalar(
                    select(SellingLot).where(
                        SellingLot.farmer_id == farmer_id,
                        SellingLot.commodity.ilike(comm_name),
                        SellingLot.available_quantity > 0
                    ).order_by(desc(SellingLot.created_at))
                )

            # 2. Resilient deductions parsing: handles list of dicts, dict map, or empty
            deductions_in: List[DeductionCreate] = []
            raw_ded = params.get("deductions") or []
            if isinstance(raw_ded, dict):
                for k, v in raw_ded.items():
                    try:
                        amt = Decimal(str(v or "0")).quantize(Decimal("0.01"))
                        if amt > Decimal("0.00"):
                            deductions_in.append(DeductionCreate(
                                deduction_type=str(k).upper(),
                                amount=amt,
                                description=f"{k} deduction"
                            ))
                    except Exception:
                        pass
            elif isinstance(raw_ded, list):
                for item in raw_ded:
                    if isinstance(item, dict):
                        try:
                            amt = Decimal(str(item.get("amount") or "0")).quantize(Decimal("0.01"))
                            if amt > Decimal("0.00"):
                                dtype = str(item.get("deduction_type") or "OTHER").upper()
                                desc_val = item.get("description") or f"{dtype} fee"
                                deductions_in.append(DeductionCreate(
                                    deduction_type=dtype,
                                    amount=amt,
                                    description=desc_val
                                ))
                        except Exception:
                            pass

            # 3. Numeric extraction with Decimal precision
            qty = Decimal(str(params.get("quantity") or "10.00")).quantize(Decimal("0.01"))
            rate = Decimal(str(params.get("rate_per_unit") or "2000.00")).quantize(Decimal("0.01"))
            init_pay = Decimal(str(params.get("initial_payment_received") or "0.00")).quantize(Decimal("0.01"))

            payload = SaleCreate(
                trader_name=str(params.get("trader_name") or "स्थानिक व्यापारी (Local Trader)"),
                market_name=params.get("market_name") or (lot.storage_location if lot else None),
                commodity=comm_name,
                variety=str(params.get("variety") or (lot.variety if lot else "Standard")),
                lot_id=lot.id if lot else None,
                quantity=qty,
                rate_per_unit=rate,
                initial_payment_received=init_pay,
                deductions=deductions_in
            )
            sale = TransactionService.create_sale(db, farmer_id, payload)
            
            # Formatted deduction breakdown for clean UI presentation
            ded_breakdown = [
                {"deduction_type": d.deduction_type, "amount": str(d.amount), "description": d.description}
                for d in deductions_in
            ]

            return {
                "status": "SUCCESS",
                "message": f"विक्री नोंदणी यशस्वी! निव्वळ रक्कम: ₹{sale.net_receivable:,.2f}",
                "sale_id": sale.id,
                "trader_name": sale.trader_name,
                "market_name": sale.market_name,
                "commodity": sale.commodity,
                "variety": sale.variety,
                "quantity": str(sale.quantity),
                "quantity_unit": sale.quantity_unit,
                "rate_per_unit": str(sale.rate_per_unit),
                "gross_amount": str(sale.gross_amount),
                "total_deductions": str(sale.total_deductions),
                "net_receivable": str(sale.net_receivable),
                "outstanding_balance": str(sale.outstanding_balance),
                "deductions": ded_breakdown,
                "lot_code": lot.lot_code if lot else None,
                "remaining_lot_quantity": str(lot.available_quantity) if lot else None
            }

        elif action_name == "record_payment":
            payload = PaymentCreate(
                sale_id=params.get("sale_id"),
                amount=Decimal(str(params.get("amount") or "1000.00")),
                payment_mode=str(params.get("payment_mode") or "CASH").upper(),
                reference_note=params.get("reference_note")
            )
            payment = TransactionService.record_payment(db, farmer_id, payload)
            return {
                "status": "SUCCESS",
                "message": f"₹{payment.amount:,.2f} चे पेमेंट यशस्वीरित्या नोंदवले.",
                "payment_id": payment.id,
                "amount": str(payment.amount)
            }

        elif action_name == "update_farmer_crops":
            crops = params.get("crops", [])
            FarmerRepository.update(db, farmer_profile, {"commonly_grown_crops": crops})
            db.commit()
            return {
                "status": "SUCCESS",
                "message": "पिके प्रोफाईलमध्ये यशस्वीरित्या अद्ययावत केली गेली.",
                "crops": crops
            }

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Action '{action_name}' is not recognized or permitted."
        )


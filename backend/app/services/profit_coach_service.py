from datetime import date
from typing import List, Dict, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.models.farmer_profile import FarmerProfile
from app.models.transaction import Sale, SaleDeduction
from app.models.mandi import MarketPrice
from app.schemas.profit_coach import (
    ProfitCoachResponse,
    TraderDebtor,
    RealizedBenchmarkComparison,
    DeductionAudit,
)

class ProfitCoachService:
    @staticmethod
    def analyze(db: Session, farmer_profile: Optional[FarmerProfile], lang: str = "mr-IN") -> ProfitCoachResponse:
        farmer_id = farmer_profile.id if farmer_profile else 0
        farmer_name = farmer_profile.display_name if farmer_profile else "Farmer"
        language = farmer_profile.preferred_language if farmer_profile else lang

        # Fetch all sales by farmer
        sales = list(db.scalars(select(Sale).where(Sale.farmer_id == farmer_id)).all())

        total_gross = Decimal("0.00")
        total_received = Decimal("0.00")
        total_outstanding = Decimal("0.00")
        total_deductions = Decimal("0.00")

        # Group by commodity
        commodity_stats: Dict[str, Dict[str, Decimal]] = {}
        # Group by trader
        trader_stats: Dict[str, Dict] = {}
        # Deductions breakdown
        deductions_breakdown: Dict[str, Decimal] = {}

        for s in sales:
            total_gross += s.gross_amount
            total_received += s.amount_received
            total_outstanding += s.outstanding_balance
            total_deductions += s.total_deductions

            # Commodity aggregation
            comm = s.commodity.strip()
            if comm not in commodity_stats:
                commodity_stats[comm] = {"total_qty": Decimal("0.00"), "total_gross": Decimal("0.00")}
            commodity_stats[comm]["total_qty"] += s.quantity
            commodity_stats[comm]["total_gross"] += s.gross_amount

            # Trader aggregation
            tname = s.trader_name.strip()
            if tname not in trader_stats:
                trader_stats[tname] = {
                    "outstanding": Decimal("0.00"),
                    "total_sales": 0,
                    "pending_sales": 0,
                    "oldest_unpaid_date": None
                }
            trader_stats[tname]["total_sales"] += 1
            if s.outstanding_balance > Decimal("0.00"):
                trader_stats[tname]["outstanding"] += s.outstanding_balance
                trader_stats[tname]["pending_sales"] += 1
                curr_oldest = trader_stats[tname]["oldest_unpaid_date"]
                if curr_oldest is None or s.sale_date < curr_oldest:
                    trader_stats[tname]["oldest_unpaid_date"] = s.sale_date

            # Deductions aggregation
            for d in s.deductions:
                dtype = d.deduction_type
                deductions_breakdown[dtype] = deductions_breakdown.get(dtype, Decimal("0.00")) + d.amount

        # Collection rate
        collection_rate = Decimal("100.00")
        total_net = (total_gross - total_deductions).quantize(Decimal("0.01"))
        if total_net > Decimal("0.00"):
            collection_rate = ((total_received / total_net) * Decimal("100.00")).quantize(Decimal("0.01"))

        # Build TraderDebtor list sorted by outstanding descending
        debtor_list: List[TraderDebtor] = []
        for tname, tdata in trader_stats.items():
            debtor_list.append(
                TraderDebtor(
                    trader_name=tname,
                    outstanding_amount=tdata["outstanding"].quantize(Decimal("0.01")),
                    total_sales_count=tdata["total_sales"],
                    pending_sales_count=tdata["pending_sales"],
                    oldest_unpaid_date=tdata["oldest_unpaid_date"]
                )
            )
        debtor_list.sort(key=lambda x: x.outstanding_amount, reverse=True)

        # Build Realized vs Benchmark
        rate_comparisons: List[RealizedBenchmarkComparison] = []
        for comm, cdata in commodity_stats.items():
            if cdata["total_qty"] > Decimal("0.00"):
                realized_avg = (cdata["total_gross"] / cdata["total_qty"]).quantize(Decimal("0.01"))
            else:
                realized_avg = Decimal("0.00")

            # Find latest benchmark modal price for this commodity
            bench_price = db.scalar(
                select(MarketPrice.modal_price)
                .where(func.lower(MarketPrice.commodity) == comm.lower())
                .order_by(desc(MarketPrice.arrival_date))
                .limit(1)
            )
            benchmark_modal = bench_price if bench_price else realized_avg
            diff = (realized_avg - benchmark_modal).quantize(Decimal("0.01"))

            if diff > Decimal("50.00"):
                perf = "ABOVE_MARKET"
                if language == "mr-IN":
                    expl = f"तुमचा सरासरी विक्री दर (₹{realized_avg}/क्विंटल) सरकारी बाजारभावापेक्षा (₹{benchmark_modal}) अधिक आहे."
                elif language == "hi-IN":
                    expl = f"आपकी औसत बिक्री दर (₹{realized_avg}/क्विंटल) सरकारी मंडी भाव (₹{benchmark_modal}) से बेहतर है।"
                else:
                    expl = f"Your realized rate (₹{realized_avg}/Qtl) outperformed the government benchmark (₹{benchmark_modal})."
            elif diff < Decimal("-50.00"):
                perf = "BELOW_MARKET"
                if language == "mr-IN":
                    expl = f"स्थानिक व्यापाऱ्यांनी बाजारभावापेक्षा ₹{abs(diff)} कमी दर दिला. पुढील वेळी लिलाव दर तपासा."
                elif language == "hi-IN":
                    expl = f"व्यापारी ने मंडी भाव से ₹{abs(diff)} कम दर दी। अगली बार पहले मंडी भाव जांचें।"
                else:
                    expl = f"Realized rate was ₹{abs(diff)} below prevailing benchmark. Check APMC modal prices before selling."
            else:
                perf = "ON_PAR"
                if language == "mr-IN":
                    expl = f"तुमचा दर चालू सरासरी बाजारभावाच्या (₹{benchmark_modal}) बरोबरीचा आहे."
                elif language == "hi-IN":
                    expl = f"आपकी दर मौजूदा औसत मंडी भाव (₹{benchmark_modal}) के अनुरूप है।"
                else:
                    expl = f"Your rate is aligned with the prevailing mandi modal price of ₹{benchmark_modal}/Qtl."

            rate_comparisons.append(
                RealizedBenchmarkComparison(
                    commodity=comm,
                    farmer_realized_avg_rate=realized_avg,
                    mandi_benchmark_modal_rate=benchmark_modal,
                    difference_per_unit=diff,
                    performance=perf,
                    explanation=expl
                )
            )

        # Deduction Audit
        ded_pct = Decimal("0.00")
        if total_gross > Decimal("0.00"):
            ded_pct = ((total_deductions / total_gross) * Decimal("100.00")).quantize(Decimal("0.01"))

        anomalies: List[str] = []
        comm_fee = deductions_breakdown.get("COMMISSION", Decimal("0.00")) + deductions_breakdown.get("MANDI_COMMISSION", Decimal("0.00"))
        if comm_fee > Decimal("0.00"):
            if language == "mr-IN":
                anomalies.append(f"एकूण ₹{comm_fee} कमिशन कापण्यात आले. नियमानुसार शेतमाल विक्रीवर आडत/कमिशन खरेदीदाराने भरणे बंधनकारक आहे.")
            elif language == "hi-IN":
                anomalies.append(f"कुल ₹{comm_fee} कमीशन काटा गया। APMC नियमों के अनुसार कमीशन आढ़त खरीदार देय होता है, किसान नहीं।")
            else:
                anomalies.append(f"Commission deductions of ₹{comm_fee} detected. Under APMC rules, commission is legally payable by the buyer.")

        if ded_pct > Decimal("5.00"):
            if language == "mr-IN":
                anomalies.append(f"तुमच्या एकूण उत्पन्नाच्या {ded_pct}% रक्कम कपातीत गेली. हे मानक २-३% पेक्षा जास्त आहे.")
            elif language == "hi-IN":
                anomalies.append(f"आपकी कुल आय का {ded_pct}% कटौतियों में गया, जो सामान्य २-३% से अधिक है।")
            else:
                anomalies.append(f"Total deductions account for {ded_pct}% of gross revenue, exceeding standard 2-3% range.")

        # Actionable recommendations
        recs: List[str] = []
        if debtor_list and debtor_list[0].outstanding_amount > Decimal("0.00"):
            top = debtor_list[0]
            if language == "mr-IN":
                recs.append(f"सर्वात मोठी थकबाकी: व्यापारी '{top.trader_name}' कडून ₹{top.outstanding_amount:,.2f} त्वरित वसूल करा.")
            elif language == "hi-IN":
                recs.append(f"प्राथमिकता वसूली: व्यापारी '{top.trader_name}' से ₹{top.outstanding_amount:,.2f} की बकाया राशि प्राप्त करें।")
            else:
                recs.append(f"Top priority recovery: Follow up with '{top.trader_name}' for outstanding ₹{top.outstanding_amount:,.2f}.")

        for comp in rate_comparisons:
            if comp.performance == "BELOW_MARKET":
                if language == "mr-IN":
                    recs.append(f"{comp.commodity} साठी पुढील वेळी मंडीमित्र शिफारसी पाहून अधिक भाव देणाऱ्या बाजार समितीत विक्री करा.")
                elif language == "hi-IN":
                    recs.append(f"{comp.commodity} के लिए अगली बार मंडीमित्र सुझाव देखकर उच्च भाव वाली मंडी में बेचें।")
                else:
                    recs.append(f"For {comp.commodity}, check MandiMitra recommendations to access higher modal rate mandis.")

        if not recs:
            if language == "mr-IN":
                recs.append("तुमचे सर्व आर्थिक व्यवहार सुरळीत आहेत. नवीन विक्रीची वेळेवर नोंद ठेवत राहा.")
            elif language == "hi-IN":
                recs.append("आपके सभी वित्तीय लेन-देन दुरुस्त हैं। नई बिक्री का समय पर हिसाब रखें।")
            else:
                recs.append("All transactions are well-tracked. Keep recording timely sales and payments.")

        return ProfitCoachResponse(
            farmer_name=farmer_name,
            preferred_language=language,
            total_gross_revenue=total_gross.quantize(Decimal("0.01")),
            total_realized_revenue=total_received.quantize(Decimal("0.01")),
            total_outstanding_receivable=total_outstanding.quantize(Decimal("0.01")),
            collection_rate_percent=collection_rate,
            trader_debtors=debtor_list,
            rate_comparisons=rate_comparisons,
            deduction_audit=DeductionAudit(
                total_deductions=total_deductions.quantize(Decimal("0.01")),
                deductions_pct_of_gross=ded_pct,
                breakdown=deductions_breakdown,
                anomalies=anomalies
            ),
            actionable_recommendations=recs
        )


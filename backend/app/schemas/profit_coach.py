from datetime import date
from typing import List, Optional, Dict
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class TraderDebtor(BaseModel):
    trader_name: str
    outstanding_amount: Decimal
    total_sales_count: int
    pending_sales_count: int
    oldest_unpaid_date: Optional[date] = None

class RealizedBenchmarkComparison(BaseModel):
    commodity: str
    farmer_realized_avg_rate: Decimal
    mandi_benchmark_modal_rate: Decimal
    difference_per_unit: Decimal
    performance: str  # ABOVE_MARKET, ON_PAR, BELOW_MARKET
    explanation: str

class DeductionAudit(BaseModel):
    total_deductions: Decimal
    deductions_pct_of_gross: Decimal
    breakdown: Dict[str, Decimal]
    anomalies: List[str]

class ProfitCoachResponse(BaseModel):
    farmer_name: str
    preferred_language: str
    total_gross_revenue: Decimal
    total_realized_revenue: Decimal
    total_outstanding_receivable: Decimal
    collection_rate_percent: Decimal
    trader_debtors: List[TraderDebtor]
    rate_comparisons: List[RealizedBenchmarkComparison]
    deduction_audit: DeductionAudit
    actionable_recommendations: List[str]

    model_config = ConfigDict(from_attributes=True)


export interface TraderDebtor {
  trader_name: string;
  outstanding_amount: string;
  total_sales_count: number;
  pending_sales_count: number;
  oldest_unpaid_date?: string;
}

export interface RealizedBenchmarkComparison {
  commodity: string;
  farmer_realized_avg_rate: string;
  mandi_benchmark_modal_rate: string;
  difference_per_unit: string;
  performance: 'ABOVE_MARKET' | 'ON_PAR' | 'BELOW_MARKET';
  explanation: string;
}

export interface DeductionAudit {
  total_deductions: string;
  deductions_pct_of_gross: string;
  breakdown: Record<string, string>;
  anomalies: string[];
}

export interface ProfitCoachResponse {
  farmer_name: string;
  preferred_language: string;
  total_gross_revenue: string;
  total_realized_revenue: string;
  total_outstanding_receivable: string;
  collection_rate_percent: string;
  trader_debtors: TraderDebtor[];
  rate_comparisons: RealizedBenchmarkComparison[];
  deduction_audit: DeductionAudit;
  actionable_recommendations: string[];
}


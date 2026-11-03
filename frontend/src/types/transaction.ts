export interface Deduction {
  id?: number;
  deduction_type: string;
  amount: string | number;
  description?: string;
}

export interface PaymentAllocationItem {
  id?: number;
  sale_id: number;
  amount: string | number;
}

export interface Sale {
  id: number;
  farmer_id: number;
  lot_id?: number | null;
  trader_name: string;
  market_name?: string | null;
  commodity: string;
  variety: string;
  quantity: string | number;
  quantity_unit: string;
  rate_per_unit: string | number;
  gross_amount: string | number;
  total_deductions: string | number;
  net_receivable: string | number;
  amount_received: string | number;
  outstanding_balance: string | number;
  status: 'PENDING' | 'PARTIAL' | 'SETTLED' | string;
  sale_date: string;
  notes?: string | null;
  evidence_url?: string | null;
  evidence_type?: string | null;
  audio_note_url?: string | null;
  created_at: string;
  deductions: Deduction[];
}

export interface SaleCreatePayload {
  trader_name: string;
  market_name?: string;
  commodity: string;
  variety?: string;
  lot_id?: number;
  quantity: number | string;
  quantity_unit?: string;
  rate_per_unit: number | string;
  sale_date?: string;
  initial_payment_received?: number | string;
  deductions?: Deduction[];
  notes?: string;
  evidence_url?: string;
  evidence_type?: string;
  audio_note_url?: string;
}

export interface Payment {
  id: number;
  farmer_id: number;
  sale_id?: number | null;
  amount: string | number;
  payment_mode: string;
  payment_date: string;
  reference_note?: string | null;
  evidence_url?: string | null;
  evidence_type?: string | null;
  audio_note_url?: string | null;
  created_at: string;
  allocations?: PaymentAllocationItem[];
}

export interface PaymentCreatePayload {
  sale_id?: number;
  amount: number | string;
  payment_mode: string;
  payment_date?: string;
  reference_note?: string;
  evidence_url?: string;
  evidence_type?: string;
  audio_note_url?: string;
  allocations?: { sale_id: number; amount: number | string }[];
}

export interface FinanceSummary {
  total_sales_count: number;
  total_gross_amount: string | number;
  total_deductions: string | number;
  total_net_receivable: string | number;
  total_received: string | number;
  total_outstanding: string | number;
  settled_sales_count: number;
  pending_sales_count: number;
  deductions_breakdown: Record<string, string | number>;
}

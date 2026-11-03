import { request } from './api';
import type { Sale, SaleCreatePayload, Payment, PaymentCreatePayload, FinanceSummary } from '../types/transaction';

export const transactionService = {
  async getSales(): Promise<Sale[]> {
    return request<Sale[]>('/sales');
  },

  async getSaleDetails(saleId: number): Promise<Sale> {
    return request<Sale>(`/sales/${saleId}`);
  },

  async createSale(payload: SaleCreatePayload): Promise<Sale> {
    return request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getPayments(): Promise<Payment[]> {
    return request<Payment[]>('/payments');
  },

  async recordPayment(payload: PaymentCreatePayload): Promise<Payment> {
    return request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getFinanceSummary(): Promise<FinanceSummary> {
    return request<FinanceSummary>('/finance/summary');
  },
};


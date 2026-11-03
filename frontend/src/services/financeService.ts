import { request } from './api';
import type { FinanceSummary } from '../types/transaction';
import type { ProfitCoachResponse } from '../types/profit_coach';

export const financeService = {
  getSummary: async (): Promise<FinanceSummary> => {
    return request<FinanceSummary>('/finance/summary');
  },

  getProfitCoach: async (): Promise<ProfitCoachResponse> => {
    return request<ProfitCoachResponse>('/finance/profit-coach');
  }
};

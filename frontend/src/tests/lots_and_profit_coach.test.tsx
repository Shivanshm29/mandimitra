import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../app/LanguageContext';
import { AuthProvider } from '../app/AuthContext';
import { SellingLotsManager } from '../components/SellingLotsManager';
import { ProfitCoachPage } from '../pages/ProfitCoachPage';
import { lotService } from '../services/lotService';
import { financeService } from '../services/financeService';

vi.mock('../services/lotService');
vi.mock('../services/financeService');

describe('Selling Lots & Profit Coach UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SellingLotsManager with lots, codes, and available quantities', async () => {
    (lotService.getLots as any).mockResolvedValue([
      {
        id: 1,
        farmer_id: 1,
        lot_code: 'LOT-001',
        commodity: 'Onion',
        variety: 'Red Garwa',
        quality_grade: 'Grade A',
        total_quantity: '20.00',
        available_quantity: '12.00',
        sold_quantity: '8.00',
        unit: 'QUINTAL',
        status: 'PARTIALLY_SOLD',
        created_at: '2026-11-03T10:00:00Z',
        updated_at: '2026-11-03T10:00:00Z',
      },
    ]);

    render(
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <SellingLotsManager />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    );

    // Switch to Selling Lots tab to view LOT-001
    const lotsTab = await screen.findByText(/शेतमाल साठा व विक्री लॉट्स|Produce Lots/i);
    fireEvent.click(lotsTab);

    await waitFor(() => {
      expect(screen.getByText('LOT-001')).toBeInTheDocument();
      expect(screen.getByText(/12\.00 Qtl/i)).toBeInTheDocument();
    });
  });

  it('renders ProfitCoachPage with metrics, debtors, and deduction audit alerts', async () => {
    (financeService.getProfitCoach as any).mockResolvedValue({
      farmer_name: 'Ganesh Shinde',
      preferred_language: 'mr-IN',
      total_gross_revenue: '202000.00',
      total_realized_revenue: '50000.00',
      total_outstanding_receivable: '146300.00',
      collection_rate_percent: '25.40',
      trader_debtors: [
        {
          trader_name: 'Patil & Sons',
          outstanding_amount: '91500.00',
          total_sales_count: 1,
          pending_sales_count: 1,
          oldest_unpaid_date: '2026-10-20',
        },
      ],
      rate_comparisons: [
        {
          commodity: 'Onion',
          farmer_realized_avg_rate: '2200.00',
          mandi_benchmark_modal_rate: '2000.00',
          difference_per_unit: '200.00',
          performance: 'ABOVE_MARKET',
          explanation: 'तुमचा विक्री दर सरकारी बाजारभावापेक्षा अधिक आहे.',
        },
      ],
      deduction_audit: {
        total_deductions: '5700.00',
        deductions_pct_of_gross: '2.82',
        breakdown: { COMMISSION: '4400.00', HAMALI: '800.00' },
        anomalies: ['कमिशन कपात आढळली'],
      },
      actionable_recommendations: ['व्यापारी Patil & Sons कडून येणे वसूल करा.'],
    });

    render(
      <BrowserRouter>
        <LanguageProvider>
          <ProfitCoachPage />
        </LanguageProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Patil & Sons/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/कमिशन कपात आढळली/i)).toBeInTheDocument();
    });
  });
});

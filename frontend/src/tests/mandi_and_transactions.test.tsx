import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../app/LanguageContext';
import { RecordSaleModal } from '../components/RecordSaleModal';
import { SellingRecommendationsPage } from '../pages/SellingRecommendationsPage';
import { mandiService } from '../services/mandiService';

describe('Mandi & Transactions Interactive Features', () => {
  it('correctly calculates gross, deductions, and net in RecordSaleModal', () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <LanguageProvider>
        <RecordSaleModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />
      </LanguageProvider>
    );

    // Quantity = 10, Rate = 5000 -> Gross = 50,000
    const qtyInput = screen.getByLabelText(/परिमाण \(क्विंटल\)/i);
    const rateInput = screen.getByLabelText(/दर \(₹ प्रति क्विंटल\)/i);

    fireEvent.change(qtyInput, { target: { value: '10' } });
    fireEvent.change(rateInput, { target: { value: '5000' } });

    // Deductions: 1000
    const deductionAmountInput = screen.getByPlaceholderText(/रक्कम ₹/i);
    fireEvent.change(deductionAmountInput, { target: { value: '1000' } });

    // Expect calculation results in summary box
    expect(screen.getByText(/50,000.00/i)).toBeInTheDocument(); // Gross
    expect(screen.getByText(/-₹1,000.00/i)).toBeInTheDocument(); // Deduction
    const netElements = screen.getAllByText(/49,000.00/i);
    expect(netElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders selling recommendations and best market badge', async () => {
    vi.spyOn(mandiService, 'getRecommendations').mockResolvedValue({
      commodity: 'Soybean',
      quantity: '50',
      best_market: 'Barshi APMC',
      best_modal_price: '4720.00',
      highest_potential_gross: '236000.00',
      potential_extra_gain: '7000.00',
      reasoning: 'Barshi APMC reports highest modal rate.',
      recommendations: [
        {
          market_name: 'Barshi APMC',
          district: 'Solapur',
          min_price: '4400.00',
          max_price: '4850.00',
          modal_price: '4720.00',
          estimated_gross: '236000.00',
          price_difference_per_quintal: '0.00',
          rank: 1,
          data_source: 'AGMARKNET / MSAMB',
          arrival_date: '2026-11-03',
        },
      ],
    });

    render(
      <BrowserRouter>
        <LanguageProvider>
          <SellingRecommendationsPage />
        </LanguageProvider>
      </BrowserRouter>
    );

    // Submit the recommendation search form
    const submitBtn = screen.getByRole('button', { name: /योग्य भाव शोधा/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const bestElements = screen.getAllByText(/Barshi APMC/i);
      expect(bestElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});

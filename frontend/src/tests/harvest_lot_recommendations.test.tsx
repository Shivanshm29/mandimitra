import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../app/LanguageContext';
import { SellingRecommendationsPage } from '../pages/SellingRecommendationsPage';
import { mandiService } from '../services/mandiService';
import { lotService } from '../services/lotService';
import { harvestService } from '../services/harvestService';
import { farmerService } from '../services/farmerService';

describe('Harvest Lot Recommendations & Smart APMC Ranking', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(farmerService, 'getProfile').mockResolvedValue({
      id: 1,
      full_name: 'Dnyaneshwar Patil',
      phone_number: '9876543210',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Lasalgaon',
      preferred_language: 'mr-IN',
      commonly_grown_crops: ['Onion', 'Soybean'],
    } as any);

    vi.spyOn(lotService, 'getLots').mockResolvedValue([
      {
        id: 101,
        lot_code: 'LOT-2026-ONION-01',
        commodity: 'Onion',
        variety: 'Garva / Red',
        quality_grade: 'Grade A',
        total_quantity: 40,
        available_quantity: 35,
        sold_quantity: 5,
        status: 'PARTIALLY_SOLD',
        created_at: '2026-11-03',
      } as any,
    ]);

    vi.spyOn(harvestService, 'getHarvests').mockResolvedValue([
      {
        id: 201,
        commodity: 'Soybean',
        variety: 'Yellow',
        harvested_quantity: 60,
        remaining_quantity: 45,
        allocated_quantity: 15,
        harvest_date: '2026-11-01',
        quantity_unit: 'Quintal',
        quality_grade: 'Grade A',
      } as any,
    ]);

    vi.spyOn(mandiService, 'getRecommendations').mockResolvedValue({
      commodity: 'Onion',
      quantity: 35,
      variety: 'Garva / Red',
      quality_grade: 'Grade A',
      farmer_district: 'Nashik',
      lot_id: 101,
      lot_code: 'LOT-2026-ONION-01',
      best_market: 'Pimpalgaon APMC',
      best_modal_price: '2450.00',
      highest_potential_gross: '85750.00',
      potential_extra_gain: '5250.00',
      best_price_market: 'Pimpalgaon APMC',
      convenient_market: 'Lasalgaon APMC',
      best_overall_market: 'Lasalgaon APMC',
      data_disclaimer: 'Modal price is an official APMC benchmark from AGMARKNET / MSAMB.',
      reasoning: 'Pimpalgaon reports the highest modal rate at ₹2450/Qtl for Red Onion.',
      recommendations: [
        {
          market_name: 'Pimpalgaon APMC',
          district: 'Nashik',
          min_price: '2100.00',
          max_price: '2650.00',
          modal_price: '2450.00',
          estimated_gross: '85750.00',
          min_estimated_gross: '73500.00',
          max_estimated_gross: '92750.00',
          price_difference_per_quintal: '0.00',
          rank: 1,
          arrivals_volume: 4200,
          data_source: 'AGMARKNET / MSAMB',
          arrival_date: '2026-11-03',
          is_best_price: true,
          is_convenient_local: true,
          is_best_overall: true,
          recommendation_reason: 'Highest reported rate with active arrivals.',
        },
        {
          market_name: 'Lasalgaon APMC',
          district: 'Nashik',
          min_price: '2000.00',
          max_price: '2500.00',
          modal_price: '2300.00',
          estimated_gross: '80500.00',
          min_estimated_gross: '70000.00',
          max_estimated_gross: '87500.00',
          price_difference_per_quintal: '150.00',
          rank: 2,
          arrivals_volume: 6800,
          data_source: 'AGMARKNET / MSAMB',
          arrival_date: '2026-11-03',
          is_best_price: false,
          is_convenient_local: true,
          is_best_overall: false,
          recommendation_reason: 'Top local APMC in registered district with huge liquidity.',
        },
      ],
    });
  });

  it('renders lot quick selector with active lots and auto-fetches recommendations', async () => {
    render(
      <MemoryRouter initialEntries={['/selling-recommendations?lotId=101']}>
        <LanguageProvider>
          <SellingRecommendationsPage />
        </LanguageProvider>
      </MemoryRouter>
    );

    // Verify lot card is visible in quick selector
    await waitFor(() => {
      expect(screen.getByText('LOT-2026-ONION-01')).toBeInTheDocument();
      const apmcItems = screen.getAllByText(/Pimpalgaon APMC/i);
      expect(apmcItems.length).toBeGreaterThanOrEqual(1);
    });

    // Check that the 3 key badges are rendered
    expect(screen.getByText(/सर्वोत्तम नोंदवलेला भाव/i)).toBeInTheDocument();
    expect(screen.getByText(/सोयीस्कर स्थानिक बाजार/i)).toBeInTheDocument();
    expect(screen.getByText(/सर्वोत्तम संतुलित निवड/i)).toBeInTheDocument();

    // Check modal rate & estimated gross payout
    const grossElements = screen.getAllByText(/85,750/i);
    expect(grossElements.length).toBeGreaterThanOrEqual(1);

    // Check disclaimer presence
    const disclaimers = screen.getAllByText(/AGMARKNET \/ MSAMB/i);
    expect(disclaimers.length).toBeGreaterThanOrEqual(1);
  });

  it('opens RecordSaleModal with prefilled lot and market rate when Sell button is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/selling-recommendations?lotId=101']}>
        <LanguageProvider>
          <SellingRecommendationsPage />
        </LanguageProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('LOT-2026-ONION-01')).toBeInTheDocument();
    });

    // Find and click the "या मंडीमध्ये विक्री नोंदवा" button on Pimpalgaon APMC
    const sellButtons = await screen.findAllByRole('button', { name: /या मंडीमध्ये विक्री नोंदवा/i });
    expect(sellButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(sellButtons[0]);

    // Verify RecordSaleModal opened with market name prefilled
    await waitFor(() => {
      const modalTitles = screen.getAllByText(/नवीन विक्री नोंदवा/i);
      expect(modalTitles.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByDisplayValue(/Pimpalgaon APMC/i)).toBeInTheDocument();
    });
  });
});

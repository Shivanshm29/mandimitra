import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../app/LanguageContext';
import { AuthProvider } from '../app/AuthContext';
import { AssistantProvider } from '../app/AssistantContext';
import { FloatingVoiceAssistant } from '../components/FloatingVoiceAssistant';
import { DashboardPage } from '../pages/DashboardPage';
import { sarvamService } from '../services/sarvamService';

// Mock sarvamService
vi.mock('../services/sarvamService', () => ({
  sarvamService: {
    askAssistant: vi.fn().mockResolvedValue({
      reply: '**Best Mandi:** Lasalgaon APMC. **Modal Price:** ₹2,350/quintal.',
      speech_text: 'The best reported market is Lasalgaon APMC, where the modal price is 2,350 rupees per quintal.',
      language: 'mr-IN',
      suggested_actions: ['Find Mandi', 'Check Receivables'],
      action_proposal: {
        action: 'record_sale',
        summary: 'Record sale of 10 Quintals Onion to Shri Ganesh Traders',
        requires_confirmation: true,
        parameters: {
          trader_name: 'श्री गणेश ट्रेडर्स',
          market_name: 'लासलगाव APMC',
          commodity: 'Onion',
          variety: 'Red Garwa',
          quantity: 10.0,
          rate_per_unit: 2400.0,
          lot_code: 'LOT-001',
          deductions: [
            { deduction_type: 'HAMALI', amount: 200, description: 'Labor unloading' },
            { deduction_type: 'WEIGHING_FEE', amount: 50, description: 'Weighing charge' },
          ],
        },
      },
      ui_action: null,
    }),
    textToSpeech: vi.fn().mockResolvedValue({ audio_base64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=', audio_format: 'wav', language: 'mr-IN' }),
    transcribeAudio: vi.fn().mockResolvedValue({ transcript: 'आज लासलगावमध्ये कांद्याला काय भाव आहे?', language_code: 'mr-IN' }),
    executeAction: vi.fn().mockResolvedValue({
      status: 'SUCCESS',
      message: 'विक्री नोंदणी यशस्वी! निव्वळ रक्कम: ₹23,750.00',
      data: { sale_id: 1, net_receivable: '23750.00' },
    }),
  },
}));

// Mock Mandi, Transaction, and Lot services
vi.mock('../services/mandiService', () => ({
  mandiService: {
    getPrices: vi.fn().mockResolvedValue([]),
    getCommodities: vi.fn().mockResolvedValue(['Onion', 'Soybean']),
    getPriceAlerts: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../services/transactionService', () => ({
  transactionService: {
    getSales: vi.fn().mockResolvedValue([]),
    getFinanceSummary: vi.fn().mockResolvedValue({
      total_sales_count: 0,
      total_gross_amount: '0.00',
      total_deductions: '0.00',
      total_net_receivable: '0.00',
      total_received: '0.00',
      total_outstanding: '0.00',
      settled_sales_count: 0,
      pending_sales_count: 0,
      deductions_breakdown: {},
    }),
  },
}));

vi.mock('../services/harvestService', () => ({
  harvestService: {
    getHarvests: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../services/lotService', () => ({
  lotService: {
    getLots: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../services/farmerService', () => ({
  farmerService: {
    getProfile: vi.fn().mockResolvedValue({
      id: 1,
      display_name: 'तुकाराम पाटील',
      district: 'Nashik',
      village: 'पिंपळगाव',
      preferred_language: 'mr-IN',
      commonly_grown_crops: [{ commodity: 'Onion', variety: 'Red Garwa' }],
    }),
  },
}));

const renderTestApp = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AssistantProvider>
            {ui}
            <FloatingVoiceAssistant />
          </AssistantProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe('Sarvam AI Voice Assistant & Action Execution Upgrade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. Yellow dashboard button activates direct voice-first interaction on the dashboard without opening drawer', async () => {
    renderTestApp(<DashboardPage />);

    // Drawer is closed initially
    expect(screen.queryByRole('dialog', { name: /Sarvam AI Assistant Panel/i })).not.toBeInTheDocument();

    // Click the yellow "बोलून विचारा / Ask Sarvam AI" button
    const yellowButton = screen.getByRole('button', { name: /बोलून विचारा \/ Ask Sarvam AI/i });
    expect(yellowButton).toBeInTheDocument();
    fireEvent.click(yellowButton);

    // It should activate direct dashboard voice interaction, NOT open the drawer dialog
    expect(screen.queryByRole('dialog', { name: /Sarvam AI Assistant Panel/i })).not.toBeInTheDocument();

    // The dashboard voice banner appears with transcript and response
    await waitFor(() => {
      expect(screen.getByText(/मंडीमित्र सर्वम AI व्हॉइस सहाय्यक/i)).toBeInTheDocument();
    });

    // Verify response displays with formatted Markdown and proposal card
    expect(await screen.findByText(/Best Mandi:/i)).toBeInTheDocument();
    expect(await screen.findByText(/Lasalgaon APMC/i)).toBeInTheDocument();
  });

  it('2. Green floating button opens the full chat panel drawer', async () => {
    renderTestApp(<DashboardPage />);

    // Find the floating trigger button
    const greenFloatingButton = screen.getByRole('button', { name: /Open Sarvam Voice Assistant/i });
    expect(greenFloatingButton).toBeInTheDocument();
    fireEvent.click(greenFloatingButton);

    // The universal panel drawer opens
    const dialog = await screen.findByRole('dialog', { name: /Sarvam AI Assistant Panel/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /मंडीमित्र सर्वम AI सहाय्यक/i })).toBeInTheDocument();
  });

  it('3. Action proposal card displays structured financial details without [object Object] and saves cleanly', async () => {
    renderTestApp(<DashboardPage />);

    // Open chat drawer
    fireEvent.click(screen.getByRole('button', { name: /Open Sarvam Voice Assistant/i }));

    // Send a message
    const input = await screen.findByPlaceholderText(/काहीही विचारा किंवा आज्ञा द्या/i);
    fireEvent.change(input, { target: { value: 'माझा कांदा विका' } });
    fireEvent.click(screen.getByTitle('Send'));

    // Wait for the action proposal card
    await waitFor(() => {
      expect(screen.getByText(/नवीन विक्री पुष्टीकरण/i)).toBeInTheDocument();
    });

    // Check that deductions are rendered properly as names and amounts, NOT [object Object]
    expect(screen.queryByText(/\[object Object\]/i)).not.toBeInTheDocument();
    expect(screen.getByText(/HAMALI/i)).toBeInTheDocument();
    expect(screen.getByText(/-₹200.00/i)).toBeInTheDocument();
    expect(screen.getByText(/-₹50.00/i)).toBeInTheDocument();

    // Check Gross and Net Realization
    expect(screen.getByText(/₹24,000.00/i)).toBeInTheDocument();
    expect(screen.getByText(/₹23,750.00/i)).toBeInTheDocument();

    // Confirm and Save
    const confirmBtn = screen.getByRole('button', { name: /✓ विक्री नोंदवा व सेव्ह करा/i });
    fireEvent.click(confirmBtn);

    // Verify backend executeAction was called with correct parameters
    await waitFor(() => {
      expect(sarvamService.executeAction).toHaveBeenCalledWith('record_sale', expect.objectContaining({
        commodity: 'Onion',
        quantity: 10,
        rate_per_unit: 2400,
      }));
    });

    // Success banner appears
    expect(await screen.findByText(/विक्री नोंदणी यशस्वी! निव्वळ रक्कम: ₹23,750.00/i)).toBeInTheDocument();
  });

  it('4. Audio controls allow playback, pause, and stop with Bulbul V4', async () => {
    renderTestApp(<DashboardPage />);

    // Open chat
    fireEvent.click(screen.getByRole('button', { name: /Open Sarvam Voice Assistant/i }));

    // Send message to get assistant reply
    const input = await screen.findByPlaceholderText(/काहीही विचारा किंवा आज्ञा द्या/i);
    fireEvent.change(input, { target: { value: 'कांद्याचे आजचे भाव सांगा' } });
    fireEvent.click(screen.getByTitle('Send'));

    // Wait for assistant reply and Listen button
    const listenBtn = await screen.findByRole('button', { name: /ऐका \(Bulbul V4\)/i });
    expect(listenBtn).toBeInTheDocument();

    // Click listen
    fireEvent.click(listenBtn);

    // textToSpeech service is called with speech text
    await waitFor(() => {
      expect(sarvamService.textToSpeech).toHaveBeenCalled();
    });
  });
});

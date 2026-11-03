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
      reply: 'लासलगाव APMC मध्ये कांद्याचा आजचा मोडल भाव ₹२,३५० प्रति क्विंटल आहे.',
      action_proposal: null,
      ui_action: null,
    }),
    textToSpeech: vi.fn().mockResolvedValue({ audio_base64: null }),
    transcribeAudio: vi.fn().mockResolvedValue({ transcript: 'कांद्याचे आजचे भाव सांगा' }),
    executeAction: vi.fn().mockResolvedValue({ success: true, message: 'Done' }),
  },
}));

// Mock Mandi, Transaction, and Lot services to avoid network in tests
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

// Test helper wrapper providing all required contexts
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

describe('Sarvam AI Voice Assistant Entry Points & Unified State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. Opens the Sarvam AI assistant panel when clicking the yellow dashboard button', async () => {
    renderTestApp(<DashboardPage />);

    // Initially the chat drawer is closed
    expect(screen.queryByRole('dialog', { name: /Sarvam AI Assistant Panel/i })).not.toBeInTheDocument();

    // Find and click the yellow "बोलून विचारा / Ask Sarvam AI" button on dashboard
    const yellowButton = screen.getByRole('button', { name: /बोलून विचारा \/ Ask Sarvam AI/i });
    expect(yellowButton).toBeInTheDocument();
    fireEvent.click(yellowButton);

    // The universal Sarvam AI conversation panel must open
    const dialog = await screen.findByRole('dialog', { name: /Sarvam AI Assistant Panel/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /मंडीमित्र सर्वम AI सहाय्यक/i })).toBeInTheDocument();
  });

  it('2. Opens the exact same Sarvam AI assistant panel when clicking the floating green button', async () => {
    renderTestApp(<DashboardPage />);

    // Initially closed
    expect(screen.queryByRole('dialog', { name: /Sarvam AI Assistant Panel/i })).not.toBeInTheDocument();

    // Find the floating trigger button
    const greenFloatingButton = screen.getByRole('button', { name: /Open Sarvam Voice Assistant/i });
    expect(greenFloatingButton).toBeInTheDocument();
    fireEvent.click(greenFloatingButton);

    // The universal panel opens
    const dialog = await screen.findByRole('dialog', { name: /Sarvam AI Assistant Panel/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /मंडीमित्र सर्वम AI सहाय्यक/i })).toBeInTheDocument();
  });

  it('3. Preserves conversation history between both entry points', async () => {
    renderTestApp(<DashboardPage />);

    // Open via yellow button
    const yellowButton = screen.getByRole('button', { name: /बोलून विचारा \/ Ask Sarvam AI/i });
    fireEvent.click(yellowButton);

    // Send a message
    const input = await screen.findByPlaceholderText(/काहीही विचारा किंवा आज्ञा द्या/i);
    fireEvent.change(input, { target: { value: 'कांद्याचे आजचे भाव काय आहेत?' } });

    const sendBtn = screen.getByTitle('Send');
    fireEvent.click(sendBtn);

    // Message and response appear
    expect(await screen.findByText('कांद्याचे आजचे भाव काय आहेत?')).toBeInTheDocument();
    expect(
      await screen.findByText('लासलगाव APMC मध्ये कांद्याचा आजचा मोडल भाव ₹२,३५० प्रति क्विंटल आहे.')
    ).toBeInTheDocument();

    // Close the panel using Close button
    const closeBtn = screen.getByRole('button', { name: /Close assistant/i });
    fireEvent.click(closeBtn);

    // Panel is closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Sarvam AI Assistant Panel/i })).not.toBeInTheDocument();
    });

    // Reopen using the floating green button
    const greenFloatingButton = screen.getByRole('button', { name: /Open Sarvam Voice Assistant/i });
    fireEvent.click(greenFloatingButton);

    // Verify conversation history is completely preserved!
    expect(await screen.findByRole('dialog', { name: /Sarvam AI Assistant Panel/i })).toBeInTheDocument();
    expect(screen.getByText('कांद्याचे आजचे भाव काय आहेत?')).toBeInTheDocument();
    expect(
      screen.getByText('लासलगाव APMC मध्ये कांद्याचा आजचा मोडल भाव ₹२,३५० प्रति क्विंटल आहे.')
    ).toBeInTheDocument();
  });

  it('4. Quick prompt buttons work and submit to the unified assistant', async () => {
    renderTestApp(<DashboardPage />);

    const yellowButton = screen.getByRole('button', { name: /बोलून विचारा \/ Ask Sarvam AI/i });
    fireEvent.click(yellowButton);

    // Click a quick prompt: 'आज लासलगावमध्ये कांद्याला काय भाव आहे?'
    const quickPrompt = await screen.findByText('आज लासलगावमध्ये कांद्याला काय भाव आहे?');
    fireEvent.click(quickPrompt);

    // Prompt submitted and answered
    await waitFor(() => {
      const elements = screen.getAllByText('आज लासलगावमध्ये कांद्याला काय भाव आहे?');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    expect(sarvamService.askAssistant).toHaveBeenCalledWith(
      'आज लासलगावमध्ये कांद्याला काय भाव आहे?',
      'mr-IN'
    );
  });
});

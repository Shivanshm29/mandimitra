import { request } from './api';

export interface ActionProposal {
  action: string;
  summary: string;
  requires_confirmation: boolean;
  parameters: Record<string, any>;
}

export interface ChatResponse {
  reply: string;
  speech_text?: string;
  language: string;
  suggested_actions: string[];
  action_proposal?: ActionProposal | null;
  ui_action?: {
    type: 'navigate' | 'open_modal' | 'switch_language';
    route?: string;
    modal?: 'RECORD_SALE' | 'RECORD_PAYMENT' | 'SCAN_BILL' | 'ADD_HARVEST' | 'CREATE_LOT';
    prefill?: Record<string, any>;
    language?: string;
    message?: string;
  } | null;
}

export interface ExecuteActionResponse {
  status: string;
  message: string;
  data?: any;
}

export interface TTSResponse {
  audio_base64: string;
  language: string;
  audio_format: string;
}

export interface STTResponse {
  transcript: string;
  language_code?: string;
}

export interface ExtractedDeduction {
  deduction_type: string;
  amount: number | string;
  description?: string;
}

export interface DocumentExtractResponse {
  trader_name?: string | null;
  market_name?: string | null;
  commodity?: string | null;
  variety?: string | null;
  quantity?: number | string | null;
  quantity_unit: string;
  rate_per_unit?: number | string | null;
  gross_amount?: number | string | null;
  deductions: ExtractedDeduction[];
  total_deductions?: number | string | null;
  net_receivable?: number | string | null;
  sale_date?: string | null;
  confidence_score: number;
  extracted_summary: string;
  notes?: string | null;
}

export const sarvamService = {
  async askAssistant(message: string, language: string = 'mr-IN'): Promise<ChatResponse> {
    return request<ChatResponse>('/sarvam/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    });
  },

  async executeAction(action: string, parameters: Record<string, any>): Promise<ExecuteActionResponse> {
    return request<ExecuteActionResponse>('/sarvam/execute-action', {
      method: 'POST',
      body: JSON.stringify({ action, parameters }),
    });
  },

  async extractCrops(text: string, language: string = 'mr-IN'): Promise<{ crops: Array<{ commodity: string; variety?: string }> }> {
    return request<{ crops: Array<{ commodity: string; variety?: string }> }>('/sarvam/extract-crops', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    });
  },

  async textToSpeech(text: string, language: string = 'mr-IN', speed: number = 1.0): Promise<TTSResponse> {
    return request<TTSResponse>('/sarvam/tts', {
      method: 'POST',
      body: JSON.stringify({ text, language, speed }),
    });
  },

  async transcribeAudio(file: Blob, language: string = 'mr-IN'): Promise<STTResponse> {
    const token = localStorage.getItem('mandimitra_token');
    const formData = new FormData();
    formData.append('file', file, 'audio.wav');
    formData.append('language_code', language);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/v1/sarvam/transcribe', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'STT failed' }));
      throw new Error(err.detail || 'Failed to transcribe audio');
    }

    return response.json();
  },

  async extractDocument(document_text?: string, image_base64?: string, language: string = 'mr-IN'): Promise<DocumentExtractResponse> {
    return request<DocumentExtractResponse>('/sarvam/document-extract', {
      method: 'POST',
      body: JSON.stringify({ document_text, image_base64, language }),
    });
  },
};

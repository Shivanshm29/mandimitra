import { request } from './api';
import type {
  MarketPrice,
  RecommendationResponse,
  RecommendationRequestPayload,
  PriceAlert,
  PriceAlertCreatePayload,
} from '../types/mandi';

export const mandiService = {
  async getPrices(params: { commodity?: string; district?: string; market_name?: string; limit?: number } = {}): Promise<MarketPrice[]> {
    const query = new URLSearchParams();
    if (params.commodity) query.set('commodity', params.commodity);
    if (params.district) query.set('district', params.district);
    if (params.market_name) query.set('market_name', params.market_name);
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<MarketPrice[]>(`/mandi/prices${qs}`);
  },

  async getCommodities(): Promise<string[]> {
    return request<string[]>('/mandi/commodities');
  },

  async getMarkets(): Promise<{ market_name: string; district: string; state: string }[]> {
    return request<{ market_name: string; district: string; state: string }[]>('/mandi/markets');
  },

  async getRecommendations(
    payloadOrCommodity: string | RecommendationRequestPayload,
    quantity?: number,
    variety?: string
  ): Promise<RecommendationResponse> {
    const payload: RecommendationRequestPayload =
      typeof payloadOrCommodity === 'string'
        ? {
            commodity: payloadOrCommodity,
            quantity: quantity ?? 10,
            variety: variety || 'Standard',
          }
        : payloadOrCommodity;

    return request<RecommendationResponse>('/mandi/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getPriceAlerts(): Promise<PriceAlert[]> {
    return request<PriceAlert[]>('/mandi/alerts');
  },

  async createPriceAlert(data: PriceAlertCreatePayload): Promise<PriceAlert> {
    return request<PriceAlert>('/mandi/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deletePriceAlert(id: number): Promise<void> {
    return request<void>(`/mandi/alerts/${id}`, {
      method: 'DELETE',
    });
  },
};



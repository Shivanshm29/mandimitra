export interface MarketPrice {
  id: number;
  state: string;
  district: string;
  market_name: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string | number;
  max_price: string | number;
  modal_price: string | number;
  arrivals_volume?: string | number | null;
  data_source: string;
  reported_at?: string;
}

export interface RecommendationRequestPayload {
  commodity: string;
  quantity: number | string;
  variety?: string;
  quality_grade?: string;
  harvest_id?: number;
  lot_id?: number;
  farmer_district?: string;
  sort_by?: 'price' | 'location' | 'date';
}

export interface RecommendationItem {
  market_name: string;
  district: string;
  min_price: string | number;
  max_price: string | number;
  modal_price: string | number;
  estimated_gross: string | number;
  min_estimated_gross?: string | number;
  max_estimated_gross?: string | number;
  price_difference_per_quintal: string | number;
  rank: number;
  arrivals_volume?: string | number | null;
  data_source: string;
  arrival_date: string;
  reported_at?: string;
  is_best_price?: boolean;
  is_convenient_local?: boolean;
  is_best_overall?: boolean;
  recommendation_reason?: string;
}

export interface RecommendationResponse {
  commodity: string;
  quantity: string | number;
  variety?: string;
  quality_grade?: string;
  farmer_district?: string;
  harvest_id?: number;
  lot_id?: number;
  lot_code?: string;
  best_market: string;
  best_modal_price: string | number;
  highest_potential_gross: string | number;
  potential_extra_gain: string | number;
  best_price_market?: string;
  convenient_market?: string;
  best_overall_market?: string;
  recommendations: RecommendationItem[];
  reasoning: string;
  data_disclaimer?: string;
}

export interface PriceAlert {
  id: number;
  farmer_id: number;
  commodity: string;
  target_modal_price: string | number;
  condition: string;
  market_name?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PriceAlertCreatePayload {
  commodity: string;
  target_modal_price: string | number;
  condition?: string;
  market_name?: string;
}



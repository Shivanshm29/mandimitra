export type SupportedLanguage = 'mr-IN' | 'hi-IN' | 'en-IN';

export interface User {
  id: number;
  username: string;
  email?: string | null;
  phone_number?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface FarmerProfile {
  id: number;
  user_id: number;
  display_name: string;
  phone_number?: string | null;
  state: string;
  district: string;
  village: string;
  locality?: string | null;
  preferred_language: SupportedLanguage;
  commonly_grown_crops?: Array<{ commodity: string; variety?: string } | string>;
  frequently_sold_commodities?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  profile?: FarmerProfile | null;
}

export interface RegisterPayload {
  username: string;
  password: string;
  display_name: string;
  phone_number?: string;
  email?: string;
  state: string;
  district: string;
  village: string;
  locality?: string;
  preferred_language: SupportedLanguage;
  commonly_grown_crops?: Array<{ commodity: string; variety?: string } | string>;
  frequently_sold_commodities?: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ProfileUpdatePayload {
  display_name?: string;
  phone_number?: string;
  state?: string;
  district?: string;
  village?: string;
  locality?: string;
  preferred_language?: SupportedLanguage;
  commonly_grown_crops?: Array<{ commodity: string; variety?: string } | string>;
  frequently_sold_commodities?: string[];
}


import { request } from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, User, FarmerProfile } from '../types/auth';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<User & { profile?: FarmerProfile | null }> {
    return request<User & { profile?: FarmerProfile | null }>('/auth/me');
  },
};

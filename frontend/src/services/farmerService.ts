import { request } from './api';
import type { FarmerProfile, ProfileUpdatePayload } from '../types/auth';

export const farmerService = {
  async getProfile(): Promise<FarmerProfile> {
    return request<FarmerProfile>('/farmer/profile');
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<FarmerProfile> {
    return request<FarmerProfile>('/farmer/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

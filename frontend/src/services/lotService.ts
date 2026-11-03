import { request } from './api';
import type { SellingLot, SellingLotCreate, SellingLotUpdate } from '../types/lot';

export const lotService = {
  getLots: async (statusFilter?: string): Promise<SellingLot[]> => {
    const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
    return request<SellingLot[]>(`/lots${query}`);
  },

  getLotById: async (id: number): Promise<SellingLot> => {
    return request<SellingLot>(`/lots/${id}`);
  },

  createLot: async (data: SellingLotCreate): Promise<SellingLot> => {
    return request<SellingLot>('/lots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLot: async (id: number, data: SellingLotUpdate): Promise<SellingLot> => {
    return request<SellingLot>(`/lots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteLot: async (id: number): Promise<void> => {
    return request<void>(`/lots/${id}`, {
      method: 'DELETE',
    });
  }
};

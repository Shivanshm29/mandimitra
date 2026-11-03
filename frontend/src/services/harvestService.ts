import { request } from './api';
import type { HarvestRecord, HarvestRecordCreate, CreateSellingLotFromHarvestPayload } from '../types/harvest';
import type { SellingLot } from '../types/lot';

export const harvestService = {
  getHarvests: async (): Promise<HarvestRecord[]> => {
    return request<HarvestRecord[]>('/harvests');
  },

  getHarvestById: async (id: number): Promise<HarvestRecord> => {
    return request<HarvestRecord>(`/harvests/${id}`);
  },

  createHarvest: async (data: HarvestRecordCreate): Promise<HarvestRecord> => {
    return request<HarvestRecord>('/harvests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateHarvest: async (id: number, data: Partial<HarvestRecordCreate>): Promise<HarvestRecord> => {
    return request<HarvestRecord>(`/harvests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteHarvest: async (id: number): Promise<void> => {
    return request<void>(`/harvests/${id}`, {
      method: 'DELETE',
    });
  },

  createSellingLotFromHarvest: async (
    harvestId: number,
    data: CreateSellingLotFromHarvestPayload
  ): Promise<SellingLot> => {
    return request<SellingLot>(`/harvests/${harvestId}/create-lot`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};


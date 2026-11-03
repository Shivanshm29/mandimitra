export interface HarvestRecord {
  id: number;
  farmer_id: number;
  commodity: string;
  variety: string;
  harvest_date: string;
  harvested_quantity: string | number;
  remaining_quantity: string | number;
  quantity_unit: string;
  quality_grade?: string | null;
  storage_location?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HarvestRecordCreate {
  commodity: string;
  variety?: string;
  harvest_date: string;
  harvested_quantity: number | string;
  quantity_unit?: string;
  quality_grade?: string;
  storage_location?: string;
  notes?: string;
}

export interface CreateSellingLotFromHarvestPayload {
  lot_quantity: number | string;
  expected_rate?: number | string;
  notes?: string;
}


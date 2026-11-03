export interface SellingLot {
  id: number;
  farmer_id: number;
  lot_code: string;
  commodity: string;
  variety: string;
  quality_grade?: string;
  total_quantity: string;
  available_quantity: string;
  sold_quantity: string;
  unit: string;
  storage_location?: string;
  status: 'AVAILABLE' | 'PARTIALLY_SOLD' | 'SOLD';
  created_at: string;
  updated_at: string;
}

export interface SellingLotCreate {
  commodity: string;
  variety?: string;
  quality_grade?: string;
  total_quantity: string;
  unit?: string;
  storage_location?: string;
}

export interface SellingLotUpdate {
  commodity?: string;
  variety?: string;
  quality_grade?: string;
  total_quantity?: string;
  storage_location?: string;
}


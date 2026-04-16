export type PropertyType = 'hotel' | 'pousada' | 'hostel' | 'resort' | 'aparthotel' | 'camping';
export type PropertyRole = 'owner' | 'admin' | 'manager' | 'staff' | 'housekeeper' | 'receptionist';

export interface PropertyItem {
  id: number;
  owner_id: number;
  name: string;
  type: PropertyType;
  city?: string;
  state?: string;
  total_rooms?: number;
  is_active?: boolean;
}

export interface PropertyUserItem {
  id: number;
  property_id: number;
  user_id: number;
  role: PropertyRole;
  is_active?: boolean;
}

export interface ConsolidatedStats {
  total_properties: number;
  total_rooms: number;
  total_guests: number;
  revenue?: number;
}

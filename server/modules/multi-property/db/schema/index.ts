export interface Property {
  id: number;
  owner_id: number;
  name: string;
  slug?: string;
  type: 'hotel' | 'pousada' | 'hostel' | 'resort' | 'aparthotel' | 'camping';
  description?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  timezone: string;
  currency: string;
  check_in_time?: string;
  check_out_time?: string;
  total_rooms: number;
  star_rating?: number;
  amenities?: string[];
  settings?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyUser {
  id: number;
  property_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'manager' | 'staff' | 'housekeeper' | 'receptionist';
  permissions?: string[];
  invited_by?: number;
  invited_at?: string;
  accepted_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const PROPERTY_TYPES = ['hotel', 'pousada', 'hostel', 'resort', 'aparthotel', 'camping'] as const;
export const PROPERTY_ROLES = ['owner', 'admin', 'manager', 'staff', 'housekeeper', 'receptionist'] as const;

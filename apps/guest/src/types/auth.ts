/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out' | string;

export interface GuestProfile {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  documentType?: string;
  documentNumber?: string;
  preferences?: {
    roomType?: string;
    preferredFloor?: string;
    allergies?: string;
    specialRequests?: string;
  };
  [key: string]: unknown;
}

export interface GuestReservation {
  id?: string | number;
  booking_id?: string | number;
  reservationNumber?: string;
  code?: string;
  status?: ReservationStatus;
  hotelName?: string;
  hotel_name?: string;
  property_name?: string;
  roomNumber?: string;
  room_number?: string;
  checkInDate?: string;
  check_in_date?: string;
  checkOutDate?: string;
  check_out_date?: string;
  totalAmount?: number;
  total_amount?: number;
  specialRequests?: string;
  special_requests?: string;
  guest?: GuestProfile;
  [key: string]: unknown;
}

export interface PortalRequest {
  id: string | number;
  booking_id?: string | number;
  type: string;
  description?: string | null;
  priority?: string;
  status?: string;
  staff_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface PortalFeedback {
  id: string | number;
  booking_id?: string | number;
  overall_rating?: number;
  cleanliness?: number | null;
  comfort?: number | null;
  location?: number | null;
  service?: number | null;
  value_for_money?: number | null;
  comment?: string | null;
  would_recommend?: boolean | null;
  is_published?: boolean;
  created_at?: string;
  [key: string]: unknown;
}

export interface PortalBookingStatus {
  canCheckIn?: boolean;
  reason?: string;
  booking?: GuestReservation | null;
}

export interface LoginRequest {
  email: string;
  reservationCode: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  guest?: GuestProfile | null;
  booking?: GuestReservation | null;
}

export interface AuthState {
  token: string | null;
  guest: GuestProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
}

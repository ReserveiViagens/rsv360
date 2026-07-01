/**
 * Resolve customer_profiles.id para dados de cliente e filtros de reservas.
 */

import { queryDatabase } from '@/lib/db';

export interface ResolvedCustomerProfile {
  id: number;
  user_id?: number;
  customer_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  customer_name?: string;
  customer_email?: string;
  loyalty_tier: string;
  total_spent: number;
  total_bookings: number;
  last_booking_at?: string;
  first_booking_at?: string;
  average_booking_value: number;
  lifetime_value: number;
  churn_risk_score: number;
  engagement_score: number;
  tags?: string[];
  notes?: string;
  preferences?: unknown;
  metadata?: unknown;
  created_at: string;
  updated_at: string;
}

export async function getCustomerProfileById(
  profileId: number
): Promise<ResolvedCustomerProfile | null> {
  const rows = await queryDatabase(
    `SELECT
       cp.*,
       u.name AS user_name,
       u.email AS user_email,
       c.phone AS user_phone,
       c.name AS customer_name,
       c.email AS customer_email
     FROM customer_profiles cp
     LEFT JOIN users u ON cp.user_id = u.id
     LEFT JOIN customers c ON cp.customer_id = c.id
     WHERE cp.id = $1`,
    [profileId]
  );

  return (rows[0] as ResolvedCustomerProfile) || null;
}

export function profileDisplayEmail(profile: ResolvedCustomerProfile): string | null {
  return profile.user_email || profile.customer_email || null;
}

export function profileDisplayName(profile: ResolvedCustomerProfile): string {
  return profile.user_name || profile.customer_name || `Cliente #${profile.id}`;
}

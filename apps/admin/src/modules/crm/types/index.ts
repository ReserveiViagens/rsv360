export type LifecycleStage = 'prospect' | 'first_stay' | 'repeat' | 'loyal' | 'advocate' | 'at_risk' | 'lost';
export type LoyaltyTier = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';

export interface GuestProfile {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  lifecycle_stage: LifecycleStage;
  total_stays?: number;
  total_revenue?: number;
  is_vip?: boolean;
  merged_into_id?: number;
}

export interface GuestTimelineItem {
  type: string;
  date: string;
  title: string;
  details?: string;
  icon?: string;
}

export interface LoyaltyProgram {
  id: number;
  name: string;
  points_per_brl: number;
  points_expiry_days: number;
  tiers: Array<{ name: LoyaltyTier; min_points: number; benefits: string[] }>;
}

export interface LoyaltyMember {
  id: number;
  guest_profile_id: number;
  member_number: string;
  tier: LoyaltyTier;
  available_points: number;
  total_earned_points: number;
  total_redeemed_points: number;
  lifetime_points: number;
}

export interface LoyaltyTransaction {
  id: number;
  type: 'earn' | 'redeem' | 'expire' | 'adjust' | 'bonus';
  points: number;
  balance_after?: number;
  description?: string;
  created_at?: string;
}

export interface Campaign {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  audience_count?: number;
  sent_count?: number;
  delivered_count?: number;
  segment_filter?: Record<string, unknown> | string;
}

export interface Segment {
  id: number;
  name: string;
  description?: string;
  filter_criteria?: Record<string, unknown> | string;
  guest_count?: number;
  is_dynamic?: boolean;
}

export interface CRMStats {
  total_guests: number;
  active_guests: number;
  new_guests_this_month: number;
  vip_count: number;
  retention_rate: number;
  loyalty_members: number;
  points_in_circulation: number;
}

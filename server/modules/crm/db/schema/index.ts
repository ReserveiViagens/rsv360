export const LIFECYCLE_STAGES = ['prospect', 'first_stay', 'repeat', 'loyal', 'advocate', 'at_risk', 'lost'] as const;
export const LOYALTY_TIERS = ['Bronze', 'Prata', 'Ouro', 'Diamante'] as const;
export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'] as const;
export const TRANSACTION_TYPES = ['earn', 'redeem', 'expire', 'adjust', 'bonus'] as const;

export interface GuestProfile {
  id: number;
  user_id: number;
  property_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  document_type?: string;
  document_number?: string;
  nationality?: string;
  date_of_birth?: string;
  gender?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  preferred_language?: string;
  preferred_room_type?: string;
  preferred_floor?: string;
  dietary_restrictions?: string;
  special_requests?: string;
  tags?: string[];
  source?: string;
  lifecycle_stage: (typeof LIFECYCLE_STAGES)[number];
  total_stays: number;
  total_revenue: number;
  average_daily_rate: number;
  last_stay_date?: string;
  first_stay_date?: string;
  notes?: string;
  is_vip: boolean;
  is_blacklisted: boolean;
  blacklist_reason?: string;
  merged_into_id?: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyProgram {
  id: number;
  user_id: number;
  property_id?: number;
  name: string;
  points_per_brl: number;
  points_expiry_days: number;
  is_active: boolean;
  tiers: Array<{ name: string; min_points: number; benefits: string[] }>;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyMember {
  id: number;
  program_id: number;
  guest_profile_id: number;
  member_number: string;
  tier: (typeof LOYALTY_TIERS)[number];
  available_points: number;
  total_earned_points: number;
  total_redeemed_points: number;
  lifetime_points: number;
  enrolled_at: string;
  tier_updated_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: number;
  member_id: number;
  type: (typeof TRANSACTION_TYPES)[number];
  points: number;
  balance_after?: number;
  description?: string;
  booking_id?: number;
  reference_id?: string;
  expires_at?: string;
  created_at: string;
}

export interface MarketingCampaign {
  id: number;
  user_id: number;
  property_id?: number;
  name: string;
  description?: string;
  type?: string;
  channel?: string;
  status: (typeof CAMPAIGN_STATUSES)[number];
  segment_filter: any;
  template_id?: number;
  subject?: string;
  body?: string;
  audience_count: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  scheduled_at?: string;
  sent_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestSegment {
  id: number;
  user_id: number;
  property_id?: number;
  name: string;
  description?: string;
  filter_criteria: any;
  guest_count: number;
  is_dynamic: boolean;
  last_calculated_at?: string;
  created_at: string;
  updated_at: string;
}

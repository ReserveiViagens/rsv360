/**
 * Tipos para o módulo Split de Pagamento Marketplace
 */

export type ReceiverType = 'owner' | 'agency' | 'park';
export type ServiceType = 'rent' | 'ticket' | 'package';
export type SplitTransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface MarketplaceReceiver {
  id: number;
  type: ReceiverType;
  name?: string;
  document?: string;
  bank_account?: BankAccount;
  default_split_pct: number;
  property_id?: number;
  external_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  bank_code?: string;
  agency?: string;
  account?: string;
  account_type?: 'checking' | 'savings';
  pix_key?: string;
}

export interface SplitConfigRule {
  id: number;
  service_type: ServiceType;
  platform_pct: number;
  partner_pct: number;
  ai_suggested: boolean;
  created_at: string;
  updated_at: string;
}

export interface SplitAllocation {
  receiver_id: number;
  amount: number;
  percentage: number;
}

export interface SplitRequest {
  booking_id?: number;
  total_amount: number;
  service_type: ServiceType;
  receiver_id?: number;
  platform_pct?: number;
  allocations?: SplitAllocation[];
}

export interface SplitResult {
  platform_amount: number;
  platform_pct: number;
  allocations: SplitAllocation[];
  total_partner_amount: number;
}

export interface MarketplaceSplitTransaction {
  id: number;
  booking_id?: number;
  payment_id?: string;
  total_amount: number;
  platform_amount: number;
  receiver_id?: number;
  receiver_amount?: number;
  service_type?: string;
  gateway_response?: Record<string, unknown>;
  status: SplitTransactionStatus;
  created_at: string;
  updated_at: string;
}

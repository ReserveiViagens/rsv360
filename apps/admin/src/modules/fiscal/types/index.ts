export type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'cancelled' | 'error';
export type InvoiceType = 'receipt' | 'nfse_pending' | 'nfse_authorized' | 'nfse_cancelled';
export type FNRHStatus = 'active' | 'exported' | 'anonymized';

export interface InvoiceItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}

export interface FiscalInvoice {
  id: number;
  number?: string;
  type: InvoiceType;
  status: InvoiceStatus;
  total: number;
  subtotal?: number;
  tax_amount?: number;
  discount?: number;
  items?: InvoiceItem[] | string;
  guest_id?: number;
  booking_id?: number;
  issue_date?: string;
}

export interface Companion {
  name: string;
  document_type?: string;
  document_number?: string;
  kinship?: string;
}

export interface FNRHRecord {
  id: number;
  full_name: string;
  nationality?: string;
  document_type?: string;
  document_number?: string;
  check_in_date: string;
  check_out_date?: string;
  status: FNRHStatus;
  companions?: Companion[] | string;
}

export interface LGPDConsent {
  id: number;
  guest_id: number;
  consent_type: string;
  granted: boolean;
  revoked_at?: string;
}

export interface LGPDRequest {
  id: number;
  guest_id: number;
  request_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'overdue';
  deadline: string;
}

export interface LGPDAuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  created_at?: string;
}

export interface FiscalStats {
  invoices_total: number;
  fnrh_total: number;
  lgpd_requests: number;
}

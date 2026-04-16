export type CommChannel = 'email' | 'sms' | 'whatsapp';

export interface Template {
  id: number;
  name: string;
  channel: CommChannel;
  type?: string;
  subject?: string;
  body: string;
  variables?: string[];
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  channel: CommChannel;
  to: string;
  subject?: string;
  body?: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'failed';
  template_id?: number;
  created_at?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  error_message?: string;
}

export interface Automation {
  id: number;
  name: string;
  trigger?: string;
  channel: CommChannel;
  template_id?: number;
  delay_minutes?: number;
  enabled: boolean;
  created_at?: string;
}

export interface ChannelConfig {
  id: number;
  channel: CommChannel;
  enabled: boolean;
  provider?: string;
  config?: Record<string, string>;
  status?: string;
}

export interface CommStats {
  totalMessages: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  byChannel?: Array<{ channel: CommChannel; count: number }>;
}

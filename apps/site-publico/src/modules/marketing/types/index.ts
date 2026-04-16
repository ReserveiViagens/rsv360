// ===== Campaign =====

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  channel: string;
  budget: number | null;
  targetAudience: string | null;
  startDate: string | null;
  endDate: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignStats {
  total: number;
  byStatus: Record<string, number>;
  totalBudget: number;
}

// ===== Broadcast =====

export interface Broadcast {
  id: string;
  name: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'push';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  subject: string | null;
  content: string;
  campaignId: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastListResponse {
  broadcasts: Broadcast[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Funnel =====

export interface FunnelStage {
  id: string;
  name: string;
  order: number;
  type: string;
  config?: Record<string, unknown>;
}

export interface Funnel {
  id: string;
  name: string;
  description: string | null;
  stages: FunnelStage[] | string;
  isActive: boolean;
  totalLeads: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface FunnelListResponse {
  funnels: Funnel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== WhatsApp =====

export interface WhatsappConversation {
  id: string;
  contactName: string;
  phone: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isActive: boolean;
  status: 'active' | 'archived' | 'blocked';
  tags: string[] | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsappTemplate {
  id: string;
  name: string;
  body: string;
  language: string;
  category: string | null;
  status: 'pending' | 'approved' | 'rejected';
  headerType: string | null;
  footer: string | null;
  buttons: unknown[] | null;
  createdAt: string;
}

export interface WhatsappMessage {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  type: string;
  content: string | null;
  mediaUrl: string | null;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface WhatsappConversationListResponse {
  conversations: WhatsappConversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WhatsappMessageListResponse {
  messages: WhatsappMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== A/B Test =====

export interface AbTest {
  id: string;
  name: string;
  campaignId: string | null;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  variantA: Record<string, unknown> | string;
  variantB: Record<string, unknown> | string;
  splitPercentage: number;
  winnerMetric: string | null;
  winnerVariant: string | null;
  results: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AbTestListResponse {
  abTests: AbTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Analytics =====

export interface DashboardOverview {
  totalCampaigns: number;
  totalLeads: number;
  totalBroadcasts: number;
  totalConversions: number;
  conversionRate: number;
  totalBudget: number;
}

export interface MetricPoint {
  date: string;
  value: number;
}

export interface ChannelMetrics {
  channel: string;
  leads: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
}

// ===== Pagination =====

export interface PaginationParams {
  page?: number;
  limit?: number;
}
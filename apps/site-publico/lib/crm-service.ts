/**
 * ✅ ITENS 51-54: SERVIÇO CRM DE CLIENTES
 * Histórico de Interações, Segmentação, Campanhas, Dashboard
 */

import { queryDatabase } from './db';

export interface Interaction {
  id: number;
  customer_id?: number;
  user_id?: number;
  interaction_type: string;
  channel: string;
  subject?: string;
  description?: string;
  outcome?: string;
  duration_minutes?: number;
  sentiment?: string;
  priority: string;
  related_booking_id?: number;
  related_property_id?: number;
  related_campaign_id?: number;
  interaction_date: string;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Segment {
  id: number;
  name: string;
  description?: string;
  criteria: any; // JSONB
  is_active: boolean;
  is_auto_update: boolean;
  customer_count: number;
  last_calculated_at?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  campaign_type: string;
  channel: string;
  target_segment_id?: number;
  target_criteria?: any; // JSONB
  subject?: string;
  message: string;
  template_id?: string;
  content?: any; // JSONB
  status: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  converted_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  budget?: number;
  cost_per_click?: number;
  cost_per_conversion?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: number;
  campaign_id: number;
  customer_id: number;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  converted_at?: string;
  bounced_at?: string;
  unsubscribed_at?: string;
  metadata?: any;
  created_at: string;
}

/**
 * ✅ ITEM 51: HISTÓRICO DE INTERAÇÕES
 */

/**
 * Criar interação
 */
export async function createInteraction(interactionData: Partial<Interaction>): Promise<Interaction> {
  const {
    customer_id,
    user_id,
    interaction_type,
    channel,
    subject,
    description,
    outcome,
    duration_minutes,
    sentiment,
    priority = 'normal',
    related_booking_id,
    related_property_id,
    related_campaign_id,
    interaction_date,
    scheduled_at,
    completed_at,
  } = interactionData;

  if (!interaction_type || !channel) {
    throw new Error('interaction_type e channel são obrigatórios');
  }

  const result = await queryDatabase(
    `INSERT INTO interactions 
     (customer_id, user_id, interaction_type, channel, subject, description, outcome,
      duration_minutes, sentiment, priority, related_booking_id, related_property_id,
      related_campaign_id, interaction_date, scheduled_at, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING *`,
    [
      customer_id || null,
      user_id || null,
      interaction_type,
      channel,
      subject || null,
      description || null,
      outcome || null,
      duration_minutes || null,
      sentiment || null,
      priority,
      related_booking_id || null,
      related_property_id || null,
      related_campaign_id || null,
      interaction_date || new Date().toISOString(),
      scheduled_at || null,
      completed_at || null,
    ]
  );

  return result[0] as Interaction;
}

/**
 * Listar interações
 */
export async function listInteractions(
  filters: {
    customer_id?: number;
    user_id?: number;
    interaction_type?: string;
    channel?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Interaction[]> {
  let query = `SELECT * FROM interactions WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.customer_id) {
    query += ` AND customer_id = $${paramIndex}`;
    params.push(filters.customer_id);
    paramIndex++;
  }

  if (filters.user_id) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(filters.user_id);
    paramIndex++;
  }

  if (filters.interaction_type) {
    query += ` AND interaction_type = $${paramIndex}`;
    params.push(filters.interaction_type);
    paramIndex++;
  }

  if (filters.channel) {
    query += ` AND channel = $${paramIndex}`;
    params.push(filters.channel);
    paramIndex++;
  }

  if (filters.date_from) {
    query += ` AND interaction_date >= $${paramIndex}`;
    params.push(filters.date_from);
    paramIndex++;
  }

  if (filters.date_to) {
    query += ` AND interaction_date <= $${paramIndex}`;
    params.push(filters.date_to);
    paramIndex++;
  }

  query += ` ORDER BY interaction_date DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

  return await queryDatabase(query, params) as Interaction[];
}

/**
 * Obter histórico de interações de um cliente
 */
export async function getCustomerInteractions(customerId: number): Promise<Interaction[]> {
  return await listInteractions({ customer_id: customerId });
}

/**
 * ✅ ITEM 52: SEGMENTAÇÃO DE CLIENTES
 */

/**
 * Criar segmento
 */
export async function createSegment(segmentData: Partial<Segment>): Promise<Segment> {
  const { name, description, criteria, is_active = true, is_auto_update = true, created_by } = segmentData;

  if (!name || !criteria) {
    throw new Error('name e criteria são obrigatórios');
  }

  const result = await queryDatabase(
    `INSERT INTO segments 
     (name, description, criteria, is_active, is_auto_update, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      name,
      description || null,
      JSON.stringify(criteria),
      is_active,
      is_auto_update,
      created_by || null,
    ]
  );

  return result[0] as Segment;
}

/**
 * Listar segmentos
 */
export async function listSegments(filters: { is_active?: boolean } = {}): Promise<Segment[]> {
  let query = `SELECT * FROM segments WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.is_active !== undefined) {
    query += ` AND is_active = $${paramIndex}`;
    params.push(filters.is_active);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  return await queryDatabase(query, params) as Segment[];
}

/**
 * Obter segmento por ID
 */
export async function getSegmentById(segmentId: number): Promise<Segment | null> {
  const segments = await queryDatabase(
    `SELECT * FROM segments WHERE id = $1`,
    [segmentId]
  );

  return segments.length > 0 ? (segments[0] as Segment) : null;
}

/**
 * Calcular clientes de um segmento
 */
export async function calculateSegmentCustomers(segmentId: number): Promise<number> {
  const segment = await getSegmentById(segmentId);
  if (!segment) {
    throw new Error('Segmento não encontrado');
  }

  const criteria = segment.criteria;
  let query = `SELECT COUNT(*) as count FROM customers WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  // Aplicar critérios (exemplo básico - pode ser expandido)
  if (criteria.min_bookings) {
    query += ` AND id IN (
      SELECT customer_id FROM bookings_rsv360 
      GROUP BY customer_id 
      HAVING COUNT(*) >= $${paramIndex}
    )`;
    params.push(criteria.min_bookings);
    paramIndex++;
  }

  if (criteria.min_total_spent) {
    query += ` AND id IN (
      SELECT customer_id FROM bookings_rsv360 
      WHERE status = 'confirmed'
      GROUP BY customer_id 
      HAVING SUM(total_amount) >= $${paramIndex}
    )`;
    params.push(criteria.min_total_spent);
    paramIndex++;
  }

  const result = await queryDatabase(query, params);
  const count = parseInt(result[0]?.count || '0');

  // Atualizar contador no segmento
  await queryDatabase(
    `UPDATE segments SET customer_count = $1, last_calculated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [count, segmentId]
  );

  return count;
}

/**
 * Adicionar cliente a segmento
 */
export async function addCustomerToSegment(
  customerId: number,
  segmentId: number,
  isManual: boolean = false,
  addedBy?: number
): Promise<boolean> {
  await queryDatabase(
    `INSERT INTO customer_segments (customer_id, segment_id, is_manual, added_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (customer_id, segment_id) DO NOTHING`,
    [customerId, segmentId, isManual, addedBy || null]
  );

  return true;
}

/**
 * Remover cliente de segmento
 */
export async function removeCustomerFromSegment(customerId: number, segmentId: number): Promise<boolean> {
  await queryDatabase(
    `DELETE FROM customer_segments WHERE customer_id = $1 AND segment_id = $2`,
    [customerId, segmentId]
  );

  return true;
}

/**
 * Obter segmentos de um cliente
 */
export async function getCustomerSegments(customerId: number): Promise<Segment[]> {
  const segments = await queryDatabase(
    `SELECT s.* FROM segments s
     INNER JOIN customer_segments cs ON s.id = cs.segment_id
     WHERE cs.customer_id = $1 AND s.is_active = true
     ORDER BY s.name`,
    [customerId]
  );

  return segments as Segment[];
}

/**
 * ✅ ITEM 53: CAMPANHAS DE MARKETING
 */

/**
 * Criar campanha
 */
export async function createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
  const {
    name,
    description,
    campaign_type,
    channel,
    target_segment_id,
    target_criteria,
    subject,
    message,
    template_id,
    content,
    status = 'draft',
    scheduled_at,
    budget,
    cost_per_click,
    cost_per_conversion,
    created_by,
  } = campaignData;

  if (!name || !campaign_type || !channel || !message) {
    throw new Error('name, campaign_type, channel e message são obrigatórios');
  }

  const result = await queryDatabase(
    `INSERT INTO campaigns 
     (name, description, campaign_type, channel, target_segment_id, target_criteria,
      subject, message, template_id, content, status, scheduled_at, budget,
      cost_per_click, cost_per_conversion, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING *`,
    [
      name,
      description || null,
      campaign_type,
      channel,
      target_segment_id || null,
      target_criteria ? JSON.stringify(target_criteria) : null,
      subject || null,
      message,
      template_id || null,
      content ? JSON.stringify(content) : null,
      status,
      scheduled_at || null,
      budget || null,
      cost_per_click || null,
      cost_per_conversion || null,
      created_by || null,
    ]
  );

  return result[0] as Campaign;
}

/**
 * Listar campanhas
 */
export async function listCampaigns(
  filters: {
    status?: string;
    campaign_type?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Campaign[]> {
  let query = `SELECT * FROM campaigns WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.campaign_type) {
    query += ` AND campaign_type = $${paramIndex}`;
    params.push(filters.campaign_type);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

  return await queryDatabase(query, params) as Campaign[];
}

/**
 * Obter campanha por ID
 */
export async function getCampaignById(campaignId: number): Promise<Campaign | null> {
  const campaigns = await queryDatabase(
    `SELECT * FROM campaigns WHERE id = $1`,
    [campaignId]
  );

  return campaigns.length > 0 ? (campaigns[0] as Campaign) : null;
}

/**
 * Adicionar destinatários à campanha
 */
export async function addCampaignRecipients(
  campaignId: number,
  customerIds: number[]
): Promise<CampaignRecipient[]> {
  const recipients: CampaignRecipient[] = [];

  for (const customerId of customerIds) {
    const result = await queryDatabase(
      `INSERT INTO campaign_recipients (campaign_id, customer_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (campaign_id, customer_id) DO NOTHING
       RETURNING *`,
      [campaignId, customerId]
    );

    if (result.length > 0) {
      recipients.push(result[0] as CampaignRecipient);
    }
  }

  return recipients;
}

/**
 * Atualizar status de destinatário
 */
export async function updateRecipientStatus(
  recipientId: number,
  status: string,
  timestamp?: string
): Promise<CampaignRecipient | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  updates.push(`status = $${paramIndex}`);
  values.push(status);
  paramIndex++;

  if (timestamp) {
    const timestampField = status === 'sent' ? 'sent_at' :
                          status === 'delivered' ? 'delivered_at' :
                          status === 'opened' ? 'opened_at' :
                          status === 'clicked' ? 'clicked_at' :
                          status === 'converted' ? 'converted_at' :
                          status === 'bounced' ? 'bounced_at' :
                          status === 'unsubscribed' ? 'unsubscribed_at' : null;

    if (timestampField) {
      updates.push(`${timestampField} = $${paramIndex}`);
      values.push(timestamp);
      paramIndex++;
    }
  }

  values.push(recipientId);

  const result = await queryDatabase(
    `UPDATE campaign_recipients 
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.length > 0 ? (result[0] as CampaignRecipient) : null;
}

/**
 * ✅ ITEM 54: DASHBOARD DE CLIENTES
 */

/**
 * Obter métricas do dashboard
 * Retorna métricas vazias se a tabela customers não existir (migração não executada)
 */
export async function getCustomerDashboardMetrics(
  filters: {
    date_from?: string;
    date_to?: string;
    segment_id?: number;
  } = {}
): Promise<{
  total_customers: number;
  active_customers: number;
  new_customers: number;
  total_revenue: number;
  average_order_value: number;
  total_interactions: number;
  interactions_by_type: Record<string, number>;
  top_segments: Array<{ segment_id: number; segment_name: string; customer_count: number }>;
  recent_interactions: Interaction[];
}> {
  const emptyMetrics = {
    total_customers: 0,
    active_customers: 0,
    new_customers: 0,
    total_revenue: 0,
    average_order_value: 0,
    total_interactions: 0,
    interactions_by_type: {} as Record<string, number>,
    top_segments: [] as Array<{ segment_id: number; segment_name: string; customer_count: number }>,
    recent_interactions: [] as Interaction[],
  };

  try {
    // Verificar se a tabela customers existe
    const tableCheck = await queryDatabase(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'customers' LIMIT 1`
    );
    if (tableCheck.length === 0) {
      return emptyMetrics;
    }
  } catch {
    return emptyMetrics;
  }

  const { date_from, date_to, segment_id } = filters;

  try {
  // Total de clientes
  let totalQuery = `SELECT COUNT(*) as count FROM customers WHERE 1=1`;
  const totalParams: any[] = [];
  let paramIndex = 1;

  if (segment_id) {
    totalQuery += ` AND id IN (SELECT customer_id FROM customer_segments WHERE segment_id = $${paramIndex})`;
    totalParams.push(segment_id);
    paramIndex++;
  }

  const totalResult = await queryDatabase(totalQuery, totalParams);
  const total_customers = parseInt(totalResult[0]?.count || '0');

  // Clientes ativos (com reserva nos últimos 90 dias)
  // Nota: bookings tem user_id, não customer_id. Usar bookings_rsv360 que tem customer_id OU fazer JOIN
  let activeQuery: string;
  let activeParams: any[] = [];
  
  // Verificar se existe coluna customer_id em bookings
  try {
    const testQuery = await queryDatabase(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'bookings' AND column_name = 'customer_id' LIMIT 1`
    );
    
    if (testQuery.length > 0) {
      // Tabela bookings tem customer_id
      activeQuery = segment_id
        ? `SELECT COUNT(DISTINCT customer_id) as count 
           FROM bookings 
           WHERE customer_id IN (SELECT customer_id FROM customer_segments WHERE segment_id = $1)
           AND created_at >= CURRENT_DATE - INTERVAL '90 days'`
        : `SELECT COUNT(DISTINCT customer_id) as count 
           FROM bookings 
           WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'`;
      activeParams = segment_id ? [segment_id] : [];
    } else {
      // Tabela bookings tem user_id, usar bookings_rsv360 ou customers
      activeQuery = segment_id
        ? `SELECT COUNT(DISTINCT b.customer_id) as count 
           FROM bookings_rsv360 b
           WHERE b.customer_id IN (SELECT customer_id FROM customer_segments WHERE segment_id = $1)
           AND b.created_at >= CURRENT_DATE - INTERVAL '90 days'`
        : `SELECT COUNT(DISTINCT customer_id) as count 
           FROM bookings_rsv360 
           WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'`;
      activeParams = segment_id ? [segment_id] : [];
    }
  } catch {
    // Fallback: usar bookings_rsv360
    activeQuery = segment_id
      ? `SELECT COUNT(DISTINCT b.customer_id) as count 
         FROM bookings_rsv360 b
         WHERE b.customer_id IN (SELECT customer_id FROM customer_segments WHERE segment_id = $1)
         AND b.created_at >= CURRENT_DATE - INTERVAL '90 days'`
      : `SELECT COUNT(DISTINCT customer_id) as count 
         FROM bookings_rsv360 
         WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'`;
    activeParams = segment_id ? [segment_id] : [];
  }
  
  const activeResult = await queryDatabase(activeQuery, activeParams);
  const active_customers = parseInt(activeResult[0]?.count || '0');

  // Novos clientes
  let newQuery = `SELECT COUNT(*) as count FROM customers WHERE 1=1`;
  const newParams: any[] = [];
  paramIndex = 1;

  if (date_from) {
    newQuery += ` AND created_at >= $${paramIndex}`;
    newParams.push(date_from);
    paramIndex++;
  } else {
    newQuery += ` AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
  }

  if (segment_id) {
    newQuery += ` AND id IN (SELECT customer_id FROM customer_segments WHERE segment_id = $${paramIndex})`;
    newParams.push(segment_id);
    paramIndex++;
  }

  const newResult = await queryDatabase(newQuery, newParams);
  const new_customers = parseInt(newResult[0]?.count || '0');

  // Receita total
  // Usar bookings_rsv360 que tem customer_id, ou fazer JOIN
  let revenueQuery = `SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings_rsv360 WHERE status = 'confirmed'`;
  const revenueParams: any[] = [];
  paramIndex = 1;

  if (date_from) {
    revenueQuery += ` AND created_at >= $${paramIndex}`;
    revenueParams.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    revenueQuery += ` AND created_at <= $${paramIndex}`;
    revenueParams.push(date_to);
    paramIndex++;
  }

  if (segment_id) {
    revenueQuery += ` AND customer_id IN (SELECT customer_id FROM customer_segments WHERE segment_id = $${paramIndex})`;
    revenueParams.push(segment_id);
    paramIndex++;
  }

  const revenueResult = await queryDatabase(revenueQuery, revenueParams);
  const total_revenue = parseFloat(revenueResult[0]?.total || '0');

  // Ticket médio
  const avgQuery = revenueQuery.replace('SUM(total_amount)', 'AVG(total_amount)');
  const avgResult = await queryDatabase(avgQuery, revenueParams);
  const average_order_value = parseFloat(avgResult[0]?.total || '0');

  // Total de interações
  let interactionsQuery = `SELECT COUNT(*) as count FROM interactions WHERE 1=1`;
  const interactionsParams: any[] = [];
  paramIndex = 1;

  if (date_from) {
    interactionsQuery += ` AND interaction_date >= $${paramIndex}`;
    interactionsParams.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    interactionsQuery += ` AND interaction_date <= $${paramIndex}`;
    interactionsParams.push(date_to);
    paramIndex++;
  }

  if (segment_id) {
    interactionsQuery += ` AND customer_id IN (SELECT customer_id FROM customer_segments WHERE segment_id = $${paramIndex})`;
    interactionsParams.push(segment_id);
    paramIndex++;
  }

  const interactionsResult = await queryDatabase(interactionsQuery, interactionsParams);
  const total_interactions = parseInt(interactionsResult[0]?.count || '0');

  // Interações por tipo
  const typeQuery = interactionsQuery.replace('COUNT(*)', 'interaction_type, COUNT(*)');
  const typeQueryFinal = typeQuery.replace('SELECT COUNT(*)', 'SELECT interaction_type, COUNT(*)') + ' GROUP BY interaction_type';
  const typeResult = await queryDatabase(typeQueryFinal, interactionsParams);
  const interactions_by_type: Record<string, number> = {};
  typeResult.forEach((row: any) => {
    interactions_by_type[row.interaction_type] = parseInt(row.count || '0');
  });

  // Top segmentos
  const segmentsQuery = `SELECT s.id as segment_id, s.name as segment_name, COUNT(cs.customer_id) as customer_count
                         FROM segments s
                         LEFT JOIN customer_segments cs ON s.id = cs.segment_id
                         WHERE s.is_active = true
                         GROUP BY s.id, s.name
                         ORDER BY customer_count DESC
                         LIMIT 5`;
  const segmentsResult = await queryDatabase(segmentsQuery, []);

  // Interações recentes
  const recentQuery = interactionsQuery + ' ORDER BY interaction_date DESC LIMIT 10';
  const recentResult = await queryDatabase(recentQuery, interactionsParams);

  return {
    total_customers,
    active_customers,
    new_customers,
    total_revenue,
    average_order_value,
    total_interactions,
    interactions_by_type,
    top_segments: segmentsResult as any,
    recent_interactions: recentResult as Interaction[],
  };
  } catch (err) {
    console.warn('getCustomerDashboardMetrics: erro ao obter métricas', err);
    return emptyMetrics;
  }
}


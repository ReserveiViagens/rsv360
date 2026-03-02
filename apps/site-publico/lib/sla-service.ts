/**
 * Serviço de SLA (Service Level Agreement) para Tickets
 * Gerencia prazos, metas e violações de SLA
 */

import { queryDatabase } from './db';
import { checkAndUpdateSLA } from './ticket-service';
import type { TicketPriority } from './schemas/ticket-schemas';

export interface SLARecord {
  id: number;
  ticket_id: number;
  priority: TicketPriority;
  first_response_target_minutes: number;
  resolution_target_minutes: number;
  first_response_at: Date | null;
  first_response_met: boolean | null;
  resolution_at: Date | null;
  resolution_met: boolean | null;
  breached_at: Date | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface SLAMetrics {
  total_tickets: number;
  first_response_met: number;
  first_response_breached: number;
  resolution_met: number;
  resolution_breached: number;
  average_first_response_minutes: number;
  average_resolution_minutes: number;
  sla_compliance_rate: number;
}

/**
 * Configurações padrão de SLA por prioridade
 */
export const DEFAULT_SLA_CONFIG: Record<TicketPriority, { firstResponse: number; resolution: number }> = {
  low: { firstResponse: 480, resolution: 2880 }, // 8h / 48h
  medium: { firstResponse: 240, resolution: 1440 }, // 4h / 24h
  high: { firstResponse: 120, resolution: 720 }, // 2h / 12h
  urgent: { firstResponse: 60, resolution: 360 }, // 1h / 6h
  critical: { firstResponse: 30, resolution: 180 } // 30min / 3h
};

/**
 * Cria registro de SLA para ticket
 */
export async function createSLA(
  ticketId: number,
  priority: TicketPriority,
  customConfig?: { firstResponse: number; resolution: number }
): Promise<SLARecord> {
  const config = customConfig || DEFAULT_SLA_CONFIG[priority];

  const result = await queryDatabase<SLARecord>(
    `INSERT INTO ticket_sla (
      ticket_id, priority, first_response_target_minutes, resolution_target_minutes
    ) VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [ticketId, priority, config.firstResponse, config.resolution]
  );

  if (result.length === 0) {
    throw new Error('Erro ao criar SLA');
  }

  // Calcular e atualizar sla_due_at no ticket
  const slaDueAt = new Date();
  slaDueAt.setMinutes(slaDueAt.getMinutes() + config.resolution);

  await queryDatabase(
    `UPDATE support_tickets SET sla_due_at = $1 WHERE id = $2`,
    [slaDueAt.toISOString(), ticketId]
  );

  return result[0];
}

/**
 * Busca SLA por ticket ID
 */
export async function getSLAByTicketId(ticketId: number): Promise<SLARecord | null> {
  const result = await queryDatabase<SLARecord>(
    `SELECT * FROM ticket_sla WHERE ticket_id = $1`,
    [ticketId]
  );

  return result[0] || null;
}

/**
 * Atualiza primeira resposta no SLA
 */
export async function updateFirstResponse(
  ticketId: number,
  firstResponseAt: Date
): Promise<void> {
  const sla = await getSLAByTicketId(ticketId);
  if (!sla) return;

  const ticket = await queryDatabase(
    `SELECT created_at FROM support_tickets WHERE id = $1`,
    [ticketId]
  );

  if (ticket.length === 0) return;

  const createdAt = new Date(ticket[0].created_at);
  const responseTime = Math.floor((firstResponseAt.getTime() - createdAt.getTime()) / 60000);
  const met = responseTime <= sla.first_response_target_minutes;

  await queryDatabase(
    `UPDATE ticket_sla 
     SET first_response_at = $1, first_response_met = $2
     WHERE ticket_id = $3`,
    [firstResponseAt.toISOString(), met, ticketId]
  );
}

/**
 * Atualiza resolução no SLA
 */
export async function updateResolution(
  ticketId: number,
  resolvedAt: Date
): Promise<void> {
  const sla = await getSLAByTicketId(ticketId);
  if (!sla) return;

  const ticket = await queryDatabase(
    `SELECT created_at FROM support_tickets WHERE id = $1`,
    [ticketId]
  );

  if (ticket.length === 0) return;

  const createdAt = new Date(ticket[0].created_at);
  const resolutionTime = Math.floor((resolvedAt.getTime() - createdAt.getTime()) / 60000);
  const met = resolutionTime <= sla.resolution_target_minutes;

  await queryDatabase(
    `UPDATE ticket_sla 
     SET resolution_at = $1, resolution_met = $2
     WHERE ticket_id = $3`,
    [resolvedAt.toISOString(), met, ticketId]
  );
}

/**
 * Verifica se SLA foi violado
 */
export async function checkSLABreach(ticketId: number): Promise<boolean> {
  const ticket = await queryDatabase(
    `SELECT sla_due_at, sla_breached FROM support_tickets WHERE id = $1`,
    [ticketId]
  );

  if (ticket.length === 0 || !ticket[0].sla_due_at) return false;

  const now = new Date();
  const dueAt = new Date(ticket[0].sla_due_at);

  if (now > dueAt && !ticket[0].sla_breached) {
    // Marcar como violado
    await queryDatabase(
      `UPDATE support_tickets SET sla_breached = true WHERE id = $1`,
      [ticketId]
    );

    await queryDatabase(
      `UPDATE ticket_sla SET breached_at = CURRENT_TIMESTAMP WHERE ticket_id = $1`,
      [ticketId]
    );

    return true;
  }

  return ticket[0].sla_breached || false;
}

/**
 * Calcula métricas de SLA
 */
export async function calculateSLAMetrics(
  filters?: {
    priority?: TicketPriority;
    dateFrom?: Date;
    dateTo?: Date;
    assignedTo?: number;
  }
): Promise<SLAMetrics> {
  let query = `
    SELECT 
      COUNT(*) as total_tickets,
      COUNT(CASE WHEN first_response_met = true THEN 1 END) as first_response_met,
      COUNT(CASE WHEN first_response_met = false THEN 1 END) as first_response_breached,
      COUNT(CASE WHEN resolution_met = true THEN 1 END) as resolution_met,
      COUNT(CASE WHEN resolution_met = false THEN 1 END) as resolution_breached,
      AVG(EXTRACT(EPOCH FROM (first_response_at - (SELECT created_at FROM support_tickets WHERE id = ticket_sla.ticket_id))) / 60) as avg_first_response,
      AVG(EXTRACT(EPOCH FROM (resolution_at - (SELECT created_at FROM support_tickets WHERE id = ticket_sla.ticket_id))) / 60) as avg_resolution
    FROM ticket_sla
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.priority) {
    query += ` AND priority = $${paramIndex}`;
    params.push(filters.priority);
    paramIndex++;
  }

  if (filters?.assignedTo) {
    query += ` AND ticket_id IN (SELECT id FROM support_tickets WHERE assigned_to = $${paramIndex})`;
    params.push(filters.assignedTo);
    paramIndex++;
  }

  if (filters?.dateFrom) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(filters.dateFrom.toISOString());
    paramIndex++;
  }

  if (filters?.dateTo) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(filters.dateTo.toISOString());
    paramIndex++;
  }

  const result = await queryDatabase<any>(query, params);
  const data = result[0] || {};

  const total = parseInt(data.total_tickets || '0');
  const firstResponseMet = parseInt(data.first_response_met || '0');
  const firstResponseBreached = parseInt(data.first_response_breached || '0');
  const resolutionMet = parseInt(data.resolution_met || '0');
  const resolutionBreached = parseInt(data.resolution_breached || '0');

  const totalWithResponse = firstResponseMet + firstResponseBreached;
  const totalWithResolution = resolutionMet + resolutionBreached;

  const complianceRate = total > 0
    ? ((firstResponseMet + resolutionMet) / (totalWithResponse + totalWithResolution || 1)) * 100
    : 0;

  return {
    total_tickets: total,
    first_response_met: firstResponseMet,
    first_response_breached: firstResponseBreached,
    resolution_met: resolutionMet,
    resolution_breached: resolutionBreached,
    average_first_response_minutes: parseFloat(data.avg_first_response || '0'),
    average_resolution_minutes: parseFloat(data.avg_resolution || '0'),
    sla_compliance_rate: Math.round(complianceRate * 100) / 100
  };
}

/**
 * Processa verificação de SLA para todos os tickets abertos
 */
export async function processSLAVerification(): Promise<{
  checked: number;
  breached: number;
}> {
  const openTickets = await queryDatabase<{ id: number }>(
    `SELECT id FROM support_tickets 
     WHERE status IN ('open', 'in_progress', 'waiting_customer', 'waiting_third_party')
     AND sla_due_at IS NOT NULL`
  );

  let breached = 0;

  for (const ticket of openTickets) {
    const wasBreached = await checkSLABreach(ticket.id);
    if (wasBreached) {
      breached++;
    }
    await checkAndUpdateSLA(ticket.id);
  }

  return {
    checked: openTickets.length,
    breached
  };
}


/**
 * Serviço Principal de Tickets de Suporte
 * Gerencia todo o ciclo de vida dos tickets de suporte
 */

import { queryDatabase } from './db';
import { sendNotificationToUser, sendNotificationToRole } from './websocket-server';
import {
  notifyTicketCreated,
  notifyTicketUpdated,
  notifyTicketComment,
  notifyTicketResolved,
  notifyTicketAssigned
} from './ticket-notifications';
import {
  ticketsCreatedTotal,
  ticketsResolvedTotal,
  ticketResolutionTime,
  ticketsOpen,
  ticketsSlaBreached
} from './metrics';
import type {
  CreateTicket,
  UpdateTicket,
  CreateComment,
  UpdateComment,
  AssignTicket,
  ChangeStatus,
  TicketFilter,
  TicketStatus,
  TicketPriority,
  TicketCategory
} from './schemas/ticket-schemas';

export interface SupportTicket {
  id: number;
  ticket_number: string;
  user_id: number;
  assigned_to: number | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  source: string;
  tags: string[];
  metadata: Record<string, unknown>;
  resolved_at: Date | null;
  resolved_by: number | null;
  resolution_notes: string | null;
  closed_at: Date | null;
  closed_by: number | null;
  sla_due_at: Date | null;
  sla_breached: boolean;
  first_response_at: Date | null;
  first_response_by: number | null;
  last_activity_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  is_internal: boolean;
  is_system: boolean;
  attachments: string[];
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Cria um novo ticket
 */
export async function createTicket(data: CreateTicket): Promise<SupportTicket> {
  // Gerar número único do ticket usando função do banco
  const ticketNumberResult = await queryDatabase<{ generate_ticket_number: string }>(
    `SELECT generate_ticket_number() as generate_ticket_number`
  );
  const ticketNumber = ticketNumberResult[0]?.generate_ticket_number || `TKT-${Date.now()}`;

  // Criar ticket
  const result = await queryDatabase<SupportTicket>(
    `INSERT INTO support_tickets (
      ticket_number, user_id, category, priority, status, subject, description, source, tags, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      ticketNumber,
      data.user_id,
      data.category,
      data.priority,
      'open',
      data.subject,
      data.description,
      data.source,
      JSON.stringify(data.tags || []),
      JSON.stringify(data.metadata || {})
    ]
  );

  if (result.length === 0) {
    throw new Error('Erro ao criar ticket');
  }

  // Criar SLA para o ticket
  await createSLAForTicket(result[0].id, data.priority);

  // Registrar métrica de ticket criado
  ticketsCreatedTotal.inc({
    category: data.category,
    priority: data.priority,
  });

  // Atualizar métrica de tickets abertos
  const openTickets = await queryDatabase<{ count: string }>(
    `SELECT COUNT(*) as count FROM support_tickets WHERE status IN ('open', 'em_analise', 'em_desenvolvimento', 'aguardando_teste')`
  ) || [];
  ticketsOpen.set(parseInt(openTickets[0]?.count || '0'));

  // Notificar via WebSocket
  try {
    sendNotificationToUser(data.user_id, {
      title: 'Ticket Criado',
      message: `Ticket ${result[0].ticket_number} criado com sucesso`,
      type: 'success',
      data: { ticket: result[0] }
    });

    // Notificar admins/staff sobre novo ticket
    sendNotificationToRole('admin', {
      title: 'Novo Ticket',
      message: `Novo ticket criado: ${result[0].ticket_number}`,
      type: 'info',
      data: { ticket: result[0] }
    });

    sendNotificationToRole('staff', {
      title: 'Novo Ticket',
      message: `Novo ticket criado: ${result[0].ticket_number}`,
      type: 'info',
      data: { ticket: result[0] }
    });
  } catch (error) {
    console.error('Erro ao enviar notificação WebSocket:', error);
  }

  // Enviar notificação por email
  try {
    await notifyTicketCreated(
      result[0].id,
      data.user_id,
      result[0].ticket_number,
      result[0].subject,
      result[0].category,
      result[0].priority
    );
  } catch (error) {
    console.error('Erro ao enviar notificação por email:', error);
  }

  return result[0];
}

/**
 * Busca ticket por ID
 */
export async function getTicketById(ticketId: number): Promise<SupportTicket | null> {
  const result = await queryDatabase<SupportTicket>(
    `SELECT * FROM support_tickets WHERE id = $1`,
    [ticketId]
  );

  return result[0] || null;
}

/**
 * Busca ticket por número
 */
export async function getTicketByNumber(ticketNumber: string): Promise<SupportTicket | null> {
  const result = await queryDatabase<SupportTicket>(
    `SELECT * FROM support_tickets WHERE ticket_number = $1`,
    [ticketNumber]
  );

  return result[0] || null;
}

/**
 * Lista tickets com filtros
 */
export async function listTickets(filter: TicketFilter): Promise<{
  tickets: SupportTicket[];
  total: number;
}> {
  let query = `SELECT * FROM support_tickets WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  // Aplicar filtros
  if (filter.user_id) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(filter.user_id);
    paramIndex++;
  }

  if (filter.assigned_to) {
    query += ` AND assigned_to = $${paramIndex}`;
    params.push(filter.assigned_to);
    paramIndex++;
  }

  if (filter.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filter.status);
    paramIndex++;
  }

  if (filter.priority) {
    query += ` AND priority = $${paramIndex}`;
    params.push(filter.priority);
    paramIndex++;
  }

  if (filter.category) {
    query += ` AND category = $${paramIndex}`;
    params.push(filter.category);
    paramIndex++;
  }

  if (filter.source) {
    query += ` AND source = $${paramIndex}`;
    params.push(filter.source);
    paramIndex++;
  }

  if (filter.search) {
    query += ` AND (subject ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    const searchTerm = `%${filter.search}%`;
    params.push(searchTerm, searchTerm);
    paramIndex += 2;
  }

  if (filter.created_from) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(filter.created_from);
    paramIndex++;
  }

  if (filter.created_to) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(filter.created_to);
    paramIndex++;
  }

  if (filter.tags && filter.tags.length > 0) {
    query += ` AND tags && $${paramIndex}`;
    params.push(JSON.stringify(filter.tags));
    paramIndex++;
  }

  // Contar total
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = await queryDatabase<{ total: string }>(countQuery, params);
  const total = parseInt(countResult[0]?.total || '0');

  // Ordenação
  query += ` ORDER BY ${filter.sort_by} ${filter.sort_order}`;

  // Paginação
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(filter.limit, filter.offset);

  const tickets = await queryDatabase<SupportTicket>(query, params);

  return { tickets, total };
}

/**
 * Atualiza ticket
 */
export async function updateTicket(
  ticketId: number,
  data: UpdateTicket
): Promise<SupportTicket> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.category !== undefined) {
    updates.push(`category = $${paramIndex}`);
    params.push(data.category);
    paramIndex++;
  }

  if (data.priority !== undefined) {
    updates.push(`priority = $${paramIndex}`);
    params.push(data.priority);
    paramIndex++;
  }

  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    params.push(data.status);
    paramIndex++;
  }

  if (data.subject !== undefined) {
    updates.push(`subject = $${paramIndex}`);
    params.push(data.subject);
    paramIndex++;
  }

  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex}`);
    params.push(data.description);
    paramIndex++;
  }

  if (data.assigned_to !== undefined) {
    updates.push(`assigned_to = $${paramIndex}`);
    params.push(data.assigned_to);
    paramIndex++;
  }

  if (data.tags !== undefined) {
    updates.push(`tags = $${paramIndex}`);
    params.push(JSON.stringify(data.tags));
    paramIndex++;
  }

  if (data.metadata !== undefined) {
    updates.push(`metadata = $${paramIndex}`);
    params.push(JSON.stringify(data.metadata));
    paramIndex++;
  }

  if (updates.length === 0) {
    throw new Error('Nenhum campo para atualizar');
  }

  params.push(ticketId);

  const result = await queryDatabase<SupportTicket>(
    `UPDATE support_tickets 
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    params
  );

  if (result.length === 0) {
    throw new Error('Ticket não encontrado');
  }

  return result[0];
}

/**
 * Adiciona comentário ao ticket
 */
export async function addComment(data: CreateComment): Promise<TicketComment> {
  // Verificar se ticket existe
  const ticket = await getTicketById(data.ticket_id);
  if (!ticket) {
    throw new Error('Ticket não encontrado');
  }

  // Criar comentário
  const result = await queryDatabase<TicketComment>(
    `INSERT INTO ticket_comments (
      ticket_id, user_id, comment, is_internal, attachments, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      data.ticket_id,
      data.user_id,
      data.comment,
      data.is_internal || false,
      JSON.stringify(data.attachments || []),
      JSON.stringify(data.metadata || {})
    ]
  );

  if (result.length === 0) {
    throw new Error('Erro ao criar comentário');
  }

  // Se for primeiro comentário do staff, registrar primeira resposta
  if (!ticket.first_response_at && !data.is_internal) {
    await queryDatabase(
      `UPDATE support_tickets 
       SET first_response_at = CURRENT_TIMESTAMP, first_response_by = $1
       WHERE id = $2`,
      [data.user_id, data.ticket_id]
    );
  }

  // Notificar via WebSocket
  try {
    // Notificar criador do ticket (se não for ele mesmo e não for interno)
    if (ticket.user_id !== data.user_id && !data.is_internal) {
      sendNotificationToUser(ticket.user_id, {
        title: 'Novo Comentário',
        message: `Novo comentário no ticket ${ticket.ticket_number}`,
        type: 'info',
        data: {
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          comment: result[0]
        }
      });
    }

    // Notificar responsável (se houver e não for ele mesmo)
    if (ticket.assigned_to && ticket.assigned_to !== data.user_id) {
      sendNotificationToUser(ticket.assigned_to, {
        title: data.is_internal ? 'Comentário Interno' : 'Novo Comentário',
        message: `Novo comentário no ticket ${ticket.ticket_number}`,
        type: 'info',
        data: {
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          comment: result[0]
        }
      });
    }

    // Notificar staff (se comentário interno)
    if (data.is_internal) {
      sendNotificationToRole('staff', {
        title: 'Comentário Interno',
        message: `Comentário interno no ticket ${ticket.ticket_number}`,
        type: 'info',
        data: {
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          comment: result[0]
        }
      });
    }
  } catch (error) {
    console.error('Erro ao enviar notificação WebSocket:', error);
  }

  // Enviar notificação por email (apenas para comentários públicos)
  if (!data.is_internal && ticket.user_id !== data.user_id) {
    try {
      await notifyTicketComment(
        ticket.id,
        ticket.user_id,
        ticket.ticket_number,
        data.comment
      );
    } catch (error) {
      console.error('Erro ao enviar notificação por email:', error);
    }
  }

  return result[0];
}

/**
 * Lista comentários de um ticket
 */
export async function getTicketComments(
  ticketId: number,
  includeInternal: boolean = false
): Promise<TicketComment[]> {
  let query = `SELECT * FROM ticket_comments WHERE ticket_id = $1`;
  const params: any[] = [ticketId];

  if (!includeInternal) {
    query += ` AND is_internal = false`;
  }

  query += ` ORDER BY created_at ASC`;

  return await queryDatabase<TicketComment>(query, params);
}

/**
 * Atribui ticket a um usuário
 */
export async function assignTicket(data: AssignTicket): Promise<SupportTicket> {
  const ticket = await getTicketById(data.ticket_id);
  if (!ticket) {
    throw new Error('Ticket não encontrado');
  }

  const result = await queryDatabase<SupportTicket>(
    `UPDATE support_tickets 
     SET assigned_to = $1, status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END
     WHERE id = $2
     RETURNING *`,
    [data.assigned_to, data.ticket_id]
  );

  if (result.length === 0) {
    throw new Error('Erro ao atribuir ticket');
  }

  // Notificar via WebSocket
  try {
    const updatedTicket = result[0];
    
    // Notificar criador do ticket
    sendNotificationToUser(updatedTicket.user_id, {
      title: 'Ticket Atribuído',
      message: `Ticket ${updatedTicket.ticket_number} foi atribuído`,
      type: 'info',
      data: {
        ticket_id: updatedTicket.id,
        ticket_number: updatedTicket.ticket_number,
        assigned_to: data.assigned_to
      }
    });

    // Notificar novo responsável
    if (data.assigned_to) {
      sendNotificationToUser(data.assigned_to, {
        title: 'Novo Ticket Atribuído',
        message: `Você foi atribuído ao ticket ${updatedTicket.ticket_number}`,
        type: 'warning',
        data: { ticket: updatedTicket }
      });
    }
  } catch (error) {
    console.error('Erro ao enviar notificação WebSocket:', error);
  }

  // Enviar notificação por email para o responsável
  if (data.assigned_to) {
    try {
      await notifyTicketAssigned(
        result[0].id,
        data.assigned_to,
        result[0].ticket_number,
        result[0].subject,
        result[0].priority,
        result[0].category
      );
    } catch (error) {
      console.error('Erro ao enviar notificação por email:', error);
    }
  }

  return result[0];
}

/**
 * Muda status do ticket
 */
export async function changeTicketStatus(data: ChangeStatus): Promise<SupportTicket> {
  const ticket = await getTicketById(data.ticket_id);
  if (!ticket) {
    throw new Error('Ticket não encontrado');
  }

  const updates: string[] = [`status = $1`];
  const params: any[] = [data.status];

  if (data.status === 'resolved') {
    updates.push(`resolved_at = CURRENT_TIMESTAMP`);
    updates.push(`resolved_by = $2`);
    params.push(data.changed_by);
    if (data.resolution_notes) {
      updates.push(`resolution_notes = $${params.length + 1}`);
      params.push(data.resolution_notes);
    }
  } else if (data.status === 'closed') {
    updates.push(`closed_at = CURRENT_TIMESTAMP`);
    updates.push(`closed_by = $${params.length + 1}`);
    params.push(data.changed_by);
  }

  params.push(data.ticket_id);

  const result = await queryDatabase<SupportTicket>(
    `UPDATE support_tickets 
     SET ${updates.join(', ')}
     WHERE id = $${params.length}
     RETURNING *`,
    params
  );

  if (result.length === 0) {
    throw new Error('Erro ao mudar status');
  }

  // Notificar via WebSocket
  try {
    const updatedTicket = result[0];
    
    // Notificar criador do ticket
    sendNotificationToUser(updatedTicket.user_id, {
      title: 'Status do Ticket Atualizado',
      message: `Status do ticket ${updatedTicket.ticket_number} alterado para ${updatedTicket.status}`,
      type: 'info',
      data: {
        ticket_id: updatedTicket.id,
        ticket_number: updatedTicket.ticket_number,
        old_status: ticket.status,
        new_status: updatedTicket.status
      }
    });

    // Notificar responsável (se houver)
    if (updatedTicket.assigned_to) {
      sendNotificationToUser(updatedTicket.assigned_to, {
        title: 'Status do Ticket Atualizado',
        message: `Status do ticket ${updatedTicket.ticket_number} alterado para ${updatedTicket.status}`,
        type: 'info',
        data: {
          ticket_id: updatedTicket.id,
          ticket_number: updatedTicket.ticket_number,
          old_status: ticket.status,
          new_status: updatedTicket.status
        }
      });
    }
  } catch (error) {
    console.error('Erro ao enviar notificação WebSocket:', error);
  }

  // Registrar métricas quando ticket é resolvido
  if (result[0].status === 'resolved' && ticket.status !== 'resolved') {
    // Calcular tempo de resolução
    const resolvedAt = result[0].resolved_at ? new Date(result[0].resolved_at) : null;
    const createdAt = ticket.created_at ? new Date(ticket.created_at) : null;
    
    let resolutionTimeSeconds = 0;
    if (resolvedAt && createdAt && !isNaN(resolvedAt.getTime()) && !isNaN(createdAt.getTime())) {
      resolutionTimeSeconds = (resolvedAt.getTime() - createdAt.getTime()) / 1000;
      // Garantir que é um número válido e positivo
      if (isNaN(resolutionTimeSeconds) || resolutionTimeSeconds < 0) {
        resolutionTimeSeconds = 0;
      }
    }

    // Registrar métricas
    ticketsResolvedTotal.inc({
      category: ticket.category,
      priority: ticket.priority,
    });

    ticketResolutionTime.observe(
      {
        category: ticket.category,
        priority: ticket.priority,
      },
      resolutionTimeSeconds
    );

    // Atualizar métrica de tickets abertos
    const openTickets = await queryDatabase<{ count: string }>(
      `SELECT COUNT(*) as count FROM support_tickets WHERE status IN ('open', 'em_analise', 'em_desenvolvimento', 'aguardando_teste')`
    ) || [];
    ticketsOpen.set(parseInt(openTickets[0]?.count || '0'));
  }

  // Atualizar métrica de tickets abertos quando status muda
  if (ticket.status !== result[0].status) {
    const openTickets = await queryDatabase<{ count: string }>(
      `SELECT COUNT(*) as count FROM support_tickets WHERE status IN ('open', 'em_analise', 'em_desenvolvimento', 'aguardando_teste')`
    ) || [];
    ticketsOpen.set(parseInt(openTickets[0]?.count || '0'));
  }

  // Verificar e atualizar métrica de SLA violado
  const breachedTickets = await queryDatabase<{ count: string }>(
    `SELECT COUNT(*) as count FROM support_tickets WHERE sla_breached = true AND status NOT IN ('resolved', 'closed')`
  ) || [];
  ticketsSlaBreached.set(parseInt(breachedTickets[0]?.count || '0'));

  // Enviar notificação por email
  try {
    await notifyTicketUpdated(
      result[0].id,
      result[0].user_id,
      result[0].ticket_number,
      result[0].status,
      result[0].priority
    );

    // Se foi resolvido, enviar email específico
    if (result[0].status === 'resolved') {
      await notifyTicketResolved(
        result[0].id,
        result[0].user_id,
        result[0].ticket_number,
        result[0].subject,
        data.resolution_notes || null
      );
    }
  } catch (error) {
    console.error('Erro ao enviar notificação por email:', error);
  }

  return result[0];
}

/**
 * Fecha ticket
 */
export async function closeTicket(
  ticketId: number,
  closedBy: number,
  notes?: string
): Promise<SupportTicket> {
  return changeTicketStatus({
    ticket_id: ticketId,
    status: 'closed',
    changed_by: closedBy,
    notes
  });
}

/**
 * Reabre ticket
 */
export async function reopenTicket(ticketId: number, reopenedBy: number): Promise<SupportTicket> {
  return changeTicketStatus({
    ticket_id: ticketId,
    status: 'open',
    changed_by: reopenedBy
  });
}

/**
 * Cria SLA para ticket (função auxiliar)
 */
async function createSLAForTicket(ticketId: number, priority: TicketPriority): Promise<void> {
  // Configurações de SLA por prioridade (em minutos)
  const slaConfig: Record<TicketPriority, { firstResponse: number; resolution: number }> = {
    low: { firstResponse: 480, resolution: 2880 }, // 8h / 48h
    medium: { firstResponse: 240, resolution: 1440 }, // 4h / 24h
    high: { firstResponse: 120, resolution: 720 }, // 2h / 12h
    urgent: { firstResponse: 60, resolution: 360 }, // 1h / 6h
    critical: { firstResponse: 30, resolution: 180 } // 30min / 3h
  };

  const config = slaConfig[priority];

  await queryDatabase(
    `INSERT INTO ticket_sla (
      ticket_id, priority, first_response_target_minutes, resolution_target_minutes
    ) VALUES ($1, $2, $3, $4)`,
    [ticketId, priority, config.firstResponse, config.resolution]
  );

  // Calcular SLA due_at
  const slaDueAt = new Date();
  slaDueAt.setMinutes(slaDueAt.getMinutes() + config.resolution);

  await queryDatabase(
    `UPDATE support_tickets SET sla_due_at = $1 WHERE id = $2`,
    [slaDueAt.toISOString(), ticketId]
  );
}

/**
 * Verifica e atualiza SLA
 */
export async function checkAndUpdateSLA(ticketId: number): Promise<void> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) return;

  const sla = await queryDatabase(
    `SELECT * FROM ticket_sla WHERE ticket_id = $1`,
    [ticketId]
  );

  if (sla.length === 0) return;

  const slaData = sla[0];
  const now = new Date();

  // Verificar primeira resposta
  if (ticket.first_response_at && !slaData.first_response_met) {
    const firstResponseTime = Math.floor(
      (new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / 60000
    );
    const met = firstResponseTime <= slaData.first_response_target_minutes;

    await queryDatabase(
      `UPDATE ticket_sla 
       SET first_response_at = $1, first_response_met = $2
       WHERE ticket_id = $3`,
      [ticket.first_response_at, met, ticketId]
    );
  }

  // Verificar resolução
  if (ticket.resolved_at && !slaData.resolution_met) {
    const resolutionTime = Math.floor(
      (new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime()) / 60000
    );
    const met = resolutionTime <= slaData.resolution_target_minutes;

    await queryDatabase(
      `UPDATE ticket_sla 
       SET resolution_at = $1, resolution_met = $2
       WHERE ticket_id = $3`,
      [ticket.resolved_at, met, ticketId]
    );
  }

  // Verificar se SLA foi violado
  if (ticket.sla_due_at && now > new Date(ticket.sla_due_at) && !ticket.sla_breached) {
    await queryDatabase(
      `UPDATE support_tickets 
       SET sla_breached = true
       WHERE id = $1`,
      [ticketId]
    );

    await queryDatabase(
      `UPDATE ticket_sla 
       SET breached_at = CURRENT_TIMESTAMP
       WHERE ticket_id = $1`,
      [ticketId]
    );
  }
}


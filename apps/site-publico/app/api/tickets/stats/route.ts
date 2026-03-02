/**
 * API Route: Estatísticas de Tickets
 * GET /api/tickets/stats - Obter estatísticas de tickets
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';
import { calculateSLAMetrics } from '@/lib/sla-service';
import { TicketStatsFilterSchema } from '@/lib/schemas/ticket-schemas';
import { z } from 'zod';

// GET /api/tickets/stats - Obter estatísticas
export async function GET(request: NextRequest) {
  try {
    // Autenticação
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Apenas admin e staff podem ver estatísticas gerais
    if (auth.user.role !== 'admin' && auth.user.role !== 'staff') {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para acessar estatísticas' },
        { status: 403 }
      );
    }

    // Obter parâmetros de query
    const searchParams = request.nextUrl.searchParams;
    const filter: any = {};

    if (searchParams.get('priority')) {
      filter.priority = searchParams.get('priority');
    }

    if (searchParams.get('category')) {
      filter.category = searchParams.get('category');
    }

    if (searchParams.get('status')) {
      filter.status = searchParams.get('status');
    }

    if (searchParams.get('assigned_to')) {
      filter.assignedTo = parseInt(searchParams.get('assigned_to')!);
    }

    if (searchParams.get('date_from')) {
      filter.dateFrom = new Date(searchParams.get('date_from')!);
    }

    if (searchParams.get('date_to')) {
      filter.dateTo = new Date(searchParams.get('date_to')!);
    }

    // Validar filtros
    const validatedFilter = TicketStatsFilterSchema.parse(filter);

    // Estatísticas gerais
    const totalTickets = await queryDatabase(
      `SELECT COUNT(*) as total FROM support_tickets`
    );
    const openTickets = await queryDatabase(
      `SELECT COUNT(*) as total FROM support_tickets WHERE status IN ('open', 'in_progress', 'waiting_customer', 'waiting_third_party')`
    );
    const resolvedTickets = await queryDatabase(
      `SELECT COUNT(*) as total FROM support_tickets WHERE status = 'resolved'`
    );
    const closedTickets = await queryDatabase(
      `SELECT COUNT(*) as total FROM support_tickets WHERE status = 'closed'`
    );

    // Estatísticas por prioridade
    const byPriority = await queryDatabase(
      `SELECT priority, COUNT(*) as count 
       FROM support_tickets 
       GROUP BY priority 
       ORDER BY priority`
    );

    // Estatísticas por categoria
    const byCategory = await queryDatabase(
      `SELECT category, COUNT(*) as count 
       FROM support_tickets 
       GROUP BY category 
       ORDER BY category`
    );

    // Estatísticas por status
    const byStatus = await queryDatabase(
      `SELECT status, COUNT(*) as count 
       FROM support_tickets 
       GROUP BY status 
       ORDER BY status`
    );

    // Tempo médio de resolução
    const avgResolution = await queryDatabase(
      `SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
       FROM support_tickets 
       WHERE resolved_at IS NOT NULL`
    );

    // Tickets sem atribuição
    const unassigned = await queryDatabase(
      `SELECT COUNT(*) as total 
       FROM support_tickets 
       WHERE assigned_to IS NULL AND status NOT IN ('closed', 'cancelled')`
    );

    // Tickets com SLA violado
    const slaBreached = await queryDatabase(
      `SELECT COUNT(*) as total 
       FROM support_tickets 
       WHERE sla_breached = true AND status NOT IN ('closed', 'cancelled')`
    );

    // Métricas de SLA
    const slaMetrics = await calculateSLAMetrics(validatedFilter);

    // Top 5 usuários que mais criam tickets
    const topUsers = await queryDatabase(
      `SELECT user_id, COUNT(*) as ticket_count
       FROM support_tickets
       GROUP BY user_id
       ORDER BY ticket_count DESC
       LIMIT 5`
    );

    // Top 5 staff que mais resolvem tickets
    const topStaff = await queryDatabase(
      `SELECT resolved_by, COUNT(*) as resolved_count
       FROM support_tickets
       WHERE resolved_by IS NOT NULL
       GROUP BY resolved_by
       ORDER BY resolved_count DESC
       LIMIT 5`
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: parseInt(totalTickets[0]?.total || '0'),
          open: parseInt(openTickets[0]?.total || '0'),
          resolved: parseInt(resolvedTickets[0]?.total || '0'),
          closed: parseInt(closedTickets[0]?.total || '0'),
          unassigned: parseInt(unassigned[0]?.total || '0'),
          sla_breached: parseInt(slaBreached[0]?.total || '0')
        },
        by_priority: byPriority,
        by_category: byCategory,
        by_status: byStatus,
        metrics: {
          avg_resolution_hours: parseFloat(avgResolution[0]?.avg_hours || '0'),
          sla: slaMetrics
        },
        top_users: topUsers,
        top_staff: topStaff
      }
    });

  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter estatísticas' },
      { status: 500 }
    );
  }
}


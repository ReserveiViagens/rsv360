/**
 * API Route: Tickets
 * GET /api/tickets - Listar tickets
 * POST /api/tickets - Criar novo ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { CreateTicketSchema, TicketFilterSchema } from '@/lib/schemas/ticket-schemas';
import { createTicket, listTickets } from '@/lib/ticket-service';
import { z } from 'zod';

// GET /api/tickets - Listar tickets com filtros
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

    // Obter parâmetros de query
    const searchParams = request.nextUrl.searchParams;
    const filter: any = {};

    if (searchParams.get('user_id')) {
      filter.user_id = parseInt(searchParams.get('user_id')!);
    }

    if (searchParams.get('assigned_to')) {
      filter.assigned_to = parseInt(searchParams.get('assigned_to')!);
    }

    if (searchParams.get('status')) {
      filter.status = searchParams.get('status');
    }

    if (searchParams.get('priority')) {
      filter.priority = searchParams.get('priority');
    }

    if (searchParams.get('category')) {
      filter.category = searchParams.get('category');
    }

    if (searchParams.get('source')) {
      filter.source = searchParams.get('source');
    }

    if (searchParams.get('search')) {
      filter.search = searchParams.get('search');
    }

    if (searchParams.get('created_from')) {
      filter.created_from = searchParams.get('created_from');
    }

    if (searchParams.get('created_to')) {
      filter.created_to = searchParams.get('created_to');
    }

    if (searchParams.get('tags')) {
      filter.tags = searchParams.get('tags')!.split(',');
    }

    filter.limit = parseInt(searchParams.get('limit') || '20');
    filter.offset = parseInt(searchParams.get('offset') || '0');
    filter.sort_by = searchParams.get('sort_by') || 'created_at';
    filter.sort_order = searchParams.get('sort_order') || 'desc';

    // Se não for admin/staff, só mostrar tickets do próprio usuário
    if (auth.user.role !== 'admin' && auth.user.role !== 'staff') {
      filter.user_id = auth.user.id;
    }

    // Validar filtros
    const validatedFilter = TicketFilterSchema.parse(filter);

    // Listar tickets
    const result = await listTickets(validatedFilter);

    return NextResponse.json({
      success: true,
      data: result.tickets,
      pagination: {
        total: result.total,
        limit: filter.limit,
        offset: filter.offset,
        has_more: result.total > filter.offset + filter.limit
      }
    });

  } catch (error: any) {
    console.error('Erro ao listar tickets:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Criar novo ticket
export async function POST(request: NextRequest) {
  try {
    // Autenticação
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter body
    const body = await request.json();

    // Adicionar user_id do token
    const ticketData = {
      ...body,
      user_id: auth.user.id
    };

    // Validar dados
    const validatedData = CreateTicketSchema.parse(ticketData);

    // Criar ticket
    const ticket = await createTicket(validatedData);

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Ticket criado com sucesso'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar ticket:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar ticket' },
      { status: 500 }
    );
  }
}


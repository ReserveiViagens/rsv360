/**
 * API de Eventos do Calendário do Grupo
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { groupCalendarService, type CalendarEvent } from '@/lib/group-calendar-service';

/**
 * GET /api/calendar/events
 * Obter eventos de um grupo
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const startDate = searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined;
    const endDate = searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined;

    if (!groupId) {
      return NextResponse.json({ error: 'group_id é obrigatório' }, { status: 400 });
    }

    const events = await groupCalendarService.getGroupEvents(groupId, startDate, endDate);

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    console.error('Erro ao obter eventos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter eventos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/events
 * Criar novo evento
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      group_id,
      trip_id,
      wishlist_id,
      title,
      description,
      start_date,
      end_date,
      all_day,
      location,
      color,
      type,
    } = body;

    if (!group_id || !title || !start_date) {
      return NextResponse.json(
        { error: 'group_id, title e start_date são obrigatórios' },
        { status: 400 }
      );
    }

    const event: CalendarEvent = {
      groupId: group_id,
      tripId: trip_id,
      wishlistId: wishlist_id,
      title,
      description,
      startDate: new Date(start_date),
      endDate: end_date ? new Date(end_date) : undefined,
      allDay: all_day || false,
      location,
      createdBy: auth.user.id,
      color: color || '#3b82f6',
      type: type || 'custom',
    };

    const createdEvent = await groupCalendarService.createEvent(event);

    return NextResponse.json({
      success: true,
      data: createdEvent,
    });
  } catch (error: any) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar evento' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calendar/events/[id]
 * Atualizar evento
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = parseInt(searchParams.get('id') || '0');

    if (!eventId) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const updates: Partial<CalendarEvent> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.start_date !== undefined) updates.startDate = new Date(body.start_date);
    if (body.end_date !== undefined) updates.endDate = body.end_date ? new Date(body.end_date) : undefined;
    if (body.all_day !== undefined) updates.allDay = body.all_day;
    if (body.location !== undefined) updates.location = body.location;
    if (body.color !== undefined) updates.color = body.color;
    if (body.type !== undefined) updates.type = body.type;

    const updatedEvent = await groupCalendarService.updateEvent(eventId, updates);

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar evento' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/events/[id]
 * Deletar evento
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = parseInt(searchParams.get('id') || '0');
    const groupId = searchParams.get('group_id');

    if (!eventId || !groupId) {
      return NextResponse.json({ error: 'id e group_id são obrigatórios' }, { status: 400 });
    }

    await groupCalendarService.deleteEvent(eventId, groupId);

    return NextResponse.json({
      success: true,
      message: 'Evento deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar evento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar evento' },
      { status: 500 }
    );
  }
}


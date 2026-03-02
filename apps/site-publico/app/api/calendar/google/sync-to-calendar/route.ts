/**
 * ✅ TAREFA MEDIUM-3: API para sincronizar reserva para Google Calendar
 * POST /api/calendar/google/sync-to-calendar
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncBookingToCalendar } from '@/lib/google-calendar-service';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, host_id, calendar_id } = body;

    // Validar dados obrigatórios
    if (!booking_id || !host_id) {
      return NextResponse.json(
        { success: false, error: 'booking_id e host_id são obrigatórios' },
        { status: 400 }
      );
    }

    // Sincronizar reserva para Google Calendar
    const eventId = await syncBookingToCalendar(
      booking_id,
      host_id,
      calendar_id || 'primary'
    );

    return NextResponse.json({
      success: true,
      data: {
        event_id: eventId,
        message: 'Reserva sincronizada com Google Calendar',
      },
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar para Google Calendar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao sincronizar para Google Calendar' },
      { status: 500 }
    );
  }
}


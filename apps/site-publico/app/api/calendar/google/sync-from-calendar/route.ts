/**
 * ✅ TAREFA MEDIUM-3: API para sincronizar disponibilidade do Google Calendar
 * POST /api/calendar/google/sync-from-calendar
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncAvailabilityFromCalendar } from '@/lib/google-calendar-service';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host_id, property_id, calendar_id } = body;

    // Validar dados obrigatórios
    if (!host_id || !property_id) {
      return NextResponse.json(
        { success: false, error: 'host_id e property_id são obrigatórios' },
        { status: 400 }
      );
    }

    // Sincronizar disponibilidade do Google Calendar
    const blockedDates = await syncAvailabilityFromCalendar(
      host_id,
      property_id,
      calendar_id || 'primary'
    );

    return NextResponse.json({
      success: true,
      data: {
        blocked_dates: blockedDates,
        message: `${blockedDates} datas bloqueadas importadas do Google Calendar`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar do Google Calendar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao sincronizar do Google Calendar' },
      { status: 500 }
    );
  }
}


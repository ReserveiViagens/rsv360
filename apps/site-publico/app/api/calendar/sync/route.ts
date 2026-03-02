/**
 * ✅ API DE SINCRONIZAÇÃO GOOGLE CALENDAR
 * POST /api/calendar/sync - Sincronizar reserva para Google Calendar
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, withAuth } from '@/lib/api-auth';
import { syncBookingToCalendar, updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar-service';

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { booking_id, action } = body;

    if (!booking_id || !action) {
      return NextResponse.json(
        { success: false, error: 'booking_id e action são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é o host da reserva
    const { queryDatabase } = await import('@/lib/db');
    const booking = await queryDatabase(
      `SELECT b.*, p.host_id 
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = $1`,
      [booking_id]
    );

    if (booking.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    if (booking[0].host_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    let result: any;

    switch (action) {
      case 'create':
        result = await syncBookingToCalendar(booking_id, booking[0].host_id);
        return NextResponse.json({
          success: true,
          message: 'Evento criado no Google Calendar',
          data: { event_id: result },
        });

      case 'update':
        await updateCalendarEvent(booking_id, booking[0].host_id);
        return NextResponse.json({
          success: true,
          message: 'Evento atualizado no Google Calendar',
        });

      case 'delete':
        await deleteCalendarEvent(booking_id, booking[0].host_id);
        return NextResponse.json({
          success: true,
          message: 'Evento deletado do Google Calendar',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Action inválida. Use: create, update ou delete' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Erro ao sincronizar com Google Calendar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao sincronizar com Google Calendar' },
      { status: 500 }
    );
  }
});


/**
 * ✅ TAREFA MEDIUM-2: API para listar códigos de smart lock
 * GET /api/smart-locks/codes?booking_id=123
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActivePins } from '@/lib/smartlock-integration';
import { queryDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('booking_id');
    const propertyId = searchParams.get('property_id');

    if (!bookingId && !propertyId) {
      return NextResponse.json(
        { success: false, error: 'booking_id ou property_id é obrigatório' },
        { status: 400 }
      );
    }

    let codes = [];

    if (bookingId) {
      // Buscar PINs ativos da reserva
      codes = await getActivePins(parseInt(bookingId));
    } else if (propertyId) {
      // Buscar todos os códigos da propriedade
      const result = await queryDatabase(
        `SELECT 
          al.*,
          sl.name as lock_name,
          sl.lock_type,
          b.booking_code
        FROM access_logs al
        JOIN smart_locks sl ON al.lock_id = sl.device_id
        LEFT JOIN bookings b ON al.booking_id = b.id
        WHERE al.property_id = $1
          AND al.action = 'granted'
          AND al.expires_at > CURRENT_TIMESTAMP
        ORDER BY al.created_at DESC`,
        [propertyId]
      );

      codes = result.map((row: any) => ({
        pin_code: row.pin_code,
        expires_at: row.expires_at,
        lock_type: row.lock_type,
        lock_name: row.lock_name,
        booking_id: row.booking_id,
        booking_code: row.booking_code,
      }));
    }

    return NextResponse.json({
      success: true,
      data: codes,
    });
  } catch (error: any) {
    console.error('Erro ao listar códigos smart lock:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar códigos' },
      { status: 500 }
    );
  }
}


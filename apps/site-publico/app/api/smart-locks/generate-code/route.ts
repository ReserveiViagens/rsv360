/**
 * ✅ TAREFA MEDIUM-2: API para gerar código de smart lock
 * POST /api/smart-locks/generate-code
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePin } from '@/lib/smartlock-integration';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, booking_id, check_in, check_out } = body;

    // Validar dados obrigatórios
    if (!property_id || !booking_id || !check_in || !check_out) {
      return NextResponse.json(
        { success: false, error: 'property_id, booking_id, check_in e check_out são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se booking existe
    const booking = await queryDatabase(
      `SELECT * FROM bookings WHERE id = $1`,
      [booking_id]
    );

    if (!booking || booking.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    // Gerar PIN
    const { pinCode, expiresAt } = await generatePin(
      property_id,
      booking_id,
      new Date(check_in),
      new Date(check_out)
    );

    // Buscar informações da fechadura
    const locks = await queryDatabase(
      `SELECT id, name, lock_type, device_id, status
       FROM smart_locks
       WHERE property_id = $1 AND is_active = true
       LIMIT 1`,
      [property_id]
    );

    return NextResponse.json({
      success: true,
      data: {
        pin_code: pinCode,
        expires_at: expiresAt.toISOString(),
        lock: locks.length > 0 ? locks[0] : null,
        booking_id,
        property_id,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar código smart lock:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar código' },
      { status: 500 }
    );
  }
}


/**
 * ✅ TAREFA MEDIUM-1: API para criar sessão Klarna
 * POST /api/payments/klarna/session
 */

import { NextRequest, NextResponse } from 'next/server';
import { klarnaClient } from '@/lib/klarna-service';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, amount, currency, billing_address, shipping_address } = body;

    // Validar dados obrigatórios
    if (!booking_id || !amount || !currency) {
      return NextResponse.json(
        { success: false, error: 'booking_id, amount e currency são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar dados da reserva
    const booking = await queryDatabase(
      `SELECT 
        b.*,
        p.name as property_name,
        p.address as property_address
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1`,
      [booking_id]
    );

    if (!booking || booking.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    const bookingData = booking[0];

    // Verificar elegibilidade
    const eligibility = await klarnaClient.checkEligibility({
      amount: parseFloat(amount),
      check_in_date: new Date(bookingData.check_in),
    });

    if (!eligibility.eligible) {
      return NextResponse.json(
        { success: false, error: eligibility.reason || 'Reserva não elegível para Pay Later' },
        { status: 400 }
      );
    }

    // Preparar order_lines
    const order_lines = [
      {
        name: bookingData.property_name || 'Reserva de Hotel',
        quantity: 1,
        unit_price: parseFloat(amount),
        total_amount: parseFloat(amount),
      },
    ];

    // Criar sessão Klarna
    const session = await klarnaClient.createSession({
      booking_id,
      amount: parseFloat(amount),
      currency,
      billing_address: billing_address || {
        given_name: bookingData.guest_name || '',
        family_name: '',
        email: bookingData.guest_email || '',
        street_address: bookingData.property_address || '',
        postal_code: '',
        city: '',
        country: 'BR',
      },
      shipping_address: shipping_address || bookingData.property_address || {},
      order_lines,
    });

    // Salvar sessão no banco (opcional, para rastreamento)
    await queryDatabase(
      `INSERT INTO payment_sessions (
        booking_id,
        provider,
        session_id,
        status,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (booking_id, provider) 
      DO UPDATE SET session_id = $3, updated_at = NOW()`,
      [
        booking_id,
        'klarna',
        session.session_id,
        'pending',
        JSON.stringify({ client_token: session.client_token }),
      ]
    );

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão Klarna:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar sessão Klarna' },
      { status: 500 }
    );
  }
}


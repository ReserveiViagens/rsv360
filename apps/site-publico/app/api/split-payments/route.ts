/**
 * ✅ ITEM 16: API DE SPLIT PAYMENTS
 * GET /api/split-payments - Listar splits
 * POST /api/split-payments - Criar split
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createSplitPayment,
  getSplitPaymentByBooking,
  getSplitPayment,
} from '@/lib/split-payment-service';
import { createSplitPaymentSchema, getSplitPaymentQuerySchema } from '@/lib/schemas/split-payment-schemas';
import { requireAuth, optionalAuth } from '@/lib/api-auth';

// GET /api/split-payments - Listar splits
export async function GET(request: NextRequest) {
  const authResult = await optionalAuth(request);
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Validar query params
    const queryResult = getSplitPaymentQuerySchema.safeParse({
      booking_id: searchParams.get('booking_id'),
      id: searchParams.get('id'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { booking_id, id } = queryResult.data;

    if (id) {
      const split = await getSplitPayment(id, true);
      if (!split) {
        return NextResponse.json(
          { success: false, error: 'Split payment não encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: split });
    }

    if (booking_id) {
      const split = await getSplitPaymentByBooking(booking_id);
      if (!split) {
        return NextResponse.json(
          { success: false, error: 'Split payment não encontrado para esta reserva' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: split });
    }

    return NextResponse.json(
      { success: false, error: 'booking_id ou id é obrigatório' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro ao buscar split payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar split payment' },
      { status: 500 }
    );
  }
}

// POST /api/split-payments - Criar split
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  try {
    const body = await request.json();
    
    // Validar body com Zod
    const validationResult = createSplitPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { booking_id, total_amount, split_type, participants, created_by } = validationResult.data;

    const split = await createSplitPayment(
      booking_id,
      total_amount,
      split_type,
      participants,
      created_by || user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Split payment criado com sucesso',
      data: split,
    });
  } catch (error: any) {
    console.error('Erro ao criar split payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar split payment' },
      { status: 500 }
    );
  }
}


/**
 * ✅ API DE CÁLCULO DE PRÊMIO
 * POST /api/insurance/calculate-premium - Calcular prêmio de seguro
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePremium } from '@/lib/insurance-service';
import { calculatePremiumSchema } from '@/lib/schemas/insurance-schemas';

export async function POST(request: NextRequest) {
  // Cálculo de prêmio pode ser público (não requer autenticação)

  try {
    const body = await request.json();
    
    // Validar body com Zod
    const validationResult = calculatePremiumSchema.safeParse(body);

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

    const {
      coverage_type,
      coverage_amount,
      trip_duration_days,
      number_of_travelers,
      destination,
    } = validationResult.data;

    // Calcular prêmio usando o service (que usa Kakau client)
    const premiumAmount = await calculatePremium({
      booking_id: validationResult.data.booking_id,
      coverage_type,
      coverage_amount,
      trip_duration_days,
      number_of_travelers,
      destination,
    });

    return NextResponse.json({
      success: true,
      data: {
        premium_amount: premiumAmount,
        coverage_amount,
        coverage_type,
        trip_duration_days,
        number_of_travelers,
      },
    });
  } catch (error: any) {
    console.error('Erro ao calcular prêmio:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao calcular prêmio' },
      { status: 500 }
    );
  }
}


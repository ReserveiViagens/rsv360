/**
 * API de Comparação de Seguros
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { multiInsuranceService, type QuoteRequest } from '@/lib/multi-insurance-service';

/**
 * POST /api/insurance/compare
 * Obter cotações de múltiplas seguradoras e comparar
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const quoteRequest: QuoteRequest = {
      bookingId: body.booking_id,
      tripDurationDays: body.trip_duration_days,
      numberOfTravelers: body.number_of_travelers,
      destination: body.destination,
      totalBookingAmount: body.total_booking_amount,
      travelers: body.travelers,
      startDate: body.start_date ? new Date(body.start_date) : undefined,
      endDate: body.end_date ? new Date(body.end_date) : undefined,
      coverageTypes: body.coverage_types || ['basic', 'standard', 'premium', 'comprehensive'],
    };

    // Validar campos obrigatórios
    if (!quoteRequest.tripDurationDays || !quoteRequest.numberOfTravelers || !quoteRequest.totalBookingAmount) {
      return NextResponse.json(
        { error: 'trip_duration_days, number_of_travelers e total_booking_amount são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter cotações
    const quotes = await multiInsuranceService.getQuotes(quoteRequest);

    // Comparar cotações
    const comparison = multiInsuranceService.compareQuotes(quotes);

    return NextResponse.json({
      success: true,
      data: {
        quotes,
        comparison,
      },
    });
  } catch (error: any) {
    console.error('Erro ao comparar seguros:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao comparar seguros' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/insurance/compare/providers
 * Obter lista de provedores de seguro disponíveis
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const providers = multiInsuranceService.getEnabledProviders();

    return NextResponse.json({
      success: true,
      data: providers,
    });
  } catch (error: any) {
    console.error('Erro ao obter provedores:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter provedores' },
      { status: 500 }
    );
  }
}


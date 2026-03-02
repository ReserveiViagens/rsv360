/**
 * API de Seleção Automática de Seguros
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { autoInsuranceSelector, type SelectionCriteria, type QuoteRequest } from '@/lib/auto-insurance-selector';

/**
 * POST /api/insurance/auto-select
 * Selecionar automaticamente o melhor seguro
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Construir QuoteRequest
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

    // Construir SelectionCriteria
    let criteria: SelectionCriteria = {
      priority: body.priority || 'balanced',
    };

    // Se não houver critérios explícitos, sugerir baseado no perfil do usuário
    if (!body.criteria && body.use_user_profile) {
      criteria = autoInsuranceSelector.suggestCriteria({
        budget: body.budget,
        riskTolerance: body.risk_tolerance,
        preferredCoverage: body.preferred_coverage,
        previousClaims: body.previous_claims,
      });
    } else if (body.criteria) {
      criteria = {
        priority: body.criteria.priority || 'balanced',
        maxPrice: body.criteria.max_price,
        minRating: body.criteria.min_rating,
        minCoverage: body.criteria.min_coverage,
        preferredProviders: body.criteria.preferred_providers,
        excludeProviders: body.criteria.exclude_providers,
        coverageType: body.criteria.coverage_type,
        requireFeatures: body.criteria.require_features,
        excludeFeatures: body.criteria.exclude_features,
      };
    }

    // Executar seleção automática
    const result = await autoInsuranceSelector.autoSelect(quoteRequest, criteria);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erro ao selecionar seguro automaticamente:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao selecionar seguro automaticamente' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/insurance/auto-select/suggest-criteria
 * Sugerir critérios de seleção baseado no perfil do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    const userProfile = {
      budget: searchParams.get('budget') ? parseFloat(searchParams.get('budget')!) : undefined,
      riskTolerance: searchParams.get('risk_tolerance') as 'low' | 'medium' | 'high' | undefined,
      preferredCoverage: searchParams.get('preferred_coverage') as 'basic' | 'standard' | 'premium' | 'comprehensive' | undefined,
      previousClaims: searchParams.get('previous_claims') ? parseInt(searchParams.get('previous_claims')!) : undefined,
    };

    const suggestedCriteria = autoInsuranceSelector.suggestCriteria(userProfile);

    return NextResponse.json({
      success: true,
      data: suggestedCriteria,
    });
  } catch (error: any) {
    console.error('Erro ao sugerir critérios:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sugerir critérios' },
      { status: 500 }
    );
  }
}


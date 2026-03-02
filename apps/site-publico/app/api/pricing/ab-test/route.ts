/**
 * ✅ TAREFA HIGH-2: API para A/B Testing de Precificação
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createABExperiment,
  addABVariant,
  assignParticipant,
  recordABMetric,
  getABExperimentResults,
  listActiveABExperiments,
} from '@/lib/ab-testing-service';

/**
 * GET /api/pricing/ab-test
 * Listar experimentos A/B ativos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('property_id');

    const experiments = await listActiveABExperiments(
      propertyId ? parseInt(propertyId) : undefined
    );

    return NextResponse.json({
      success: true,
      data: experiments,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao listar experimentos A/B',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pricing/ab-test
 * Criar novo experimento A/B
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      property_id,
      start_date,
      end_date,
      traffic_split,
      variants,
    } = body;

    // Criar experimento
    const experiment = await createABExperiment({
      name,
      description,
      property_id,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      status: 'draft',
      traffic_split: traffic_split || 50,
    });

    // Adicionar variantes
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await addABVariant({
          experiment_id: experiment.id!,
          variant_name: variant.variant_name,
          pricing_strategy: variant.pricing_strategy,
          traffic_percentage: variant.traffic_percentage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: experiment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao criar experimento A/B',
      },
      { status: 500 }
    );
  }
}


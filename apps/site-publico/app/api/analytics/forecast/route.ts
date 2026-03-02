import { NextRequest, NextResponse } from 'next/server';
import { generateRevenueForecast } from '@/lib/advanced-analytics-service';

// GET: Gerar revenue forecast
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeScenarios = searchParams.get('includeScenarios') === 'true';
    const confidenceLevel = searchParams.get('confidenceLevel') ? parseInt(searchParams.get('confidenceLevel')!) : undefined;

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'propertyId, startDate e endDate são obrigatórios' },
        { status: 400 }
      );
    }

    const forecast = await generateRevenueForecast(
      parseInt(propertyId),
      new Date(startDate),
      new Date(endDate),
      {
        includeScenarios,
        confidenceLevel,
      }
    );

    return NextResponse.json({ success: true, data: forecast });
  } catch (error: any) {
    console.error('Erro ao gerar forecast:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar forecast' },
      { status: 500 }
    );
  }
}


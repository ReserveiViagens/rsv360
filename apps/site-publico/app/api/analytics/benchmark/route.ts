import { NextRequest, NextResponse } from 'next/server';
import { generateCompetitorBenchmark } from '@/lib/advanced-analytics-service';

// POST: Gerar competitor benchmark
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, competitors } = body;

    if (!propertyId || !competitors || !Array.isArray(competitors)) {
      return NextResponse.json(
        { error: 'propertyId e competitors (array) são obrigatórios' },
        { status: 400 }
      );
    }

    const benchmark = await generateCompetitorBenchmark(
      propertyId,
      competitors
    );

    return NextResponse.json({ success: true, data: benchmark });
  } catch (error: any) {
    console.error('Erro ao gerar benchmark:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar benchmark' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { generateDemandHeatmap } from '@/lib/advanced-analytics-service';

// GET: Gerar demand heatmap
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'propertyId, startDate e endDate são obrigatórios' },
        { status: 400 }
      );
    }

    const heatmap = await generateDemandHeatmap(
      parseInt(propertyId),
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({ success: true, data: heatmap });
  } catch (error: any) {
    console.error('Erro ao gerar heatmap:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar heatmap' },
      { status: 500 }
    );
  }
}


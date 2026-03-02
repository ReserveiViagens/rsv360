/**
 * API simulação tributária
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { simulateTax, checkThresholds } from '@/lib/tax-optimization/tax-optimization-service';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gross_revenue, regime = 'simples', service_type = 'services', period_start, period_end } =
      body;

    if (!gross_revenue || gross_revenue <= 0) {
      return NextResponse.json(
        { success: false, error: 'gross_revenue é obrigatório e deve ser positivo' },
        { status: 400 }
      );
    }

    const [simulation, thresholds] = await Promise.all([
      simulateTax(
        parseFloat(gross_revenue),
        regime,
        service_type,
        period_start,
        period_end
      ),
      checkThresholds(),
    ]);

    return NextResponse.json({
      success: true,
      data: { simulation, thresholds },
    });
  } catch (err: unknown) {
    console.error('[tax/simulation] POST error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

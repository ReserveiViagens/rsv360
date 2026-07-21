/**
 * 📊 ENDPOINT DE MÉTRICAS PROMETHEUS
 * GET /api/metrics — PR-05b: Bearer METRICS_TOKEN obrigatório (fail-closed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isMetricsBearerAuthorized } from '@rsv360/shared';
import { getMetrics } from '@/lib/metrics';
import { jsonInternalError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    if (!isMetricsBearerAuthorized(request.headers.get('authorization'))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const metrics = await getMetrics();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return jsonInternalError(error, 'metrics_collect');
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API status Perse
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { checkPerseEligibility } from '@/lib/tax-optimization/perse-enrollment-service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cnae = searchParams.get('cnae');

    const status = await checkPerseEligibility(cnae || undefined);

    return NextResponse.json({ success: true, data: status });
  } catch (err: unknown) {
    console.error('[tax/perse] GET error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

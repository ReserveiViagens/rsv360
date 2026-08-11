import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { generateMockPlan, type OnboardingPlanData, type OnboardingPlan } from '@/lib/onboarding-plan-generator';
import { generateOnboardingPlanViaLlm } from '@/lib/onboarding-plan-openai';
import {
  getJwtSecret,
  JWT_HS256_VERIFY_OPTIONS,
} from '@rsv360/shared';
import { jsonInternalError } from '@/lib/api-error';

function getUserId(request: NextRequest): { userId: number; error?: NextResponse } {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: 0, error: NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 }) };
  }
  const token = authHeader.substring(7);
  const JWT_SECRET = getJwtSecret();
  try {
    const decoded = jwt.verify(token, JWT_SECRET, JWT_HS256_VERIFY_OPTIONS) as { userId?: number; id?: number };
    const userId = decoded.userId ?? decoded.id;
    if (!userId) return { userId: 0, error: NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 }) };
    return { userId };
  } catch {
    return { userId: 0, error: NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 }) };
  }
}

// POST /api/onboarding/generate-plan
export async function POST(request: NextRequest) {
  const { error } = getUserId(request);
  if (error) return error;

  try {
    const data: OnboardingPlanData = await request.json();
    const mode = process.env.NEXT_PUBLIC_ONBOARDING_PLAN_MODE || process.env.ONBOARDING_PLAN_MODE || 'mock';

    let plan: OnboardingPlan;

    if (mode === 'openai' && process.env.OPENAI_API_KEY) {
      // PR-13e-followup-c: shared gateway (allowlist 13b + timeout/budget/safe logs)
      const fromLlm = await generateOnboardingPlanViaLlm(data);
      plan = fromLlm ?? generateMockPlan(data);
    } else {
      plan = generateMockPlan(data);
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (err: any) {
    console.error('Erro ao gerar plano:', err);
    return jsonInternalError(err);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { generateMockPlan, type OnboardingPlanData, type OnboardingPlan } from '@/lib/onboarding-plan-generator';

function getUserId(request: NextRequest): { userId: number; error?: NextResponse } {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: 0, error: NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 }) };
  }
  const token = authHeader.substring(7);
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: number; id?: number };
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
      try {
        const openaiModule = await import('openai').catch(() => null);
        if (!openaiModule) throw new Error('openai package not installed');
        const OpenAI = openaiModule.default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `Com base nos dados do usuário, crie um plano de onboarding em JSON. Resposta APENAS JSON válido, sem markdown.
Dados: ${JSON.stringify(data)}
Estrutura: { "title": string, "description": string, "estimatedDuration": number, "difficulty": "beginner"|"intermediate"|"advanced", "steps": [{ "title": string, "duration": number }], "resources": [{ "title": string, "type": string, "duration": number }] }`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        });
        const content = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content.replace(/```json?\n?|\n?```/g, '').trim());
        plan = {
          id: 'plan-openai',
          ...parsed,
        };
      } catch (openaiErr: any) {
        console.warn('OpenAI fallback to mock:', openaiErr.message);
        plan = generateMockPlan(data);
      }
    } else {
      plan = generateMockPlan(data);
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (err: any) {
    console.error('Erro ao gerar plano:', err);
    return NextResponse.json({ success: false, error: err.message || 'Erro ao gerar plano' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';

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

// GET /api/onboarding - Buscar progresso do usuário
export async function GET(request: NextRequest) {
  const { userId, error } = getUserId(request);
  if (error) return error;

  try {
    const rows = await queryDatabase(
      'SELECT profile, assessment, preferences, goals, plan_data, current_step, completed_at FROM user_onboarding WHERE user_id = $1',
      [userId]
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }
    const r = rows[0] as any;
    return NextResponse.json({
      success: true,
      data: {
        profile: typeof r.profile === 'string' ? JSON.parse(r.profile || '{}') : (r.profile || {}),
        assessment: typeof r.assessment === 'string' ? JSON.parse(r.assessment || '{}') : (r.assessment || {}),
        preferences: typeof r.preferences === 'string' ? JSON.parse(r.preferences || '{}') : (r.preferences || {}),
        goals: typeof r.goals === 'string' ? JSON.parse(r.goals || '{}') : (r.goals || {}),
        planData: typeof r.plan_data === 'string' ? JSON.parse(r.plan_data || '{}') : (r.plan_data || {}),
        currentStep: r.current_step ?? 0,
        completedAt: r.completed_at,
      },
    });
  } catch (err: any) {
    console.error('Erro ao buscar onboarding:', err);
    return NextResponse.json({ success: false, error: 'Erro ao buscar dados do onboarding' }, { status: 500 });
  }
}

// POST /api/onboarding - Salvar/atualizar dados do onboarding
export async function POST(request: NextRequest) {
  const { userId, error } = getUserId(request);
  if (error) return error;

  try {
    const body = await request.json();
    const profile = JSON.stringify(body.profile || {});
    const assessment = JSON.stringify(body.assessment || {});
    const preferences = JSON.stringify(body.preferences || {});
    const goals = JSON.stringify(body.goals || {});
    const planData = JSON.stringify(body.planData || body.plan_data || {});
    const currentStep = body.currentStep ?? body.current_step ?? 0;
    const completedAt = body.completedAt ?? body.completed_at ?? null;

    const existing = await queryDatabase('SELECT id FROM user_onboarding WHERE user_id = $1', [userId]);
    if (existing.length > 0) {
      await queryDatabase(
        `UPDATE user_onboarding SET 
          profile = $1, assessment = $2, preferences = $3, goals = $4, plan_data = $5, 
          current_step = $6, completed_at = $7, updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $8`,
        [profile, assessment, preferences, goals, planData, currentStep, completedAt, userId]
      );
    } else {
      await queryDatabase(
        `INSERT INTO user_onboarding (user_id, profile, assessment, preferences, goals, plan_data, current_step, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, profile, assessment, preferences, goals, planData, currentStep, completedAt]
      );
    }
    return NextResponse.json({ success: true, message: 'Onboarding salvo com sucesso' });
  } catch (err: any) {
    console.error('Erro ao salvar onboarding:', err);
    return NextResponse.json({ success: false, error: 'Erro ao salvar onboarding' }, { status: 500 });
  }
}

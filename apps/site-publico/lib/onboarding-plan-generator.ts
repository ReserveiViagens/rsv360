/**
 * Gerador de plano de onboarding - 3 modos configuráveis
 * mock: lógica local baseada em regras
 * api: chama POST /api/onboarding/generate-plan
 * openai: mesma rota, backend usa OpenAI
 */

export interface OnboardingPlanData {
  profile: {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    experience?: string;
  };
  assessment: {
    systemKnowledge?: string;
    industryKnowledge?: number;
    softwareComfort?: number;
  };
  preferences: {
    learningStyle?: string;
    timeAvailability?: string;
    devicePreference?: string;
  };
  goals: {
    primaryGoals?: string[];
    specificGoals?: string;
  };
}

export interface OnboardingPlan {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: { title: string; duration: number }[];
  resources: { title: string; type: string; duration: number }[];
}

export function generateMockPlan(data: OnboardingPlanData): OnboardingPlan {
  const { profile, assessment, preferences, goals } = data;
  const experience = profile.experience || '';
  const industry = assessment.industryKnowledge ?? 3;
  const software = assessment.softwareComfort ?? 3;
  const timeAvail = preferences.timeAvailability || '3-5 horas';

  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  let estimatedDuration = 120;

  if (experience.includes('Iniciante') || industry <= 2 || software <= 2) {
    difficulty = 'beginner';
    estimatedDuration = 180;
  } else if (experience.includes('Sênior') && industry >= 4 && software >= 4) {
    difficulty = 'advanced';
    estimatedDuration = 90;
  }

  const steps = [
    { title: 'Introdução ao módulo de reservas', duration: 15 },
    { title: 'Dashboard e analytics', duration: 20 },
    { title: 'Gestão de propriedades', duration: 25 },
    { title: 'Canais de distribuição', duration: 30 },
    { title: 'Relatórios e métricas', duration: 20 },
    { title: 'Práticas e certificação', duration: difficulty === 'beginner' ? 40 : 20 },
  ];

  const resources = [
    { title: 'Vídeo: Primeiros passos no RSV', type: 'video', duration: 10 },
    { title: 'Guia: Manual do sistema', type: 'document', duration: 30 },
    { title: 'Quiz: Avaliação de conhecimento', type: 'quiz', duration: 15 },
  ];

  if (preferences.learningStyle === 'Visual') {
    resources.unshift({ title: 'Infográfico: Fluxo de reservas', type: 'document', duration: 5 });
  }

  return {
    id: 'plan-1',
    title: 'Plano de Onboarding Personalizado',
    description: `Plano criado para ${profile.name || 'você'} - ${profile.role || 'Agente'}`,
    estimatedDuration,
    difficulty,
    steps,
    resources,
  };
}

export async function generatePlan(
  mode: 'mock' | 'api' | 'openai',
  data: OnboardingPlanData
): Promise<OnboardingPlan> {
  if (mode === 'mock') {
    return generateMockPlan(data);
  }

  const res = await fetch('/api/onboarding/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao gerar plano');
  }

  const result = await res.json();
  return result.data;
}

export function getPlanMode(): 'mock' | 'api' | 'openai' {
  const mode = process.env.NEXT_PUBLIC_ONBOARDING_PLAN_MODE || process.env.ONBOARDING_PLAN_MODE || 'mock';
  if (mode === 'api' || mode === 'openai') return mode;
  return 'mock';
}

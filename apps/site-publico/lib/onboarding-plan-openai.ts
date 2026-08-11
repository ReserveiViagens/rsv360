/**
 * PR-13e-followup-c: onboarding plan via shared llmChatCompletion gateway.
 */
import {
  llmChatCompletion,
  sanitizeOnboardingPromptFields,
  type LlmChatGatewayDeps,
} from '@rsv360/shared';
import type { OnboardingPlan, OnboardingPlanData } from './onboarding-plan-generator';

function asPlanShape(parsed: Record<string, unknown>): OnboardingPlan | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const title = typeof parsed.title === 'string' ? parsed.title : '';
  const description = typeof parsed.description === 'string' ? parsed.description : '';
  if (!title && !description) return null;
  return {
    id: 'plan-openai',
    title: title || 'Plano de Onboarding',
    description,
    estimatedDuration:
      typeof parsed.estimatedDuration === 'number' ? parsed.estimatedDuration : 120,
    difficulty:
      parsed.difficulty === 'beginner' ||
      parsed.difficulty === 'intermediate' ||
      parsed.difficulty === 'advanced'
        ? parsed.difficulty
        : 'intermediate',
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    resources: Array.isArray(parsed.resources) ? parsed.resources : [],
  };
}

export async function generateOnboardingPlanViaLlm(
  data: OnboardingPlanData,
  deps: LlmChatGatewayDeps = {},
): Promise<OnboardingPlan | null> {
  const safeFields = sanitizeOnboardingPromptFields(data);
  if (!safeFields) return null;

  const result = await llmChatCompletion(
    {
      surface: 'onboarding-plan',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 800,
      maxOutputChars: 4_000,
      jsonObject: true,
      messages: [
        {
          role: 'user',
          content: `Com base nos dados do usuário, crie um plano de onboarding em JSON. Resposta APENAS JSON válido, sem markdown.
Dados (allowlist):
${safeFields}
Estrutura: { "title": string, "description": string, "estimatedDuration": number, "difficulty": "beginner"|"intermediate"|"advanced", "steps": [{ "title": string, "duration": number }], "resources": [{ "title": string, "type": string, "duration": number }] }`,
        },
      ],
    },
    deps,
  );

  if (!result.ok) return null;

  try {
    const parsed = JSON.parse(result.content) as Record<string, unknown>;
    return asPlanShape(parsed);
  } catch {
    return null;
  }
}

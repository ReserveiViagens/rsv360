/**
 * PR-13b — sanitize / allowlist user-controlled fields before LLM prompts.
 * Never dump raw JSON.stringify of request bodies into prompts.
 */

export const LLM_MAX_MESSAGE_CHARS = 2_000;
export const LLM_MAX_CONTEXT_CHARS = 500;
export const LLM_MAX_FIELD_CHARS = 120;

/** Strip controls, fence breakers, and role-spoof prefixes; enforce max length. */
export function sanitizeLlmText(
  input: unknown,
  maxLen: number = LLM_MAX_MESSAGE_CHARS,
): string {
  if (typeof input !== 'string') return '';
  let s = input.normalize('NFKC');
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  s = s.replace(/```/g, "'''");
  s = s.replace(/\b(system|assistant)\s*:/gi, '[redacted]:');
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

/**
 * Format allowlisted scalar fields as `key=value` lines (not raw JSON objects).
 */
export function formatAllowlistedPromptLines(
  fields: Record<string, string | number | boolean | null | undefined>,
): string {
  const lines: string[] = [];
  for (const [key, raw] of Object.entries(fields)) {
    if (raw === undefined || raw === null || raw === '') continue;
    const value =
      typeof raw === 'string'
        ? sanitizeLlmText(raw, LLM_MAX_FIELD_CHARS)
        : String(raw);
    if (value === '') continue;
    lines.push(`${key}=${value}`);
  }
  return lines.join('\n');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/**
 * Onboarding plan prompt payload — allowlisted fields only.
 * Omits email and other high-sensitivity identifiers (LGPD).
 */
export function sanitizeOnboardingPromptFields(data: unknown): string {
  const root = asRecord(data);
  const profile = asRecord(root.profile);
  const assessment = asRecord(root.assessment);
  const preferences = asRecord(root.preferences);
  const goals = asRecord(root.goals);

  const primaryGoals = Array.isArray(goals.primaryGoals)
    ? goals.primaryGoals
        .slice(0, 5)
        .map((g) => sanitizeLlmText(g, 80))
        .filter(Boolean)
        .join('|')
    : undefined;

  return formatAllowlistedPromptLines({
    display_name: typeof profile.name === 'string' ? profile.name : undefined,
    role: typeof profile.role === 'string' ? profile.role : undefined,
    department:
      typeof profile.department === 'string' ? profile.department : undefined,
    experience:
      typeof profile.experience === 'string' ? profile.experience : undefined,
    system_knowledge:
      typeof assessment.systemKnowledge === 'string'
        ? assessment.systemKnowledge
        : undefined,
    industry_knowledge: asNumber(assessment.industryKnowledge),
    software_comfort: asNumber(assessment.softwareComfort),
    learning_style:
      typeof preferences.learningStyle === 'string'
        ? preferences.learningStyle
        : undefined,
    time_availability:
      typeof preferences.timeAvailability === 'string'
        ? preferences.timeAvailability
        : undefined,
    device_preference:
      typeof preferences.devicePreference === 'string'
        ? preferences.devicePreference
        : undefined,
    primary_goals: primaryGoals,
    specific_goals:
      typeof goals.specificGoals === 'string' ? goals.specificGoals : undefined,
  });
}

export type SanitizedTaxChatContext = {
  grossRevenue?: number;
  deductions?: number;
  cnae?: string;
};

/** Tax chat context — numeric + CNAE only. */
export function sanitizeTaxChatContext(
  context: unknown,
): SanitizedTaxChatContext {
  const ctx = asRecord(context);
  const grossRevenue = asNumber(ctx.grossRevenue);
  const deductions = asNumber(ctx.deductions);
  const cnaeRaw =
    typeof ctx.cnae === 'string' ? sanitizeLlmText(ctx.cnae, 32) : '';
  const cnae = cnaeRaw.replace(/[^\d.\-/A-Za-z]/g, '').slice(0, 32) || undefined;

  const out: SanitizedTaxChatContext = {};
  if (grossRevenue !== undefined && grossRevenue >= 0 && grossRevenue <= 1e12) {
    out.grossRevenue = grossRevenue;
  }
  if (deductions !== undefined && deductions >= 0 && deductions <= 1e12) {
    out.deductions = deductions;
  }
  if (cnae) out.cnae = cnae;
  return out;
}

export function sanitizeSplitAiContext(context: unknown): string {
  return sanitizeLlmText(context, LLM_MAX_CONTEXT_CHARS);
}

export function sanitizeComissoesIaPromptFields(input: {
  objetivo?: string;
  contexto?: string;
  oficialPlataformaPct: number;
  oficialCorretorPct: number;
}): string {
  return formatAllowlistedPromptLines({
    objetivo: input.objetivo ?? 'padrao',
    contexto: input.contexto
      ? sanitizeLlmText(input.contexto, LLM_MAX_CONTEXT_CHARS)
      : undefined,
    oficial_plataforma_pct: input.oficialPlataformaPct,
    oficial_corretor_pct: input.oficialCorretorPct,
  });
}

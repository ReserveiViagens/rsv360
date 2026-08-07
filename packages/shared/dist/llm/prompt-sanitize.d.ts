/**
 * PR-13b — sanitize / allowlist user-controlled fields before LLM prompts.
 * Never dump raw JSON.stringify of request bodies into prompts.
 */
export declare const LLM_MAX_MESSAGE_CHARS = 2000;
export declare const LLM_MAX_CONTEXT_CHARS = 500;
export declare const LLM_MAX_FIELD_CHARS = 120;
/** Strip controls, fence breakers, and role-spoof prefixes; enforce max length. */
export declare function sanitizeLlmText(input: unknown, maxLen?: number): string;
/**
 * Format allowlisted scalar fields as `key=value` lines (not raw JSON objects).
 */
export declare function formatAllowlistedPromptLines(fields: Record<string, string | number | boolean | null | undefined>): string;
/**
 * Onboarding plan prompt payload — allowlisted fields only.
 * Omits email and other high-sensitivity identifiers (LGPD).
 */
export declare function sanitizeOnboardingPromptFields(data: unknown): string;
export type SanitizedTaxChatContext = {
    grossRevenue?: number;
    deductions?: number;
    cnae?: string;
};
/** Tax chat context — numeric + CNAE only. */
export declare function sanitizeTaxChatContext(context: unknown): SanitizedTaxChatContext;
export declare function sanitizeSplitAiContext(context: unknown): string;
export declare function sanitizeComissoesIaPromptFields(input: {
    objetivo?: string;
    contexto?: string;
    oficialPlataformaPct: number;
    oficialCorretorPct: number;
}): string;

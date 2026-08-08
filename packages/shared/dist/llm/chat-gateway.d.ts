/**
 * PR-13e / 13e-followup-a — shared LLM chat gateway (OpenAI chat.completions).
 * Centralizes: API key fail-closed, timeout, user-message sanitize, safe logs,
 * per-surface process-local budget, output char redaction.
 * Does not log prompts, completions, or secrets.
 */
export declare const LLM_GATEWAY_DEFAULT_MODEL = "gpt-4o-mini";
export declare const LLM_GATEWAY_DEFAULT_TIMEOUT_MS = 20000;
export declare const LLM_GATEWAY_DEFAULT_MAX_TOKENS = 500;
/** Hard ceiling for any single request max_tokens. */
export declare const LLM_GATEWAY_HARD_MAX_TOKENS = 2000;
/** Default max chars kept from model output (redaction / cost). */
export declare const LLM_GATEWAY_DEFAULT_MAX_OUTPUT_CHARS = 4000;
/** Process-local call budget per surface per window. */
export declare const LLM_GATEWAY_BUDGET_MAX_CALLS = 60;
export declare const LLM_GATEWAY_BUDGET_WINDOW_MS = 60000;
/** Process-local token budget (prompt+completion) per surface per window. */
export declare const LLM_GATEWAY_BUDGET_MAX_TOKENS = 80000;
export type LlmChatRole = 'system' | 'user' | 'assistant';
export type LlmChatMessage = {
    role: LlmChatRole;
    content: string;
};
export type LlmChatGatewayRequest = {
    /** Logical surface id for safe telemetry (e.g. tax-chat). */
    surface: string;
    messages: LlmChatMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
    /** Cap output length after response (default LLM_GATEWAY_DEFAULT_MAX_OUTPUT_CHARS). */
    maxOutputChars?: number;
    /** When true, ask OpenAI for JSON object responses. */
    jsonObject?: boolean;
    /** Sanitize user-role messages (default true). */
    sanitizeUser?: boolean;
};
export type LlmChatGatewayOk = {
    ok: true;
    content: string;
    model: string;
    tokensIn?: number;
    tokensOut?: number;
    truncated?: boolean;
};
export type LlmChatGatewayErr = {
    ok: false;
    error: 'missing_api_key' | 'invalid_request' | 'timeout' | 'http_error' | 'empty' | 'network' | 'budget_exceeded';
    status?: number;
};
export type LlmChatGatewayResult = LlmChatGatewayOk | LlmChatGatewayErr;
export type LlmChatGatewayDeps = {
    apiKey?: string | null;
    fetchImpl?: typeof fetch;
    now?: () => number;
    log?: (event: string, meta: Record<string, string | number | boolean | null>) => void;
};
export declare function clearLlmGatewayBudgetForTests(): void;
/**
 * Call OpenAI chat.completions through the shared gateway.
 */
export declare function llmChatCompletion(req: LlmChatGatewayRequest, deps?: LlmChatGatewayDeps): Promise<LlmChatGatewayResult>;

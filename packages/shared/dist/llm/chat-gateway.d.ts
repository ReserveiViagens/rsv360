/**
 * PR-13e / 13e-followup-a / 13e-followup-d — shared LLM chat gateway.
 * Centralizes: API key fail-closed, timeout, user-message sanitize, safe logs,
 * per-surface budget (process-local + optional Redis), circuit breaker,
 * output char redaction.
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
/** Consecutive upstream failures before opening the circuit. */
export declare const LLM_GATEWAY_CIRCUIT_FAILURE_THRESHOLD = 5;
/** How long the circuit stays open (ms). */
export declare const LLM_GATEWAY_CIRCUIT_COOLDOWN_MS = 30000;
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
    error: 'missing_api_key' | 'invalid_request' | 'timeout' | 'http_error' | 'empty' | 'network' | 'budget_exceeded' | 'circuit_open';
    status?: number;
};
export type LlmChatGatewayResult = LlmChatGatewayOk | LlmChatGatewayErr;
/** Duck-typed Redis (ioredis-compatible). Optional — no ioredis dep in shared. */
export type LlmGatewayRedisLike = {
    incr(key: string): Promise<number>;
    incrby(key: string, increment: number): Promise<number>;
    expire(key: string, seconds: number): Promise<unknown>;
};
export type LlmChatGatewayDeps = {
    apiKey?: string | null;
    fetchImpl?: typeof fetch;
    now?: () => number;
    log?: (event: string, meta: Record<string, string | number | boolean | null>) => void;
    /** When set, budget is counted in Redis (multi-instance). Falls back to memory on Redis errors. */
    redis?: LlmGatewayRedisLike | null;
};
/** Process-wide Redis for budget (call once at boot). Tests should pass deps.redis instead. */
export declare function setLlmGatewayRedis(client: LlmGatewayRedisLike | null): void;
export declare function clearLlmGatewayBudgetForTests(): void;
/**
 * Call OpenAI chat.completions through the shared gateway.
 */
export declare function llmChatCompletion(req: LlmChatGatewayRequest, deps?: LlmChatGatewayDeps): Promise<LlmChatGatewayResult>;

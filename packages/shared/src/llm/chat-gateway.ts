/**
 * PR-13e / 13e-followup-a — shared LLM chat gateway (OpenAI chat.completions).
 * Centralizes: API key fail-closed, timeout, user-message sanitize, safe logs,
 * per-surface process-local budget, output char redaction.
 * Does not log prompts, completions, or secrets.
 */

import { LLM_MAX_MESSAGE_CHARS, sanitizeLlmText } from './prompt-sanitize.js';

export const LLM_GATEWAY_DEFAULT_MODEL = 'gpt-4o-mini';
export const LLM_GATEWAY_DEFAULT_TIMEOUT_MS = 20_000;
export const LLM_GATEWAY_DEFAULT_MAX_TOKENS = 500;
/** Hard ceiling for any single request max_tokens. */
export const LLM_GATEWAY_HARD_MAX_TOKENS = 2_000;
/** Default max chars kept from model output (redaction / cost). */
export const LLM_GATEWAY_DEFAULT_MAX_OUTPUT_CHARS = 4_000;
/** Process-local call budget per surface per window. */
export const LLM_GATEWAY_BUDGET_MAX_CALLS = 60;
export const LLM_GATEWAY_BUDGET_WINDOW_MS = 60_000;
/** Process-local token budget (prompt+completion) per surface per window. */
export const LLM_GATEWAY_BUDGET_MAX_TOKENS = 80_000;

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
  error:
    | 'missing_api_key'
    | 'invalid_request'
    | 'timeout'
    | 'http_error'
    | 'empty'
    | 'network'
    | 'budget_exceeded';
  status?: number;
};

export type LlmChatGatewayResult = LlmChatGatewayOk | LlmChatGatewayErr;

export type LlmChatGatewayDeps = {
  apiKey?: string | null;
  fetchImpl?: typeof fetch;
  now?: () => number;
  log?: (event: string, meta: Record<string, string | number | boolean | null>) => void;
};

type BudgetBucket = { windowStart: number; calls: number; tokens: number };

const budgetBuckets = new Map<string, BudgetBucket>();

export function clearLlmGatewayBudgetForTests(): void {
  budgetBuckets.clear();
}

function checkAndReserveBudget(
  surface: string,
  estimatedTokens: number,
  now: number,
): { allowed: true } | { allowed: false; reason: 'calls' | 'tokens' } {
  const existing = budgetBuckets.get(surface);
  if (!existing || now - existing.windowStart > LLM_GATEWAY_BUDGET_WINDOW_MS) {
    budgetBuckets.set(surface, {
      windowStart: now,
      calls: 1,
      tokens: estimatedTokens,
    });
    return { allowed: true };
  }
  if (existing.calls >= LLM_GATEWAY_BUDGET_MAX_CALLS) {
    return { allowed: false, reason: 'calls' };
  }
  if (existing.tokens + estimatedTokens > LLM_GATEWAY_BUDGET_MAX_TOKENS) {
    return { allowed: false, reason: 'tokens' };
  }
  existing.calls += 1;
  existing.tokens += estimatedTokens;
  return { allowed: true };
}

function estimateRequestTokens(messages: LlmChatMessage[], maxTokens: number): number {
  const chars = messages.reduce((n, m) => n + (m.content?.length || 0), 0);
  // ~4 chars/token rough; include completion budget
  return Math.ceil(chars / 4) + maxTokens;
}

function defaultLog(
  event: string,
  meta: Record<string, string | number | boolean | null>,
): void {
  console.info(`[llm-gateway] ${event} ${JSON.stringify(meta)}`);
}

function resolveApiKey(deps?: LlmChatGatewayDeps): string {
  const fromDeps = (deps?.apiKey ?? '').trim();
  if (fromDeps) return fromDeps;
  return (process.env.OPENAI_API_KEY || '').trim();
}

function prepareMessages(
  messages: LlmChatMessage[],
  sanitizeUser: boolean,
): LlmChatMessage[] | null {
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const out: LlmChatMessage[] = [];
  for (const msg of messages) {
    if (!msg || (msg.role !== 'system' && msg.role !== 'user' && msg.role !== 'assistant')) {
      return null;
    }
    let content = typeof msg.content === 'string' ? msg.content : '';
    if (msg.role === 'user' && sanitizeUser) {
      content = sanitizeLlmText(content, LLM_MAX_MESSAGE_CHARS);
    } else if (msg.role === 'system') {
      content = content.slice(0, 12_000);
    }
    if (!content.trim() && msg.role === 'user') return null;
    out.push({ role: msg.role, content });
  }
  return out;
}

function redactOutput(
  content: string,
  maxOutputChars: number,
): { text: string; truncated: boolean } {
  if (content.length <= maxOutputChars) return { text: content, truncated: false };
  return { text: content.slice(0, maxOutputChars), truncated: true };
}

/**
 * Call OpenAI chat.completions through the shared gateway.
 */
export async function llmChatCompletion(
  req: LlmChatGatewayRequest,
  deps: LlmChatGatewayDeps = {},
): Promise<LlmChatGatewayResult> {
  const log = deps.log ?? defaultLog;
  const nowFn = deps.now ?? Date.now;
  const surface = sanitizeLlmText(req.surface, 64) || 'unknown';
  const apiKey = resolveApiKey(deps);

  if (!apiKey) {
    log('reject', { surface, error: 'missing_api_key' });
    return { ok: false, error: 'missing_api_key' };
  }

  const sanitizeUser = req.sanitizeUser !== false;
  const messages = prepareMessages(req.messages, sanitizeUser);
  if (!messages) {
    log('reject', { surface, error: 'invalid_request' });
    return { ok: false, error: 'invalid_request' };
  }

  const model =
    (req.model || process.env.OPENAI_MODEL || LLM_GATEWAY_DEFAULT_MODEL).trim() ||
    LLM_GATEWAY_DEFAULT_MODEL;
  const timeoutMs = Math.max(
    1_000,
    req.timeoutMs ?? LLM_GATEWAY_DEFAULT_TIMEOUT_MS,
  );
  const maxTokens = Math.min(
    LLM_GATEWAY_HARD_MAX_TOKENS,
    Math.max(1, req.maxTokens ?? LLM_GATEWAY_DEFAULT_MAX_TOKENS),
  );
  const maxOutputChars = Math.min(
    20_000,
    Math.max(64, req.maxOutputChars ?? LLM_GATEWAY_DEFAULT_MAX_OUTPUT_CHARS),
  );
  const temperature =
    typeof req.temperature === 'number' && Number.isFinite(req.temperature)
      ? Math.min(2, Math.max(0, req.temperature))
      : 0.3;

  const now = nowFn();
  const estimated = estimateRequestTokens(messages, maxTokens);
  const budget = checkAndReserveBudget(surface, estimated, now);
  if (!budget.allowed) {
    log('budget_exceeded', {
      surface,
      reason: budget.reason,
      estimatedTokens: estimated,
    });
    return { ok: false, error: 'budget_exceeded' };
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = nowFn();

  try {
    const response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        ...(req.jsonObject ? { response_format: { type: 'json_object' } } : {}),
        messages,
      }),
    });

    if (!response.ok) {
      log('http_error', {
        surface,
        status: response.status,
        model,
        durationMs: nowFn() - started,
      });
      return { ok: false, error: 'http_error', status: response.status };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
      model?: string;
    };
    const raw = payload.choices?.[0]?.message?.content?.trim() || '';
    if (!raw) {
      log('empty', {
        surface,
        model,
        durationMs: nowFn() - started,
      });
      return { ok: false, error: 'empty' };
    }

    const { text: content, truncated } = redactOutput(raw, maxOutputChars);
    const tokensIn = payload.usage?.prompt_tokens;
    const tokensOut = payload.usage?.completion_tokens;
    const actual =
      (typeof tokensIn === 'number' ? tokensIn : 0) +
      (typeof tokensOut === 'number' ? tokensOut : 0);
    if (actual > estimated) {
      const b = budgetBuckets.get(surface);
      if (b) b.tokens += actual - estimated;
    }

    log('ok', {
      surface,
      model: payload.model || model,
      durationMs: nowFn() - started,
      tokensIn: tokensIn ?? null,
      tokensOut: tokensOut ?? null,
      truncated,
    });

    return {
      ok: true,
      content,
      model: payload.model || model,
      tokensIn,
      tokensOut,
      truncated,
    };
  } catch (err) {
    const name = (err as Error)?.name || '';
    if (name === 'AbortError') {
      log('timeout', { surface, model, timeoutMs });
      return { ok: false, error: 'timeout' };
    }
    log('network', { surface, model, errName: name || 'Error' });
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

"use strict";
/**
 * PR-13e / 13e-followup-a / 13e-followup-d — shared LLM chat gateway.
 * Centralizes: API key fail-closed, timeout, user-message sanitize, safe logs,
 * per-surface budget (process-local + optional Redis), circuit breaker,
 * output char redaction.
 * Does not log prompts, completions, or secrets.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLM_GATEWAY_CIRCUIT_COOLDOWN_MS = exports.LLM_GATEWAY_CIRCUIT_FAILURE_THRESHOLD = exports.LLM_GATEWAY_BUDGET_MAX_TOKENS = exports.LLM_GATEWAY_BUDGET_WINDOW_MS = exports.LLM_GATEWAY_BUDGET_MAX_CALLS = exports.LLM_GATEWAY_DEFAULT_MAX_OUTPUT_CHARS = exports.LLM_GATEWAY_HARD_MAX_TOKENS = exports.LLM_GATEWAY_DEFAULT_MAX_TOKENS = exports.LLM_GATEWAY_DEFAULT_TIMEOUT_MS = exports.LLM_GATEWAY_DEFAULT_MODEL = void 0;
exports.setLlmGatewayRedis = setLlmGatewayRedis;
exports.clearLlmGatewayBudgetForTests = clearLlmGatewayBudgetForTests;
exports.llmChatCompletion = llmChatCompletion;
const prompt_sanitize_js_1 = require("./prompt-sanitize.js");
exports.LLM_GATEWAY_DEFAULT_MODEL = 'gpt-4o-mini';
exports.LLM_GATEWAY_DEFAULT_TIMEOUT_MS = 20_000;
exports.LLM_GATEWAY_DEFAULT_MAX_TOKENS = 500;
/** Hard ceiling for any single request max_tokens. */
exports.LLM_GATEWAY_HARD_MAX_TOKENS = 2_000;
/** Default max chars kept from model output (redaction / cost). */
exports.LLM_GATEWAY_DEFAULT_MAX_OUTPUT_CHARS = 4_000;
/** Process-local call budget per surface per window. */
exports.LLM_GATEWAY_BUDGET_MAX_CALLS = 60;
exports.LLM_GATEWAY_BUDGET_WINDOW_MS = 60_000;
/** Process-local token budget (prompt+completion) per surface per window. */
exports.LLM_GATEWAY_BUDGET_MAX_TOKENS = 80_000;
/** Consecutive upstream failures before opening the circuit. */
exports.LLM_GATEWAY_CIRCUIT_FAILURE_THRESHOLD = 5;
/** How long the circuit stays open (ms). */
exports.LLM_GATEWAY_CIRCUIT_COOLDOWN_MS = 30_000;
const budgetBuckets = new Map();
const circuitBySurface = new Map();
let globalRedis = null;
/** Process-wide Redis for budget (call once at boot). Tests should pass deps.redis instead. */
function setLlmGatewayRedis(client) {
    globalRedis = client;
}
function clearLlmGatewayBudgetForTests() {
    budgetBuckets.clear();
    circuitBySurface.clear();
    globalRedis = null;
}
function checkAndReserveBudget(surface, estimatedTokens, now) {
    const existing = budgetBuckets.get(surface);
    if (!existing || now - existing.windowStart > exports.LLM_GATEWAY_BUDGET_WINDOW_MS) {
        budgetBuckets.set(surface, {
            windowStart: now,
            calls: 1,
            tokens: estimatedTokens,
        });
        return { allowed: true };
    }
    if (existing.calls >= exports.LLM_GATEWAY_BUDGET_MAX_CALLS) {
        return { allowed: false, reason: 'calls' };
    }
    if (existing.tokens + estimatedTokens > exports.LLM_GATEWAY_BUDGET_MAX_TOKENS) {
        return { allowed: false, reason: 'tokens' };
    }
    existing.calls += 1;
    existing.tokens += estimatedTokens;
    return { allowed: true };
}
function estimateRequestTokens(messages, maxTokens) {
    const chars = messages.reduce((n, m) => n + (m.content?.length || 0), 0);
    // ~4 chars/token rough; include completion budget
    return Math.ceil(chars / 4) + maxTokens;
}
function isCircuitOpen(surface, now) {
    const c = circuitBySurface.get(surface);
    return Boolean(c && c.openUntil > now);
}
function recordCircuitSuccess(surface) {
    circuitBySurface.delete(surface);
}
function recordCircuitFailure(surface, now) {
    const existing = circuitBySurface.get(surface);
    const failures = (existing?.failures ?? 0) + 1;
    if (failures >= exports.LLM_GATEWAY_CIRCUIT_FAILURE_THRESHOLD) {
        circuitBySurface.set(surface, {
            failures,
            openUntil: now + exports.LLM_GATEWAY_CIRCUIT_COOLDOWN_MS,
        });
        return;
    }
    circuitBySurface.set(surface, {
        failures,
        openUntil: existing?.openUntil ?? 0,
    });
}
function shouldTripCircuit(status) {
    if (status === undefined)
        return true; // timeout / network
    return status === 429 || status >= 500;
}
function redisWindowId(now) {
    return Math.floor(now / exports.LLM_GATEWAY_BUDGET_WINDOW_MS);
}
async function checkAndReserveBudgetRedis(redis, surface, estimatedTokens, now) {
    const windowId = redisWindowId(now);
    const ttlSec = Math.ceil(exports.LLM_GATEWAY_BUDGET_WINDOW_MS / 1000);
    const callsKey = `llm-gw:c:${surface}:${windowId}`;
    const tokensKey = `llm-gw:t:${surface}:${windowId}`;
    const calls = await redis.incr(callsKey);
    if (calls === 1)
        await redis.expire(callsKey, ttlSec);
    const tokens = await redis.incrby(tokensKey, estimatedTokens);
    if (tokens === estimatedTokens)
        await redis.expire(tokensKey, ttlSec);
    if (calls > exports.LLM_GATEWAY_BUDGET_MAX_CALLS) {
        return { allowed: false, reason: 'calls' };
    }
    if (tokens > exports.LLM_GATEWAY_BUDGET_MAX_TOKENS) {
        return { allowed: false, reason: 'tokens' };
    }
    return { allowed: true };
}
async function addRedisTokenDelta(redis, surface, delta, now) {
    if (delta <= 0)
        return;
    const windowId = redisWindowId(now);
    await redis.incrby(`llm-gw:t:${surface}:${windowId}`, delta);
}
function defaultLog(event, meta) {
    console.info(`[llm-gateway] ${event} ${JSON.stringify(meta)}`);
}
function resolveApiKey(deps) {
    const fromDeps = (deps?.apiKey ?? '').trim();
    if (fromDeps)
        return fromDeps;
    return (process.env.OPENAI_API_KEY || '').trim();
}
function prepareMessages(messages, sanitizeUser) {
    if (!Array.isArray(messages) || messages.length === 0)
        return null;
    const out = [];
    for (const msg of messages) {
        if (!msg || (msg.role !== 'system' && msg.role !== 'user' && msg.role !== 'assistant')) {
            return null;
        }
        let content = typeof msg.content === 'string' ? msg.content : '';
        if (msg.role === 'user' && sanitizeUser) {
            content = (0, prompt_sanitize_js_1.sanitizeLlmText)(content, prompt_sanitize_js_1.LLM_MAX_MESSAGE_CHARS);
        }
        else if (msg.role === 'system') {
            content = content.slice(0, 12_000);
        }
        if (!content.trim() && msg.role === 'user')
            return null;
        out.push({ role: msg.role, content });
    }
    return out;
}
function redactOutput(content, maxOutputChars) {
    if (content.length <= maxOutputChars)
        return { text: content, truncated: false };
    return { text: content.slice(0, maxOutputChars), truncated: true };
}
/**
 * Call OpenAI chat.completions through the shared gateway.
 */
async function llmChatCompletion(req, deps = {}) {
    const log = deps.log ?? defaultLog;
    const nowFn = deps.now ?? Date.now;
    const surface = (0, prompt_sanitize_js_1.sanitizeLlmText)(req.surface, 64) || 'unknown';
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
    const model = (req.model || process.env.OPENAI_MODEL || exports.LLM_GATEWAY_DEFAULT_MODEL).trim() ||
        exports.LLM_GATEWAY_DEFAULT_MODEL;
    const timeoutMs = Math.max(1_000, req.timeoutMs ?? exports.LLM_GATEWAY_DEFAULT_TIMEOUT_MS);
    const maxTokens = Math.min(exports.LLM_GATEWAY_HARD_MAX_TOKENS, Math.max(1, req.maxTokens ?? exports.LLM_GATEWAY_DEFAULT_MAX_TOKENS));
    const maxOutputChars = Math.min(20_000, Math.max(64, req.maxOutputChars ?? exports.LLM_GATEWAY_DEFAULT_MAX_OUTPUT_CHARS));
    const temperature = typeof req.temperature === 'number' && Number.isFinite(req.temperature)
        ? Math.min(2, Math.max(0, req.temperature))
        : 0.3;
    const now = nowFn();
    if (isCircuitOpen(surface, now)) {
        log('circuit_open', { surface });
        return { ok: false, error: 'circuit_open' };
    }
    const estimated = estimateRequestTokens(messages, maxTokens);
    let budget;
    const redis = deps.redis ?? globalRedis;
    if (redis) {
        try {
            budget = await checkAndReserveBudgetRedis(redis, surface, estimated, now);
        }
        catch {
            log('redis_budget_fallback', { surface });
            budget = checkAndReserveBudget(surface, estimated, now);
        }
    }
    else {
        budget = checkAndReserveBudget(surface, estimated, now);
    }
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
            if (shouldTripCircuit(response.status)) {
                recordCircuitFailure(surface, nowFn());
            }
            log('http_error', {
                surface,
                status: response.status,
                model,
                durationMs: nowFn() - started,
            });
            return { ok: false, error: 'http_error', status: response.status };
        }
        const payload = (await response.json());
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
        const actual = (typeof tokensIn === 'number' ? tokensIn : 0) +
            (typeof tokensOut === 'number' ? tokensOut : 0);
        if (actual > estimated) {
            const delta = actual - estimated;
            const b = budgetBuckets.get(surface);
            if (b)
                b.tokens += delta;
            if (redis) {
                try {
                    await addRedisTokenDelta(redis, surface, delta, nowFn());
                }
                catch {
                    /* memory already updated when fallback was used */
                }
            }
        }
        recordCircuitSuccess(surface);
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
    }
    catch (err) {
        const name = err?.name || '';
        if (name === 'AbortError') {
            recordCircuitFailure(surface, nowFn());
            log('timeout', { surface, model, timeoutMs });
            return { ok: false, error: 'timeout' };
        }
        recordCircuitFailure(surface, nowFn());
        log('network', { surface, model, errName: name || 'Error' });
        return { ok: false, error: 'network' };
    }
    finally {
        clearTimeout(timer);
    }
}

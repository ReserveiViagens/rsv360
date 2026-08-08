# PR-13e-followup-a — LLM gateway budget + migrate ai-search / expense-classifier

**Branch:** `security/pr-13e-followup-a`  
**Baseline:** `183e6c3ff3dabc8ca4d58b13201fdfb2359e85a4` (pós-13e / #228)

## Escopo

- Gateway (`packages/shared/src/llm/chat-gateway.ts`):
  - budget process-local por `surface` (60 calls / 80k tokens / 60s) → `budget_exceeded`
  - `maxOutputChars` + flag `truncated` (redaction de saída)
  - hard ceiling `LLM_GATEWAY_HARD_MAX_TOKENS` (2000)
- Migrados para `llmChatCompletion` (fetch direto removido):
  - `apps/site-publico/lib/ai-search-service.ts` (`surface: ai-search`)
  - `apps/site-publico/lib/tax-optimization/expense-classifier-ai.ts` (`surface: expense-classifier`)

## OUT (próximas fatias)

- onboarding SDK · Instrutor SDK · acomodações import
- Redis / circuit breaker

## Test plan

```bash
cd packages/shared && npm run build
cd apps/site-publico && npx jest __tests__/lib/llm-chat-gateway.test.ts __tests__/lib/llm-prompt-sanitize.test.ts __tests__/lib/ai-search-guard.test.ts --forceExit
```

Resultado: **26 passed** (3 suites).

## Risco

- Blast radius: shared gateway + 2 superfícies site-publico.
- Budget é process-local (não multi-instância); suficiente para fail-closed por surface até Redis.
- Fallbacks de expense-classifier e erros de ai-search preservados.

## Rollback

Revert do squash merge desta PR.

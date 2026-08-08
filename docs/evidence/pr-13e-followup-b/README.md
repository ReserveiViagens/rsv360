# PR-13e-followup-b — migrar acomodações import → LLM gateway

**Branch:** `security/pr-13e-followup-b`  
**Baseline:** `9c892d60f6abe0c47c4292be487bde3bcd05db28` (pós-followup-a / #229)

## Escopo

- `server/modules/acomodacoes/import/parse.ts` → `extrairViaLLM` via `llmChatCompletion`
  - `surface: acomodacoes-import`
  - timeout / budget / safe logs / `jsonObject` / `maxOutputChars` (20k)
  - `sanitizeUser: false` + strip de controls + teto **120k** (preserva whitespace de docs; chat cap 2k quebraria import)
- Fetch direto OpenAI **removido**
- Erros tipados (`http_error`, `budget_exceeded`, …) — sem body upstream no throw

## OUT (próximas fatias)

- onboarding SDK · Instrutor SDK
- Redis / circuit breaker

## Test plan

```bash
cd packages/shared && npm run build
cd backend && npx jest src/__tests__/unit/extrair-via-llm-gateway.test.ts src/__tests__/unit/parse-estruturado.test.ts --forceExit
cd apps/site-publico && npx jest __tests__/lib/llm-chat-gateway.test.ts --forceExit
```

Resultado: **7 passed** (backend: extrair-via-llm + parse-estruturado) · gateway site-publico regressão OK.

## Risco

- Blast radius: 1 superfície server (import .md/.docx/.pdf).
- `max_tokens` agora capped em `LLM_GATEWAY_HARD_MAX_TOKENS` (2000) — antes implícito default OpenAI.
- Inline JSON path inalterado (sem LLM).

## Rollback

Revert do squash merge desta PR.

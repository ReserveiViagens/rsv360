# PR-13e-followup-c — onboarding + Instrutor chat → LLM gateway

**Branch:** `security/pr-13e-followup-c`  
**Baseline:** `86ffce881b0e971ac774e6211dce7fe96581e4ba` (pós-followup-b / #230)

## Escopo

- Onboarding `POST /api/onboarding/generate-plan` (modo openai):
  - helper `generateOnboardingPlanViaLlm` via `llmChatCompletion` (`surface: onboarding-plan`)
  - allowlist 13b preservada; fallback mock se gateway falhar
  - SDK OpenAI dinâmico **removido**
- Instrutor `chatInstrutor`:
  - via `llmChatCompletion` (`surface: instrutor`)
  - output filter 13d permanece em `executarT1`
  - **embeddings** continuam no SDK OpenAI (`embedText`) — fora do chat gateway

## OUT

- Redis / circuit breaker
- Embeddings no gateway (não é chat.completions)

## Test plan

```bash
cd packages/shared && npm run build
cd apps/site-publico && npx jest __tests__/lib/onboarding-plan-openai.test.ts __tests__/lib/llm-prompt-sanitize.test.ts --forceExit
cd backend && npx tsc --noEmit
cd backend && npx jest src/__tests__/unit/chat-instrutor-gateway.test.ts src/__tests__/unit/agentes-instrutor-output-filter.test.ts src/__tests__/unit/agentes-instrutor-t1-failsafe.test.ts --forceExit
```

Resultado: shared build PASS · site-publico **11 passed** · backend `tsc --noEmit` **0** · backend jest **9 passed**.

## Risco

- Blast radius: 2 superfícies (onboarding route + Instrutor chat).
- System prompt Instrutor agora capado em 12k chars no gateway (RAG chunks).
- `max_tokens` Instrutor/onboarding capped (800) — antes implícito no SDK.

## Rollback

Revert do squash merge desta PR.

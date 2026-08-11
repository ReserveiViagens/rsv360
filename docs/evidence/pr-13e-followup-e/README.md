# PR-13e-followup-e — wire Redis into LLM gateway at app boot

**Branch:** `security/pr-13e-followup-e`  
**Baseline:** `20c680209753bc90227ab87666fad82473e2d8b3` (pós-followup-d / #234)

## Escopo

- `apps/site-publico/instrumentation.ts` + `lib/llm-gateway-redis-boot.ts`:
  - se `REDIS_URL` e sem `REDIS_DISABLED=true` → ioredis + `setLlmGatewayRedis`
  - senão → memory (não lança)
- `backend/app.js` (`createApp`):
  - reusa `getRedisConnection` / `isRedisRequiredForLocks`
  - falha Redis → `setLlmGatewayRedis(null)` + warn
- Fallback in-memory do gateway (**#234**) **preservado**

## OUT

- Circuit breaker multi-instância
- Auto-connect dentro de `@rsv360/shared`
- 10c-infra-c

## Test plan

```bash
cd packages/shared && npm run build
cd apps/site-publico && npx jest __tests__/lib/llm-gateway-redis-boot.test.ts __tests__/lib/llm-chat-gateway.test.ts --forceExit
```

Resultado: shared build PASS · jest **13 passed**.

## Risco

- Blast: boot site-publico + backend only.
- Sem Redis: comportamento idêntico ao #234 (budget por processo).
- Multi-réplica sem REDIS_URL: teto de budget não compartilhado.

## Rollback

Revert do squash merge desta PR.

# PR-13e-followup-d — LLM gateway circuit breaker + Redis budget

**Branch:** `security/pr-13e-followup-d`  
**Baseline:** `0869b799c5bfd718c87135f4dc7a8427a9c3db26` (pós-followup-c / #233)

## Escopo

- Circuit breaker process-local por `surface`:
  - 5 falhas consecutivas (`timeout` / `network` / HTTP 429 ou ≥500) → `circuit_open`
  - cooldown 30s; sucesso zera o contador; superfícies isoladas
- Budget Redis opcional (`deps.redis` ou `setLlmGatewayRedis`):
  - chaves `llm-gw:c:{surface}:{window}` / `llm-gw:t:{surface}:{window}`
  - duck-type ioredis — **sem** nova dep em `@rsv360/shared`
  - se Redis lançar → fallback para budget in-memory (não derruba LLM)
- In-memory budget (followup-a) permanece o default

## OUT

- Auto-connect `REDIS_URL` no shared (apps devem injetar o client no boot)
- Circuit breaker multi-instância (Redis)
- Embeddings no gateway

## Test plan

```bash
cd packages/shared && npm run build
cd apps/site-publico && npx jest __tests__/lib/llm-chat-gateway.test.ts --forceExit
```

Resultado: shared build PASS · jest gateway **9 passed**.

## Risco

- Blast radius: só `@rsv360/shared` llm gateway (todas as superfícies já migradas).
- Circuit é por processo até Redis circuit (OUT).
- Redis down não fail-closed o chat (fallback memória).

## Rollback

Revert do squash merge desta PR.

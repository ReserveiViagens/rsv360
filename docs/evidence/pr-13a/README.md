# PR-13a — Auth + rate limit + input cap for `/api/ai-search/*`

**Branch:** `security/pr-13a-ai-search-auth`  
**Baseline:** `b271517248ad9b302cb53dfe1be4c0b7cc66f981` (pós-10c-telemetry)

## Escopo

- Gate compartilhado `requireAiSearchAccess`: Bearer JWT (`advancedAuthMiddleware`) → **401**; rate limit in-memory (10/min por `user:{id}`) → **429** + `Retry-After`.
- Validação de `message` / `query`: obrigatório, trim, máx. **2000** chars → **400**.
- Histórico em memória **por `userId`** (fim do singleton cross-user).
- UI `AISearchChat`: envia `Authorization: Bearer` de `localStorage.token`; trata 401/429.

## OUT

- 13b sanitização onboarding/tax/split/comissões  
- 13c SRE shell / :5050  
- 13d Instrutor  
- Redis rate limit / DDL  

## Test plan

```bash
cd apps/site-publico && npx jest __tests__/lib/ai-search-guard.test.ts --forceExit
```

Resultado: **10 passed**.

## Risco

- Blast radius: apenas rotas `/api/ai-search/{chat,search,history}` + componente chat.  
- Anônimos passam a receber 401 (intencional — fecha drenagem OpenAI).  
- Rate limit process-local (mesmo modelo PR-06b/11e).

## Rollback

Revert do squash merge desta PR.

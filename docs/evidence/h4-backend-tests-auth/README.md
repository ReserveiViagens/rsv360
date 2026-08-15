# H4 — backend integration tests auth (PR-01 + publicLimiter)

**Branch:** `security/pr-h4-backend-tests-auth`  
**Baseline:** `17cd069e34c4cea6a32278029e8f6c8e6835a9b8` (pós-#237)

## Problema

Ruído permanente no CI `backend-tests` após PR-01 (JWT staff) e PR-06a (`publicLimiter` fail-closed):

| Suite | Sintoma | Causa |
|-------|---------|-------|
| `payments.integration.test.ts` | 401 em rotas staff | JWT obrigatório; teste sem `Authorization` |
| `guest-portal-auth.integration.test.ts` | 503 em audit via `portal.routes` | `publicLimiter` não inicializado no harness |

**Não** é regressão de produto: auth e limiter estão corretos.

## Escopo

- `payments.integration.test.ts`: `.set(authHeader())` nas rotas staff + caso negativo 401 sem JWT
- `guest-portal-auth.integration.test.ts`: `await initPublicLimiter()` em `beforeAll`

## OUT

- Mudança de auth de produção / middleware
- 04b / 16d / 10c-infra-c

## Validação

```bash
cd backend && npx jest src/__tests__/integration/payments.integration.test.ts src/__tests__/integration/guest-portal-auth.integration.test.ts src/__tests__/unit/pr01-crit-auth.routes.test.ts --forceExit --runInBand
```

Resultado: **3 suites PASS · 19 tests PASS**.

## Risco

- Blast: só harness de teste.
- Sem alteração de comportamento em runtime.

## Rollback

Revert do squash merge desta PR.

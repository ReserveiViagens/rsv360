# PR-10c-telemetry — métricas de refresh body deprecated

**GO:** `GO 10c-telemetry @ main d82464d0`  
**Branch:** `security/pr-10c-telemetry`  
**Baseline:** `main @ d82464d0`

## Fase 0

- Único emissor do log: `backend/src/api/v1/auth/resolve-refresh-token.js`.
- Flag: `isRefreshCookieRequired()` (`AUTH_REFRESH_COOKIE_REQUIRED`, default OFF).
- Transport: header `x-rsv-refresh-transport` (`bff-cookie` vs body legado).
- Prometheus já existe no backend (`/metrics` + bearer). Sem métricas de auth/refresh antes desta fatia.

## Implementação

| Métrica | Quando |
|---------|--------|
| `rsv360_auth_refresh_deprecated_total{transport}` | Body aceito com flag OFF e transport ≠ `bff-cookie` (mantém `console.warn` legado) |
| `rsv360_auth_refresh_cookie_required_rejected_total{transport}` | Body rejeitado com flag ON e transport ≠ `bff-cookie` |

Sem PII nos labels (apenas `transport`). Cut-over das flags permanece OUT.

## Fora de escopo

- 10c-infra-c (cookie Domain) — blocked aguardando VPS.
- Cut-over `AUTH_REFRESH_COOKIE_REQUIRED=true` / `AUTH_DPOP_ENABLED=true`.
- Dashboard Grafana (pode consumir as séries depois).

## Validação

- `npm run test --workspace=backend -- --testPathPattern=resolve-refresh-token.test.ts --runInBand --forceExit`
- `npx tsc -p backend/tsconfig.json --noEmit`

PARAR na URL. CodeQL + H0 humano. Agente não mergeia.

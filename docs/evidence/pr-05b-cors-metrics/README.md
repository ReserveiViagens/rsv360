# PR-05b — CORS + /metrics evidence

## Decision: Bearer `METRICS_TOKEN` (not network-only)

Rede interna do compose sozinha deixaria qualquer container na bridge ler
`/metrics` (~27 KB de telemetria). Bearer fail-closed + `prometheus.yml`
`authorization.credentials_file` na mesma fatia evita scrape cego e fecha
a superfície pública. Compose injeta `METRICS_TOKEN` em backend, site-publico
(`<<: *app-env`) e prometheus (grava `/tmp/metrics_bearer_token` no start).

## CORS allowlist (10 legítimas + evil)

| Origin | Esperado ACAO |
|--------|----------------|
| http://localhost:3000 | refletida |
| http://localhost:3001 | refletida |
| http://localhost:3004 | refletida (admin — antes quebrado) |
| http://localhost:3005 | refletida |
| http://localhost:3006 | refletida (guest — antes quebrado) |
| http://127.0.0.1:3000 | refletida |
| http://127.0.0.1:3001 | refletida |
| http://127.0.0.1:3004 | refletida |
| http://127.0.0.1:3005 | refletida |
| http://127.0.0.1:3006 | refletida |
| http://evil.example | **sem** ACAO |

Fonte automatizada: `backend/src/__tests__/unit/cors-pr05b.test.ts`
(+ helper `packages/shared/src/http/__tests__/cors-origins.test.ts`).

Live curl (quando backend sobe com o patch): ver `matrix-live.txt`
gerado por `node scripts/smoke-pr05b-cors-metrics.cjs`.

## /metrics

| Request | Esperado |
|---------|----------|
| GET /metrics (sem Authorization) | 401 |
| GET /metrics Authorization: Bearer wrong | 401 |
| GET /metrics Authorization: Bearer $METRICS_TOKEN | 200 text/plain |
| GET /api/metrics (site-publico) anônimo | 401 |
| Prometheus scrape (credentials_file) | health=up |

Fonte: `metrics-route.test.ts` + `metrics-auth.test.ts`.

## Socket.IO

Fallback `'*'` removido. Backend usa `corsOriginDelegate`; site-publico WS
usa `getCorsOriginAllowlist()` (mesma allowlist).

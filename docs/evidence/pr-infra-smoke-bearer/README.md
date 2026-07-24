# Hygiene — infra-smoke bearer `/metrics` (F2 Opção A)

**Date:** 2026-07-24  
**Branch:** `hygiene/infra-smoke-bearer`  
**Base:** `main @ 22cc7fb0`

## Motivação

Pós-05b, `GET /metrics` (backend) é **bearer fail-closed**. O smoke CI (`tests/e2e/infra-smoke.js`) ainda esperava **200 anônimo** → job vermelho (`401 !== 200`). Contrato morto; não é regressão de app.

## Escopo (fechado)

| Arquivo | Mudança |
|---------|---------|
| `.github/workflows/e2e.yml` | Injeta `METRICS_TOKEN: ${{ secrets.METRICS_TOKEN }}` no env do step `Run E2E infra smoke` |
| `tests/e2e/infra-smoke.js` | Bearer → 200 · anon → 401 · env ausente → fail claro |
| `docs/evidence/pr-infra-smoke-bearer/` | Esta evidência |

**Fora de escopo:** `/api/metrics` no site-publico (`:3000`) — check live já provado no G2; CI do `:3000` = higiene futura.

## Diff resumido (sem secret)

```yaml
# e2e.yml — env do step Run E2E infra smoke
METRICS_TOKEN: ${{ secrets.METRICS_TOKEN }}
```

```js
// infra-smoke.js
// 1) if (!METRICS_TOKEN) throw fail-closed
// 2) GET /metrics sem header → assert 401
// 3) GET /metrics Authorization: Bearer <env> → assert 200 + payload Prometheus
```

O valor do token **nunca** aparece em código, evidence ou body de PR.

## Contrato novo

| Caso | Esperado |
|------|----------|
| Bearer (`METRICS_TOKEN` no env) | **200** + `rsv360_http_requests_total` |
| Anônimo (sem header) | **401** (falha se 200) |
| `METRICS_TOKEN` ausente no env | Fail claro no início (não skip) |

## Nota

Smoke sobe backend em `E2E_PORT` default **3102** (não 3002). Validação local contra host `:3002` (compose) cobre o mesmo contrato HTTP.

# PR-06a — Rate limit fail-closed (evidence)

## Vinculantes

| # | Item | Status |
|---|------|--------|
| ① | `publicLimiter` boot assert + runtime 503 se uninit; Redis runtime → memory | OK |
| ② | `checkRateLimit` store down → deny (`storeUnavailable`, 503) | OK |
| ③ | Admin login: rate limit + lockout + `timingSafeEqual` via SHA-256 digests | OK |
| ④ | Pilot herda `enforceLoginRateLimit` (memory se sem DB) | OK |
| ⑤ | `/metrics` + `/api/metrics` 120/min/IP (fecha #4520) | OK |
| ⑥ | Evidence: store down → nega; flood login → block; uninit → 503 | OK |

## Commands

```bash
cd backend && npx tsc --noEmit
cd backend && npm test -- --coverage=false --testPathIgnorePatterns=integration
cd apps/site-publico && npx jest --runInBand --testPathPattern 'bookings-pr03-idor|checkin-pr03b|webhooks-pr02b|webhooks-pr02c|image-error-telemetry|admin-login-pr06a'
npm run build --workspace apps/site-publico
```

## Baselines (pós-rebase `main @ fa42d6b6`)

| Check | Resultado |
|---|---|
| backend `tsc --noEmit` | 0 |
| jest excl. integration | 560 PASS (553 pré-06a + testes desta fatia) |
| site-publico runners | **54** PASS (= baseline **52** + 2 `admin-login-pr06a`) |
| `npm run build --workspace apps/site-publico` | PASS (gate) |

## Ops note — ajuste ⑤ Prometheus `health=up`

Re-provar scrape Prometheus com Bearer + `health=up` no alvo live após redeploy (mesmo rito PR-05b).

**Neste host de gate:** `METRICS_TOKEN` **ausente** em `.env` / `apps/site-publico/.env*` → **SKIP explícito** da re-prova live `health=up` (pendência ops 05b). Prova unitária do rate-limit 120/min + bearer 401 permanece nos testes.

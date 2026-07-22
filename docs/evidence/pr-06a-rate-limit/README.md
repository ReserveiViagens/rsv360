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

## Baselines (pos-rebase `main @ fa42d6b6`)

| Check | Resultado |
|---|---|
| backend `tsc --noEmit` | 0 |
| jest excl. integration | **560 PASS** |
| site-publico runners | **54 PASS** (= baseline **52** + 2 `admin-login-pr06a`) |
| `npm run build --workspace apps/site-publico` | PASS |

### Reconciliacao de contagem (11 vs delta 9)

Rodada `public-limiter|rate-limit-pr06a|metrics-route` = **11 PASS** (4+3+4).

| Origem | Contagem |
|---|---|
| Net-new no backend vs `main` | **+7** (public-limiter +3 fail-closed; metrics-route +1 teto 120/IP; rate-limit-pr06a +3 arquivo novo) |
| Ja existiam na mesma rodada (05b/limiter) | **4** (1× 429 publicLimiter + 3× bearer metrics) |
| Net-new site-publico | **+2** (`admin-login-pr06a`) |
| **Delta observavel** | **560−553=7** + **54−52=2** = **9** |

Os **11** nao sao 11 testes novos — sao o tamanho das 3 suites backend tocadas (inclui 4 regressoes 05b/limiter).

## Ops note — ajuste ⑤ Prometheus `health=up`

Re-provar scrape Prometheus com Bearer + `health=up` no alvo live apos redeploy (mesmo rito PR-05b).

**Neste host de gate:** `METRICS_TOKEN` **ausente** em `.env` / `apps/site-publico/.env*` → **SKIP explicito** da re-prova live `health=up` (pendencia ops 05b). Prova unitaria do rate-limit 120/min + bearer 401 permanece nos testes.

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
cd backend && npm test -- --coverage=false
cd apps/site-publico && npx jest --runInBand --testPathPattern 'bookings-pr03-idor|checkin-pr03b|webhooks-pr02b|webhooks-pr02c|admin-login-pr06a|image-error-telemetry'
```

## Ops note

Re-provar scrape Prometheus com Bearer + `health=up` no alvo live após redeploy (mesmo rito PR-05b).

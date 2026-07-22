# PR-06b — Route quotas + anti-flood (evidence)

## Vinculantes (registro)

| # | Item | Status |
|---|------|--------|
| ① | Limiter `GET propostas/:id` (fecha risco aceito 03b — enumeração redacted) | OK |
| ② | Bookings lookup + check-in Next + guest portal | OK |
| ③ | `buscar-ofertas` | OK |
| ④ | Anti-flood webhook MP **antes** do HMAC, teto alto (600/min/IP) — acomoda reentrega 02c | OK |
| ⑤ | Socket.IO handshake RL — CORS continua `corsOriginDelegate` (05b), sem `*` | OK |
| ⑥ | Redis compartilhado onde couber (`publicLimiter` / `createIpRateLimiter`) | OK |

## Cuidados da fatia

- **MP × 02c:** 503 fail-closed dispara reentrega nativa → teto 600/min; signed legítimo em 429 = PARAR e retunar.
- **03b dívida:** body do PR referencia fechamento da enumeração redacted em `GET /api/v1/propostas/:id`.
- **CORS:** `backend/server.js` mantém `corsOriginDelegate`; handshake RL não altera origin.

## Commands

```bash
cd backend && npx tsc --noEmit
cd backend && npx jest --coverage=false --testPathIgnorePatterns=integration
cd apps/site-publico && npx jest --runInBand --testPathPattern 'bookings-pr03-idor|checkin-pr03b|webhooks-pr02b|webhooks-pr02c|image-error-telemetry|admin-login-pr06a|pr06b-route-limits'
npm run build --workspace apps/site-publico
```

## Baselines (entrada `main @ 794b1519` · tip `c668c9d9`)

| Check | Resultado |
|---|---|
| `tsc --noEmit` | 0 |
| jest excl. integration | **563** (560+3) |
| site-publico runners | **58** (54+4) |
| build `apps/site-publico` | PASS |

### Reconciliacao

- Backend net-new: **+3** em `rate-limit-pr06b.test.ts` (teto MP · 429 antes HMAC · handshake)
- Next net-new: **+4** em `pr06b-route-limits.test.ts`
- Express propostas/buscar-ofertas/guest-portal: **0** net-new (wiring `publicLimiter` 06a)
- Delta: **3+4=7**

### Triagem vermelhos locais

Jobs paralelos interrompidos pre-fechamento ≠ evidencia. Run definitivo 777582 = 563 PASS + build PASS; recheck 22/22 nas suites que tinham caido.

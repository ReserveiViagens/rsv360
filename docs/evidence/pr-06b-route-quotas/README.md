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

## Baselines (entrada `main @ 794b1519`)

Documentar no body do PR: tsc · jest · runners · net-new vs tamanho de rodada (norma 06a).

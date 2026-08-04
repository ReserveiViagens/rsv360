# PR-11b — CAS booking status + atomic webhook claim (no DDL)

**Branch:** `security/pr-11b-cas-status`  
**Baseline:** `ed1d4998` (pós-11a)

## Escopo

- `updateBookingStatus`: `UPDATE … WHERE id AND status = $expected RETURNING *` (lost update → `conflict: true`).
- Mercado Pago settle: side-effect `payment_status` / timestamps só se CAS venceu; `WHERE status = …` no UPDATE complementar.
- `processWebhookEvent`: claim via `INSERT … ON CONFLICT DO NOTHING RETURNING id` — perdedor não re-settle.
- Sem migration / DDL.

## Test plan

```bash
cd apps/site-publico && npx jest __tests__/lib/booking-status-cas.test.ts __tests__/lib/webhook-claim-atomic.test.ts --forceExit
```

- CAS win / miss / transição ilegal  
- 2× confirm|cancel concorrente → 1 vence  
- 2× webhook claim → 2º `Claim held` / already processed  

## OUT

11-c/d/e · G6 hold · cupom · rate limit POST booking

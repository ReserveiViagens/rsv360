# PR-11a — atomic `POST /api/bookings` (period lock, no DDL)

**Branch:** `security/pr-11a-atomic-booking`  
**Baseline:** `d0b56b88`

## Escopo

- `createBookingUnderPeriodLock`: `pg_advisory_xact_lock` por **noite** (`item_id` + `YYYY-MM-DD`), chaves ordenadas (anti-deadlock).
- Re-check overlap + soft-block **dentro** da tx → `INSERT`.
- PIX / e-mail / webhook **fora** da tx (inalterados após sucesso).
- Sem migration / DDL.

## Test plan

```bash
cd apps/site-publico && npx jest __tests__/lib/booking-create-atomic.test.ts --forceExit
```

- 2× período idêntico → 1 ok + 1× 409  
- overlap parcial → 1 vence  
- itens diferentes → ambos ok  

## OUT

11-b/c/d/e · PR-12 · 04b · 10c

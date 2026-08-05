# PR-11e — rate limit coupon redeem (`POST /api/coupons/usage`)

**Branch:** `security/pr-11e-coupon-rate-limit`  
**Baseline:** `03e174ac` (pós-11c)

## Escopo

- Reuse PR-06b `createIpRateLimitStore` (+ `check()` → `retryAfterSec`).
- Key: `user:{id}` autenticado; fallback `ip:{clientIp}`.
- Ceiling: **5 / 60s** no POST redeem (antes do body / atomicidade 11-c).
- Resposta: **429** + header **`Retry-After`**.
- Sem DDL · sem alterar `applyCouponToBooking`.

## Test plan

```bash
cd apps/site-publico && npx jest __tests__/lib/coupon-redeem-rate-limit.test.ts __tests__/api/pr06b-route-limits.test.ts --forceExit
```

## OUT

11-d G6 hold · PR-12 · POST /api/bookings RL (outra fatia se GO)

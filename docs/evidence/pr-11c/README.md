# PR-11c — atomic coupon single-use redemption (no DDL)

**Branch:** `security/pr-11c-coupon-single-use`  
**Baseline:** `c8e55179` (pós-11b)

## Escopo

- `applyCouponToBooking`: tx + `SELECT … FROM coupons WHERE id FOR UPDATE` + re-check `usage_limit` / `usage_limit_per_user` + `INSERT coupon_usage`.
- Lock **só** na linha do cupom (não global).
- `total_uses` continua no trigger `trigger_update_coupon_stats` (sem double increment no app).
- `POST /api/coupons/usage` → resgate autenticado (201 / 409 / 404).
- Sem UNIQUE novo / sem DDL. Schema atual: índices em `coupon_usage`, sem UNIQUE `(coupon_id, user_id)`.

## Test plan

```bash
cd apps/site-publico && npx jest __tests__/lib/coupon-redeem-atomic.test.ts --forceExit
```

- `usage_limit=1` → 1 ok  
- 2× simultâneo mesmo cupom → 1 ok + 1× 409 esgotado  
- `usage_limit=2` × 3 simultâneos → 2 ok + 1 fail  
- 2 cupons distintos em paralelo → ambos ok  
- `usage_limit_per_user=1` → 2º do mesmo user 409  

## OUT

11-d G6 hold · 11-e rate limit POST booking · DDL UNIQUE (opcional follow-up)

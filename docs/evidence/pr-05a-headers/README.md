# PR-05a — HTTP security headers evidence

Captured with `node scripts/pr05a-capture-headers.cjs {before|after}` (HEAD).

| Surface | Before highlight | After highlight |
|---------|------------------|-----------------|
| backend `:3002` | `X-Frame-Options=SAMEORIGIN`, `X-Powered-By=RSV360…` | `DENY`, no `X-Powered-By`, no HSTS (flag off) |
| site-publico `:3000` | 500 (pre-existing image/CSS), no security headers | headers present (`nosniff`/`DENY`/Referrer); status still 500 (rebuild/redeploy pendente) |
| admin `:3004` | `X-Powered-By=Next.js`, empty security headers | `nosniff`/`DENY`/Referrer, no powered-by |
| turismo `:3005` | same as admin | same after |
| guest `:3006` | same as admin | same after (307 redirect to login still carries headers) |

HSTS: absent in all after captures with `ENABLE_HSTS` unset/false. Unit tests cover `ENABLE_HSTS=true` without preload.

# HIG-02 — rate limit on `/api/v1/auth/sso/exchange`

**Branch:** `security/hig-02-sso-exchange-ratelimit`  
**Baseline:** `9be49400` (pós-#213 / 10c-b)

## Escopo

- `enforceSsoExchangeRateLimit(ip)` — config `sso-exchange` (10/min, block 5 min) · DB store ou memory sem DB.
- Wire in-handler em `routes.js` **antes** de `exchangeSsoCode` (padrão `/refresh` · `/2fa/verify`).
- SSO service: sem RL interno pré-existente (confirmado — sem PARAR).

## Validação

```bash
cd backend && npx jest src/__tests__/unit/hig-02-sso-exchange-ratelimit.test.ts --forceExit --no-coverage
cd backend && npx tsc --noEmit
```

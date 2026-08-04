# PR-10c-b — DPoP refresh family bind (flag OFF)

**Branch:** `security/pr-10c-b-dpop-refresh`  
**Baseline:** `94180ce4` (pós-#211 / 10c-a2)

## Escopo

- Refresh: uma verificação DPoP por rotação; access com `cnf.jkt` via `signAccessTokenBound(..., { dpopJkt })`.
- Family bind: `device_info.dpop_jkt` (JSONB existente — **sem migração**). Bound + jkt mismatch → revoga família. Legado sem jkt → rotaciona.
- Login: propaga `cnf.jkt` do access para `createRefreshToken({ dpopJkt })`.
- Resource (flag ON): `ath` **obrigatório** (`dpop_ath_missing`).
- Higiene 4646: removido `base64UrlEncode` morto em `routes.js`.

## Comportamento observável

Flag OFF: bind registrado; resource enforcement continua no-op. Hubs a2 já enviam `DPoP`.

## OUT

Flag ON cut-over · cookie cut-over · 10c-c guest · CORS/cookie Path

## Validação

```bash
cd backend && npx jest src/__tests__/unit/dpop.service.test.ts src/__tests__/unit/refresh-dpop-family.test.ts --forceExit --no-coverage
cd backend && npx tsc --noEmit
```

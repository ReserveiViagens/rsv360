# PR-16a — canonical password-reset base URL

**Branch:** `security/pr-16a-canonical-reset-base`  
**Base:** `main @ 543a9ce0`  
**Commit:** `feat(security): PR-16a canonical password-reset base URL`

## Gap (Fase 0)

Reset **não** usava Host do request. O risco era cadeia fragmentada (`PASSWORD_RESET_*` → `FRONTEND_URL` → `localhost:3000`) com fallback silencioso em produção.

## Cadeia canônica

1. `PASSWORD_RESET_BASE_URL` (específica; alias legado `PASSWORD_RESET_URL_BASE`)
2. `NEXT_PUBLIC_PRIMARY_SITE_URL` | `PRIMARY_SITE_URL` (canônica)
3. **Produção** sem base → `PASSWORD_RESET_BASE_MISSING` fail-closed (503 no forgot; sem e-mail)
4. **Dev** sem base → `http://localhost:3000`

`FRONTEND_URL` removido da cadeia (Playwright/legado apenas — documentado nos `.env*.example`).

## Vinculantes

| # | Resultado |
| --- | --- |
| Host / X-Forwarded-Host em builder | 0 — `buildResetUrl(token, env)` só lê env canônica |
| Fail-closed prod | throw `PASSWORD_RESET_BASE_MISSING` |
| Dev fallback | localhost:3000 |
| Ordem | específica vence PRIMARY |
| OUT | `canonical-redirect.js`, `clone-alert`, 16b/c/d, cookies, CSP |

## Diff

| Arquivo | Papel |
| --- | --- |
| `backend/src/api/v1/auth/password-reset.service.js` | resolve + fail-closed + 503 |
| `.env.example` | documenta cadeia |
| `.env.production.example` | documenta fail-closed |
| `apps/site-publico/.env.example` | FRONTEND_URL ≠ reset |
| `password-reset-email.service.test.ts` | test plan ①–④ |
| `docs/evidence/pr-16a/README.md` | esta evidence |

## Fix (typecheck + anti-enumeration)

- `tsc`: catch tipado `unknown` no teste (useUnknownInCatchVariables).
- `requestPasswordReset`: `resolvePasswordResetBaseUrl()` **antes** da consulta ao usuário → 503 uniforme (sem enumeração).

## Validação

```bash
cd backend && npx tsc --noEmit   # EXIT 0
cd backend && npx jest src/__tests__/unit/password-reset-email.service.test.ts --no-coverage
# 14 passed
```

## OUT

16b CSRF · 16c CSP Report-Only · 16d enforce · SameSite/HttpOnly · 04b · 10c

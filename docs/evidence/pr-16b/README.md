# PR-16b — CSRF + cookie hardening (site-publico + guest portal)

**Branch:** `security/pr-16b-csrf-samesite-cookies`  
**Base:** `main @ 3f2b9fdc`

## Escopo

| Superfície | Mudança |
| --- | --- |
| Helper central | `assertCookieMutationOrigin` + `formatBrowserSessionCookie*` em `packages/shared` (reusa allowlist PR-05b) |
| site-publico | Middleware CSRF fail-closed em mutações `/api/*` com `auth_token`/`admin_token`; cookies client com `Secure` em prod |
| guest portal | Cookie `rsv360_guest_portal_token` via helper (`Secure` em prod, `SameSite=Lax`) |
| Admin cookie server | Já tinha `Secure` + `Lax` + HttpOnly — intocado (HttpOnly = 04b) |

## SameSite = Lax (justificativa)

`Strict` quebraria cookies em retornos top-level de OAuth e Mercado Pago. `Lax` + Origin/Referer fail-closed cobre CSRF em mutações com cookie.

## CSRF

- Só quando método mutante **e** cookie de sessão presente
- Exempt: webhooks, OAuth callbacks, login/2FA (mint cookie)
- Sem Origin/Referer → 403; Origin fora da allowlist → 403
- Bearer `/api/v1/auth/*` e admin Bearer — **fora** (não tocados)

- Deep import no middleware: `packages/shared/dist/http/cors-origins.js` (Edge — evita barrel `@rsv360/shared`)

## Validação

```bash
cd packages/shared && npm run build && npx tsc --noEmit   # EXIT 0
cd backend && npx tsc --noEmit                             # EXIT 0
cd backend && npx jest ../packages/shared/src/http/__tests__/cors-origins.test.ts --no-coverage
# 10 passed (5 PR-05b + 5 PR-16b)
```

## OUT

16c/16d CSP · HttpOnly (04b) · canonical-redirect · clone-alert · 10c

# PR-10c-pré-a — Refresh HttpOnly cookie (site-publico BFF)

**Branch:** `security/pr-10c-pre-a-refresh-httponly`  
**Baseline:** `511d4af7` (HIG-01)

## Decisões vinculantes

1. Estratégia **A+D** — só **site-publico + backend**. Admin/turismo = **10c-pré-b** (body legado byte-a-byte).
2. Flag **`AUTH_REFRESH_COOKIE_REQUIRED` default OFF** — cookie first; body fallback + log `auth_refresh_body_deprecated`.
3. Cookie **`rsv360_refresh_token`** · HttpOnly · Secure(prod) · SameSite=Lax · **Path=/api/auth** (BFF).
4. BFF **strip** `refresh_token` do JSON ao browser (login/refresh).
5. Interceptor/login site-publico: `credentials: 'include'`, não persiste refresh em LS; limpa legado no 1º refresh via cookie.
6. CSRF 16b: `hasCookieSession` inclui `rsv360_refresh_token`; rotas BFF refresh/logout **sem** exceção.
7. `JWT_REFRESH_SECRET` documentado (fallback `JWT_SECRET` compatível).

## OUT

admin/turismo clients · DPoP · guest · admin_token · mTLS · 16d · PR-11

## Validação

```bash
npm run build --workspace=@rsv360/shared
npx jest packages/shared/src/http/__tests__/cors-origins.test.ts --config=...
npx jest backend/src/__tests__/unit/resolve-refresh-token.test.js
npx jest backend/src/__tests__/integration/auth-v1-refresh.integration.test.ts
# + type-check / monorepo-build conforme CI
```

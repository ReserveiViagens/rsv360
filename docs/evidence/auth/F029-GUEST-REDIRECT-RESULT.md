# F-029 — Guest redirect loop closeout

**Data:** 2026-06-22  
**Branch:** `chore/f029-guest-redirect-loop`

## Causa

`localStorage` com token órfão (sem cookie `rsv360_guest_portal_token`) fazia `isAuthenticated=true` no client, redirecionando `/login` → `/`, enquanto o middleware SSR enviava `/` → `/login` (loop).

## Correções

1. `portal-session.ts` — `getPortalCookieToken()`, `hasValidPortalSession()`
2. `auth.tsx` — limpa sessão se só localStorage; sincroniza localStorage a partir do cookie; `verify()` sem fallback otimista; `isAuthenticated` exige `hasValidPortalSession()`
3. `portal-booking.spec.ts` — cenário localStorage sem cookie permanece em `/login`

## Validação

```bash
cd apps/guest && npx playwright test tests/e2e/portal-booking.spec.ts
npm run test:e2e:routes   # com stack Docker
```

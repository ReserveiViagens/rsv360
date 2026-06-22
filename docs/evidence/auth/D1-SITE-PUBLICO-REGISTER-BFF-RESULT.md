# Site-publico register BFF → v1

**Data:** 2026-06-22  
**Gap:** AUTH-ALIGNMENT-MATRIX D1 (residual register)

## Mudanças

| Arquivo | Alteração |
|---------|-----------|
| `apps/site-publico/app/api/auth/register/route.ts` | Proxy `proxyAuthV1` → `/api/v1/auth/register` |
| `apps/site-publico/lib/auth-v1.ts` | `AUTH_V1.REGISTER`, `AUTH_BFF.REGISTER` |
| `apps/site-publico/lib/auth.ts` | `register()` usa BFF same-origin; sem auto-login |

## Contrato

Igual D2.2: 201 sem tokens; usuário faz login após cadastro.

OAuth (Google/Facebook) permanece local — fora de escopo.

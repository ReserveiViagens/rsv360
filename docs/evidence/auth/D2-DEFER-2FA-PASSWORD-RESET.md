# D2 — 2FA / password reset defer (turismo)

**Data:** 2026-06-22  
**Status:** Spec aprovada — ver `docs/security/AUTH-V1-2FA-PASSWORD-RESET-SPEC.md`

## Decisão

Sem endpoints `/api/v1/auth/2fa/*` nem forgot/reset no backend, o turismo **não chama** mais `/api/auth/*` (404).

## Implementação cliente

| Arquivo | Comportamento |
|---------|---------------|
| `apps/turismo/src/lib/auth-legacy-deferred.ts` | Mensagens e `rejectDeferredAuth()` |
| `apps/turismo/src/services/authService.ts` | 2FA/forgot/reset → erro explícito |
| `apps/turismo/src/components/auth/AuthPage.tsx` | "Esqueceu senha" → mensagem defer |

## Próximo (spec D2.4–D2.7)

Ver `docs/security/AUTH-V1-2FA-PASSWORD-RESET-SPEC.md`:

1. **D2.4** — Backend forgot/reset password v1
2. **D2.5** — Backend 2FA TOTP v1
3. **D2.6** — Wire turismo + remover defer
4. **D2.7** — site-publico BFF

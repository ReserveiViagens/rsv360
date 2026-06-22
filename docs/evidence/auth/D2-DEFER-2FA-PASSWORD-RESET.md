# D2 — 2FA / password reset defer (turismo)

**Data:** 2026-06-22  
**Status:** **Fechado** — implementado em D2.4–D2.7 (#572)

## Histórico

Durante D2.1–D2.3 o turismo exibia defer no cliente até existir backend v1 + spec.

## Resolução (#572)

| Fase | Entregável |
|------|------------|
| D2.4 | Backend forgot/reset v1 |
| D2.5 | Backend 2FA TOTP |
| D2.6 | Turismo wire; `auth-legacy-deferred.ts` removido |
| D2.7 | site-publico BFF + telas recuperar/redefinir senha |

Ver `docs/security/AUTH-V1-2FA-PASSWORD-RESET-SPEC.md` e evidências `D2.4`–`D2.7`.

# D2 — Turismo 2FA / register (trilha proposta)

**Data:** 2026-06-22  
**Gap:** AUTH-ALIGNMENT-MATRIX D2  
**App:** `apps/turismo`

## Estado atual

| Fluxo | Endpoint turismo | Backend v1 |
|-------|------------------|------------|
| Login/session/refresh/logout | `/api/v1/auth/*` | ✅ T1.7 |
| Register | `/api/v1/auth/register` | ✅ `POST /api/v1/auth/register` (D2.2) |
| 2FA setup/verify/disable | `/api/auth/2fa/*` | ❌ 404 |
| Forgot/reset password | `/api/auth/forgot-password`, `reset-password` | ❌ 404 |

## Fases

| Fase | Status | Evidência |
|------|--------|-----------|
| D2.1 Inventário + smoke | ✅ | `D2.1-TURISMO-LEGACY-AUTH-INVENTORY.md` |
| D2.2 Backend register v1 | ✅ | `D2.2-BACKEND-AUTH-REGISTER-RESULT.md` |
| D2.3 Turismo wire → v1 | ✅ | `D2.3-TURISMO-REGISTER-V1-RESULT.md` |
| 2FA / forgot-reset | Defer (cliente) | `D2-DEFER-2FA-PASSWORD-RESET.md` |

## Trilha register concluída

Register migrado no turismo. 2FA e forgot/reset: mensagem explícita no cliente até backend v1.

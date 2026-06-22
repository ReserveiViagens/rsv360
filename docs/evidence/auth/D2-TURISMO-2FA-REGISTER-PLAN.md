# D2 — Turismo 2FA / register (trilha)

**Data:** 2026-06-22  
**Status:** **Concluída** (#565–#568 register + #572 2FA/reset)

## Estado final

| Fluxo | Endpoint | Backend v1 |
|-------|----------|------------|
| Login/session/refresh/logout | `/api/v1/auth/*` | ✅ |
| Register | `/api/v1/auth/register` | ✅ |
| 2FA | `/api/v1/auth/2fa/*` | ✅ D2.5/D2.6 |
| Forgot/reset | `/api/v1/auth/forgot-password`, `reset-password` | ✅ D2.4/D2.6 |

## Fases

| Fase | Status | Evidência |
|------|--------|-----------|
| D2.1 Inventário + smoke | ✅ | `D2.1-TURISMO-LEGACY-AUTH-INVENTORY.md` |
| D2.2 Backend register v1 | ✅ | `D2.2-BACKEND-AUTH-REGISTER-RESULT.md` |
| D2.3 Turismo wire → v1 | ✅ | `D2.3-TURISMO-REGISTER-V1-RESULT.md` |
| D2.4–D2.7 2FA + reset | ✅ | `D2.4`–`D2.7` + PR #572 |

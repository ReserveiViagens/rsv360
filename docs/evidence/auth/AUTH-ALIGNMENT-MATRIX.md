# Auth alignment matrix — #56 / #31

**Data:** 2026-06-22 (atualizado pós D2.4–D2.7 #572)  
**Base:** `main` @ pós-merge register v1 + PR #572  
**Canônico:** `backend` `/api/v1/auth/*` + `@rsv360/shared` (`packages/shared/src/auth/session.ts`)

## Resumo executivo

| App | Namespace auth | Alinhado v1 | Storage tokens | Status |
|-----|----------------|-------------|----------------|--------|
| **admin** | `/api/v1/auth/*` | Sim (T1.2) | `localStorage` (`rsv360_*`) | OK |
| **turismo** | `/api/v1/auth/*` | Sim (T1.7 + D2.3–D2.6) | `localStorage` + authService | OK |
| **guest** | `/api/guest-portal/auth/*` | N/A (portal) | `portal-session` | OK — F-029 corrigido |
| **site-publico** | `/api/auth/*` BFF → `:3002` v1 | **Sim (T1.8 + register + forgot/reset + OAuth D2.9)** | `rsv360_*` via BFF | OK |

## Backend canônico (`:3002`)

| Endpoint | Método | Contrato | Testes |
|----------|--------|----------|--------|
| `/api/v1/auth/login` | POST | tokens + user | integration + E2E #31 |
| `/api/v1/auth/session` | GET | Bearer → session | integration + E2E #31 |
| `/api/v1/auth/refresh` | POST | rotação refresh | integration + E2E #31 |
| `/api/v1/auth/logout` | POST | revoga refresh | integration + E2E #31 |
| `/api/v1/auth/register` | POST | cria conta (sem tokens) | integration + E2E D2 |
| `/api/v1/auth/forgot-password` | POST | 200 genérico | integration + E2E D2.4 |
| `/api/v1/auth/reset-password` | POST | token opaco | integration + E2E D2.4 |
| `/api/v1/auth/2fa/*` | POST | TOTP + backup codes | integration D2.5 |
| `/api/v1/auth/oauth` | POST | login social (BFF) | integration D2.9 |
| Rate limit | — | T1.5 + D2.4/D2.5 | integration |

## Divergências

| ID | Severidade | Descrição | Status |
|----|------------|-----------|--------|
| D1 | ~~Média~~ | site-publico BFF `/api/auth/*` → proxy v1 | **Fechado (T1.8 + register + OAuth D2.9 BFF)** |
| D2 | Baixa | 2FA + reset v1 | **Fechado (D2.4–D2.7)** |
| D3 | Baixa | guest portal namespace próprio | Esperado |
| D4 | ~~Ops~~ | F-029 guest redirect loop | **Fechado (#559)** |

## Cenários #31

| # | Cenário | Status |
|---|---------|--------|
| 1 | Login válido → session 200 | ✅ E2E `tests/e2e/auth-v1/` (T1.9) |
| 2 | Credencial inválida → 401 | ✅ E2E |
| 3 | Refresh válido | ✅ E2E |
| 4 | Logout → refresh revogado | ✅ E2E |
| 5 | RBAC / `enterpriseId` | ✅ E2E + tenant context |
| 6 | Register v1 201/409 | ✅ E2E D2 |
| 7 | Legado `/api/auth/register` 404 | ✅ E2E D2 |
| 8 | Forgot-password 200 genérico | ✅ E2E D2.4 |
| 9 | Reset-password token inválido 401 | ✅ E2E D2.4 |

## Trilha concluída

1. ~~Merge PR #553~~ — LFS
2. ~~T1.8~~ — site-publico BFF proxy v1 (#555)
3. ~~T1.9~~ — E2E auth #31 (#556)
4. ~~F-029~~ — guest redirect (#559)
5. ~~D2 register~~ — backend + turismo + site-publico BFF (#565–#568)
6. ~~Docker backend build~~ — #569
7. ~~D2.4–D2.7~~ — forgot/reset + 2FA (#572)

## Referências

- `docs/evidence/auth/AUTH-ALIGNMENT-PLAN.md`
- `docs/evidence/auth/AUTH-QUEUE-CLOSEOUT-2026-06.md`
- `docs/evidence/trilha-0/T1.8-SITE-PUBLICO-AUTH-V1-RESULT.md`
- `docs/evidence/auth/T1.9-AUTH-V1-E2E-RESULT.md`
- `docs/evidence/auth/D2.3-TURISMO-REGISTER-V1-RESULT.md`
- `docs/evidence/auth/D1-SITE-PUBLICO-REGISTER-BFF-RESULT.md`
- `docs/evidence/auth/D2-DEFER-2FA-PASSWORD-RESET.md`
- `docs/security/AUTH-V1-2FA-PASSWORD-RESET-SPEC.md`
- `docs/evidence/auth/D2.4-BACKEND-PASSWORD-RESET-RESULT.md`
- `docs/evidence/auth/D2.5-BACKEND-2FA-RESULT.md`
- `docs/evidence/auth/D2.6-TURISMO-2FA-RESET-V1-RESULT.md`
- `docs/evidence/auth/D2.7-SITE-PUBLICO-AUTH-BFF-RESULT.md`

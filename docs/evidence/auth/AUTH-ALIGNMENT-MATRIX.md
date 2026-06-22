# Auth alignment matrix — #56 / #31

**Data:** 2026-06-22  
**Base:** `main` @ `adc32e149`  
**Modo:** read-only (PACR-Ampla Fase 2)  
**Canônico:** `backend` `/api/v1/auth/*` + `@rsv360/shared` (`packages/shared/src/auth/session.ts`)

## Resumo executivo

| App | Namespace auth | Alinhado v1 | Storage tokens | Próxima ação |
|-----|----------------|-------------|----------------|--------------|
| **admin** | `/api/v1/auth/*` | Sim (T1.2) | `localStorage` (`rsv360_*`) | E2E login/session |
| **turismo** | `/api/v1/auth/*` | Sim (T1.7) | `localStorage` + authService | Migrar 2FA/register legado |
| **guest** | `/api/guest-portal/auth/*` | N/A (portal) | `portal-session` | Manter escopo guest; smoke F-029 |
| **site-publico** | `/api/auth/*` (BFF Next) | Não | `localStorage` (`user`) | Piloto migração v1 ou BFF proxy |

## Backend canônico (`:3002`)

| Endpoint | Método | Contrato | Testes integration |
|----------|--------|----------|-------------------|
| `/api/v1/auth/login` | POST | `{ email, password }` → `{ success, data: { user, access_token, refresh_token } }` | `auth-v1-login.integration.test.ts` |
| `/api/v1/auth/session` | GET | Bearer → `{ authenticated, user, session }` | `auth-v1-session.integration.test.ts` |
| `/api/v1/auth/refresh` | POST | `{ refresh_token }` → novo par tokens | `auth-v1-refresh.integration.test.ts` |
| `/api/v1/auth/logout` | POST | Bearer + `{ refresh_token }` → revoga | `auth-v1-logout.integration.test.ts` |
| Rate limit | — | T1.5 | `auth-v1-rate-limit.integration.test.ts` |

## Por frontend

### admin (`apps/admin`)

| Item | Valor |
|------|-------|
| Provider | `lib/auth/SessionProvider.tsx` |
| API base | `NEXT_PUBLIC_API_URL` → `:3002` |
| Endpoints | `session`, `refresh` via v1 |
| Shared types | `@rsv360/shared` (`SessionUser`, `TenantSession`) |
| Gap | Login UI pode ainda não usar mesmo fluxo que turismo; validar E2E |

### turismo (`apps/turismo`)

| Item | Valor |
|------|-------|
| Provider | `context/AuthContext.tsx` + `hooks/useAuth.ts` |
| Helpers | `lib/auth-v1.ts` |
| Endpoints | login, logout, refresh, session → v1 |
| API default | `:3002` (`config/api.ts`) |
| Gap | 2FA/register ainda em `/api/auth/*` legado (sem v1 backend) |
| Gap | Demo tokens (`demo-token`, `admin-token`) mantidos para dev |

### guest (`apps/guest`)

| Item | Valor |
|------|-------|
| Provider | `src/lib/auth.tsx` |
| Endpoints | `/api/guest-portal/auth/login`, `verify`, `logout` |
| Escopo | Portal hóspede (não staff v1) |
| Gap | F-029 redirect loop no route-smoke — investigar separado |

### site-publico (`apps/site-publico`)

| Item | Valor |
|------|-------|
| Provider | `contexts/auth-context.tsx`, `components/auth-provider.tsx` |
| Endpoints | `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh` (rotas Next BFF) |
| Admin login | `/api/admin/auth/login` (separado) |
| Gap | Não consome `/api/v1/auth/*` direto; shape `User` local vs `SessionUser` |
| Gap | `lib/auth.ts` chama `${API_BASE_URL}/api/auth/login` |

## Divergências prioritárias

| ID | Severidade | Descrição | Blast radius |
|----|------------|-----------|--------------|
| D1 | Média | site-publico usa namespace `/api/auth/*` BFF, não v1 | site-publico + testes integração |
| D2 | Baixa | turismo 2FA/register fora de v1 | turismo auth flows |
| D3 | Baixa | guest portal namespace próprio | esperado — não unificar com staff |
| D4 | Ops | F-029 guest redirect loop | smoke/route-smoke, guest portal |

## Cenários #31 (próximo — testes)

| # | Cenário | Status |
|---|---------|--------|
| 1 | Login válido → session 200 | Backend integration OK; falta E2E por app |
| 2 | Credencial inválida → 401 | Backend integration OK |
| 3 | Refresh válido → novo access_token | Backend + admin/turismo wired |
| 4 | Logout → refresh revogado | T1.6 GO backend; turismo wired |
| 5 | RBAC / tenant `enterpriseId` | T1.3/T1.4 shared types; falta E2E |

## Recomendação de trilha

1. **Merge PR #553** — higiene Git LFS (sem runtime).
2. **T1.8 (proposta)** — site-publico BFF proxy para `/api/v1/auth/*` ou migração direta (PR dedicada, ADR-0004 H2).
3. **T1.9 (proposta)** — suite E2E Playwright auth (5 cenários #31) contra stack Docker.
4. **F-029** — guest redirect (governança; não misturar com T1.8).

## Referências

- `docs/evidence/auth/AUTH-ALIGNMENT-PLAN.md`
- `docs/evidence/trilha-0/T1.7-AUTH-V1-WIRE-RESULT.md`
- `packages/shared/src/auth/session.ts`
- `docs/governance/REORDENACAO_PRIORIDADES_F030_F027_F028_F024_F025_F029_F026.md` (F-029)

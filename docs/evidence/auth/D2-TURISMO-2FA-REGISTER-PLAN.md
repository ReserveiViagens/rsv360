# D2 — Turismo 2FA / register (trilha proposta)

**Data:** 2026-06-22  
**Gap:** AUTH-ALIGNMENT-MATRIX D2  
**App:** `apps/turismo`

## Estado atual

| Fluxo | Endpoint turismo | Backend v1 |
|-------|------------------|------------|
| Login/session/refresh/logout | `/api/v1/auth/*` | ✅ T1.7 |
| Register | `/api/auth/register` | ❌ legado (`authService`, `AuthContext`) |
| 2FA setup/verify/disable | `/api/auth/2fa/*` | ❌ legado |
| Forgot/reset password | `/api/auth/forgot-password`, `reset-password` | ❌ legado |

Implementação legada referenciada em `apps/turismo/server/server-file-auth.ts` e `src/services/authService.ts`.

## Opções (ADR-0004 H2)

| Opção | Escopo | Risco |
|-------|--------|-------|
| **A — BFF proxy** | Rotas Next `/api/auth/register`, `/api/auth/2fa/*` fazem forward para futuro backend v1 | Médio |
| **B — Manter legado documentado** | Sem mudança até backend expor v1 register/2FA | Baixo |
| **C — Desabilitar UI** | Esconder register/2FA até v1 existir | Baixo (perda feature) |

## Recomendação

1. **Fase D2.1** — Inventário + testes de contrato dos endpoints legado (read-only).
2. **Fase D2.2** — Backend: `POST /api/v1/auth/register` (se produto exigir).
3. **Fase D2.3** — Turismo BFF proxy (mesmo padrão T1.8 site-publico).
4. **2FA** — defer até spec de segurança (fora sprint atual).

## Próximo PR sugerido

`chore/d2-turismo-auth-legacy-inventory` — apenas docs + testes de smoke dos endpoints legado, sem refactor.

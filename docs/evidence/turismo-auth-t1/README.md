# turismo/auth-t1 — Unificar AuthContext + remover bypass demo

**Base:** `main @ 4dda5468`  
**Branch:** `turismo/auth-t1`  
**GO Decisor:** 31/07/2026

## Escopo executado

1. Deletado `apps/turismo/context/AuthContext.tsx` (cópia legada — único arquivo em `context/`).
2. `tsconfig` `@/context/*` → só `./src/context/*`.
3. Imports `components/Navigation.tsx` e `components/Layout.tsx` → `../src/context/AuthContext`.
4. Provider vivo: removidos ramos demo/admin; login só `POST /api/v1/auth/login`; tokens fabricados legados limpos via `isLegacyFabricatedToken`.
5. UI login sem banner/credenciais demo; `src/pages/login` sem botão demo.
6. e2e: `E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD` via `e2e/auth-credentials.ts` (6 specs).
7. Layout: redirect auth em `useEffect` (não em render) — necessário após unificação (antes o contexto errado mascarava SSG com `isLoading: true`).

## Grep S0b (apps/turismo, excl. BACKUP / reservei / ECOSYSTEM)

| Pattern | Antes (files/occ) | Depois |
|---------|-------------------|--------|
| admin@onion360.com | 9 / 12 | **0 / 0** |
| admin@onionrsv.com | 1 / 2 | **0 / 0** |
| demo@onionrsv.com | 4 / 7 | **0 / 0** |
| admin123 | 9 / 11 | **0 / 0** |
| demo123 | 4 / 4 | **0 / 0** |
| demo-token | 2 / 8 | **0 / 0** |
| demo-refresh | 2 / 4 | **0 / 0** |
| admin-token | 1 / 5 | **0 / 0** |
| admin-refresh | 1 / 2 | **0 / 0** |

Arquivos: `grep-before.json`, `grep-after.json`.

## Seed / e2e (sem senha no source)

```bash
# Backend (compose raiz :3002)
export SEED_TEST_USER_EMAIL=test@local.dev
export SEED_TEST_USER_PASSWORD='<secret>'
cd backend && npm run seed

# Playwright turismo
export E2E_AUTH_EMAIL="$SEED_TEST_USER_EMAIL"
export E2E_AUTH_PASSWORD="$SEED_TEST_USER_PASSWORD"
# npm run test:e2e — ou playwright no apps/turismo
```

Sem `E2E_AUTH_*`, specs fazem **SKIP explícito** (nunca silencioso).

## Validação

| Check | Resultado |
|-------|-----------|
| backend `tsc --noEmit` | **0** |
| `npm run build --workspace=apps/turismo` | **PASS** (`turismo-build.log`) |
| Docker Fase 5 | **N/A** (lockfile intocado) |
| localStorage→HttpOnly | **fora** (dívida 04b) |
| defaults :5000 | **fora** (T2) |
| compose legado | **fora** (T3) |

## Smoke funcional (ambiente Decisor / CI)

- Backend `:3002` de pé → login real seed → 200
- Credencial demo antiga → negada
- Navigation/Layout no mesmo Provider

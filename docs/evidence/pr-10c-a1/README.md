# PR-10c-a1 — DPoP access token (backend + shared util, flag OFF)

**Branch:** `security/pr-10c-a-dpop-access`  
**Baseline:** `49a85b1b` (pós-#207)

## Escopo

- Shared: `packages/shared/src/auth/dpop.ts` — JWK thumbprint + WebCrypto ECDSA P-256 non-extractable (IndexedDB) + `createDpopProof` (**sem wiring** de clients).
- Backend: `dpop.service.js` — emissão `cnf.jkt` quando proof válida no login/refresh; validação atrás de `AUTH_DPOP_ENABLED` (default OFF).
- Hook: `authenticateJwt` / `optionalJwt` — fail-closed DPoP **somente** com flag ON e access com `cnf.jkt`.

## Comportamento observável

**Nenhum** com flag OFF: validação é no-op; tokens sem proof continuam sem `cnf`.

## OUT (fatias seguintes)

- **10c-a2** — wire hubs (site-publico / admin / turismo)
- **10c-b** — DPoP no refresh
- Cut-over cookie flag / Domain-SameSite

## Validação

```bash
npm run build --workspace=@rsv360/shared
npm run test --workspace=backend -- --testPathPattern=dpop.service --forceExit
cd backend && npx tsc --noEmit
```

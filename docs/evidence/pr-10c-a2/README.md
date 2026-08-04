# PR-10c-a2 — DPoP wire hubs (flag OFF)

**Branch:** `security/pr-10c-a2-dpop-hubs`  
**Baseline:** `8efe0263` (pós-#210 / 10c-a1)

## Escopo

- **site-publico:** `auth-interceptor` + `auth.login` enviam `DPoP`; BFF `proxyAuthV1` **forward** do header; `htu` mapeia `/api/auth/*` → upstream `/api/v1/auth/*`.
- **admin:** `apiFetch` + `SessionProvider` (session/refresh).
- **turismo:** `apiClient` axios interceptor + `AuthContext` (login/refresh/session/logout).
- Shared: `resolveDpopHtu` + `tryCreateDpopProof` (fail-soft).

## Comportamento observável

Com `AUTH_DPOP_ENABLED=false`: backend passa a receber proof válida → pode emitir `cnf.jkt`; **não exige** DPoP em resource. Sem WebCrypto/IndexedDB, request segue sem header.

## OUT

- Flag ON · cookie cut-over · 10c-b refresh-bind · endurecimento `ath` obrigatório

## Validação

```bash
npm run build --workspace=@rsv360/shared
cd backend && npx jest ../packages/shared/src/auth/__tests__/dpop.test.ts --forceExit --no-coverage
```

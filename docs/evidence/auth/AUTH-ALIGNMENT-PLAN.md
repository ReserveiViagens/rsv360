# Auth alignment plan — #56 / #31

## Escopo PACR-Ampla (read-only primeiro)

1. Mapear base URL client vs server (turismo, admin, site-publico)
2. Endpoints login/logout/refresh — comparar `authService`, API routes, cookies
3. Payload de tokens — shape esperado vs retornado
4. Implementar suíte 5 cenários (#31) antes de refactors

## Entregáveis

- [x] Matriz de divergências em `docs/evidence/auth/AUTH-ALIGNMENT-MATRIX.md`
- [x] Testes E2E ou integration para login/logout/session/expiração/RBAC — ver `docs/evidence/auth/T1.9-AUTH-V1-E2E-RESULT.md`

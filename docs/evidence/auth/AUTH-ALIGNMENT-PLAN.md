# Auth alignment plan — #56 / #31

## Escopo PACR-Ampla (read-only primeiro)

1. Mapear base URL client vs server (turismo, admin, site-publico)
2. Endpoints login/logout/refresh — comparar `authService`, API routes, cookies
3. Payload de tokens — shape esperado vs retornado
4. Implementar suíte 5 cenários (#31) antes de refactors

## Entregáveis

- [x] Matriz de divergências em `docs/evidence/auth/AUTH-ALIGNMENT-MATRIX.md`
- [x] Testes E2E ou integration para login/logout/session/expiração/RBAC — `T1.9-AUTH-V1-E2E-RESULT.md`
- [x] Register v1 backend + turismo + site-publico BFF — D2.2/D2.3/D1 (#565–#568)
- [x] D2.1 inventário legacy + smoke `test:e2e:turismo-legacy`
- [x] Docker backend rebuild — #569

## Próximo (fora escopo atual)

- Implementar trilha **D2.4–D2.7** conforme `docs/security/AUTH-V1-2FA-PASSWORD-RESET-SPEC.md`
- site-publico OAuth social → BFF ou IdP canônico

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

- [x] Trilha **D2.4–D2.7** (forgot/reset + 2FA backend + turismo + site-publico BFF/UI)

## Backlog auth (pós-plano)

**Decisão 2026-06-22:** priorizar **E-mail reset produção (D2.8)** antes de OAuth social.

| Item | Prioridade | Notas |
|------|------------|-------|
| **E-mail reset produção (D2.8)** | **Alta (escolhido)** | SMTP/SES ou `PASSWORD_RESET_EMAIL_WEBHOOK`; desbloqueia forgot/reset end-to-end fora de dev log |
| OAuth social site-publico | Média (próximo) | Google/Facebook locais → BFF ou IdP; escopo maior, sem dependência de D2.4 |
| Admin UI 2FA | Baixa | Spec §5 backlog |
| E2E 2FA fluxo completo | Baixa | setup→login→verify (manual hoje) |

## Fora de escopo

- D3 guest namespace (by design)
- SMS/WebAuthn 2FA (spec §8)

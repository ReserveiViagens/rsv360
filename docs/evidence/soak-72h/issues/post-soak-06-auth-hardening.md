## Status
**READY-TO-IMPLEMENT** (rascunho pós-soak) — **não executar** durante soak 72h.

## Trilha
- [TRILHA-PARALELA B2/C6](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/ops/soak-72h-g4-final/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- **Evidência Trilha B:** `docs/evidence/soak-72h/issues/TRILHA-B-255-auth-evidence.md`

## Prioridade | Impacto
**P1** | Token demo `admin-token-123` em APIs admin; login pode retornar **500** em falha de DB.

## Comportamento atual (arquivo/linha)

| Item | Local | Atual | Risco |
|------|-------|-------|-------|
| Login catch-all | `app/api/auth/login/route.ts:152-160` | **500** em exceção | Confunde com bug auth |
| Admin API auth | `app/api/admin/website/pages/route.ts:4-9` (+ ~14 rotas) | Bearer === `admin-token-123` | Bypass total API CMS |
| UI middleware | `middleware.ts:20-29` | JWT `verifyAdminToken` | OK |
| Cookie demo | `lib/advanced-auth.ts:187-201` | cookie fixo → admin mock | Alto em prod |

**API P0 hoje:** 8/8 OK; A6=200 **com** token demo (contrato fraco).

## Implementação (4 PRs sugeridos, pós-soak)

1. `lib/admin-api-auth.ts` + trocar `checkAuth` em `app/api/admin/**`
2. `login/route.ts`: DB down → **503**; inválido → **401**
3. Remover demo cookie exceto `NODE_ENV=development` + flag explícita
4. Atualizar `API-CONTRACT-MATRIX.md` + smoke (A6 → **401** sem token)

## Critérios de aceite
- [ ] Sem `admin-token-123` em rotas API (exceto testes/dev flag)
- [ ] `POST /api/auth/login` inválido → **401**; PG down → **503**
- [ ] `GET /api/admin/website/pages` sem JWT → **401**
- [ ] API P0 **8/8** com matriz atualizada
- [ ] `ADMIN_JWT_SECRET` documentado no compose

## Bloqueio
HS-8 Sprint 0 + soak até G4 GO.

## Relacionadas
#195 `area/auth` `security`

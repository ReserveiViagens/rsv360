# PR draft #255 — copiar/colar no GitHub

> **Não abrir antes de:** #256 GO + **#252** (recomendado) + fim soak  
> **Issue:** https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/255  
> **Evidência:** [TRILHA-B-255-auth-evidence.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/issues/TRILHA-B-255-auth-evidence.md)

---

## Estratégia de entrega

Recomendado **3 PRs pequenos** (menor risco de review). Este arquivo traz o **PR 1/3** (core API); títulos dos demais no final.

---

## PR 1/3 — Admin API auth (principal)

### Título

```
fix(auth): substituir admin-token-123 por verifyAdminToken nas rotas /api/admin
```

### Branch

```
fix/post-soak-255-auth-admin-api
```

### Corpo

```markdown
## Summary

Remove autenticação demo `admin-token-123` das rotas REST `app/api/admin/**` e centraliza validação JWT admin (`ADMIN_JWT_SECRET` / `lib/admin-token.ts`).

**Parte de #255** (auth hardening pós-soak)

## Objetivo de segurança (2 asserts)

| Cenário | Antes | Depois |
|---------|-------|--------|
| Sem token válido | 401 ou 200 com demo | **401** |
| JWT admin válido | N/A (demo) | **200** |

## Mudanças

- Novo: `apps/site-publico/lib/admin-api-auth.ts`
  - `verifyAdminApiRequest(request)` → payload admin ou `null`
- Substituir `checkAuth()` duplicado em:
  - `app/api/admin/website/pages/route.ts` (L4-9)
  - `app/api/admin/website/**` (side-rails, header, content, credentials, etc.)
- **Não** alterar `middleware.ts` (UI `/admin` já usa JWT)

## Arquivos de referência (pré-change)

- Demo token: `pages/route.ts:8` → `token === 'admin-token-123'`
- Cookie demo: `lib/advanced-auth.ts:187-201` → **fora deste PR** (PR 2/3)

## Test plan

| # | Request | Esperado |
|---|---------|----------|
| 1 | `GET /api/admin/website/pages` sem Authorization | **401** |
| 2 | `GET` com `Bearer admin-token-123` | **401** |
| 3 | `GET` com JWT admin válido (login admin) | **200** |
| 4 | `run-api-p0-round1.ps1` | **8/8** (A6 atualizado: 401 sem token) |

## Evidência obrigatória

| Artefato | Conteúdo |
|----------|-----------|
| `API-P0-SUMMARY.tsv` | A6 = 401 sem token; 200 com JWT |
| `A6.log` | HTTP codes |
| `auth-hardening-smoke.md` | Tabela cenário → status |
| Lista rotas | Paths migrados de `checkAuth` |

## Non-goals

- Refatorar UI admin / hooks `useWebsiteData*`
- S1 CRM `:5000`
- Mudanças Docker / `.env` soak

## Rollback

Revert deste PR; re-smoke API P0.

## Ordem

#256 → #250/#251 → #252 → **este PR** → PR 2/3 login → PR 3/3 cleanup hooks
```

---

## PR 2/3 — Login 401/503

### Título

```
fix(auth): login retorna 401/503 em vez de 500 genérico
```

### Branch

```
fix/post-soak-255-auth-login
```

### Corpo (resumo)

- `apps/site-publico/app/api/auth/login/route.ts`
  - Credencial inválida → **401** (já OK no happy path)
  - `catch`: distinguir erro DB (`queryDatabase`) → **503** + log; não expor stack
- Teste: PG down controlado → **503**, nunca **500** para smoke inválido

**Evidência:** `A3.log`, linha em `API-CONTRACT-MATRIX.md` (A3 401 inválido; 503 infra)

---

## PR 3/3 — Cleanup demo (opcional / menor prioridade)

### Título

```
chore(auth): restringir admin-token-123 a dev flag
```

### Branch

```
chore/post-soak-255-auth-dev-flag
```

- `advanced-auth.ts` cookie demo só se `NODE_ENV=development` && `ALLOW_DEMO_ADMIN=true`
- Fallbacks em hooks/components → remover ou guard por env
- Atualizar `tests/e2e/admin-crud.spec.ts` para JWT real

---

## Contrato API (atualizar no PR 1 ou PR 2)

`docs/evidence/g4-kickoff/API-CONTRACT-MATRIX.md`:

| ID | Antes | Depois |
|----|-------|--------|
| A6 | 200 com demo token | **401** sem token; **200** com JWT admin |

`run-api-p0-round1.ps1` / `.sh`: critério A6 alinhado.

---

## Checklist antes de abrir PR 1/3

- [ ] G4 completo GO (#256)
- [ ] #250 rede estável (recomendado)
- [ ] #252 healthcheck feito (recomendado)
- [ ] `ADMIN_JWT_SECRET` definido no compose `site-publico`

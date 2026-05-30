## Status
**READY-TO-IMPLEMENT** — executar somente **após** fim do soak, **#256** GO e preferencialmente após **#252**.

## Trilha e evidência
- [TRILHA-PARALELA-POS-SOAK.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- [TRILHA-B-255-auth-evidence.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/issues/TRILHA-B-255-auth-evidence.md)

## Prioridade | Impacto
**P1** | Token demo em APIs admin; login pode retornar **500** em falha de infra.

## Objetivo de segurança (2 asserts — admin API)

| Cenário | Esperado |
|---------|----------|
| **Sem token válido** (`GET /api/admin/website/pages` sem Bearer / Bearer inválido) | **401** |
| **Com JWT admin válido** (emitido via `ADMIN_JWT_SECRET` / fluxo admin login) | **200** |

Hoje: Bearer `admin-token-123` → **200** (`pages/route.ts:4-9` e ~14 rotas) — **remover** em produção.

## Login (`POST /api/auth/login`)

| Cenário | Esperado |
|---------|----------|
| Credencial inválida (email/senha errados) | **401** |
| Indisponibilidade DB / erro infraestrutura | **503** |
| **Nunca** para fluxo esperado de smoke | **500** |

Referência atual: `login/route.ts:152-160` (`catch` → 500).

## Non-goals (escopo fora desta issue)

- **Não** refatorar UI/admin inteira (componentes, hooks, CMS visual).
- **Não** mexer em **S1** (CRM legado `:5000`).
- **Não** alterar stack Docker / compose (ver #250, #252).

## Dependência de ordem

| Regra | Detalhe |
|-------|---------|
| **Bloqueada por** | Fim do soak `2026-06-02T09:03:09-03:00` + **#256** G4 gate GO |
| **Sequência recomendada** | **#256** → **#252** infra health → **#255** (esta) |
| **Durante soak** | Zero mudança em `.env`, PG, containers monitorados |

## Implementação (4 PRs sugeridos)

1. `lib/admin-api-auth.ts` — `verifyAdminApiRequest()` (JWT admin)
2. Substituir `checkAuth` duplicado em `app/api/admin/**`
3. `login/route.ts` — 401 / 503; remover 500 genérico
4. `API-CONTRACT-MATRIX.md` + `run-api-p0-round1` — A6: sem token → 401

## Critérios de aceite

- [ ] Assert admin: sem JWT → **401**; com JWT admin válido → **200**
- [ ] Assert login: inválido → **401**; DB down (teste controlado) → **503**
- [ ] Zero `admin-token-123` em rotas API fora de testes com flag dev explícita
- [ ] API P0 re-smoke **8/8** com matriz atualizada
- [ ] `ADMIN_JWT_SECRET` obrigatório documentado no compose

## Evidência obrigatória no PR

| Artefato | Conteúdo |
|----------|----------|
| `docs/evidence/g4-kickoff/logs/API-P0-SUMMARY.tsv` | Pós-change: 8/8; A6 sem token = 401 |
| `logs/A3.log`, `A6.log` | Trechos HTTP + body (ou só A* se FAIL) |
| `auth-hardening-smoke.md` | Tabela: cenário → status esperado → obtido |
| Lista de rotas migradas | Paths `app/api/admin/**` que deixaram `checkAuth` demo |

## Relacionadas
#195 `area/auth` `security` #256 #252

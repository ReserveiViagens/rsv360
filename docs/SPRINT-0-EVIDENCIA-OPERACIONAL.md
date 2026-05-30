# Sprint 0 — Evidência operacional e técnica (RSV360)

**Data da coleta:** 28/05/2026  
**Repositório canônico (S2):** `ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo`  
**Clone operacional:** `s2-pr232-validate` — WSL: `/mnt/c/Users/RSV 360/Documents/s2-pr232-validate`  
**Escopo:** Inventário factual do que existe e roda **hoje** — sem refactor, sem fusão de sistemas, sem mudança de auth/multi-tenant/IA.

**Referência de visão-alvo:** `docs/integracao-v3/sprint-0/PLANO-MESTRE-v3-CONSOLIDADO.md` (quando versionado no repo).

**Perfil canônico (aprovado 28/05/2026):** **Docker Compose** — backend API em **`:3002`**, frontends **`:3000`–`:3006`**, Postgres **`:5432`**, Redis **`:6379`**. Dev nativo `:3007` **não** é perfil canônico até nova decisão.

**Modernização:** **NOGO** até gates **G0–G4** verdes.

**Evidências G2:** `docs/evidence/2026-05-28/` — **G2-S2: GO (20/20)** | **G2-integrado: GO (21/21)** — 29/05/2026. Detalhe: `G2-RESULTADO.md`, `GATES-v3.md` (quando presente em `docs/integracao-v3/sprint-0/`).

**Atualização pós-merge #243 (29/05/2026):** bloco **G4-API P0 = GO** (8/8 rotas testáveis OK no re-smoke), com evidência em `docs/evidence/g4-kickoff/`.

---

## Sumário executivo

| Pergunta | Resposta em uma linha |
|----------|----------------------|
| 1. O que existe? | Monorepo parcial: 5 apps Next + 1 backend Express + módulos TS em `server/` + pasta NTX/leilões + observabilidade documentada |
| 2. O que roda localmente? | **Docker Compose** (backend :3002, 4 frontends, PG, Redis); dev nativo :3007 **não** está ativo |
| 3. Apps/portas/vars/health? | Ver §3 — canônico **Docker :3002**; `:3007` apenas legado/dev opcional |
| 4. Riscos que bloqueiam modernização? | Ver §5 — doc drift, React split, monorepo root ausente, frontends Docker `unhealthy` |
| 5. Gates mínimos pré-upgrade? | Ver §6 |
| 6. Jul/2026 1× TITAN defensável? | **Não**, com evidência atual — ver §7 |
| 7. Hard stop? | Ver §8 |

---

## 1. O que existe hoje?

### 1.1 Aplicações (`apps/`)

| App | Pasta | Stack (package.json) | Porta dev |
|-----|-------|----------------------|-----------|
| Site público B2C + CMS | `apps/site-publico` | Next **14**, React **18.3** | 3000 |
| Dashboard turismo | `apps/turismo` | Next **15.5**, React **19.2** | 3005 |
| Admin operacional | `apps/admin` | Next **15.5**, React **19.2** | 3004 |
| Portal hóspede | `apps/guest` | Next **15** (alinha admin/turismo) | 3006 |
| Shared (lib) | `apps/shared` | Utilitários | — |

**Não presente neste clone:** `apps/atendimento-ia` (citado em docs antigos).

### 1.2 Backend

| Item | Detalhe |
|------|---------|
| Entrada | `backend/server.js` → `createApp()` em `backend/app.js` |
| Stack | Express **5.2**, Drizzle ORM, PostgreSQL (`pg`), `tsx` |
| Porta default código | `process.env.PORT \|\| **3001**` |
| Health | `GET /health`, `GET /health/security` |
| Testes | Jest — **7 suites, 16 testes OK** (28/05/2026) |

### 1.3 Módulos de domínio (`server/modules/`)

Módulos TypeScript **separados** do processo `backend/server.js` (importados em boot):

`cloud`, `communication`, `crm`, `guest-portal`, `housekeeping`, `marketing`, `multi-property`, `pricing`, `revenue`, `tracking`

### 1.4 Pacotes compartilhados

`packages/shared` — workspace documentado; **sem `package.json` na raiz** neste clone.

### 1.5 O que a documentação promete mas **não existe** aqui

| Item | Status neste clone |
|------|-------------------|
| `package.json` raiz (npm workspaces) | **Ausente** |
| `backend/microservices/` (32 serviços, portas 6000–6031) | **Ausente** |
| Backend legado :5000 / :5002 | **Ausente** |
| CRM em `Downloads\...` | Repositório **externo** |

### 1.6 Outros artefatos no repo

- `docker-compose.yml` — stack containerizada
- `monitoring/` — Prometheus, Grafana, Alertmanager (compose)
- `sre-agents/` — agentes Python (porta ~5050 em docs)
- `NTX + OTAS LEILÔES+ FLASHDEALS/` — módulo leilões/flash deals (fora do fluxo 5 serviços)
- `database/` — migrations/scripts SQL
- Centenas de `.md` de correção/histórico (alto ruído documental)

### 1.7 Governança de stack já decidida (não é Sprint 0 de implementação)

- **ADR-0001** (2026-04-02): split controlado — `turismo` Next 15/React 19; `site-publico` Next 14/React 18 até janela dedicada.
- **SOLUCAO_UNICA_ATUALIZACAO_STACK_2026-04-02.md**: lint executável; **build/type-check/smoke ainda não fechados** como gate de release.

---

## 2. O que roda localmente? (evidência 28/05/2026)

### 2.1 Modo ativo nesta máquina: **Docker Compose**

```
docker ps (resumo)
rsv360-backend        Up, healthy     0.0.0.0:3002->3002
rsv360-site-publico   Up, unhealthy    0.0.0.0:3000->3000
rsv360-admin          Up, unhealthy    0.0.0.0:3004->3004
rsv360-turismo        Up, unhealthy    0.0.0.0:3005->3005
rsv360-guest          Up, unhealthy    0.0.0.0:3006->3006
rsv360-postgres       Up, healthy      0.0.0.0:5432->5432
rsv360-redis          Up               0.0.0.0:6379->6379
```

**Observação:** vários containers órfãos/antigos também `Up` (prometheus/grafana sem bind em 9090/3007 no host).

### 2.2 Modo dev documentado (5 terminais `npm run dev`): **não ativo**

| URL | Resultado HTTP |
|-----|----------------|
| http://localhost:3007/health | **Falha** (conexão recusada) |
| http://localhost:3002/health | **200 OK** |
| http://localhost:3000 | **200 OK** |
| http://localhost:3004 | **200 OK** |
| http://localhost:3005/login | **200 OK** |
| http://localhost:3006 | **200 OK** |
| http://localhost:3007 (Grafana) | **Falha** |
| http://localhost:9090 | **Falha** |

**Conclusão:** o host responde nos frontends via Docker, mas o perfil “dev nativo :3007” **não está rodando**. Há **drift** entre documentação (`SERVICOS-DEV.md`, `SCRIPT-START-5-SERVICOS.ps1`) e runtime real.

### 2.3 Runtime local

- Node: **v22.22.0**
- npm: **11.9.0**

---

## 3. Mapa consolidado: apps, portas, variáveis, health, dependências

### 3.1 Matriz de portas (fontes conflitantes explicitadas)

| Porta | Uso real (28/05) | Documentação dev | Docker Compose |
|-------|------------------|------------------|----------------|
| 3000 | Site (Docker) ✓ HTTP 200 | site-publico dev | site-publico |
| 3002 | **Backend ativo** ✓ /health 200 | — | backend (`PORT=3002`) |
| 3004 | Admin (Docker) ✓ | admin dev | admin |
| 3005 | Turismo (Docker) ✓ | turismo dev | turismo |
| 3006 | Guest (Docker) ✓ | guest dev | guest |
| 3007 | **Livre no host** | Backend dev + Grafana | Grafana → 3007:3000 |
| 3001 | Default em `server.js` | legado | — |
| 5432 | Postgres (Docker + possível instância local PID 3904) | DB | postgres |
| 6379 | Redis (Docker) | cache | redis |
| 9090/9093 | Containers sem publish no host | Prometheus/Alertmanager | sim (não expostos agora) |

### 3.2 Health checks

| Alvo | Endpoint / probe | Status observado |
|------|------------------|------------------|
| Backend Docker | `GET /health` :3002 | **200**, container `healthy` |
| Backend dev doc | `GET /health` :3007 | **offline** |
| Site/Admin/Turismo/Guest | HTTP raiz ou `/login` | **200 no host**, containers `unhealthy` (probe interno `connection refused`) |
| Postgres | `pg_isready` | `healthy` |
| Frontends Docker | (sem healthcheck no compose) | unhealthy por imagem/processo interno |

### 3.3 Variáveis de ambiente (referência — sem valores secretos)

| Camada | Arquivo típico | Variáveis críticas |
|--------|----------------|-------------------|
| Raiz exemplo | `.env.example` | `POSTGRES_*`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL` |
| Site público | `apps/site-publico/.env.example` | `DB_*`, `NEXT_PUBLIC_API_URL` (**aponta :5000**), `OPENAI_API_KEY`, Mercado Pago |
| Site público local | `.env.local` | presente (não versionado) |
| Turismo | `.env.local` | presente |
| Backend Docker | compose | `DATABASE_URL`, `JWT_SECRET`, `PORT=3002`, `REDIS_DISABLED=true` |
| Frontends Docker | compose anchor | `NEXT_PUBLIC_API_URL=http://localhost:3002` |

**Risco:** `site-publico/.env.example` usa API `:5000`; compose usa `:3002`; dev doc usa `:3007`.

### 3.4 Dependências de infra

| Dependência | Obrigatória para | Estado |
|-------------|------------------|--------|
| PostgreSQL 16 | Backend, site (API routes diretas PG) | Docker healthy |
| Redis 7 | Cache/sessões (quando habilitado) | Docker up; backend compose desabilita Redis |
| Mercado Pago / Stripe | Pagamentos | tokens placeholder no compose |

### 3.5 Dependências entre serviços (ordem de subida)

```
postgres (healthy) → backend (healthy) → frontends
prometheus → depende backend
grafana → depende prometheus
```

---

## 4. Perfil canônico aprovado: Docker

| Critério | Valor canônico |
|----------|----------------|
| Backend API | **http://localhost:3002** — `GET /health` |
| Site público | :3000 |
| Admin | :3004 |
| Turismo | :3005 |
| Guest | :3006 |
| Postgres / Redis | :5432 / :6379 |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3002` |

**Dev nativo (5 terminais, backend :3007):** legado — não usar para gates G0–G4 nem para decisão de modernização.

**Pendência documental:** alinhar `SERVICOS-DEV.md`, `CODEX-AMBIENTE-LOCAL.json` e `apps/site-publico/.env.example` ao perfil Docker.

---

## 5. Riscos que bloqueiam modernização (priorizados)

| # | Risco | Impacto | Evidência |
|---|-------|---------|-----------|
| R1 | **Doc drift** (portas, paths, clones) | Chamadas API falham silenciosamente | :3007 vs :3002 vs :5000 |
| R2 | **React/Next split** sem gate único | Regressões em site-publico ao subir React 19 | ADR-0001 + versões package.json |
| R3 | **Sem `package.json` raiz** | Workspaces/npm scripts oficiais quebrados | `Test-Path package.json` = false |
| R4 | **Microserviços fantasma** | Planejamento baseado em 32 serviços inexistentes | `ONDE_PARAMOS.md` vs pasta ausente |
| R5 | **Frontends Docker unhealthy** | Falso negativo em orquestração/CI local | docker inspect |
| R6 | **Postgres duplo em 5432** | Migrations/schema imprevisíveis | netstat PID 12728 + 3904 |
| R7 | **Git sem commits** | Sem baseline reprodutível | `git status` inicial |
| R8 | **Centenas de MDs contraditórios** | Decisões erradas por doc obsoleta | raiz do repo |
| R9 | **site-publico com PG direto + backend** | Dupla fonte de verdade de dados | inventário arquitetura |
| R10 | **Gates build/type-check não comprovados** | Upgrade stack inseguro | SOLUCAO_UNICA doc |

---

## 6. Gates mínimos antes de qualquer upgrade de stack

Todos devem passar **no perfil canônico escolhido** (dev ou docker), com log arquivado em `docs/evidence/`.

### Gate G0 — Baseline reprodutível
- [ ] `package.json` raiz restaurado ou decisão formal “multi-repo”
- [ ] Um único mapa de portas commitado
- [ ] Primeiro commit baseline com hash registrado

### Gate G1 — Infra
- [ ] Postgres único em 5432 (sem conflito de instância)
- [ ] `GET /health` backend 200 na porta canônica
- [ ] Redis: estado documentado (on/off) consistente com backend

### Gate G2 — Qualidade por workspace
```bash
npm run lint --workspaces --if-present
npm run type-check --workspaces --if-present
npm run build --workspaces --if-present
```
- [ ] 5 apps + backend: lint OK
- [ ] 5 apps + backend: type-check OK
- [ ] 5 apps + backend: build OK

### Gate G3 — Testes
- [ ] `backend`: `npm test` (já **16/16 OK** em 28/05)
- [ ] `site-publico`: smoke Playwright mínimo (login, home, CMS read)
- [ ] Turismo: `/login` sem loop AuthContext

### Gate G4 — Contrato API
- [ ] `NEXT_PUBLIC_API_URL` alinhado em todos os `.env*`
- [ ] Matriz rotas críticas (auth, pagamentos, CMS) testada manual ou contract test

### Gate G5 — Docker (se for perfil de deploy)
- [ ] Todos os containers `healthy` ou healthcheck removido com justificativa
- [ ] `docker compose up` sobe sem órfãos conflitantes

**Regra:** nenhum upgrade Node/React/Next/Express/Drizzle até **G0–G3** verdes.

---

## 7. Ambiente alvo Julho/2026 em 1× TITAN — defensável?

**Premissa:** “1× TITAN” = um único host (servidor dedicado ou VM única) rodando stack completa RSV360 para produção/homologação em jul/2026, conforme visão do PLANO-MESTRE-v3-CONSOLIDADO.

### Veredito: **NÃO defensável hoje** (com evidência coletada)

| Critério defensável | Situação atual |
|-------------------|----------------|
| Um perfil de deploy | Dois perfis (Docker :3002 vs dev :3007) |
| Health end-to-end confiável | Frontends Docker unhealthy; observabilidade não exposta no host |
| Monorepo governado | Sem package.json raiz; workspaces não verificáveis |
| Testes de release | Só backend unitário comprovado |
| Capacidade única máquina | Site-publico + 4 frontends + API + PG + Redis + monitoring — **viável em hardware**, mas **não validado** (sem load test recente neste sprint) |
| Segurança baseline | JWT placeholder no compose; secrets não auditados nesta sprint |
| Plano mestre versionado no repo | Arquivo **não localizado** — impossível traçar requisitos TITAN |

### O que seria necessário para tornar defensável (sem implementar ainda)
1. Fechar gates G0–G5
2. Dimensionamento: RAM/CPU/disco para PG + 4 Next + API + Redis (+ monitoring opcional)
3. Runbook único: backup PG, restore, rollback de imagem
4. Inventário de domínios reais em produção (NTX/leilões incluso ou excluído?)
5. Anexar `PLANO-MESTRE-v3-CONSOLIDADO` ao repo em `docs/PLANO-MESTRE-v3-CONSOLIDADO.md`

---

## 8. Ponto exato de hard stop

Parar **qualquer** trabalho de modernização (stack, fusão, auth, multi-tenant, IA/agentes) se ocorrer **qualquer** item abaixo:

| ID | Condição de parada | Ação |
|----|-------------------|------|
| HS-1 | `GET /health` falha na porta canônica por >30 min após subida | Não avançar upgrade; corrigir infra |
| HS-2 | `npm run build` falha em qualquer workspace ativo | Stop — corrigir build antes de bump de versão |
| HS-3 | Conflito de porta não resolvido (ex.: 5432 duplo) | Stop — resolver DB único |
| HS-4 | `NEXT_PUBLIC_API_URL` divergente entre apps | Stop — alinhar contrato |
| HS-5 | Tentativa de ativar 32 microserviços sem pasta no repo | Stop — replanejar escopo (monólito primeiro) |
| HS-6 | Deploy em TITAN com containers `unhealthy` | Stop — não promover |
| HS-7 | Escopo do PLANO-MESTRE sem rastreio ao arquivo em `docs/integracao-v3/sprint-0/` | Stop — atualizar baseline de integração |
| HS-8 | Mudança de auth/multi-tenant/IA sem G0–G4 verdes | **Hard stop absoluto** (regra de negócio desta sprint) |

**Frase de parada:** *“Sem evidência verde em G0–G4, o PLANO-MESTRE permanece visão — não execução.”*

---

## 9. Próximos passos Sprint 0 (somente evidência, sem refactor)

1. ~~Perfil canônico~~ → **Docker :3002** (aprovado).
2. ~~Executar G2~~ — concluído (**GO 21/21**, 29/05/2026, após merge de #238 e #239).
3. Referência plano: `docs/integracao-v3/sprint-0/PLANO-MESTRE-v3-CONSOLIDADO.md`.
4. Resolver Postgres duplo em 5432 (identificar PID 3904).
5. Investigar healthcheck dos frontends Docker (connection refused interno) — PR [#242](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/242).
6. Arquivar ou mover MDs históricos da raiz para `docs/archive/` (reduzir ruído).

---

## 10. Comandos de revalidação rápida

```powershell
# Health
Invoke-WebRequest http://localhost:3002/health -UseBasicParsing
Invoke-WebRequest http://localhost:3000 -UseBasicParsing

# Docker
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Testes backend
cd backend; npm test

# Gates (quando package.json raiz existir)
npm run lint --workspaces --if-present
npm run type-check --workspaces --if-present
npm run build --workspaces --if-present
```

---

*Documento gerado como camada de evidência Sprint 0. Não autoriza refactor do PLANO-MESTRE-v3-CONSOLIDADO.*

---

## 11. Snapshot Pós-Merge #243 (29/05/2026)

### 11.1 Linha do tempo consolidada (main)

| Marco | Evidência |
|------|-----------|
| PR #232 (G3/T0b) | Merge em `main` |
| PR #239 (admin lint baseline) | Merge commit `03679401` |
| PR #238 (site-publico lint baseline) | Merge commit `ef72eba4` |
| Fechamento #237 + G2 final | `PASS=21 / FAIL=0 / SKIP=0` |
| PR #243 (G4-API rodada 2) | Merge commit `5e745cf5` (2026-05-29T23:06:35Z) |

### 11.2 Status de gates (snapshot)

| Bloco | Status |
|-------|--------|
| G2 estrito (S1+S2) | **GO** (21/21) |
| G3 segurança baseline | **GO** |
| G4-API P0 (smoke de contrato) | **GO** (rodada 2) |
| G4 completo (Trilha 0 + G1 + soak 72h + critérios finais) | **NOGO** |

### 11.3 Resultado API P0 (rodada 2)

| ID | Resultado | Nota |
|----|-----------|------|
| A1 | OK | |
| A2 | OK | |
| A3 | OK | |
| A4 | OK | |
| A5g | OK | |
| A5p | OK | |
| A6 | OK | |
| A7g | OK | |
| A7p | OK | |
| A8 | **SKIP** | CRM S1 `:5000` — fora do perfil canônico S2 |

**Contagem:** 8/8 rotas testáveis **OK**; 1 rota legado **SKIP** (não entra no denominador do gate P0).

### 11.4 Evidências de referência

- `docs/evidence/g4-kickoff/API-CONTRACT-MATRIX.md`
- `docs/evidence/g4-kickoff/API-P0-ROUND2-REPORT.md`
- `docs/evidence/g4-kickoff/logs/API-P0-SUMMARY.tsv`

### 11.5 Pendências para próximo gate

1. ~~G1 dual-system com evidência~~ → rodada 1 em `docs/evidence/g1-dual-system/` (**GO condicional**; ver §12).
2. ~~Trilha 0 (prep)~~ → pacote base em `docs/evidence/trilha-0/` (branch `chore/trilha-0-prep`).
3. Soak operacional de 72h — plano em `docs/evidence/trilha-0/SOAK-72H-PLAN.md` (após Trilha 0 GO).
4. Somente após esses itens: promover **G4 completo = GO**.

---

## 12. Snapshot G1 dual-system (rodada 1 — 30/05/2026)

**Evidência:** `docs/evidence/g1-dual-system/G1-DUAL-SYSTEM-REPORT.md`

| Bloco | Status |
|-------|--------|
| G1 S2 (`:3002`, `:3000`, PG/Redis healthy) | **GO** |
| G1 S1 (`:5000` CRM) | **SKIP** (offline) |
| G1 rede Docker unificada | **GAP** |
| **G1 dual-system completo** | **NOGO** |

**Próximo:** subir S1 (`npm run dev` em `Crm-RSV-360`) + `docker compose -p rsv360 up -d --build` + re-smoke G1.

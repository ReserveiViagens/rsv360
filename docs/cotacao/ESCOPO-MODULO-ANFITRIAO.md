# Escopo — Módulo /anfitriao

Fonte da verdade técnica do módulo privado de parceiros (anfitriões e corretores) no Turismo `:3005`.
Espelho operacional recomendado no Notion: **Análise de escopo — módulo /anfitriao**.

**Repositório:** `rsv360`  
**Sequência de PRs:** 21.0 → 22A → 22B → 22C → 23 → 24A → 24B → 24C

---

## 1. Decisões travadas (não reabrir)

### Papéis e UI

- **Um único módulo** privado `/anfitriao` no Turismo (`:3005`), atrás de login + role.
- **Não** criar app `/corretor` separado — mesmas telas; diferença = **escopo de ownership**.
- **Corretor:** vê unidades dos proprietários na `carteira_corretor` (N:N) — **PR 24A**.
- **Anfitrião/proprietário:** vê só `proprietario_id = user.id`.
- **Staff** (`admin`, `manager`, `user`): operação em `:3004`/`:3005`; import massa; aprovação.

### Publicação: `status_publicacao` × `dados_completos`

| Campo | Papel |
|-------|--------|
| **`status_publicacao`** | **Fonte da verdade** — único gate do wizard Passo 2 |
| **`dados_completos`** | **Legado/derivado** — pré-condição técnica; **nunca** critério de publicação |

**Enum unidade (travado):** `rascunho` → `completo` → `em_aprovacao` → `publicado` | `rejeitado`

**Wizard Passo 2** (`server/modules/acomodacoes/services/acomodacoes.service.ts`):

```text
WHERE hotel_id = :hotelId
  AND ativo = true
  AND status_publicacao = 'publicado'
```

**Regra de escrita `dados_completos`:**

```text
dados_completos = (status_publicacao IN ('completo','em_aprovacao','publicado'))
```

### Anti-overbooking (duas camadas — não misturar)

| Camada | Tabela | Fase | Granularidade |
|--------|--------|------|---------------|
| Lock wizard | `reservas_cotacao` | Já existe | Hotel/oferta (`parceiroId` + `ofertaId`) |
| Calendário unidade | `disponibilidade_acomodacao` | **PR 24C** | `acomodacao_id` + `data` |

Nesta fase: 1 unidade = 1 `proprietario_id` + `UNIQUE(codigo_externo)` + corretor edita a **mesma linha** (não cópia).

### Recortes complementares

**Adiado (tabelas/API):**

1. `carteira_corretor` → **PR 24A**
2. `disponibilidade_acomodacao` → **PR 24C**
3. UI `/anfitriao/*` → **PR 24B**

**Execução no 22A** (tabela `acomodacoes` vazia = rename grátis):

3. `anfitriao_id` (uuid) → `proprietario_id` (integer FK `users.id`) + `UNIQUE(codigo_externo)`
4. Coluna espelho `empreendimentos.hotel_id` (= slug wizard) para `resolverHotel` (22C)

### Import 436 (inventário casa)

- `proprietario_id` = **conta técnica Reservei** (criar `users` dedicado no PR 23)
- Staff bulk: **`status_publicacao = 'publicado'`** (pula `em_aprovacao`)
- **Ordem obrigatória:** 22A → 22B → 22C → 23

---

## 2. Modelo de dados (pós-22A)

### Tabela `empreendimentos`

```sql
empreendimentos (
  id              serial PRIMARY KEY,
  slug            text UNIQUE NOT NULL,
  hotel_id        text UNIQUE NOT NULL,  -- espelho wizard (= slug estável)
  nome_oficial    text NOT NULL,
  nome_normalizado text NOT NULL,
  tipo            text DEFAULT 'condominio',
  cidade          text DEFAULT 'Caldas Novas',
  status          text NOT NULL DEFAULT 'aprovado',  -- pendente|aprovado|rejeitado
  criado_por      integer REFERENCES users(id),
  website_content_id text NULL,
  metadata        jsonb,
  ativo           boolean DEFAULT true,
  criado_em, atualizado_em
)
```

Migration: `backend/drizzle/0022_empreendimentos_parceiros.sql`  
Schema Drizzle: `backend/src/db/schema/empreendimentos.ts`

### Alterações `acomodacoes` (22A)

- `proprietario_id integer REFERENCES users(id)` (substitui `anfitriao_id` uuid)
- `status_publicacao text NOT NULL DEFAULT 'rascunho'`
- `metadata jsonb` (fonte/obs do CSV)
- `UNIQUE(codigo_externo)` partial index (`WHERE codigo_externo IS NOT NULL`)
- Manter `hotel_id text` — deve igualar `empreendimentos.hotel_id`

### Tabela `carteira_corretor` (PR 24A — adiada)

```sql
carteira_corretor (
  corretor_id     integer REFERENCES users(id),
  proprietario_id integer REFERENCES users(id),
  status          text DEFAULT 'ativo',
  PRIMARY KEY (corretor_id, proprietario_id)
)
```

### Regra de acesso (PR 24A)

```text
pode_ver(unidade) :=
  unidade.proprietario_id = :userId
  OR EXISTS (carteira_corretor WHERE corretor_id = :userId
             AND proprietario_id = unidade.proprietario_id AND status = 'ativo')
  OR :role IN ('admin','manager')
```

### Roles

- `users.role` ∈ `admin`, `manager`, `user`, `anfitriao`, `corretor`
- Registro público: **não** inclui `anfitriao`/`corretor` — criação só por admin/staff (`register.service.js`)

---

## 3. Workflow de aprovação

| Objeto | Fluxo |
|--------|--------|
| Empreendimento | staff cria OU parceiro solicita → `pendente` → staff → `aprovado` |
| Unidade | parceiro completa → `em_aprovacao` → staff → `publicado` (wizard) |
| Inventário 436 | staff bulk `publicado` direto |

Estados da unidade: `rascunho` → `completo` → `em_aprovacao` → `publicado` | `rejeitado` (rejeitado volta a `completo` após correção).

---

## 4. Matriz de permissões

| Ação | admin | manager | user (staff) | corretor | anfitrião |
|------|:-----:|:-------:|:------------:|:--------:|:---------:|
| Import massa (436) | sim | sim | sim | — | — |
| Import próprio (≤50) | sim | sim | sim | carteira | suas |
| Listar/editar minhas unidades | * | * | — | carteira | suas |
| Completar → enviar aprovação | — | — | — | sim | sim |
| Aprovar unidade/empreendimento | sim | sim | — | — | — |
| Solicitar novo empreendimento | — | — | — | sim | sim |
| Atribuir dono / carteira | sim | sim | — | — | — |

\*staff com filtro/impersonação auditável.

---

## 5. Sequência de PRs

| PR | Escopo | Depende de |
|----|--------|------------|
| **21.0** | Boot `cotacao-publica` + `configuracoes` em `server/app.ts` | — |
| **22A** | Migration 0022 + modelo parceiros + `listarDisponiveis` → `publicado` | 21.0 |
| **22B** | Sync ~60 condomínios CSV + `hotel_id` espelho | 22A |
| **22C** | `resolverHotel` via `empreendimentos.hotel_id` + `fonte`/`obs` | 22B |
| **23** | Import 436 + bulk `publicado` + conta Reservei | 22C |
| **24A** | `carteira_corretor` + `/minhas` + API aprovação | 22A, 23 |
| **24B** | UI Turismo `/anfitriao/*` MVP | 24A |
| **24C** | Import parceiro ≤50 + `disponibilidade_acomodacao` | 24B |

### DoD por frente

| # | Frente | Verde quando |
|---|--------|--------------|
| 21.0 | Boot | `GET /api/v1/cotacao-publica/health` → 200; BFF cotacao não 404 |
| 22A | Migration | `empreendimentos` + `proprietario_id` + `status_publicacao` + UNIQUE codigo |
| 22B | Sync 60 | ~60 rows `empreendimentos`; `hotel_id` espelho preenchido |
| 22C | Import resolver | `resolverHotel` usa `empreendimentos.hotel_id`; fonte/obs persistidos |
| 23 | Import 436 | ≈436 rows; wizard passo 2 com `publicado` |
| 24A | API parceiro | `/minhas` + carteira + 403 cross-owner |
| 24B | UI | `/anfitriao` MVP navegável |
| 24C | Fase 2 | calendário disponibilidade + import ≤50 |

---

## 6. UI prevista (PR 24B)

| Tela | Rota | Função |
|------|------|--------|
| Dashboard | `/anfitriao` | KPIs: total, incompletas, em aprovação, publicadas |
| Minhas unidades | `/anfitriao/unidades` | Lista paginada (escopo carteira ou proprietário) |
| Editar | `/anfitriao/unidades/[id]` | Preço, mídia, amenidades → `completo` → enviar `em_aprovacao` |
| Perfil | `/anfitriao/perfil` | Leitura dados parceiro |

Login redirect: `anfitriao`/`corretor` → `/anfitriao`; staff → `/dashboard`.

---

## 7. Não fazer

- Sistema fora do monorepo
- App `/corretor` separado
- `enterprises`/`properties` legado para import PR 19
- Editar migrations 0013–0021
- Import 436 antes de 22A
- Misturar `reservas_cotacao` com `disponibilidade_acomodacao` nesta fase
- Publicar no wizard via `dados_completos` alone

---

## 8. Referências de código

| Área | Caminho |
|------|---------|
| Boot módulos | `server/app.ts` |
| Wizard Passo 2 | `server/modules/acomodacoes/services/acomodacoes.service.ts` |
| Import inventário | `server/modules/acomodacoes/import/` |
| Schema acomodações | `backend/src/db/schema/acomodacoes.ts` |
| Schema empreendimentos | `backend/src/db/schema/empreendimentos.ts` |
| Migration 22A | `backend/drizzle/0022_empreendimentos_parceiros.sql` |
| Turismo (UI futura) | `apps/turismo` |

---

## 9. Pendências e etapas operacionais (§11)

### 11.1 Dados — 17 publicados + 3 prédios

- **Fechada**: **17 rascunhos** publicados em 2 jul 2026 (`044de955`); preços REF aguardam tarifário real.
- **Fechada**: **3 prédios** agrupados (`231cdaee`, `agrupar-3-predios.mjs`).

### 11.2 PATCH legado

- **Fechada** (2 jul 2026): `PATCH /anfitriao/:id` removido; canônica `/anfitriao/unidades/:id`.

### 11.3 Fase 2 (backlog)

- **`codigo_pms` COMMITADO**: `c80d180e` (migration `0030_codigo_pms.sql` + schema + journal + snapshot + hook inicial).
- **Pendentes**:
  - Comissões marketplace — tabelas existem; integração pendente.
  - Integrar `isDataBloqueada` no fluxo de reserva (anti-overbooking por data).
  - Backfill Stays (preencher `codigo_pms`) — execução controlada após validação/approvação.

---

## 10. Plano de execução Cursor (§12)

### Etapa A — preços reais (flat)

- Bootstrap: `2d4bf107` (CSV simbólico `publicar_17_rascunhos.csv` — **não usar em prod**).
- UPDATE prod: `atualizar-precos-publicados.mjs` (`0c600cf4`) com guard `SIMBOLICO`.
- **Confirmado (3 jul 2026):** `data/etapa-a/precos_reais_17.csv` — 17 preços flat (`nota=confirmado`); ver tabela em `data/etapa-a/README.md`.
- Runbook + export: `export-precos-reais-17-xlsx.mjs`.

### Etapa A′ — tarifário dinâmico

- **Modelo híbrido Premium (9 jul 2026):** base 1q/2q + upgrade varanda opcional no Wizard (+R$ 80/noite); Premium âncora (ex. ALD-FAM) como produto topo — ver [`WIZARD-PREMIUM-HIBRIDO.md`](./WIZARD-PREMIUM-HIBRIDO.md)
- Inventário referência: `data/etapa-a/mapeamento-tipo-17-unidades.csv` (Notion *Inventário & Tarifário Reservei*)
- Migration: `0030_tarifario_dinamico.sql`
- Motor: `server/modules/acomodacoes/services/tarifa.service.ts` (`resolverTarifa`)
- API: `/api/v1/tarifas/*` (CRUD staff + simular com escopo 403)
- Seed: `backend/scripts/seed-tarifario.mjs` (sem regras de preço)
- Toggle global: `configuracoes_sistema.chave=tarifario` → `tarifario_dinamico_ativo` (default **false**)
- UI: `apps/turismo/pages/anfitriao/tarifas/`

### Etapas B/C/D

- **B** — 3 prédios: shipado.
- **C** — PATCH legado: shipado.
- **D** — PR 25 mapa: shipado (`0028`, `RoteiroMapa`).

### UI 24B/24C (complemento)

- `AnfitriaoRoleGuard` + redirect pós-login (`anfitriao-auth.ts`)
- `/anfitriao/importar` — preview/commit ≤50
- `/anfitriao/unidades/[id]/disponibilidade` — calendário
- Edição completa: amenidades, utensílios, mídia (JSON) em `unidades/[id].tsx`

---

## 11. CI / Segurança (§13)

§13 completa — status consolidado pós-fechamentos de Fase 5 e Fase 2.

### Segurança / SAST

- **CodeQL**: `build-mode: none` (`9d049bfc`)
- **Typecheck estrito**: issue **#43** (backlog)

### Fila (cadeia) — Fase 5 (Playwright gate)

**Fase 5 FECHADA**: run `28910403265` (5/5 verdes) — fix final `a2536a42`.

**Cadeia completa (registro):**

- Billing (regularizado)
- Jest deadlock: `f0a2a49b`
- Migrate/seed `DATABASE_URL` (5433): `e605efd0`
- Login 503→429 (refresh_tokens + rate limit): `4937d13e` + `4f1e9fb9`
- SSR Turismo 500 (Turbopack symlinks no Docker): `88a6738b`
- App-layer (CORS `:3005` + import estático `objecao`): `a2536a42` → run `28910403265` (5/5)

### Fase 2 — `codigo_pms`

**COMMIT**: `c80d180e` — passou sem regressão no gate Fase 5.

- Fase 5 — run `28913338858`: 5/5 verdes
- CI — run `28913338782`: 4/4 verdes

### Higiene pré-deploy (não bloqueante, mas obrigatória antes de prod)

- **Secrets em logs de CI**: limpar/mascarar (LGPD/segurança).
- **CORS default**: `localhost:3005` no default serve para dev/CI; **em produção** a allowlist deve vir de `CORS_ORIGIN` (env).

---

## 12. Referências adicionais

| Área | Caminho |
|------|---------|
| Tarifário service | `server/modules/acomodacoes/services/tarifa.service.ts` |
| Tarifas API | `server/modules/acomodacoes/routes/tarifas.routes.ts` |
| Migration tarifário | `backend/drizzle/0030_tarifario_dinamico.sql` |
| Migration codigo_pms | `backend/drizzle/0030_codigo_pms.sql` |
| Seed tarifário | `backend/scripts/seed-tarifario.mjs` |
| Guard UI | `apps/turismo/components/AnfitriaoRoleGuard.tsx` |
| Hook reserva (Fase 2) | `server/modules/acomodacoes/services/disponibilidade-reserva.hook.ts` |


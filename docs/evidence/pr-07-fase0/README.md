# PR-07 Fase 0 — Inventário de input (injection / LFI / mass-assignment)

**Base:** `main @ 38688f98` (pós turismo auth T3)  
**Branch:** `security/pr-07-fase0`  
**Escopo:** read-only · **zero** alteração de runtime · só evidence neste diretório.

## Veredito executivo

| Tema | Resultado |
|------|-----------|
| **LFI `csvPath`** | **VIVO** — `POST .../acomodacoes/sync/empreendimentos-caldas` · `req.body.csvPath` → `readFileSync` sem sandbox · auth `admin\|manager\|user` (não só admin) |
| **LFI write/sendFile HTTP** | `res.sendFile` / `res.download` = **0** hits; writes = scripts CLI / não-HTTP |
| **SQL interpolado em payments** | **0 CRIT** — `sql.raw(` = **0**; `queryDatabase`/`pool.query` usam `$n` |
| **ORM** | Drizzle/pg parametrizado dominante → escopo de implementação **reduz** a LFI + mass-assignment + Zod efetivo |
| **Mass-assignment** | **HIGH** dispute/subscription/propostas; **MEDIUM** housekeeping; **spread** `...req.body` em relatorios/acomodacoes/tarifas |
| **Zod** | 1 schema **EFETIVO** (`.strict` + parse usado: guest-portal booking write); demais **PARCIAL** / `.passthrough()` / ausente nas críticas |
| **Query parser** | Sem `app.set('query parser')` → default **`extended` (qs)** — nested query objects possíveis |
| **NoSQL `$ne`** | N/A clássico (Postgres); residual = JSON não tipado + mass-assign + query nesting |
| **PARAR CRIT payments SQL** | **Não disparou** |

## Artefatos

| Arquivo | Conteúdo |
|---------|----------|
| `inventory.json` | Camada A mounts + disk-only + Camada B + Zod audit + query parser + estimativas |
| `grep-csvpath.json` | Path FS read+write+delete+sendFile (C1) · 85 hits · LFI HTTP confirmado |
| `grep-raw-sql.json` | 177 hits · `sql.raw` = 0 · CRIT payment = 0 |
| `grep-mass-assignment.json` | 337 hits · high-interest + cadeias conhecidas + spreads |

## Vinculantes

### ① Rotas / input
- Runtime ≈ **400–450** handlers montados (total on-disk routes ~620 inclui marketing/communication/cloud/pricing **não** registrados em `backend/app.js`).
- Órfãos em `app.js`: só `/health` + error/404 inline — resto via `app.use` / `register*Module`.

### ② LFI
- Vetor HTTP confirmado (role **user** incluída — I1).
- Ampliação C1: sem sendFile/download HTTP; writes em scripts.

### ③ SQL
- Sem `sql.raw(`; sem CRIT em payments.

### ④ Mass-assignment + pollution (C5)
- Cadeias HIGH documentadas; `{ ...req.body }` em 3+ rotas.

### ⑤ NoSQL / nested query (C4)
- Stack Postgres; parser `extended`; risco via filtros sem type-check.

### ⑥ Zod (C2)
| Schema | Classe |
|--------|--------|
| `PortalBookingUpdateSchema` | **EFETIVO** (único: `.strict()` + persist parse) |
| `gerarPropostaBodySchema` (`.passthrough()`) | **PARCIAL** |
| `roteiroAnalyticsBatchSchema` | **PARCIAL** |
| `comissoes*` (config + IA + aprovação + simular) | **PARCIAL** (parse/`safeParse` usado; field-pick em config; sem `.strict()`) |
| `fornecedores-hub` oferta* / configProposta | **PARCIAL** (adapters, não shield HTTP body) |
| `agentes` inline Zod | **PARCIAL** |
| pricing inline Zod | morto para boot Express (módulo não montado) |

### ⑦ Fatiamento proposto (ordem por risco)

| Fatia | Escopo | Estimativa |
|-------|--------|------------|
| **PR-07a** | LFI: remover/sandbox `csvPath` (+ testes traversal) | **2–4 arquivos**, 1 handler |
| **PR-07b** | Zod **efetivo** (`.strict` + persistir parse) + allowlist anti mass-assign em payments dispute/subscription, propostas, spreads acomodacoes/relatorios, gaps auth writes | **12–25 arquivos**, ~15–40 handlers · se >20 handlers → **07b1** auth+payments / **07b2** propostas+spreads |
| **PR-07c** | Mass-assign restante (housekeeping, crm/revenue/financeiro/…) só módulos **montados** | **20–50 arquivos**, ~50–150 handlers |

**Fora:** Upload → **PR-08** · Secrets/CI → **PR-09** · Frontend.

## Testes existentes (M3)

**0** testes dedicados a path traversal / injection payload / Zod `.strict` mass-assignment no backend. GO de implementação deve incluir asserts negativos.

## Headers (M4)

Nota apenas — spoof de role fechado no PR-01; não é escopo de patch do PR-07.

## Baselines (referência do tip — não re-executados nesta Fase 0)

`tsc` 0 · jest backend ~575 · BLOCK 0 · allowlist 3

## Próximo passo

Decisor / Orquestrador 1 auditam este inventário → emitem **GO de implementação** (provavelmente **07a** primeiro).  
Esta PR é **docs-only** — **PARAR na URL**, H0, sem merge automático.

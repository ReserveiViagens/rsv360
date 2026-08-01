# PR-07c1 — Housekeeping + CRM: anti mass-assignment + Zod `.strict()`

**Branch:** `security/pr-07c1-housekeeping-crm`  
**Base:** `main @ 40de59ea`  
**Estado:** PARAR na URL (H0 — nunca mergear pelo agente)

## Fase 0.5 (confirmação)

| Módulo | Handlers write com body | Params tipados (I2) | Contagem |
| --- | ---: | ---: | ---: |
| housekeeping | tasks 5 · checklists 2 · maintenance 5 · room-status 2 | todos `/:id` | **14** body + params |
| crm | guest 5 · campaigns 4 (+send SKIP body) · segments 3 · loyalty 5 | todos `/:id` | **17** body (+ SKIPs) |
| **Total modificados** | | | **~31** (≤40 — OK) |

**PARAR >40:** não disparou.

### SKIPs explícitos (sem `req.body` cru)

- HK: `PUT .../start` (só params) · `POST checklists/seed` · `DELETE checklist`
- CRM: `POST campaigns/:id/send` · `POST loyalty/expire` · `POST lifecycle/refresh` · `POST :id/lifecycle` (só params)

### SQL raw / `extended: false`

- Grep em rotas HK/CRM desta fatia: sem `sql.raw` / interpolação em query string de rota.
- `extended: false` + `qs depth:0` do 07b: sem quebra observada nestes módulos (in-memory / body JSON).

## Diff (resumo)

- `server/modules/housekeeping/schemas/housekeeping-write.schema.ts` — schemas `.strict()` + `parsePositiveIntId`
- `server/modules/crm/schemas/crm-write.schema.ts` — schemas `.strict()` + params
- Rotas HK/CRM: `Schema.parse(req.body)` → typed body; `parsePositiveIntId` em params
- `room-status`: `floor-map` / `dashboard` / `bulk-status` antes de `/:id`
- Helper `badRequest` local (extração compartilhada → 07c3)

## Test plan

| Caso | Esperado |
| --- | --- |
| `{ isAdmin: true }` em create/update HK ou CRM | rejeitado (`.strict()` / privileged) |
| `{ notes: { $ne: null } }` / `{ email: { $ne: null } }` | rejeitado (tipo) |
| `params.id` = `abc` / `12.5` / `-1` | 400 / throw Zod |
| payload allowlisted válido | aceito |

Suite: `backend/src/__tests__/unit/pr07c1-zod-mass-assign.test.ts`

## Baselines (host local pós-impl)

| Check | Resultado |
| --- | --- |
| `tsc` | **0** |
| `pr07c1` unit | **9 PASS** (+9 net-new) |
| jest full | 658 PASS / 15 FAIL (integration pré-existente + flake env; HK/CRM unit verde) |
| total tests | **673** (= 664 tip 07b + 9) |
| BLOCK / allowlist | intocados |
| build app tocado | N/A (só `server/modules`) |
| PR | [#190](https://github.com/reserveiviagens-tech/rsv360/pull/190) @ `763212bb` · **PARAR na URL** |

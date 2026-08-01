# PR-07c2 — Revenue + Financeiro: anti mass-assignment + Zod `.strict()`

**Branch:** `security/pr-07c2-revenue-financeiro`  
**Base:** `main @ 2872c634`  
**Estado:** PARAR na URL (H0)

## Fase 0.5

| Módulo | Rota write com body | Count |
| --- | --- | ---: |
| revenue/rules | POST / · POST /validate · PUT /:id · PUT /:id/toggle · PUT /reorder | 5 |
| revenue/competitors | POST / · POST /bulk · PUT /:id | 3 |
| revenue/calendar | POST /generate · PUT /override · DELETE /override · POST /bulk-override | 4 |
| revenue/forecast | POST /generate | 1 |
| revenue/engine | POST /calculate · /calculate-stay · /optimal-price · /simulate | 4 |
| **revenue subtotal** | | **17** |
| financeiro | POST/PUT transacoes · POST contas-receber · POST …/receber · POST contas-pagar · POST …/pagar | **6** |
| **Total** | | **23** (≤40 — OK) |

**PARAR >40:** não disparou.  
**SQL raw / interpolação:** 0 hits em revenue + financeiro.  
**`extended: false`:** sem dependência de query nesting nestas rotas (bodies JSON).

### SKIPs explícitos

- revenue: `POST /rules/seed` · `DELETE /rules/:id` · `DELETE /competitors/:id`
- financeiro: `DELETE /transacoes/:id`

### Route reordering

- `PUT /rules/reorder` movido **antes** de `/:id` (antes batia como id=`reorder`)
- competitor: `/comparison` · `/summary` já antes de `/:id` (mantido)

## Diff (resumo)

- `server/modules/revenue/schemas/revenue-write.schema.ts`
- `server/modules/financeiro/schemas/financeiro-write.schema.ts`
- Rotas revenue (5) + financeiro (1): `Schema.parse(req.body)` + `parsePositiveIntId`
- Suite: `backend/src/__tests__/unit/pr07c2-zod-mass-assign.test.ts` (+9)

## Test plan

| Caso | Esperado |
| --- | --- |
| `isAdmin` / `role` / `password` em write | rejeitado |
| `{ campo: { $ne: null } }` | rejeitado (tipo) |
| `params.id` inválido | rejeitado |
| id válido | aceito |

# PR-07b — Zod `.strict()` + anti mass-assignment (cadeias críticas)

**Base:** `main @ d901db02` (pós-07a)  
**Branch:** `security/pr-07b-zod-mass-assign`

## Fase 0.5 (confirmação)

| Cadeia | Rota → sink | Handlers de escrita no escopo |
|--------|-------------|-------------------------------|
| dispute | `dispute.routes` → `updateDispute` `.set(data)` | 1 write + params em get/evidence/accept |
| subscription | `subscription.routes` → `updatePlan` `.set(data)` (+ create plan/sub) | 3 writes + params |
| propostas | `propostas/routes` → `create`/`update`/`templates` | 4 |
| spreads | relatorios views/snapshots · acomodacoes addon · tarifas categoria/regra | 5 |
| **Total writes** | | **13** (<20 — sem sub-fatia) |

**I4 webhook pós-HMAC:** movido para **07c** (evitar +arquivos fora do núcleo HIGH).  
**Housekeeping/crm/…:** 07c.

## O que mudou

- Schemas Zod `.strict()` + handlers persistem **parse**, nunca `req.body` cru
- Services dispute/subscription: allowlist no `.set()`
- `req.params.id` UUID (payments) / int positivo (propostas)
- `app.js`: `query parser` via `qs` `depth:0` + `urlencoded({ extended: false })`
- Rota `/stats` reposicionada antes de `/:id` (dispute + subscription)

## Testes

`backend/src/__tests__/unit/pr07b-zod-mass-assign.test.ts` — extras `isAdmin`, tipo inválido `$ne`, UUID inválido, proposta id NaN, query depth 0.

## Contagem net-new (reconciliação)

| Item | Qtd |
|------|-----|
| Schemas novos | 6 |
| Rotas/services tocados | 8 |
| `app.js` | 1 |
| Teste unitário | 1 |
| Evidence | 1 |
| **Arquivos** | **~16** (<25) |
| **Handlers write** | **13** (<20) |

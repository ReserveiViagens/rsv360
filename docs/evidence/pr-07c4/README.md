# PR-07c4 — Residual mounted modules Zod `.strict()` mass-assignment

**Branch:** `security/pr-07c4-residual`  
**Base:** `main @ de0001ee`  
**Estado:** PARAR na URL (H0)

## Fase 0.5

| Módulo | Body writes | Arquivo |
| --- | ---: | --- |
| campanhas | 6 | `server/modules/campanhas/routes/index.ts` |
| logistica | 9 | `server/modules/logistica/routes/index.ts` |
| orcamentos | 4 (+ SKIP converter) | `server/modules/orcamentos/routes/index.ts` |
| passageiros | 6 | `server/modules/passageiros/routes/index.ts` |
| multi-property | 6 | `server/modules/multi-property/routes/properties.routes.ts` |
| **Total** | **~31 ≤ 40** | uma fatia |

## Diff (resumo)

- Schemas `*-write.schema.ts` com `.strict()` por módulo
- Rotas: `Schema.parse(req.body)` → service; `parsePositiveIntId` / `parsePositiveIntParam` / `parseNonNegativeIntParam`
- `badRequest` shared com `{ successEnvelope: true }`
- Reorder: `/cupons/validar` e `/metricas` antes de `/:id`; `PUT /fnrh/:fnrhId` estático
- `parse-id.ts`: helpers nomeados + índice ≥0
- Suite `pr07c4-zod-mass-assign.test.ts`

## SKIPs

- DELETE handlers (sem body)
- `POST /:id/converter-proposta` — sem body útil (`/** SKIP body */`)
- Disk-only / upload (PR-08)
- `multi-property` repo `ALTER TABLE … ${column}` — colunas hardcoded no ensureSchema (não input HTTP)

## Validação local (preencher no PR)

- `npx tsc --noEmit` (backend)
- `npx jest …/pr07c4-zod-mass-assign.test.ts`
- Regressão `pr07c1` / `pr07c2` / `pr07c3`

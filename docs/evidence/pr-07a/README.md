# PR-07a — LFI csvPath sandbox

**Base:** `main` pós Fase 0 (`f7f81764`)  
**Branch:** `security/pr-07a-lfi`

## Fix

- Novo: `server/modules/acomodacoes/sync/safe-csv-path.ts` — `resolveSafeCsvPath` + allowlist `data/` (cwd e `../data`).
- `sync.routes.ts` — valida `req.body.csvPath` antes do sync; **400** em path inseguro.
- `sync-empreendimentos.ts` — defesa em profundidade se `options.csvPath` for fornecido.

## Testes

`backend/src/__tests__/unit/safe-csv-path-pr07a.test.ts` — positivo relativo/absoluto; negativos traversal, absoluto fora, null-byte.

## PARAR

Não disparou: paths legítimos sob `data/` (incl. `../data` quando cwd=`backend/`) passam pelo `isPathInside` pós-`resolve`.

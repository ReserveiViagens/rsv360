# Security Trail — Status e handoff (Cursor + Codex)

**Última atualização:** 2026-06-13  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**`main`:** `3f7de5ab2` (SEC-05 impl #323)

> **Leia este arquivo primeiro** ao retomar.

## Linha do tempo Security

| Etapa | PR impl | PR carimbo | Status |
|-------|---------|------------|--------|
| Inventário | — | #314 | GO |
| SEC-01 | #315 | #316 | GO pós-merge |
| SEC-02 | #317 | #318 | GO pós-merge |
| SEC-03 | #319 | #320 | GO pós-merge |
| SEC-04 | #321 | #322 | GO pós-merge |
| SEC-05 esbuild | #323 | *(carimbo pendente)* | GO impl |
| **SEC-06 uuid** | em andamento | — | #122, #124 open |

**Dependabot open:** **2** (uuid medium) — pós SEC-05

## SEC-06 — uuid (em andamento)

- Override `"uuid": "11.1.1"` — sem mercadopago@3.x, sem downgrade exceljs
- Instâncias VULN: root `9.0.1`, backend `9.0.1`, nested `8.3.2` (exceljs, falso)

## NOGO sem HITL

Tailwind 4, Express 5, `.next/types`

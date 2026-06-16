# Lint #237 — turismo BackupCenter + marketing + AuditSystem

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-backup-marketing-audit`

## Cluster selecionado

Ranking pós-#398 (excl. voucher-editor + validation): **4805** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/backup/BackupCenter.tsx` | 52 |
| `src/pages/marketing.tsx` | 50 |
| `src/components/security/AuditSystem.tsx` | 50 |
| **Total cluster** | **152** |

## Baseline → after

| Métrica | Pós-#398 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **4805** | **4653** (**−152**) |
| 3 arquivos alvo | 152 | **0** (**−152**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `BackupCenter.tsx` | 52 | 0 |
| `src/pages/marketing.tsx` | 50 | 0 |
| `AuditSystem.tsx` | 50 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −98 (65→29, 45→16, 58→25) |
| BackupCenter: UI/recharts mortos, state morto, `formatter` tipado | residual backup |
| AuditSystem: `Play` restaurado, recharts/UI mortos, `unknown`, entidades HTML | residual security |
| marketing: hooks mortos, state só-setter `[, setX]`, dead handlers removidos | residual pages |

## Scripts adicionados

- `scripts/fix-backup-marketing-audit-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `src/components/security/DataProtectionCenter.tsx` — 50
2. `pages/marketing.tsx` — 49 (duplicata)
3. `src/pages/reviews.tsx` — 49

## Veredito

**GO condicional** — cluster BackupCenter/marketing/AuditSystem saneado; débito global ~4653 warnings.

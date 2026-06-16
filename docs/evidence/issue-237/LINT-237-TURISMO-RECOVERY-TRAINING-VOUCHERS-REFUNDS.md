# Lint #237 — turismo RecoveryTesting + TrainingCenter + vouchers + refunds

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-recovery-training-vouchers-refunds`

## Cluster selecionado

Ranking pós-#397 (excl. voucher-editor + validation): **5026** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/backup/RecoveryTesting.tsx` | 58 |
| `src/components/training/TrainingCenter.tsx` | 58 |
| `src/pages/vouchers.tsx` | 53 |
| `src/pages/refunds.tsx` | 52 |
| **Total cluster** | **221** |

## Baseline → after

| Métrica | Pós-#397 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **5026** | **4805** (**−221**) |
| 4 arquivos alvo | 221 | **0** (**−221**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `RecoveryTesting.tsx` | 58 | 0 |
| `TrainingCenter.tsx` | 58 | 0 |
| `src/pages/vouchers.tsx` | 53 | 0 |
| `src/pages/refunds.tsx` | 52 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −172 (72→27, 69→30, 72→30, 58→12) |
| Restaurar `TrainingCenter.tsx` saneado (#391 branch) | −58 |
| RecoveryTesting: UI/recharts mortos + state morto | residual backup |
| vouchers: `CreditCard`, tipos `unknown`, hooks eslint-disable mock bootstrap | residual |
| src/pages/refunds: espelha pages/refunds (#397) | −6 |

## Scripts adicionados

- `scripts/fix-recovery-training-vouchers-refunds-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (4 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `src/components/backup/BackupCenter.tsx` — 52
2. `src/pages/marketing.tsx` — 50
3. `src/components/security/AuditSystem.tsx` — 50

## Veredito

**GO condicional** — cluster recovery/training/vouchers/refunds saneado; débito global ~4805 warnings.

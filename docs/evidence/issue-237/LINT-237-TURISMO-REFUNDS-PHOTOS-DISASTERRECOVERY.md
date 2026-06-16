# Lint #237 — turismo refunds + photos duplicate + DisasterRecovery

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-refunds-photos-disasterrecovery`

## Cluster selecionado

Ranking pós-#396 (excl. voucher-editor + validation): **5203** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/refunds.tsx` | 59 |
| `src/pages/photos.tsx` | 59 |
| `src/components/backup/DisasterRecovery.tsx` | 59 |
| **Total cluster** | **177** |

Breakdown: **177×** `@typescript-eslint/no-unused-vars`.

## Baseline → after

| Métrica | Pós-#396 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **5203** | **5026** (**−177**) |
| 3 arquivos alvo | 177 | **0** (**−177**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `pages/refunds.tsx` | 59 | 0 |
| `src/pages/photos.tsx` | 59 | 0 |
| `DisasterRecovery.tsx` | 59 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (`trim-lucide-imports.cjs`) | −149 (65→12, 65→13, 66→22) |
| Remover `useAuth`/`useRouter`/`isLoading` mortos (refunds, photos) | −8 |
| Prefixar `_cardId` / `_action` em handlers | −4 |
| Remover `formatDate` morto (photos) | −1 |
| Remover UI/recharts não usados + state morto (DisasterRecovery) | −15 |

## Scripts adicionados

- `scripts/fix-refunds-photos-disasterrecovery-residual.cjs` — residual após trim Lucide

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

Top arquivos restantes:

1. `src/components/backup/RecoveryTesting.tsx` — 58
2. `src/components/training/TrainingCenter.tsx` — 58
3. `src/pages/vouchers.tsx` — 53

Ou agrupar **`src/pages/refunds.tsx`** (52) — duplicata de `pages/refunds` (esta PR).

## Veredito

**GO condicional** — cluster refunds/photos/DisasterRecovery saneado; débito global ~5026 warnings.

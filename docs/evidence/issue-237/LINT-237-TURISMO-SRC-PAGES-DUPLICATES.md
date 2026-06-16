# Lint #237 — turismo src/pages duplicates (upgrades, workflows, maps)

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-src-pages-duplicates`

## Cluster selecionado

Ranking pós-#394 (excl. voucher-editor + validation): **5600** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/pages/upgrades.tsx` | 71 |
| `src/pages/workflows.tsx` | 68 |
| `src/pages/maps.tsx` | 67 |
| **Total cluster** | **206** |

Duplicatas em `src/pages/` das páginas já saneadas em `pages/` (#392).

Breakdown: **206×** `@typescript-eslint/no-unused-vars`.

## Baseline → after

| Métrica | Pós-#394 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **5600** | **5394** (**−206**) |
| 3 arquivos alvo | 206 | **0** (**−206**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `src/pages/upgrades.tsx` | 71 | 0 |
| `src/pages/workflows.tsx` | 68 | 0 |
| `src/pages/maps.tsx` | 67 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (`trim-lucide-imports.cjs`) | −194 (80→11, 76→15, 81→17) |
| Espelhar fixes de `pages/upgrades` (modal, handler, read-only state) | upgrades residual |
| Espelhar fixes de `pages/maps` (mock read-only, geolocation setter) | maps residual |
| Espelhar fixes de `pages/workflows` (hooks mortos, `_cardId`/`_action`, `getPriorityColor`) | workflows residual |

## Scripts adicionados

- `scripts/fix-src-pages-duplicates-residual.cjs` — residual após trim Lucide (espelha #392 em `src/pages/`)

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

Top arquivos restantes:

1. `src/components/training/SkillsAssessment.tsx` — 66
2. `src/components/backup/DataReplication.tsx` — 63
3. `src/pages/plans.tsx` — 62

Ou agrupar **`src/pages/plans.tsx` + `pages/plans.tsx`** (plans já saneado em `pages/` na #393).

## Veredito

**GO condicional** — duplicatas `src/pages/` saneadas; débito global ~5394 warnings.

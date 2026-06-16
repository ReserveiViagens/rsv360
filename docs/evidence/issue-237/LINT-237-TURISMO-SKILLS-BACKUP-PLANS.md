# Lint #237 — turismo SkillsAssessment + DataReplication + src/pages/plans

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-skills-backup-plans`

## Cluster selecionado

Ranking pós-#395 (excl. voucher-editor + validation): **5394** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/training/SkillsAssessment.tsx` | 66 |
| `src/components/backup/DataReplication.tsx` | 63 |
| `src/pages/plans.tsx` | 62 |
| **Total cluster** | **191** |

Breakdown predominante: `@typescript-eslint/no-unused-vars`, poucos `no-explicit-any` e `react/no-unescaped-entities`.

## Baseline → after

| Métrica | Pós-#395 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **5394** | **5203** (**−191**) |
| 3 arquivos alvo | 191 | **0** (**−191**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `SkillsAssessment.tsx` | 66 | 0 |
| `DataReplication.tsx` | 63 | 0 |
| `src/pages/plans.tsx` | 62 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (`trim-lucide-imports.cjs`) | −151 (74→28, 70→24, 69→10) |
| Remover UI/recharts não usados, state morto, helpers | SkillsAssessment + DataReplication |
| `correctAnswer` / `sourceValue` / `targetValue`: `any` → `unknown` | −3 |
| Escapar entidades HTML em SkillsAssessment | −2 |
| Espelhar fixes de `pages/plans` (#393) em `src/pages/plans` | plans residual |

## Scripts adicionados

- `scripts/fix-skills-backup-plans-residual.cjs` — residual após trim Lucide

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

Top arquivos restantes:

1. `pages/refunds.tsx` — 59
2. `src/pages/photos.tsx` — 59 (duplicata; `pages/photos` saneado na #394)
3. `src/components/backup/DisasterRecovery.tsx` — 59

Ou agrupar duplicatas `refunds` / `photos` em `src/pages/`.

## Veredito

**GO condicional** — cluster SkillsAssessment/DataReplication/plans saneado; débito global ~5203 warnings.

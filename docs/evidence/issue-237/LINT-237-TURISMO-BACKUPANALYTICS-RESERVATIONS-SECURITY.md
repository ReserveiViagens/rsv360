# Lint #237 — turismo BackupAnalytics + reservations + SecurityCenter

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-backupanalytics-reservations-security`

## Cluster selecionado

Ranking pós-#400 (excl. voucher-editor + validation): **4505** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/backup/BackupAnalytics.tsx` | 49 |
| `pages/reservations.tsx` | 47 |
| `src/pages/reservations.tsx` | 47 |
| `src/components/security/SecurityCenter.tsx` | 46 |
| **Total cluster** | **189** |

## Baseline → after

| Métrica | Pós-#400 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **4505** | **4316** (**−189**) |
| 4 arquivos alvo | 189 | **0** (**−189**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `BackupAnalytics.tsx` | 49 | 0 |
| `pages/reservations.tsx` | 47 | 0 |
| `src/pages/reservations.tsx` | 47 | 0 |
| `SecurityCenter.tsx` | 46 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −71 (BackupAnalytics 60→24, SecurityCenter 62→27) |
| BackupAnalytics: `Input`/`Textarea`/recharts mortos, `selectedMetric` morto, `formatter` tipado | residual backup |
| SecurityCenter: `Textarea`/recharts mortos, `SecurityPolicy`/`selectedThreat` mortos, `Plus` restaurado | residual security |
| reservations×2: imports Lucide enxutos (só aliases usados), handlers mortos prefixados | residual pages |

## Scripts adicionados

- `scripts/fix-backupanalytics-reservations-security-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (4 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `src/services/api.ts` — 46
2. `pages/chat.tsx` + `src/pages/chat.tsx` — ~45 cada
3. *(revalidar ranking após merge)*

## Veredito

**GO condicional** — cluster BackupAnalytics/reservations/SecurityCenter saneado; débito global ~4316 warnings.

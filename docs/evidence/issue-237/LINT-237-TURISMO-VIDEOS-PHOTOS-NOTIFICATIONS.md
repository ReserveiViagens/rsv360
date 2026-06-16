# Lint #237 — turismo videos + photos + notifications

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-videos-photos-notifications`

## Cluster selecionado

Ranking pós-#393 (excl. voucher-editor + validation): **5864** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/videos.tsx` | 73 |
| `src/pages/videos.tsx` | 49 |
| `pages/photos.tsx` | 71 |
| `src/pages/notifications.tsx` | 71 |
| **Total cluster** | **264** |

Breakdown: **264×** `@typescript-eslint/no-unused-vars`.

## Baseline → after

| Métrica | Pós-#393 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **5864** | **5600** (**−264**) |
| 4 arquivos alvo | 264 | **0** (**−264**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `pages/videos.tsx` | 73 | 0 |
| `src/pages/videos.tsx` | 49 | 0 |
| `pages/photos.tsx` | 71 | 0 |
| `src/pages/notifications.tsx` | 71 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (`trim-lucide-imports.cjs`) | −235 (81→15, 57→15, 77→13, 81→18) |
| Remover `useAuth`/`useRouter`/`isLoading` mortos | −16 |
| Prefixar `_cardId` / `_action` em handlers | −8 |
| Remover `formatDate` morto (videos×2, photos) | −3 |
| Remover `getPriorityColor` + import `Archive` duplicado (notifications) | −2 |

## Scripts adicionados

- `scripts/fix-videos-photos-notifications-residual.cjs` — residual hooks/handlers/helpers após trim Lucide

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (4 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

Top arquivos restantes (single-file):

1. `src/pages/photos.tsx` — verificar volume (duplicata de `pages/photos.tsx`)
2. `pages/customers-rsv.tsx` — ver ranking atual
3. Próximo módulo `src/components/training/` residual (`SkillsAssessment`, etc.)

Consultar `node scripts/eslint-warnings-rank.cjs` pós-merge para ranking atualizado.

## Veredito

**GO condicional** — cluster videos/photos/notifications saneado; débito global ~5600 warnings.

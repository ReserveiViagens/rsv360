# Lint #237 — turismo useApi + conteudo×2

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-useapi-conteudo`

## Cluster selecionado

Ranking pós-#410 (excl. voucher-editor + validation): **3316** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/hooks/useApi.ts` | 30 |
| `pages/conteudo.tsx` | 29 |
| `src/pages/conteudo.tsx` | 29 |
| **Total cluster** | **88** |

## Baseline → after

| Métrica | Pós-#410 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3316** | **3228** (**−88**) |
| 3 arquivos alvo | 88 | **0** (**−88**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `useApi.ts` | 30 | 0 |
| `pages/conteudo.tsx` | 29 | 0 |
| `src/pages/conteudo.tsx` | 29 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (conteudo×2) | −24 (29→17 cada) |
| useApi: `unknown`, executeRef, PaginationMeta, delete ref, memo deps | residual hooks |
| conteudo×2: state/funções mortos, `ImageIcon`, narrowing modal, histórico tipado | residual pages |

## Scripts adicionados

- `scripts/fix-useapi-conteudo-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |
| `eslint-warnings-rank.cjs` | **3228** global |

## Próximo cluster sugerido

1. `pages/dashboard-reservei-viagens-fixed.tsx` — 29
2. `src/pages/tickets.tsx` — 29
3. `src/components/ai/ChatbotAI.tsx` — 29

## Veredito

**GO condicional** — cluster useApi/conteudo saneado; débito global ~3228 warnings.

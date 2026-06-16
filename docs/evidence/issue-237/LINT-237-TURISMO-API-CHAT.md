# Lint #237 — turismo api.ts + pages/chat + src/pages/chat

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-api-chat`

## Cluster selecionado

Ranking pós-#401 (excl. voucher-editor + validation): **4316** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/services/api.ts` | 46 |
| `pages/chat.tsx` | 45 |
| `src/pages/chat.tsx` | 45 |
| **Total cluster** | **136** |

## Baseline → after

| Métrica | Pós-#401 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **4316** | **4180** (**−136**) |
| 3 arquivos alvo | 136 | **0** (**−136**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `api.ts` | 46 | 0 |
| `pages/chat.tsx` | 45 | 0 |
| `src/pages/chat.tsx` | 45 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (chat×2) | −48 (37→13 cada) |
| api.ts: `any` → `unknown`/`Record`, `_refreshError`, `handleApiError` tipado | residual services |
| chat×2: hooks mortos, state só-setter, mocks com datas estáticas, `ImageIcon`, `scrollToBottom` reordenado | residual pages |

## Scripts adicionados

- `scripts/fix-api-chat-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `pages/financeiro.tsx` + `src/pages/financeiro.tsx` — ~41 cada
2. `pages/vouchers.tsx` — 41
3. *(revalidar ranking após merge)*

## Veredito

**GO condicional** — cluster api/chat saneado; débito global ~4180 warnings.

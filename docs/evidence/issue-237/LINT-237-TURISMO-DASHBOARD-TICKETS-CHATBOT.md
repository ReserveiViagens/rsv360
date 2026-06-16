# Lint #237 — turismo dashboard + tickets + ChatbotAI

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-dashboard-tickets-chatbot`

## Cluster selecionado

Ranking pós-#411 (excl. voucher-editor + validation): **3228** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/dashboard-reservei-viagens-fixed.tsx` | 29 |
| `src/pages/tickets.tsx` | 29 |
| `src/components/ai/ChatbotAI.tsx` | 29 |
| **Total cluster** | **87** |

## Baseline → after

| Métrica | Pós-#411 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3228** | **3141** (**−87**) |
| 3 arquivos alvo | 87 | **0** (**−87**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `dashboard-reservei-viagens-fixed.tsx` | 29 | 0 |
| `tickets.tsx` | 29 | 0 |
| `ChatbotAI.tsx` | 29 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (3 arquivos) | −54 |
| dashboard: stats estático, remover load/effect mortos, `ImageIcon` | residual |
| tickets: restaurar `ProtectedRoute`/`MapPin`, `useMemo` mocks, limpar mortos, `eslint-disable` img | residual |
| ChatbotAI: `KnowledgeForm` hoist, `Pie`, ids via ref, `useCallback` scroll, state inicial | residual hooks |

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |
| `eslint-warnings-rank.cjs` | **3141** global |

## Próximo cluster sugerido

1. `src/components/integrations/IntegrationHub.tsx` — 29
2. `src/components/projects/ProjectTimeline.tsx` — 29
3. `pages/cotacoes/atracoes.tsx` — 28

## Veredito

**GO condicional** — cluster dashboard/tickets/chatbot saneado; débito global ~3141 warnings.

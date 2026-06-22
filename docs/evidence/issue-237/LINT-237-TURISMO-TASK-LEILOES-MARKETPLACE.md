# Lint #237 — turismo TaskManager + leiloesApi + marketplace

**Cluster:** **#24** | **Branch:** `chore/lint-turismo-task-leiloes-marketplace`

| Métrica | Pós-#435 | Esta PR |
|---------|----------|---------|
| warnings globais | **1717** | **1670** (**−47**) |
| 3 arquivos alvo | 47 | **0** |

**Correções principais:**
- `TaskManager.tsx`: imports Lucide/UI enxutos; removidos `getPriorityColor` e `handleStatusChange`; tipagem `Task['status']`/`Task['priority']` nos Selects
- `leiloesApi.ts`: tipos `AuctionApiRecord`, `BidApiRecord`, `FlashDealApiRecord`, `LeilaoRelatorio`, `ApiResponse`; removido `apiClient` não usado; `_filters` em `getRelatorios`
- `marketplace.tsx`: imports enxutos; removido state `filters`; `loadData` hoistado; init deferido via `setTimeout`; parsing `ordersRes`/`commissionsRes` com `.data`

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #25 — CustomerManagement + FinalDeploySystem + AccountingIntegration (−45)

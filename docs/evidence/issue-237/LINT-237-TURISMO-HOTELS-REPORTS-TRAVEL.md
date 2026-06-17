# Lint #237 — turismo hotels-complete + reports + travel

**Cluster:** **#21** | **Branch:** `chore/lint-turismo-hotels-reports-travel`

| Métrica | Pós-#432 | Esta PR |
|---------|----------|---------|
| warnings globais | **1861** | **1813** (**−48**) |
| 3 arquivos alvo | 48 | **0** |

**Correções principais:**
- `pages/hotels-complete.tsx`: imports Lucide enxutos; `MOCK_HOTELS` hoistado; `getErrorMessage`; tipagem em `handleInputChange`; offsets fixos no gráfico de ocupação (sem `Math.random` no render)
- `pages/reports.tsx`: removidos imports/vars/funções mortas; mocks via `setTimeout` no mount; tipos `DestinationMetric`/`ChartData`/`MetricDetail` nos maps
- `pages/travel.tsx`: `MOCK_TRAVELS` hoistado; `NewTravelForm` e `TravelDetailsView` extraídos; state morto removido

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #23 — ChatConversations + NotificationManager + PushNotificationSystem (−48)

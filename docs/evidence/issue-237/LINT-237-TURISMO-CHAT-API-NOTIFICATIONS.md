# Lint #237 — turismo ChatAnalytics + ApiConnector + NotificationSettings

**Cluster:** **#45** | **Branch:** `chore/lint-turismo-chat-api-notifications`

| Métrica | Pós-#44 | Esta PR |
|---------|---------|---------|
| warnings globais | **927** | **897** (**−30**) |
| 3 arquivos alvo | 30 | **0** |

**Correções principais:**
- `ChatAnalytics.tsx`: imports enxutos (Lucide + Recharts)
- `ApiConnector.tsx`: imports mortos removidos; tipos concretos em selects; `getStatusIcon` removido
- `NotificationSettings.tsx`: `useCallback` load; tipos genéricos; imports enxutos

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #46 — reports/ReportBuilder + CodeCoverage + TravelCatalog (−30)

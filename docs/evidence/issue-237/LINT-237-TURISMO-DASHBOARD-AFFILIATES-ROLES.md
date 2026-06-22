# Lint #237 — turismo dashboard + affiliates + roles

**Cluster:** **#43** | **Branch:** `chore/lint-turismo-dashboard-affiliates-roles`

| Métrica | Pós-#42 | Esta PR |
|---------|---------|---------|
| warnings globais | **987** | **957** (**−30**) |
| 3 arquivos alvo | 30 | **0** |

**Correções principais:**
- `pages/dashboard.tsx`: imports Lucide enxutos
- `pages/dashboard/affiliates.tsx`: imports mortos removidos; `useCallback` load; state `filters` removido
- `pages/roles.tsx`: imports enxutos; `useCallback` load; busca client-side via `filteredRoles`

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #45 — ChatAnalytics + ApiConnector + NotificationSettings (−30)

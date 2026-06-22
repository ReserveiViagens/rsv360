# Lint #237 — turismo ChatConversations + NotificationManager + PushNotificationSystem

**Cluster:** **#23** | **Branch:** `chore/lint-turismo-chat-notifications`

| Métrica | Pós-#434 | Esta PR |
|---------|----------|---------|
| warnings globais | **1765** | **1717** (**−48**) |
| 3 arquivos alvo | 48 | **0** |

**Correções principais:**
- `ChatConversations.tsx`: `MOCK_CONVERSATIONS` hoistado com datas fixas; `AvatarImage`/`AvatarFallback`; filtro por `activeTab`; imports enxutos
- `NotificationManager.tsx`: `NOTIFICATION_TEMPLATES` constante; init deferido via `setTimeout`; `applyTemplate` (evita rules-of-hooks); imports enxutos
- `PushNotificationSystem.tsx`: mocks hoistados; state morto removido; `getStatusBadgeVariant` tipado; imports enxutos

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #24 — TaskManager + leiloesApi + marketplace (−47)

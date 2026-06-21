# Lint #237 — turismo ChatSystem + SocialMedia + PaymentHistory

**Cluster:** **#49** | **Branch:** `chore/lint-turismo-chat-social-payment`

| Métrica | Pós-#48 | Esta PR |
|---------|---------|---------|
| warnings globais | **813** | **786** (**−27**) |
| 3 arquivos alvo | 27 | **0** |

**Correções principais:**
- `ChatSystem.tsx`: `MOCK_MESSAGES_BY_ROOM`; eslint img mock; `ImageIcon`
- `SocialMediaIntegration.tsx`: state morto removido; imports enxutos
- `PaymentHistory.tsx`: `TransactionFilters` tipado; imports enxutos

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #50 — RefundManager + DataExport + TestRunner (−27)

# Lint #237 — turismo integracoes-apis + marketplace-parceiros + notification-system-test

**Cluster:** **#28** | **Branch:** `chore/lint-turismo-integracoes-marketplace-notification`

| Métrica | Pós-#439 | Esta PR |
|---------|----------|---------|
| warnings globais | **1541** | **1499** (**−42**) |
| 3 arquivos alvo | 42 | **0** |

**Correções principais:**
- `integracoes-apis.tsx`: imports enxutos; `updateIntegrationField` tipado; `getMockResponseTime` determinístico; removido `getUsageColor`
- `marketplace-parceiros.tsx`: imports enxutos; removidos `loading`, `selectedPartner`; `next/image` no logo
- `notification-system-test.tsx`: imports enxutos; entidades JSX escapadas

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #29 — relatorios-personalizados + DataExportSystem + BackupRecoverySystem (−42)

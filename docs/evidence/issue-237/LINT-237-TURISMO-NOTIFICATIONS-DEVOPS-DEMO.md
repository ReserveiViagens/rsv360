# Lint #237 — turismo notifications + DevOpsPage + demo-layout

**Cluster:** **#48** | **Branch:** `chore/lint-turismo-notifications-devops-demo`

| Métrica | Pós-#47 | Esta PR |
|---------|---------|---------|
| warnings globais | **840** | **813** (**−27**) |
| 3 arquivos alvo | 27 | **0** |

**Correções principais:**
- `notifications.tsx`: `useCallback` loadData; `Record<string, string>` params; imports enxutos; entities escapadas
- `DevOpsPage.tsx`: `MonitoringStats`/`EnvironmentStatus`; `useCallback` loadSystemStatus; imports enxutos
- `demo-layout.tsx`: imports Lucide enxutos; `Palette` adicionado; `colors` removido

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #49 — ChatSystem + SocialMediaIntegration + PaymentHistory (−27)

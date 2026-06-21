# Lint #237 — turismo TrainingSystem + LeadCapture + SettingsPanel

**Cluster:** **#30** | **Branch:** `chore/lint-turismo-training-leadcapture-settings`

| Métrica | Pós-#441 | Esta PR |
|---------|----------|---------|
| warnings globais | **1457** | **1415** (**−42**) |
| 3 arquivos alvo | 42 | **0** |

**Correções principais:**
- `TrainingSystem.tsx`: imports enxutos; mock hoistado; props `_prefix`; removido `activeTab`
- `LeadCapture.tsx`: imports enxutos; `handleFilterChange` genérico; removido `handleStatusChange`
- `SettingsPanel.tsx`: imports enxutos; `handleSettingChange`/`handleNestedSettingChange` tipados

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #31 — PerformanceTesting + templates + dashboard-rsv-backup (−40)

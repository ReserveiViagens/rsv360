# Lint #237 — turismo relatorios-personalizados + DataExportSystem + BackupRecoverySystem

**Cluster:** **#29** | **Branch:** `chore/lint-turismo-relatorios-dataexport-backup`

| Métrica | Pós-#440 | Esta PR |
|---------|----------|---------|
| warnings globais | **1499** | **1457** (**−42**) |
| 3 arquivos alvo | 42 | **0** |

**Correções principais:**
- `relatorios-personalizados.tsx`: imports enxutos; `ReportData` tipado; `DropResult`; removido `exportTemplate`; entidades escapadas
- `DataExportSystem.tsx`: imports enxutos; `useRef` para IDs de job; download usa `job.id`
- `BackupRecoverySystem.tsx`: imports enxutos; `_onBackupCompleted`; `recoveryPoints` readonly

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #30 — TrainingSystem + LeadCapture + SettingsPanel (−42)

# Soak 72h - tarefas agendadas (America/Sao_Paulo -03)
Gerado: 2026-06-01T10:35:58

| Task | Sample | Data/Hora (-03) | Comando equivalente |
|------|--------|-----------------|---------------------|
| RSV360-Soak-72h-Sample-001 | 001 | 2026-06-01 16:12:00 | bash run-soak-sample.sh 001 periodic |
| RSV360-Soak-72h-Sample-002 | 002 | 2026-06-01 22:12:00 | bash run-soak-sample.sh 002 periodic |
| RSV360-Soak-72h-Sample-003 | 003 | 2026-06-02 04:12:00 | bash run-soak-sample.sh 003 periodic |
| RSV360-Soak-72h-Sample-004 | 004 | 2026-06-02 10:12:00 | bash run-soak-sample.sh 004 periodic |
| RSV360-Soak-72h-Sample-005 | 005 | 2026-06-02 16:12:00 | bash run-soak-sample.sh 005 periodic |
| RSV360-Soak-72h-Sample-006 | 006 | 2026-06-02 22:12:00 | bash run-soak-sample.sh 006 periodic |
| RSV360-Soak-72h-Sample-007 | 007 | 2026-06-03 04:12:00 | bash run-soak-sample.sh 007 periodic |
| RSV360-Soak-72h-Sample-008 | 008 | 2026-06-03 10:12:00 | bash run-soak-sample.sh 008 periodic |
| RSV360-Soak-72h-Sample-009 | 009 | 2026-06-03 16:12:00 | bash run-soak-sample.sh 009 periodic |
| RSV360-Soak-72h-Sample-010 | 010 | 2026-06-03 22:12:00 | bash run-soak-sample.sh 010 periodic |
| RSV360-Soak-72h-Sample-011 | 011 | 2026-06-04 04:12:00 | bash run-soak-sample.sh 011 periodic |
| RSV360-Soak-72h-Sample-012 | 012 | 2026-06-04 10:12:00 | bash run-soak-sample.sh 012 periodic |

## Fechamento

Apos 2026-06-04T10:12:40-03:00 (tarefa RSV360-Soak-72h-Close ou manual):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\RSV 360\Documents\s2-pr232-validate\docs\evidence\soak-72h\run-soak-close-scheduled.ps1"
```

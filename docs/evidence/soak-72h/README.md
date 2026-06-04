# Soak 72h — evidência G4 completo

**Branch:** `ops/soak-72h-g4-final`  
**Plano:** [SOAK-72H-PLAN.md](./SOAK-72H-PLAN.md)  
**Soak Safe (Cursor + Codex):** [CHECKLIST-SOAK-SAFE.md](./CHECKLIST-SOAK-SAFE.md) · [TRILHA-PARALELA-POS-SOAK.md](./TRILHA-PARALELA-POS-SOAK.md)

**Pós-GO (docs):** [POST-SOAK-EXECUTION-PLAYBOOK.md](./POST-SOAK-EXECUTION-PLAYBOOK.md) · [PR-DRAFT-INDEX.md](./issues/PR-DRAFT-INDEX.md)

## Início rápido

```powershell
cd docs\evidence\soak-72h

# Baseline (uma vez)
.\run-soak-sample.ps1 -SampleId '000' -Label 'baseline'

# Amostra manual
.\run-soak-sample.ps1

# Agendar amostras 001–012 (horários exatos -03) + fechamento — PowerShell **Admin**
.\register-soak-scheduler-slots.ps1

# (legado) repetição genérica 6/6h
# .\register-soak-scheduler.ps1

# Só fechamento (após 2026-06-04T10:12:40-03:00)
.\register-soak-close-scheduler.ps1

# Encerramento (após 2026-06-04T10:12:40-03:00)
.\run-soak-final.ps1
# Checklist: SOAK-72H-CLOSE-CHECKLIST.md
```

## Artefatos

| Arquivo | Descrição |
|---------|-----------|
| `logs/SOAK-BASELINE.tsv` | Snapshot kickoff |
| `logs/SOAK-SAMPLES.tsv` | Todas as amostras |
| `logs/sample-*.log` | Detalhe por amostra |
| `SOAK-72H-REPORT.md` | Relatório final (pós `run-soak-final.ps1`) |
| `SOAK-72H-STATUS.md` | Status vivo do soak |

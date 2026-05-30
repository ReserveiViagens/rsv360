# Soak 72h — evidência G4 completo

**Branch:** `ops/soak-72h-g4-final`  
**Plano:** [SOAK-72H-PLAN.md](./SOAK-72H-PLAN.md)

## Início rápido

```powershell
cd docs\evidence\soak-72h

# Baseline (uma vez)
.\run-soak-sample.ps1 -SampleId '000' -Label 'baseline'

# Amostra manual
.\run-soak-sample.ps1

# Agendar coleta 6/6h (Admin)
.\register-soak-scheduler.ps1

# Encerramento (após 2026-06-02T09:03:09-03:00)
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

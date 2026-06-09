# Soak 72h — status vivo

**Ultima atualizacao:** 2026-06-08T22:00:45-03:00  
**Estado:** **EM EXECUÇÃO — janela pós-Next 16 (#278+#279+#283)**

| Campo | Valor |
|-------|--------|
| start_at (kickoff) | **2026-06-08T22:00:00-03:00** |
| end_at (kickoff + 72h) | **2026-06-11T22:00:00-03:00** |
| Branch / base | `main` @ `5f3c1f62`+ (#283) |
| Motivo restart | Stack Next **16.2.7** + hotfix webpack/pg Docker |
| Baseline | **OK** (`000` `baseline-post-next16-v2`) |
| API P0 (kickoff) | **8/8 OK** |
| Amostras coletadas | **1 / 13** (000 baseline; 001–012 pendentes) |
| Task coleta 6h | **OK** — `RSV360-Soak-72h-Sample-001` … `012` (manifest `SOAK-SCHEDULER-MANIFEST-NEXT16.md`) |
| Task fechamento | **OK** — `RSV360-Soak-72h-Close` @ 2026-06-11 22:02 -03 |
| Veredito soak | _pendente fim janela_ |

## Comandos operacionais

```powershell
cd "C:\Users\RSV 360\Documents\s2-pr232-validate"
$env:RSV360_DOCKER_PROJECT = "rsv360"
.\docs\evidence\soak-72h\run-soak-sample.ps1 -SampleId "001" -Force   # manual entre slots
.\docs\evidence\soak-72h\run-soak-close-scheduled.ps1                 # após end_at
```

## Janela anterior (encerrada GO)

- 2026-06-01 → 2026-06-04 — **GO** — `SOAK-72H-REPORT.md`, PR #249

## Plano desta janela

`SOAK-72H-RESTART-NEXT16.md` + `SOAK-SCHEDULER-MANIFEST-NEXT16.md`

# Soak 72h — restart pós-Next 16 (Fase D completa)

**Data kickoff:** 2026-06-08T20:50:00-03:00 (pós merge #278 + #279 + rebuild Docker)  
**End_at (+72h):** 2026-06-11T20:50:00-03:00  
**Motivo restart:** stack Next **16.2.7** em guest, admin, turismo, site-publico; GAP-T04 fechado.

## Pré-requisitos desta janela

| Gate | Status |
|------|--------|
| Merge #278 turismo | **DONE** |
| Merge #279 site-publico | **DONE** |
| Smoke :3000/:3005/:3002 | **200** |
| API P0 backend (A1,A2,A7) | **OK** |
| API P0 site-publico (A3–A6) | **GAP** — pg/Turbopack Docker (hotfix `next build --webpack` em PR follow-up) |

## Baseline

| Artefato | Caminho |
|----------|---------|
| Log | `logs/sample-000-baseline-post-next16.log` |
| TSV | `logs/SOAK-SAMPLES.tsv` (entrada `000-post-next16`) |

## Comandos

```powershell
cd "C:\Users\RSV 360\Documents\s2-pr232-validate"
$env:RSV360_DOCKER_PROJECT = "rsv360"
.\docs\evidence\soak-72h\run-soak-sample.ps1 -SampleId "000" -Label "baseline-post-next16" -Force
# Periódicas a cada 6h (ajustar kickoff no script ou usar -Force)
.\docs\evidence\soak-72h\run-soak-sample.ps1 -Force
```

## Janela anterior

Ver `SOAK-72H-PLAN.md` — restart 2026-06-01 (abortado/incidente backend).

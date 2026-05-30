# Soak 72h — status vivo

**Última atualização:** 2026-05-30T10:53:07-03:00  
**Estado:** **EM EXECUÇÃO**

| Campo | Valor |
|-------|--------|
| start_at (kickoff) | 2026-05-30T09:03:09-03:00 |
| end_at (kickoff + 72h) | 2026-06-02T09:03:09-03:00 |
| Branch | `ops/soak-72h-g4-final` |
| Baseline | **OK** (sample-000) |
| Amostras coletadas | 2 / 13 (000 baseline, 001 manual/exec) |
| Task coleta 6h | `RSV360-Soak-72h-Sample` (próx. ~15:03) |
| Task fechamento | `RSV360-Soak-72h-Close` → **02/06 09:05** |
| API P0 (pré-fechamento) | **8/8 OK** (30/05 09:47 — revalidar no fechamento) |
| Veredito soak | _pendente_ |
| G4 completo | **NOGO** (até encerramento verde) |
| Modo Soak Safe | **ATIVO** — ver `CHECKLIST-SOAK-SAFE.md` |

## Baseline (000)

| Check | Valor |
|-------|--------|
| :3002/health | 200 |
| :3000/ | 200 |
| backend | healthy (restarts=0) |
| site-publico | healthy (restarts=0) |
| postgres | healthy (restarts=0) |
| error_rate | smoke-only (Prometheus up) |

## Monitor Soak Safe (leitura)

| Horário | Health :3002/:3000 | Tasks | Amostras |
|---------|-------------------|-------|----------|
| 10:13 | 200/200 | Sample/Close Ready | 2 |
| 10:53 | 200/200 | Next sample **15:03**; Close **02/06 09:05** | 2 |

Log: `logs/SOAK-SAFE-OBSERVATIONS.log`

## Trilha paralela (docs)

- [POST-SOAK-EXECUTION-PLAYBOOK.md](./POST-SOAK-EXECUTION-PLAYBOOK.md)
- [RISK-MATRIX-POS-SOAK.md](./RISK-MATRIX-POS-SOAK.md)
- [ROLLBACK-RUNBOOK-POST-G4.md](./ROLLBACK-RUNBOOK-POST-G4.md)
- [PR-DRAFT-INDEX.md](./issues/PR-DRAFT-INDEX.md)

## Próximas ações

1. Amostras **001–012** a cada 6h (Task `RSV360-Soak-72h-Sample` ou manual).
2. Fechamento **após** `2026-06-02T09:03:09-03:00` — ver `SOAK-72H-CLOSE-CHECKLIST.md`.
3. `run-soak-final.ps1` + API P0 8/8 → PR #249 → G4 completo se verde.

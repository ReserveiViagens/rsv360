# Soak 72h — status vivo

**Última atualização:** 2026-05-30T09:02:28-03:00  
**Estado:** **EM EXECUÇÃO**

| Campo | Valor |
|-------|--------|
| start_at (kickoff) | 2026-05-30T09:03:09-03:00 |
| end_at (kickoff + 72h) | 2026-06-02T09:03:09-03:00 |
| Branch | `ops/soak-72h-g4-final` |
| Baseline | **OK** (sample-000) |
| Amostras coletadas | 1 / 13 (baseline + 12 periódicas) |
| Veredito soak | _pendente_ |
| G4 completo | **NOGO** (até encerramento verde) |

## Baseline (000)

| Check | Valor |
|-------|--------|
| :3002/health | 200 |
| :3000/ | 200 |
| backend | healthy (restarts=0) |
| site-publico | healthy (restarts=0) |
| postgres | healthy (restarts=0) |
| error_rate | smoke-only (Prometheus up) |

## Próximas ações

1. Amostras **001–012** a cada 6h (Task `RSV360-Soak-72h-Sample` ou manual).
2. Fechamento **após** `2026-06-02T09:03:09-03:00` — ver `SOAK-72H-CLOSE-CHECKLIST.md`.
3. `run-soak-final.ps1` + API P0 8/8 → PR #249 → G4 completo se verde.

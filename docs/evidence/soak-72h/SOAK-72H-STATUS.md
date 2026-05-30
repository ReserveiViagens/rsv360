# Soak 72h — status vivo

**Última atualização:** 2026-05-30T09:02:28-03:00  
**Estado:** **EM EXECUÇÃO**

| Campo | Valor |
|-------|--------|
| start_at | 2026-05-30T00:00:00-03:00 |
| end_at | 2026-06-02T00:00:00-03:00 |
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

1. Amostra **001** ~2026-05-30 15:02 -03 (Task Scheduler ou manual).
2. Ao fim da janela: `run-soak-final.ps1` + API P0 + `SOAK-72H-REPORT.md`.
3. PR e promoção G4 completo se verde.

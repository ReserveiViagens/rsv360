# Trilha 0 — Preflight rodada 0 (2026-05-30)

Captura automática antes de G1 GO completo e subida prometheus/grafana.

| ID | Verdicto | Nota |
|----|----------|------|
| T0-01 | OK | `:3002/health` |
| T0-02 | OK | `:3000/` |
| T0-h-* | OK | postgres, backend, site-publico **healthy** |
| T0-net | **GAP** | redes divergentes (igual G1) |
| T2-prometheus | **FAIL** | container não Up |
| T2-grafana | **FAIL** | container não Up |

**Trilha 0:** **NOGO** até `docker compose -p rsv360 up -d` unificado + observabilidade opcional conforme checklist.

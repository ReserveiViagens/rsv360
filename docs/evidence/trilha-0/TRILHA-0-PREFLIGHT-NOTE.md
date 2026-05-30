# Trilha 0 — Preflight rodada 1 (2026-05-30)

Pós **G1 dual-system = GO** e subida prometheus/grafana.

| ID | Verdicto | Nota |
|----|----------|------|
| T0-01 | OK | `:3002/health` |
| T0-02 | OK | `:3000/` |
| T0-h-* | OK | postgres, backend, site-publico **healthy** |
| T0-net | **OK** | `rsv360-phase1_default` compartilhada |
| T2-prometheus | **OK** | Up |
| T2-grafana | **OK** | Up |

**Preflight:** **GO** (8/8 checks OK)

## Rodada 0 (histórico)

GAP rede + monitoring offline — corrigido antes desta rodada.

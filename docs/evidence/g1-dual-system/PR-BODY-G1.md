## Summary
- Evidência **G1 rodada 1**: dual-system S1 (`:5000`) + S2 Docker (`:3002`/`:3000`) + infra.
- Scripts: `run-g1-dual-system.sh` (WSL) e `run-g1-dual-system.ps1` (Windows).
- Atualiza `docs/SPRINT-0-EVIDENCIA-OPERACIONAL.md` §12.

## Veredito (rodada 1)
| Bloco | Status |
|-------|--------|
| G1 S2 canônico | **GO** (3/3 HTTP + PG/site healthy) |
| G1 S1 CRM | **SKIP** (offline) |
| G1 rede Docker | **GAP** |
| **G1 dual-system completo** | **NOGO** → **GO condicional** |

## Test plan
- [ ] Revisar `logs/G1-SUMMARY.tsv`
- [ ] Merge docs
- [ ] Operador: subir S1 + `docker compose -p rsv360 up -d --build` + re-smoke

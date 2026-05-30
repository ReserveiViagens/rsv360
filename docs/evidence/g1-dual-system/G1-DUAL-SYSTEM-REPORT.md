# G1 — Rodada 1 (dual-system + infra)

**Data:** 2026-05-30T10:50-03:00 (captura Windows)  
**Branch evidência:** `docs/g1-dual-system-evidence`  
**Compose project:** `rsv360`  
**S1_ROOT:** `C:\Users\RSV 360\Documents\GitHub\Crm-RSV-360` (presente; serviço **offline**)

## Resumo

| Bloco | OK | SKIP | GAP | FAIL |
|-------|---:|-----:|----:|-----:|
| S2 HTTP | 3 | 0 | 0 | 0 |
| S1 HTTP | 0 | 3 | 0 | 0 |
| Infra | 3 | 0 | 1 | 0 |

## Veredito

| Gate | Status | Motivo |
|------|--------|--------|
| **G1 S2 canônico** | **GO** | `:3002` + `:3000` OK; Postgres/Redis/site **healthy** |
| **G1 dual-system (S1+S2)** | **NOGO** | S1 `:5000` **offline** (3× SKIP) |
| **G1 infra rede** | **GAP** | `site-publico` em `rsv360_default`; Postgres em `rsv360-phase1_default` |

**Veredito operacional recomendado:** **GO condicional** — S2 pronto para soak/API; promover **G1 dual-system = GO** após subir S1 e unificar rede (`docker compose -p rsv360 up -d`).

## Ações para GO dual-system completo

1. **S1:** `cd Crm-RSV-360 && npm run dev` → reexecutar script.
2. **Rede:** recriar stack no mesmo projeto:
   ```powershell
   cd s2-pr232-validate
   docker compose -p rsv360 up -d --build backend site-publico
   ```
3. **Postgres host:** validar listener único em `:5432` (hoje 2 PIDs — ver §SPRINT-0 item 4).
4. Re-smoke: `run-g1-dual-system.ps1` ou `.sh` → esperado 0 FAIL, 0 GAP, S1 OK.

## Evidência

- `logs/G1-SUMMARY.tsv`
- `logs/G1-*.log` (gerados na rodada)

## Referências

- Pós-merge health: **#245** (`/healthcheck.sh`)
- API P0: `docs/evidence/g4-kickoff/` (**GO**)
- Snapshot: `docs/SPRINT-0-EVIDENCIA-OPERACIONAL.md`

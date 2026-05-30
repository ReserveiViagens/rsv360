# G1 dual-system — evidência final (GO)

**Data:** 2026-05-30T11:58-03:00  
**Pré-requisito:** #246 merged, S1 CRM dev Up, rede `rsv360-phase1_default` alinhada  
**Snapshot:** `logs/G1-SUMMARY.tsv` (rodada 2)

## Veredito

**G1 dual-system = GO**

| ID | HTTP | Status |
|----|------|--------|
| G1-S2-01..03 | 200 | OK |
| G1-S1-01..03 | 200 | OK |
| G1-INFRA-01..04 | healthy/OK | OK |

## Ações executadas

1. `npm run dev` em `Crm-RSV-360` → `:5000`
2. `docker network connect rsv360-phase1_default rsv360-site-publico`
3. `docker compose -p rsv360 up -d --no-deps prometheus grafana alertmanager`
4. `run-g1-dual-system.ps1` → 10/10 OK

## Congelamento

Evidência final desta rodada: `logs/G1-SUMMARY.tsv` + este arquivo.  
Próximo gate: **Trilha 0** (`docs/evidence/trilha-0/`).

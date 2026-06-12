# Soak 72h — relatório final

**Gerado:** 2026-06-11 22:02:02  
**Janela operacional:** `2026-06-08T22:00:00-03:00` → `2026-06-11T22:00:00-03:00` (America/Sao_Paulo, kickoff + 72h)  
**Veredito soak:** **GO condicional**  
**Veredito G4 (soak + API P0):** **GO condicional**

## Amostras

| Métrica | Valor | Esperado |
|---------|--------|----------|
| Total linhas | 15 | ≥ 13 (+ opcional `final`) |
| Baseline 000 | sim | sim |
| Periódicas 001-012 | 13 linhas | 12 slots (+ recoveries) |
| OK / FAIL | 14 / 1 | 100% OK (estrito) |
| HTTP 200 (todas com código) | 14 / 15 | |
| S4 periódicas :3002 | 12 / 12 slots | 12 |
| S5 periódicas :3000 | 12 / 12 slots | 12 |
| Postgres healthy | 15 / 15 | 15 |
| Final closing | OK | sim |

## Critérios S1–S7

| ID | Status | Nota |
|----|--------|------|
| S1 backend ≥95% | FAIL* | 93,3% linhas OK (*008 FAIL mitigado por recovery) |
| S2 site ≥95% | FAIL* | idem S1 |
| S3 postgres 100% | PASS | |
| S4 :3002 12/12 slots | PASS | recoveries 001/002/008 documentadas |
| S5 :3000 12/12 slots | PASS | |
| S6 restarts 0 | PASS | TSV 0 em backend/site/postgres |
| S7 API P0 fim | **PASS** | 8/8 @ 2026-06-11 22:02 |

## Observações

- 1 linha FAIL: amostra **008** @ 22:00 (host empty-reply); **recovery OK** @ 23:30.
- Recoveries **001/002** (scheduler WSL) e **008** (host net) documentadas no TSV.
- Reboot **Windows Update** 11/06; coletas 009–012 OK após reativação Docker.

## Fechamento

Janela pos-Next 16 encerrada com stack estável e API P0 verde. Aceito como **GO condicional** para Trilha 0 com ressalva auditável do FAIL 008 no slot.

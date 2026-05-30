# Soak 72h — plano formal (pós Trilha 0)

**Status:** RASCUNHO — não iniciar antes de **Trilha 0 = GO** e **G1 dual-system = GO**.

## Janela

| Campo | Valor |
|-------|--------|
| **Início (UTC-3)** | _YYYY-MM-DDTHH:MM_ |
| **Fim** | início + 72h |
| **Responsável** | _preencher_ |
| **Compose project** | `rsv360` |

## Critérios de aprovação (soak)

| ID | Critério | Limiar |
|----|----------|--------|
| S1 | `backend` health | **healthy** ≥ 95% do período |
| S2 | `site-publico` health | **healthy** ≥ 95% |
| S3 | `postgres` health | **healthy** 100% |
| S4 | Smoke `:3002/health` a cada 6h | 12/12 amostras 200 |
| S5 | Smoke `:3000/` a cada 6h | 12/12 amostras 200 |
| S6 | Restart inesperado | 0 containers críticos |
| S7 | API P0 re-smoke no fim | 8/8 OK (`run-api-p0-round1.sh`) |

## Coleta

- Script periódico (cron/Task Scheduler): `run-soak-sample.sh` (a criar na branch soak)
- Logs em `docs/evidence/soak-72h/logs/`
- Resumo: `SOAK-72H-REPORT.md` ao encerrar

## Hard stop (abortar soak)

- `GET /health` falha > 30 min
- Postgres down > 15 min
- Perda de dados não recuperável em PG

## Próximo passo

1. Trilha 0 **GO**
2. Preencher data/hora de início neste arquivo
3. Abrir branch `chore/soak-72h` com scripts de amostragem

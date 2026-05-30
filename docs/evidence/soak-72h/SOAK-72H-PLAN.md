# Soak 72h — plano operacional (G4 final)

**Status:** **EM EXECUÇÃO**  
**Branch:** `ops/soak-72h-g4-final`  
**Pré-requisitos:** Trilha 0 **GO**, G1 dual-system **GO**, G4-API P0 **GO**

## Janela (America/Sao_Paulo)

| Campo | Valor |
|-------|--------|
| **start_at** | `2026-05-30T00:00:00-03:00` |
| **end_at** | `2026-06-02T00:00:00-03:00` |
| **Duração** | 72 horas |
| **Baseline operacional (kickoff)** | `2026-05-30T09:02:28-03:00` |
| **Responsável** | Ops RSV360 / Sprint 0 |
| **Compose project** | `rsv360` |

## Coleta

| Parâmetro | Valor |
|-----------|--------|
| **Frequência** | A cada **6 h** (12 amostras periódicas + 1 baseline) |
| **Script Windows** | `run-soak-sample.ps1` |
| **Script Linux/WSL** | `run-soak-sample.sh` |
| **Agendamento** | `register-soak-scheduler.ps1` (Task Scheduler, 6 h) |
| **Logs** | `docs/evidence/soak-72h/logs/` |
| **Índice** | `logs/SOAK-SAMPLES.tsv` |
| **Relatório final** | `SOAK-72H-REPORT.md` (ao encerrar) |

### Slots esperados (a partir do kickoff 09:02 -03)

| # | Horário aproximado (-03) |
|---|--------------------------|
| 000 | 2026-05-30 09:02 (baseline) |
| 001 | 2026-05-30 15:02 |
| 002 | 2026-05-30 21:02 |
| 003 | 2026-05-31 03:02 |
| 004 | 2026-05-31 09:02 |
| 005 | 2026-05-31 15:02 |
| 006 | 2026-05-31 21:02 |
| 007 | 2026-06-01 03:02 |
| 008 | 2026-06-01 09:02 |
| 009 | 2026-06-01 15:02 |
| 010 | 2026-06-01 21:02 |
| 011 | 2026-06-02 03:02 |
| 012 | 2026-06-02 09:02 (última amostra antes do fechamento) |

## Critérios de aprovação (soak)

| ID | Critério | Limiar |
|----|----------|--------|
| S1 | `backend` Docker health | **healthy** em ≥ 95% das amostras |
| S2 | `site-publico` Docker health | **healthy** em ≥ 95% das amostras |
| S3 | `postgres` Docker health | **healthy** em **100%** das amostras |
| S4 | `GET :3002/health` | **200** em 12/12 amostras periódicas |
| S5 | `GET :3000/` | **200** em 12/12 amostras periódicas |
| S6 | Restart inesperado | **0** em `backend`, `site-publico`, `postgres` |
| S7 | API P0 re-smoke no fim | **8/8 OK** (`docs/evidence/g4-kickoff/run-api-p0-round1.sh`) |

## Critérios de falha (hard stop)

| ID | Condição | Ação |
|----|----------|------|
| F1 | `GET /health` indisponível > **30 min** | Abortar soak → NOGO |
| F2 | Postgres down > **15 min** | Abortar soak → NOGO |
| F3 | Perda de dados PG não recuperável | Abortar soak → NOGO |
| F4 | RestartCount crítico sobe sem deploy planejado | Investigar; pode abortar |
| F5 | Taxa de erro HTTP 5xx > **5%** em janela de 1 h (Prometheus, se disponível) | Investigar; pode abortar |

## Baseline inicial

Registrado em `logs/SOAK-BASELINE.tsv` e `logs/sample-000-baseline.log`.

## Encerramento

1. Após `end_at`, executar `run-soak-final.ps1`.
2. Preencher `SOAK-72H-REPORT.md` com veredito **GO** ou **NOGO**.
3. Se **GO**: atualizar `docs/SPRINT-0-EVIDENCIA-OPERACIONAL.md` §14 → **G4 completo = GO**.
4. Abrir PR com evidência; merge em `main`.

## Referências

- Plano rascunho original: `docs/evidence/trilha-0/SOAK-72H-PLAN.md` (redireciona para este arquivo)
- Trilha 0 GO: `docs/evidence/trilha-0/TRILHA-0-GO-REPORT.md`

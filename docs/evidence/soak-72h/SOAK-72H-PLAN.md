# Soak 72h — plano operacional (G4 final)

**Status:** **EM EXECUÇÃO**  
**Branch:** `ops/soak-72h-g4-final`  
**Pré-requisitos:** Trilha 0 **GO**, G1 dual-system **GO**, G4-API P0 **GO**

## Janela (America/Sao_Paulo)

> **Auditoria:** janela **operacional** = kickoff + 72h (não meia-noite do calendário).

| Campo | Valor |
|-------|--------|
| **start_at (kickoff)** | `2026-05-30T09:03:09-03:00` |
| **end_at (kickoff + 72h)** | `2026-06-02T09:03:09-03:00` |
| **Duração** | 72 horas exatas |
| **Referência calendário** | 30/05 → 02/06/2026 (rótulo apenas) |
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

### Slots esperados (kickoff `09:03:09`, intervalo 6h)

| # | Horário alvo (-03) |
|---|---------------------|
| 000 | 2026-05-30 09:03 (baseline) |
| 001 | 2026-05-30 15:03 |
| 002 | 2026-05-30 21:03 |
| 003 | 2026-05-31 03:03 |
| 004 | 2026-05-31 09:03 |
| 005 | 2026-05-31 15:03 |
| 006 | 2026-05-31 21:03 |
| 007 | 2026-06-01 03:03 |
| 008 | 2026-06-01 09:03 |
| 009 | 2026-06-01 15:03 |
| 010 | 2026-06-01 21:03 |
| 011 | 2026-06-02 03:03 |
| 012 | 2026-06-02 09:03 (última periódica; fechamento após este horário) |

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

Ver **`SOAK-72H-CLOSE-CHECKLIST.md`** (após `2026-06-02T09:03:09-03:00`).

1. Validar **≥ 13** amostras em `SOAK-SAMPLES.tsv` (000 + 001–012).
2. Executar `run-soak-final.ps1` → `SOAK-72H-REPORT.md`.
3. API P0 final **8/8** (`run-api-p0-round1.sh`).
4. Atualizar PR #249; se verde → **G4 completo = GO** + merge `main`.

## Referências

- Plano rascunho original: `docs/evidence/trilha-0/SOAK-72H-PLAN.md` (redireciona para este arquivo)
- Trilha 0 GO: `docs/evidence/trilha-0/TRILHA-0-GO-REPORT.md`

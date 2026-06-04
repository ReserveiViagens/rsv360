# Soak 72h — plano operacional (G4 final)

**Status:** **EM EXECUÇÃO (RESTART LIMPO)**  
**Branch:** `ops/soak-72h-g4-final`  
**Pré-requisitos:** Trilha 0 **GO**, G1 dual-system **GO**, G4-API P0 **GO**

## Janela (America/Sao_Paulo)

> **Auditoria:** janela **operacional** = kickoff + 72h (não meia-noite do calendário).

| Campo | Valor |
|-------|--------|
| **start_at (kickoff)** | `2026-06-01T10:12:40-03:00` |
| **end_at (kickoff + 72h)** | `2026-06-04T10:12:40-03:00` |
| **Duração** | 72 horas exatas |
| **Referência calendário** | reinício por incidente em 2026-06-01 |
| **Responsável** | Ops RSV360 / Sprint 0 |
| **Compose project** | `rsv360` |

## Janela anterior (abortada)

- Janela anterior: `2026-05-30T09:03:09-03:00` → `2026-06-02T09:03:09-03:00`
- Motivo do aborto: hard stop **F1** (backend down, amostra 009 FAIL)
- Evidência: `INCIDENT-2026-06-01-BACKEND-DOWN.md` + `logs/archive/`

## Coleta

| Parâmetro | Valor |
|-----------|--------|
| **Frequência** | A cada **6 h** (12 amostras periódicas + 1 baseline) |
| **Script Windows** | `run-soak-sample.ps1` |
| **Script Linux/WSL** | `run-soak-sample.sh` |
| **Agendamento** | `register-soak-scheduler-slots.ps1` (12 tarefas, horários exatos -03) |
| **Fallback operacional** | Coleta **manual** a cada 6h (`run-soak-sample.sh <id> periodic`) |
| **Logs** | `docs/evidence/soak-72h/logs/` |
| **Índice** | `logs/SOAK-SAMPLES.tsv` |
| **Relatório final** | `SOAK-72H-REPORT.md` (ao encerrar) |

### Slots esperados (kickoff e intervalo 6h)

| # | Horário alvo (-03) |
|---|---------------------|
| 000 | 2026-06-01 10:12 |
| 001 | 2026-06-01 16:12 |
| 002 | 2026-06-01 22:12 |
| 003 | 2026-06-02 04:12 |
| 004 | 2026-06-02 10:12 |
| 005 | 2026-06-02 16:12 |
| 006 | 2026-06-02 22:12 |
| 007 | 2026-06-03 04:12 |
| 008 | 2026-06-03 10:12 |
| 009 | 2026-06-03 16:12 |
| 010 | 2026-06-03 22:12 |
| 011 | 2026-06-04 04:12 |
| 012 | 2026-06-04 10:12 |

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

Registrar baseline `000` imediatamente após restart limpo.
- Baseline desta janela já coletado: `2026-06-01T10:13:29-03:00` (ver `SOAK-SAMPLES.tsv`).

## Observação de permissão local (Task Scheduler)

- Nesta máquina, a troca das tasks antigas retornou **Acesso negado**.
- Até ajuste com PowerShell/Admin, a janela segue com **coleta manual** nos horários dos slots.
- Isso **não invalida** a auditoria, desde que cada sample seja registrado no `SOAK-SAMPLES.tsv`.
- `run-soak-sample.ps1/.sh` agora ignora execução `periodic` fora dos slots (tolerância 20 min), evitando contaminação por task antiga.

## Encerramento

Ver **`SOAK-72H-CLOSE-CHECKLIST.md`** (após `2026-06-04T10:12:40-03:00`).

1. Validar **≥ 13** amostras em `SOAK-SAMPLES.tsv` (000 + 001–012).
2. Executar `run-soak-final.ps1` → `SOAK-72H-REPORT.md`.
3. API P0 final **8/8** (`run-api-p0-round1.sh`).
4. Atualizar PR #249; se verde → **G4 completo = GO** + merge `main`.

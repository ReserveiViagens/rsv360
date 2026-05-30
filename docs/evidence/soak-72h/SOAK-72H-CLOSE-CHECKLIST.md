# Soak 72h — checklist de fechamento (auditoria)

**Executar após:** `2026-06-02T09:03:09-03:00` (kickoff + 72h)  
**Branch:** `ops/soak-72h-g4-final` · **PR:** #249

## Janela operacional (canônica)

| Campo | ISO-8601 (-03) |
|-------|----------------|
| **kickoff / start_at** | `2026-05-30T09:03:09-03:00` |
| **end_at** | `2026-06-02T09:03:09-03:00` |

> Não usar meia-noite do dia 02/06 — a janela real é **72h a partir do kickoff**.

## 1. Amostras (`SOAK-SAMPLES.tsv`)

| # | Critério | Esperado | Resultado |
|---|----------|----------|-----------|
| C1 | Total de linhas de dados | **≥ 13** (000 baseline + 001–012 periódicas) | |
| C2 | Baseline `000` presente | OK | |
| C3 | Periódicas 001–012 (6h) | 12 linhas | |
| C4 | Todas `verdict=OK` | 13/13 (ou documentar exceção) | |
| C5 | S4 `:3002` = 200 nas periódicas | 12/12 | |
| C6 | S5 `:3000` = 200 nas periódicas | 12/12 | |
| C7 | S3 postgres `healthy` | 13/13 | |
| C8 | S6 restarts críticos = 0 | manual | |

## 2. Scripts

```powershell
cd docs\evidence\soak-72h
.\run-soak-final.ps1   # gera SOAK-72H-REPORT.md + amostra closing
```

| # | Critério | Resultado |
|---|----------|-----------|
| C9 | `run-soak-final.ps1` sem erro | |
| C10 | `SOAK-72H-REPORT.md` veredito preliminar | GO / NOGO |

## 3. API P0 final

```bash
# WSL/Git Bash, a partir do repo
docs/evidence/g4-kickoff/run-api-p0-round1.sh
```

| # | Critério | Resultado |
|---|----------|-----------|
| C11 | API P0 **8/8 OK** | |
| C12 | Log em `g4-kickoff/logs/API-P0-SUMMARY.tsv` anexado ao PR | |

## 4. Promoção G4

| # | Ação | Resultado |
|---|------|-----------|
| C13 | Atualizar `SOAK-72H-REPORT.md` S7 = PASS se C11 OK | |
| C14 | `SPRINT-0-EVIDENCIA-OPERACIONAL.md` §14 → **G4 completo = GO** | |
| C15 | Atualizar PR #249 (relatório + amostras finais) | |
| C16 | Merge #249 em `main` (somente se C1–C15 verdes) | |

## Veredito final

| | |
|-|-|
| **SOAK 72h** | GO / NOGO |
| **G4 completo** | GO / NOGO |

**Assinatura / data:** _______________

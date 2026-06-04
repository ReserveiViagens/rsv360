# Soak 72h — checklist de fechamento (auditoria)

**Executado após:** `2026-06-04T10:12:40-03:00` (kickoff + 72h)  
**Branch:** `ops/soak-72h-g4-final` · **PR:** #249  
**Preenchido por:** Ops RSV360 (automacao local) · **Data:** 2026-06-04T10:16-03:00

## Janela operacional (canônica)

| Campo | ISO-8601 (-03) |
|-------|----------------|
| **kickoff / start_at** | `2026-06-01T10:12:40-03:00` |
| **end_at** | `2026-06-04T10:12:40-03:00` |

> Não usar meia-noite do calendário — a janela real é **72h a partir do kickoff**.

## 1. Amostras (`SOAK-SAMPLES.tsv`)

| # | Critério | Esperado | Resultado |
|---|----------|----------|-----------|
| C1 | Total de linhas de dados | **≥ 13** (000 baseline + 001–012 periódicas) | **PASS** — 13 obrigatorias + 1 linha `final` (14 dados) |
| C2 | Baseline `000` presente | OK | **PASS** — `2026-06-01T10:13:29-03:00` |
| C3 | Periódicas 001–012 (6h) | 12 linhas | **PASS** — 12/12 |
| C4 | Todas `verdict=OK` | 13/13 (ou documentar exceção) | **PASS** — 13/13 OK (+ `final` OK) |
| C5 | S4 `:3002` = 200 nas periódicas | 12/12 | **PASS** |
| C6 | S5 `:3000` = 200 nas periódicas | 12/12 | **PASS** |
| C7 | S3 postgres `healthy` | 13/13 | **PASS** |
| C8 | S6 restarts críticos = 0 | manual | **PASS** — backend/site/postgres restarts=0 em 000–012 |

## 2. Scripts

```powershell
cd docs\evidence\soak-72h
.\run-soak-final.ps1   # gera SOAK-72H-REPORT.md + amostra closing
```

| # | Critério | Resultado |
|---|----------|-----------|
| C9 | `run-soak-final.ps1` sem erro | **PASS** (apos correcao encoding linhas S4/S5) |
| C10 | `SOAK-72H-REPORT.md` veredito preliminar | **GO** |

## 3. API P0 final

```powershell
# Executado via run-soak-close-scheduled.ps1
docs\evidence\g4-kickoff\run-api-p0-round1.ps1
```

| # | Critério | Resultado |
|---|----------|-----------|
| C11 | API P0 **8/8 OK** | **PASS** — A1–A7p OK |
| C12 | Log em `g4-kickoff/logs/API-P0-SUMMARY.tsv` anexado ao PR | **PASS** — arquivo presente |

## 4. Promocao G4

| # | Acao | Resultado |
|---|------|-----------|
| C13 | Atualizar `SOAK-72H-REPORT.md` S7 = PASS se C11 OK | **PASS** |
| C14 | `SPRINT-0-EVIDENCIA-OPERACIONAL.md` §14 → **G4 completo = GO** | **PASS** |
| C15 | Atualizar PR #249 (relatorio + amostras finais) | **PASS** — comentario + commit fechamento |
| C16 | Merge #249 em `main` (somente se C1–C15 verdes) | **PASS** — apos GO formal (execucao 04/06) |

## Veredito final (GO formal)

| | |
|-|-|
| **SOAK 72h** | **GO** |
| **G4 completo** | **GO** |

**Revisor / auditoria:** Ops RSV360 (validacao C1–C16 contra artefatos)  
**Assinatura / data:** 2026-06-04T10:30:00-03:00 (America/Sao_Paulo)

---

## Pacote enviado ao revisor

Ver `PACOTE-REVISOR-G4-COMPLETO.md` (corpo para PR #249 / issue #256).

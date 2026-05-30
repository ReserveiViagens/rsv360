# Trilha paralela 100% segura (durante soak 72h)

**Válido até:** `2026-06-02T09:03:09-03:00` (-03)  
**Governança:** `CHECKLIST-SOAK-SAFE.md` · regra Cursor `.cursor/rules/soak-safe-g4.mdc`

## Objetivo

Aproveitar a janela de soak **sem invalidar** a evidência G4, preparando a fase pós-soak.

## Trilha A — Documentação e governança

| # | Entrega | Branch sugerida | Impacto runtime |
|---|---------|-----------------|-----------------|
| A1 | Atualizar `SPRINT-0-EVIDENCIA-OPERACIONAL.md` (somente texto) | `docs/sprint0-*` | Nenhum |
| A2 | Matriz de riscos pós-G4 (TITAN, PG duplo :5432, rede compose) | `docs/risk-*` | Nenhum |
| A3 | Runbook rollout/rollback pós-promoção G4 (não executar) | `docs/ops-*` | Nenhum |
| A4 | Consolidar `CHECKLIST-SOAK-SAFE.md` + observações em `logs/SOAK-SAFE-OBSERVATIONS.log` | `ops/soak-72h-g4-final` | Nenhum |

## Trilha B — Revisão de código (leitura)

| # | Foco | Evidência | Issue |
|---|------|-----------|-------|
| B1 | Healthcheck `/healthcheck.sh` (#245) | [TRILHA-B-252-healthcheck-evidence.md](./issues/TRILHA-B-252-healthcheck-evidence.md) | [#252](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/252) **ready** |
| B2 | Auth demo / middleware | [TRILHA-B-255-auth-evidence.md](./issues/TRILHA-B-255-auth-evidence.md) | [#255](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/255) **ready** |
| B3 | API contract matrix | Atualizar pós-#255 (A6 → 401) | #255 |
| B4 | Lint/type-check local **sem** subir containers | Pendente | [#253](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/253) |

## Trilha C — Backlog pós-soak (issues GitHub)

**Índice:** [`issues/ISSUES-POS-SOAK-INDEX.md`](./issues/ISSUES-POS-SOAK-INDEX.md)  
**Label:** `post-soak-draft` — **não executar** até G4 completo GO + fim soak.

| ID | Item | Prioridade | Issue |
|----|------|------------|-------|
| C1 | Unificar rede `docker compose -p rsv360` | P1 | [#250](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/250) |
| C2 | Postgres duplo :5432 | P1 | [#251](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/251) |
| C3 | Healthcheck guest/admin/turismo | P2 | [#252](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/252) |
| C4 | Warnings lint (baseline → redução) | P2 | [#253](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/253) |
| C5 | Observabilidade (5xx, alertas, runbook) | P2 | [#254](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/254) |
| C6 | Hardening auth (401, demo token) | P1 | [#255](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/255) |
| GATE | G4 completo → PLANO-MESTRE | P0 | [#256](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/256) |

### Mapeamento tema → issue

| Tema | Issues |
|------|--------|
| healthcheck / Docker | #250, #252 |
| warnings lint | #253 |
| observabilidade | #254 |
| hardening auth | #255 |
| infra / gate | #251, #256 |

## Trilha D — PRs seguros (merge permitido)

- Apenas **`docs-only`** ou **evidência operacional** (TSV/MD em `docs/evidence/`).
- **Não** mergear código de app/backend até veredito G4 completo.
- PR #249 (`ops/soak-72h-g4-final`): merge **após** fechamento + GO do revisor.

## Rotina diária (2 min, leitura)

```powershell
cd docs\evidence\soak-72h
.\run-soak-safe-monitor.ps1
```

Registrar anomalias em `logs/SOAK-SAFE-OBSERVATIONS.log` — **não** aplicar hotfix.

## Codex — instrução de sessão

Colar no início da sessão Codex (ou `CODEX-SOAK-SAFE.txt` na raiz do clone):

```txt
MODO SOAK SAFE ATIVO até 2026-06-02T09:03:09-03:00.
Não execute mudanças no ambiente monitorado (rsv360).
Bloqueie: build/restart de containers, env/rede/DB/migrations, merges runtime, alteração tasks Sample/Close.
Atue em: docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md, backlog, revisão leitura.
Leia: docs/evidence/soak-72h/CHECKLIST-SOAK-SAFE.md
```

## Cursor AI — já ativo

Regra persistente: `.cursor/rules/soak-safe-g4.mdc` (`alwaysApply: true`).

## Fechamento (02/06 após 09:03)

1. Task `RSV360-Soak-72h-Close` ou `run-soak-close-scheduled.ps1`
2. Pacote: `SOAK-SAMPLES.tsv`, `SOAK-72H-REPORT.md`, `API-P0-SUMMARY.tsv`
3. Validação C1–C16 → GO/NOGO G4 completo

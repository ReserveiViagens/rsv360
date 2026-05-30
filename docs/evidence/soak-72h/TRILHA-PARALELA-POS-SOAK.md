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

| # | Foco | Ação |
|---|------|------|
| B1 | Healthcheck `/healthcheck.sh` (#245) | Revisar Dockerfile sem rebuild |
| B2 | Auth demo / middleware site-publico | Notas de débito técnico |
| B3 | API contract matrix `g4-kickoff/API-CONTRACT-MATRIX.md` | Gap A2 histórico vs atual |
| B4 | Lint/type-check local **sem** subir containers | `npm run lint` se não tocar rede |

## Trilha C — Backlog pós-soak (issues / PR drafts)

| # | Item | Prioridade pós-GO |
|---|------|-------------------|
| C1 | Unificar rede `docker compose -p rsv360` (eliminar `network connect` manual) | P1 |
| C2 | Resolver Postgres duplo em :5432 (Sprint 0 §9) | P1 |
| C3 | Frontends `guest`/`admin`/`turismo` unhealthy — investigar | P2 |
| C4 | Soak contínuo 7d em staging (opcional) | P3 |
| C5 | Promover G4 completo → PLANO-MESTRE fase seguinte | Gate |

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

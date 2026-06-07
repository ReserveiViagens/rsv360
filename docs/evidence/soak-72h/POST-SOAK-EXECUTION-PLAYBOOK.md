# Playbook — execução pós-GO (G4 completo)

**Versão:** 2026-05-30  
**Pré-requisito:** Soak Safe encerrado + **#256** veredito **GO**  
**Índice issues:** [ISSUES-POS-SOAK-INDEX.md](./issues/ISSUES-POS-SOAK-INDEX.md)

## 0. Gate (obrigatório)

| Passo | Ação | Evidência |
|-------|------|-----------|
| G0 | Revisor valida C1–C16 | `SOAK-SAMPLES.tsv`, `SOAK-72H-REPORT.md`, `API-P0-SUMMARY.tsv` |
| G1 | Merge PR #249 em `main` | Commit em `main` |
| G2 | Atualizar `SPRINT-0-EVIDENCIA-OPERACIONAL.md` §14 | G4 completo = **GO** |
| G3 | Remover/desativar Soak Safe (regra Cursor opcional) | `.cursor/rules/soak-safe-g4.mdc` — **DONE 2026-06-04** |

## 1. Go-live order (após soak GO — acordado)

| # | Passo | Referência |
|---|--------|------------|
| 1 | **#256** gate G4 | Pacote soak + API P0 + GO revisor |
| 2 | **PR #250** rede unificada | [PR-DRAFT-250-COPY-PASTE.md](./issues/PR-DRAFT-250-COPY-PASTE.md) |
| 3 | **#251** Postgres :5432 | Issue #251 |
| 4 | **#252** healthcheck frontends | Issue #252 |
| 5 | **#255** auth (3 PRs em sequência) | [PR-DRAFT-255-COPY-PASTE.md](./issues/PR-DRAFT-255-COPY-PASTE.md) |
| 6 | **#253** ∥ **#254** | Lint + observabilidade (paralelo) |

> Checklist operacional detalhado: a confirmar pelo revisor no fechamento (“go-live order”).

## 2. Infra (#250 + #251)

**Issues:** [#250](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/250) · [#251](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/251)

- **#250 primeiro** (draft pronto) — base estável para #252/#255.
- Rede canônica: `rsv360_internal` (`docker compose -p rsv360 up -d` — **sem** `docker network connect`).
- #251 em seguida; coordenar restart PG na mesma janela se possível.

## 3. Healthcheck frontends

**Issue:** [#252](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/252)

```powershell
docker compose -p rsv360 build admin guest turismo
docker compose -p rsv360 up -d --no-deps admin guest turismo
```

Validar `Health.Status=healthy` e HTTP 200 em 3004/3005/3006.

## 4. Auth hardening

**Issue:** [#255](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/255)

- PRs pequenos (lib → rotas admin → login).
- API P0 final **8/8** com A6 = 401 sem token.

## 5. Qualidade e ops (paralelo)

| Issue | Foco |
|-------|------|
| [#253](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/253) | Lint warnings |
| [#254](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/254) | Prometheus/Grafana/runbook |

## 6. PLANO-MESTRE

Após #250–#255 conforme prioridade do produto → iniciar fase documentada em `docs/integracao-v3/sprint-0/PLANO-MESTRE-v3-CONSOLIDADO.md` (somente com G0–G4 verdes).

**Integração S1↔S2 validada 2026-06-06** — próximos passos: workspace integração `03-PROXIMA-TRILHA-POS-INTEGRACAO.md` (G1 formal · G2 S1 · Segurança · G3 → Trilha 0).

## Referências

- [CHECKLIST-SOAK-SAFE.md](./CHECKLIST-SOAK-SAFE.md)
- [ROLLBACK-RUNBOOK-POST-G4.md](./ROLLBACK-RUNBOOK-POST-G4.md)
- [RISK-MATRIX-POS-SOAK.md](./RISK-MATRIX-POS-SOAK.md)

## Status
**READY-TO-IMPLEMENT** — executar somente **após** **#256** (G4 gate GO).

## Trilha e evidência
- [TRILHA-PARALELA-POS-SOAK.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- [TRILHA-0-OBSERVABILITY.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/trilha-0/TRILHA-0-OBSERVABILITY.md)
- [SOAK-72H-PLAN.md — F5 (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/SOAK-72H-PLAN.md)

## Prioridade | Impacto
**P2** | Formaliza métricas 5xx (hoje `smoke-only` no soak); suporte ops/TITAN.

## Contexto
- `rsv360-prometheus`, `rsv360-grafana` Up no kickoff soak.
- Critério soak **F5**: taxa 5xx > 5% / 1h → investigar/abortar.

## Dependência de ordem

| Regra | Detalhe |
|-------|---------|
| **Bloqueada por** | **#256** G4 GO |
| **Paralelo com** | **#253** (lint — sem conflito) |
| **Após** | **#250–#252** (stack estável) |
| **Durante soak** | Sem restart prometheus/grafana; só leitura |

## Implementação sugerida

1. Query PromQL documentada: 5xx backend (`:3002`) + BFF (`:3000`).
2. Regra Alertmanager: health down > 15 min (alinhar SOAK hard stop F1).
3. Runbook: links Grafana `:3007`, Prometheus `:9090`, logs Docker.
4. Opcional: plano soak 7d staging (reuso `run-soak-sample.ps1`).

## Critérios de aceite (positivo)

- [ ] Query 5xx versionada em `monitoring/` ou doc ops
- [ ] Alerta mínimo testado (fire drill ou screenshot silenced)
- [ ] Runbook em `docs/evidence/trilha-0/` ou `monitoring/README`
- [ ] F5 do soak mapeado para métrica real (não só smoke)

## Critérios negativos (não pode)

- [ ] Depender só de `curl` manual sem documentação
- [ ] Alertas sem rota de escalonamento
- [ ] Mudança de rede compose sem coordenar #250

## Evidência obrigatória no PR

| Artefato | Conteúdo |
|----------|----------|
| `promql-5xx.md` | Queries + interpretação |
| `alertmanager-rule.diff` | Regra nova ou alterada |
| `grafana-screenshot.png` | Painel ou explore (opcional) |
| `runbook-observability.md` | Passo a passo dev/staging |

## Relacionadas
#254 (esta) · #250 · SOAK F5 · #256

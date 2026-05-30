## Status
**RASCUNHO pós-soak** — não executar durante soak 72h.

## Trilha paralela
- **Ref:** [TRILHA-PARALELA-POS-SOAK.md — C4 / Trilha 0 observability](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/ops/soak-72h-g4-final/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- **Tema:** observabilidade

## Prioridade
**P2**

## Impacto
- Critério F5 do soak: taxa 5xx via Prometheus (hoje `smoke-only`).
- Suporte a soak 7d staging (C4 opcional) e TITAN.

## Contexto
- `rsv360-prometheus`, `rsv360-grafana` Up no kickoff soak.
- `TRILHA-0-OBSERVABILITY.md` — alinhar pós-G4.

## Critérios de aceite
- [ ] Dashboard ou query documentada: 5xx rate backend + site BFF.
- [ ] Alerta mínimo (Alertmanager) para health down > 15 min.
- [ ] Runbook: onde ver logs/métricas em dev e staging.
- [ ] Opcional: job amostragem soak 7d reutilizando `run-soak-sample.ps1`.

## Bloqueio
Não reiniciar stack de monitoring durante soak; apenas docs/queries até GO G4.

## Relacionadas
- `docs/evidence/trilha-0/TRILHA-0-OBSERVABILITY.md`
- `SOAK-72H-PLAN.md` critério F5

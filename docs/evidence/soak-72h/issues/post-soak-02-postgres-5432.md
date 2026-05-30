## Status
**RASCUNHO pós-soak** — não executar durante soak 72h.

## Trilha paralela
- **Ref:** [TRILHA-PARALELA-POS-SOAK.md — C2](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/ops/soak-72h-g4-final/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md#trilha-c--backlog-pós-soak-issues--pr-drafts)
- **Tema:** infra / banco

## Prioridade
**P1**

## Impacto
- Remove ambiguidade de dois processos PostgreSQL na porta **5432** do host.
- Evita migrations/dumps apontando para instância errada.
- Crítico para rollout TITAN/staging.

## Contexto
- Sprint 0 §9: PID duplo em 5432 (investigar PID 3904).
- Soak usa `rsv360-postgres` container — não alterar até fim da janela.

## Critérios de aceite
- [ ] Inventário documentado: qual PG é canônico (Docker 5432 vs host).
- [ ] Apenas uma instância ativa na porta esperada em dev.
- [ ] `pg_dump`/migrations testados contra instância canônica.
- [ ] Atualizar `SPRINT-0-EVIDENCIA-OPERACIONAL.md` §9 como resolvido.

## Bloqueio
Após **G4 completo = GO**; sem restart de `rsv360-postgres` durante soak.

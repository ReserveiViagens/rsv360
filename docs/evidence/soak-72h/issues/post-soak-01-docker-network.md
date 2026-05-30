## Status
**RASCUNHO pós-soak** — não executar durante soak 72h (até `2026-06-02T09:03:09-03:00`).

## Trilha paralela
- **Ref:** [TRILHA-PARALELA-POS-SOAK.md — C1](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/ops/soak-72h-g4-final/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md#trilha-c--backlog-pós-soak-issues--pr-drafts)
- **Tema:** healthcheck / infra Docker

## Prioridade
**P1**

## Impacto
- Elimina workaround `docker network connect` entre `rsv360_default` e `rsv360-phase1_default`.
- Reduz risco de falha intermitente site↔postgres durante smoke e soak.
- Base para healthchecks estáveis em stack única.

## Contexto (evidência)
- G1 rodada 2: rede corrigida manualmente; ideal unificar via `docker compose -p rsv360 up -d`.
- Soak monitora: `rsv360-backend`, `rsv360-site-publico`, `rsv360-postgres`.

## Critérios de aceite
- [ ] `docker compose -p rsv360 up -d` sobe stack sem `network connect` manual.
- [ ] `site-publico` e `postgres` na mesma rede compose documentada.
- [ ] Re-smoke G1 **10/10** e Trilha 0 preflight **8/8** após mudança.
- [ ] Documentar em `CONFIGURACAO_SERVIDORES.md` ou evidência ops.

## Bloqueio
Executar somente após **G4 completo = GO** e fim do soak 72h.

## Relacionadas
- PR #245 (healthcheck backend)
- Issue #197 (Redis/cache) — verificar se rede unificada resolve

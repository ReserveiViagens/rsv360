## Status
**READY-TO-IMPLEMENT** — executar somente **após** **#256** (G4 gate GO).

## Trilha e evidência
- [TRILHA-PARALELA-POS-SOAK.md — C2 (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md#trilha-c--backlog-pós-soak-github)
- [ISSUES-POS-SOAK-INDEX.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/issues/ISSUES-POS-SOAK-INDEX.md)
- Sprint 0: [SPRINT-0-EVIDENCIA-OPERACIONAL.md §9 (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/SPRINT-0-EVIDENCIA-OPERACIONAL.md)

## Prioridade | Impacto
**P1** | Dois PIDs em **:5432** no host → risco de dump/migration na instância errada.

## Contexto
- Item aberto Sprint 0 §9 (PID duplo).
- Soak usou `rsv360-postgres` container — **não alterar** durante janela soak.

## Dependência de ordem

| Regra | Detalhe |
|-------|---------|
| **Bloqueada por** | **#256** G4 GO + fim soak |
| **Paralelo com** | **#250** (coordenar para um único restart planejado) |
| **Antes de** | **#255** (auth depende de PG canônico claro) |
| **Durante soak** | Sem restart `rsv360-postgres`, sem migrations |

## Implementação sugerida

1. Inventariar: `netstat` / `Get-NetTCPConnection :5432` + `docker ps` postgres.
2. Definir instância **canônica** (Docker `rsv360-postgres` recomendado).
3. Parar/desabilitar PG host concorrente ou mudar porta documentada.
4. Validar `pg_dump` e `database/g4-auth-smoke-tables.sql` na canônica.

## Critérios de aceite (positivo)

- [ ] Documento: qual PG é canônico e por quê
- [ ] **Uma** instância ativa em `:5432` em dev (ou porta alternativa documentada)
- [ ] `pg_dump` + login A3 smoke OK contra canônica
- [ ] `SPRINT-0-EVIDENCIA-OPERACIONAL.md` §9 marcado resolvido

## Critérios negativos (não pode)

- [ ] Dois listeners em 5432 sem documentação
- [ ] Perda de dados do soak sem backup
- [ ] API P0 A3/A6 regressão por PG errado

## Rollback (1 linha)

Restaurar mapeamento de porta / serviço Windows anterior documentado no PR + `docker compose -p rsv360 up -d postgres` com volume existente.

## Evidência obrigatória no PR

| Artefato | Conteúdo |
|----------|----------|
| `postgres-inventory.txt` | PIDs, portas, container name |
| `pg_dump-test.log` | Dump bem-sucedido pós-fix |
| `API-P0-A3-A6.txt` | HTTP codes login/admin após fix |
| Atualização §9 | Link/commit em SPRINT-0 |

## Relacionadas
#250 #255 #256

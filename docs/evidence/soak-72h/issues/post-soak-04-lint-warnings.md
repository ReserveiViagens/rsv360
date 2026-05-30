## Status
**RASCUNHO pós-soak** — não executar durante soak 72h.

## Trilha paralela
- **Ref:** [TRILHA-PARALELA-POS-SOAK.md — B4](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/ops/soak-72h-g4-final/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md#trilha-b--revisão-de-código-leitura)
- **Tema:** warnings lint

## Prioridade
**P2**

## Impacto
- Reduz ruído pós-baseline (#238 site-publico, #239 admin).
- Facilita G2 estrito e CI sem `--max-warnings` inflado.
- Não altera runtime se feito como PR incremental.

## Contexto
- G2 **GO 21/21** com baseline de warnings congelado.
- Trilha B4: `npm run lint` local permitido se não subir containers.

## Critérios de aceite
- [ ] Inventário de warnings por workspace (antes/depois).
- [ ] PRs pequenos: site-publico, admin, backend (sem mudança de comportamento).
- [ ] `npm run lint` verde ou dentro do teto acordado em CI.
- [ ] Nenhuma regressão em API P0 **8/8**.

## Bloqueio
Merge após G4 completo; evitar refactors grandes na mesma PR.

## Relacionadas
- PR #238, #239

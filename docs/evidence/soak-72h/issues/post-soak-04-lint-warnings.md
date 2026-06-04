## Status
**READY-TO-IMPLEMENT** — executar somente **após** **#256** GO e preferencialmente após **#252** / **#255**.

## Trilha e evidência
- [TRILHA-PARALELA-POS-SOAK.md — B4 (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md#trilha-b--revisão-de-código-leitura)
- [TRILHA-B-255-auth-evidence.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/issues/TRILHA-B-255-auth-evidence.md) — B4 escopo
- Baseline: PR [#238](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/238), [#239](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pull/239)

## Prioridade | Impacto
**P2** | Reduz ruído lint pós-baseline; melhora G2/CI sem mudar comportamento runtime.

## Non-goals

- **Não** refatorar features ou UI.
- **Não** alterar contratos API (ver #255).
- **Não** subir containers (`npm run lint` local/CI apenas).

## Dependência de ordem

| Regra | Detalhe |
|-------|---------|
| **Bloqueada por** | **#256** G4 GO |
| **Paralelo com** | **#254** (observabilidade — docs/ops) |
| **Após** | **#252**, **#255** (evitar conflito de PR grande) |
| **Durante soak** | Sem merge que altere runtime |

## Implementação sugerida

1. Inventário: `npm run lint --workspaces` (antes/depois por workspace).
2. PRs pequenos: `apps/site-publico`, `apps/admin`, `backend`.
3. Somente fixes mecânicos (unused, imports, eslint-disable justificado).

## Critérios de aceite (positivo)

- [ ] Tabela antes/depois de warnings por workspace no PR
- [ ] `npm run lint` dentro do teto CI acordado
- [ ] G2 revalidação **21/21** ou documentação de delta aceito
- [ ] API P0 permanece **8/8**

## Critérios negativos (não pode)

- [ ] PR único gigante misturando lint + auth + docker
- [ ] Mudança de comportamento em rotas API
- [ ] Quebra build produção

## Evidência obrigatória no PR

| Artefato | Conteúdo |
|----------|----------|
| `lint-inventory-before-after.tsv` | workspace · warnings · delta |
| `lint-ci.log` | Saída CI verde ou teto documentado |
| `g2-rerun.tsv` | Opcional: gates G2 pós-lint |
| `API-P0-SUMMARY.tsv` | 8/8 após merge da branch lint |

## Relacionadas
#253 (esta) · #238 #239 #255 #256

## Status
**READY-TO-IMPLEMENT** — executar somente **após** **#256** (G4 gate GO).

## Trilha e evidência
- [TRILHA-PARALELA-POS-SOAK.md — C1 (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md#trilha-c--backlog-pós-soak-github)
- [ISSUES-POS-SOAK-INDEX.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/issues/ISSUES-POS-SOAK-INDEX.md)
- **Tema:** infra Docker / rede compose

## Prioridade | Impacto
**P1** | Elimina `docker network connect` manual; reduz falha intermitente site↔postgres.

## Contexto (evidência existente)
- G1 rodada 2: workaround `rsv360-phase1_default` ↔ `site-publico`.
- Soak monitorou `rsv360-backend`, `rsv360-site-publico`, `rsv360-postgres` (verdes).

## Dependência de ordem

| Regra | Detalhe |
|-------|---------|
| **Bloqueada por** | **#256** G4 GO + fim soak |
| **Paralelo com** | **#251** (Postgres :5432) — mesma janela pós-GO, cuidado com restart |
| **Antes de** | **#252**, **#255** (preferir rede estável antes de rebuild frontends/auth) |
| **Durante soak** | Proibido `compose up --build` no ambiente monitorado |

## Implementação sugerida

- Unificar `docker-compose.yml` / project `rsv360` para uma rede compose documentada.
- `docker compose -p rsv360 up -d` sem `network connect` manual.
- Documentar em `CONFIGURACAO_SERVIDORES.md` ou `docs/evidence/ops/`.

## Critérios de aceite (positivo)

- [ ] `site-publico` e `postgres` na **mesma rede** compose (inspect networks)
- [ ] G1 re-smoke **10/10** OK
- [ ] Trilha 0 preflight **8/8** OK
- [ ] `:3000` e `:3002/health` → **200**

## Critérios negativos (não pode)

- [ ] Dependência permanente de `docker network connect` manual
- [ ] Regressão G1 rede (T0-net GAP)
- [ ] Smoke API P0 < 8/8 após mudança

## Rollback (1 linha)

```powershell
docker network connect rsv360-phase1_default rsv360-site-publico
# + documentar estado anterior no PR se rollback parcial
```

## Evidência obrigatória no PR

| Artefato | Conteúdo |
|----------|----------|
| `g1-after-network.tsv` | Saída `run-g1-dual-system.ps1` 10/10 |
| `docker-network-inspect.txt` | Networks de site-publico + postgres (comum) |
| `trilha0-preflight.tsv` | 8/8 |
| Diff compose | `docker-compose.yml` ou override documentado |

## Relacionadas
#251 #252 #197 #245 #256

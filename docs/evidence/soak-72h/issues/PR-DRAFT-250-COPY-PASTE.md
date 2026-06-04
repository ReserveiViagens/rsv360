# PR draft #250 — copiar/colar no GitHub

> **Não abrir este PR antes de:** #256 G4 GO + fim soak `2026-06-02T09:03:09-03:00`  
> **Issue:** https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/250

---

## Título do PR

```
fix(docker): unificar rede compose rsv360 (elimina network connect manual)
```

## Branch

```
fix/post-soak-250-docker-network
```

Base: `main` (após merge PR #249 soak, se aplicável)

---

## Corpo do PR (copiar abaixo)

```markdown
## Summary

Unifica a rede Docker do stack **`rsv360`** para que todos os serviços críticos (em especial `site-publico` ↔ `postgres`) subam na **mesma rede compose**, eliminando o workaround manual:

```powershell
docker network connect rsv360-phase1_default rsv360-site-publico
```

**Closes #250**

## Contexto / problema

- G1 rodada 2 e Trilha 0 exigiram `network connect` porque `site-publico` ficou em `rsv360_default` e `postgres` em `rsv360-phase1_default`.
- Risco: falha intermitente de resolução `DB_HOST=postgres` e GAP em `T0-net` / `G1-INFRA-04`.
- Evidência: `docs/evidence/g1-dual-system/G1-DUAL-SYSTEM-FINAL-REPORT.md` (workaround documentado).

## Mudanças propostas

### 1. `docker-compose.yml`

- Declarar rede explícita (ex.: `rsv360_net` com `name: rsv360_internal` ou rede default nomeada do project).
- Anexar **todos** os serviços do stack (`postgres`, `redis`, `backend`, `site-publico`, `admin`, `guest`, `turismo`, monitoring) à mesma rede.
- Garantir `site-publico` com `DB_HOST: postgres` resolvendo via DNS interno da rede (sem connect manual).

### 2. Documentação ops

- Atualizar `CONFIGURACAO_SERVIDORES.md` ou `docs/evidence/soak-72h/POST-SOAK-EXECUTION-PLAYBOOK.md` com:
  - Comando canônico: `docker compose -p rsv360 up -d`
  - Proibição de `network connect` como procedimento permanente
  - `COMPOSE_PROJECT_NAME=rsv360` (ou `-p rsv360`) obrigatório

### 3. (Opcional) Script de verificação

- Adicionar check em `docs/evidence/g1-dual-system/run-g1-dual-system.ps1` ou `run-trilha0-preflight.ps1` que falha se `site-publico` e `postgres` não compartilham rede.

## O que NÃO está neste PR

- Rebuild healthcheck guest/admin/turismo → **#252**
- Auth / demo token → **#255**
- Resolução Postgres duplo :5432 → **#251** (coordenar janela de restart)

## Test plan

Executar **após** deploy local do branch:

```powershell
$env:RSV360_DOCKER_PROJECT = 'rsv360'
docker compose -p rsv360 up -d
# NÃO executar: docker network connect ...
```

| # | Comando / check | Esperado |
|---|-----------------|----------|
| 1 | `docker inspect rsv360-site-publico` + `rsv360-postgres` — networks | **Rede comum** documentada |
| 2 | `.\docs\evidence\g1-dual-system\run-g1-dual-system.ps1` | **10/10 OK** (T0-net OK) |
| 3 | `.\docs\evidence\trilha-0\run-trilha0-preflight.ps1` | **8/8 OK** |
| 4 | `Invoke-WebRequest http://127.0.0.1:3002/health` | **200** |
| 5 | `Invoke-WebRequest http://127.0.0.1:3000/` | **200** |
| 6 | `docs/evidence/g4-kickoff/run-api-p0-round1.ps1` | **8/8 OK** |

## Evidência obrigatória (anexar no PR)

| Artefato | Descrição |
|----------|-----------|
| `docs/evidence/soak-72h/logs/g1-after-network.tsv` | Export `G1-SUMMARY.tsv` pós-fix 10/10 |
| `docs/evidence/soak-72h/logs/docker-network-inspect.txt` | `docker inspect` networks site-publico + postgres |
| `docs/evidence/soak-72h/logs/trilha0-preflight-after.tsv` | Preflight 8/8 |
| `docs/evidence/g4-kickoff/logs/API-P0-SUMMARY.tsv` | 8/8 pós-rede |

## Critérios de aceite (issue #250)

**Positivo**
- [ ] `site-publico` + `postgres` mesma rede compose
- [ ] G1 10/10, preflight 8/8, HTTP 200 :3000/:3002
- [ ] API P0 8/8

**Negativo**
- [ ] Sem dependência de `network connect` manual
- [ ] Sem GAP T0-net / G1-INFRA-04

## Rollback

```powershell
docker network connect rsv360-phase1_default rsv360-site-publico
docker compose -p rsv360 up -d
```

Documentar no PR se rollback parcial foi necessário.

## Ordem pós-GO

#256 (gate) → **este PR #250** → (#251 ∥) → #252 → #255

## Referências

- [TRILHA-PARALELA C1 (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- [RISK-MATRIX R1](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/RISK-MATRIX-POS-SOAK.md)
- Issue #197 (Redis) — validar se rede unificada melhora cache Redis
```

---

## Snippet `docker-compose.yml` (referência para implementação)

```yaml
networks:
  rsv360_internal:
    name: rsv360_internal
    driver: bridge

services:
  postgres:
    networks: [rsv360_internal]
  redis:
    networks: [rsv360_internal]
  backend:
    networks: [rsv360_internal]
  site-publico:
    networks: [rsv360_internal]
  admin:
    networks: [rsv360_internal]
  guest:
    networks: [rsv360_internal]
  turismo:
    networks: [rsv360_internal]
  prometheus:
    networks: [rsv360_internal]
  alertmanager:
    networks: [rsv360_internal]
  grafana:
    networks: [rsv360_internal]
```

> Ajustar nome da rede conforme política do time (pode ser `${COMPOSE_PROJECT_NAME}_default` se preferir compatibilidade com volumes existentes).

---

## Checklist antes de abrir o PR

- [ ] #256 merge / G4 completo = **GO**
- [ ] Soak encerrado (`>= 2026-06-02T09:03:09-03:00`)
- [ ] Soak Safe desativado para esta janela de deploy
- [ ] Coordenado com #251 se houver restart de `postgres` no mesmo dia

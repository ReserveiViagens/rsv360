## Status
**READY-TO-IMPLEMENT** — executar somente **após** fim do soak e **G4 completo = GO**.

## Trilha e evidência
- [TRILHA-PARALELA-POS-SOAK.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- [TRILHA-B-252-healthcheck-evidence.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/issues/TRILHA-B-252-healthcheck-evidence.md)

## Prioridade | Impacto
**P2** | Falso `unhealthy` em guest/admin/turismo; apps respondem HTTP; probe Docker legado.

## Causa raiz (confirmada — leitura 30/05)
- Imagens **29/05** usam `wget http://localhost:${APP_PORT}` (**literal**, sem expandir).
- `site-publico` (rebuild recente) usa `/healthcheck.sh` com porta fixada no build (**healthy**).
- `docker exec` + `wget 127.0.0.1:3006/` → **OK**; HEALTHCHECK → **unhealthy**.

Referência fix: `docker/frontend/Dockerfile` L68–73 (PR #245).

## Dependência de ordem
| Regra | Detalhe |
|-------|---------|
| **Bloqueada por** | Fim do soak `2026-06-02T09:03:09-03:00` + veredito **#256** (G4 gate) |
| **Sequência** | **#256** → **#252** (esta) → **#255** auth |
| **Não fazer durante soak** | `compose build/up`, restart dos monitorados |

## Implementação (pós-soak)

```powershell
docker compose -p rsv360 build admin guest turismo
docker compose -p rsv360 up -d --no-deps admin guest turismo
```

## Critérios de aceite (positivo)

- [ ] `docker inspect rsv360-{guest,admin,turismo} --format '{{.Config.Healthcheck.Test}}'` → `[/healthcheck.sh]`
- [ ] Após **start-period** (60s): `Health.Status` = **healthy** nos 3 containers
- [ ] **Sem regressão HTTP:** `GET :3004/`, `:3005/`, `:3006/` → **200** (ou código acordado documentado)
- [ ] G1 smoke / preflight sem regressão nos serviços já verdes do soak

## Critérios negativos (não pode)

- [ ] HEALTHCHECK ainda contendo `${APP_PORT}` literal na imagem em execução
- [ ] Qualquer um dos 3 frontends permanece **unhealthy** após 3 ciclos pós start-period
- [ ] HTTP 5xx ou connection refused em `:3004/:3005/:3006` após deploy

## Rollback (1 linha)

Se regressão após rebuild, recriar com imagem/tag anterior (ajustar tag conforme ambiente):

```powershell
docker compose -p rsv360 up -d --no-deps --force-recreate admin guest turismo
# + tag/imagem anterior documentada no PR (ex.: imagem pré-rebuild 29/05)
```

## Evidência obrigatória no PR

Anexar no corpo do PR ou em `docs/evidence/soak-72h/issues/`:

| Artefato | Conteúdo |
|----------|----------|
| `healthcheck-inspect.txt` | Saída `docker inspect` Healthcheck.Test + Health.Status dos 3 serviços |
| `http-smoke-3004-3006.tsv` | `curl`/Invoke-WebRequest :3004, :3005, :3006 → status |
| `docker-ps-after.txt` | `docker ps` mostrando **healthy** |
| Link PR #245 / Dockerfile | Diff ou referência ao `docker/frontend/Dockerfile` |

## Relacionadas
#245 #242 #250 #256

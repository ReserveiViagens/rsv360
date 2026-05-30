# Trilha B — Evidência técnica #252 (healthcheck / PR #245)

**Modo:** leitura + `docker inspect`/`docker exec` (sem rebuild/restart)  
**Data:** 2026-05-30  
**Issue:** [#252](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/252)

## Resumo executivo

| Container | Health | Causa raiz (evidência) |
|-----------|--------|-------------------------|
| `rsv360-site-publico` | **healthy** | Imagem com `/healthcheck.sh` (PR #245) |
| `rsv360-guest` | **unhealthy** | HEALTHCHECK legado: URL com `${APP_PORT}` literal |
| `rsv360-admin` | **unhealthy** | Idem guest |
| `rsv360-turismo` | **unhealthy** | Idem guest |
| `rsv360-backend` | **healthy** | `wget` → `/health` (compose) |

App **está no ar** nos três frontends unhealthy; falha é só do probe Docker.

## Comportamento atual (runtime, leitura)

### site-publico (referência OK)

```text
Config.Healthcheck.Test = ["CMD-SHELL", "/healthcheck.sh"]
```

Arquivo no build:

```68:73:docker/frontend/Dockerfile
# HEALTHCHECK não expande ARG/ENV na instrução CMD — porta fixada no build via script
RUN printf '%s\n' '#!/bin/sh' "exec wget --no-verbose --tries=1 -O /dev/null http://127.0.0.1:${APP_PORT}/" > /healthcheck.sh \
  && chmod +x /healthcheck.sh
HEALTHCHECK ... CMD /healthcheck.sh
```

`APP_PORT` é expandido **no RUN** (build arg), não no HEALTHCHECK.

### guest / admin / turismo (imagem de 29/05, pré-rebuild)

```text
Config.Healthcheck.Test = ["CMD-SHELL", "wget ... http://localhost:${APP_PORT} || exit 1"]
```

- `docker exec rsv360-guest cat /healthcheck.sh` → **arquivo inexistente**
- Log health: `Connection refused` (wget tenta host/porta inválidos)
- `docker exec rsv360-guest wget -q -O /dev/null http://127.0.0.1:3006/` → **exit 0** (app responde)

Logs Next: `Ready in ~9s` em `:3006`, `:3004`, `:3005` — processo saudável.

### Compose (portas alinhadas ao build)

```71:107:docker-compose.yml
  admin:   APP_PORT: 3004  → package.json "start": "next start -p 3004"
  guest:   APP_PORT: 3006  → "next start -p 3006"
  turismo: APP_PORT: 3005  → "next start -p 3005"
```

Portas **não** são a causa do unhealthy; causa é probe legado.

## Risco

| Risco | Severidade | Nota |
|-------|------------|------|
| Falso negativo em `docker ps` / alertas | Médio | Ops pode assumir stack quebrada |
| CI/CD com gate `healthy` bloqueia deploy | Alto | Pós-soak |
| Confusão com soak S1/S2 | Baixo | Soak monitora site-publico/backend/postgres (OK) |

## Plano de implementação (pós-soak, sem violar janela)

1. **Rebuild somente** imagens `admin`, `guest`, `turismo` com Dockerfile atual (`docker/frontend/Dockerfile`).
2. Comando sugerido (executar **após** `2026-06-02T09:03:09-03:00`):

   ```powershell
   docker compose -p rsv360 build admin guest turismo
   docker compose -p rsv360 up -d --no-deps admin guest turismo
   ```

3. Validar:

   ```powershell
   docker inspect rsv360-guest --format '{{.Config.Healthcheck.Test}}'
   # esperado: [/healthcheck.sh]
   docker inspect rsv360-guest --format '{{.State.Health.Status}}'
   # esperado: healthy (após start-period)
   ```

4. Opcional: alinhar `package.json` `start` para `next start -p ${PORT:-3000}` ou confiar em `ENV PORT` (hardening menor).

## Critérios de pronto (ready-to-implement)

- [ ] `guest`, `admin`, `turismo` com `CMD /healthcheck.sh` na imagem.
- [ ] `docker inspect` → **healthy** ≥ 3 ciclos após start-period.
- [ ] Sem regressão G1 `:3000` e apps nas portas 3004/3005/3006.
- [ ] Evidência anexada em comentário na #252 (screenshot ou TSV).

## Relacionados

- PR #245, #242
- Issue #250 (rede compose unificada) — independente, mas mesmo `compose up` pós-soak

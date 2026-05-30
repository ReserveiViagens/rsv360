## Status
**READY-TO-IMPLEMENT** (rascunho pós-soak) — **não executar** durante soak 72h.

## Trilha
- [TRILHA-PARALELA C3](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/ops/soak-72h-g4-final/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- **Evidência Trilha B:** `docs/evidence/soak-72h/issues/TRILHA-B-252-healthcheck-evidence.md`

## Prioridade | Impacto
**P2** | Falso `unhealthy` em 3 frontends; não afeta soak atual (site-publico OK).

## Causa raiz (confirmada 30/05, leitura)

| Container | HEALTHCHECK em execução | App HTTP |
|-----------|-------------------------|----------|
| site-publico | `/healthcheck.sh` (PR #245) | OK |
| guest/admin/turismo | `wget http://localhost:${APP_PORT}` **literal** | OK em `:3006/:3004/:3005` |

Imagens guest/admin/turismo de **29/05** sem `/healthcheck.sh`. `wget` manual `127.0.0.1:PORT` → exit 0.

## Implementação (pós `2026-06-02T09:03:09-03:00`)

```powershell
docker compose -p rsv360 build admin guest turismo
docker compose -p rsv360 up -d --no-deps admin guest turismo
```

Validar: `docker inspect rsv360-guest --format '{{.Config.Healthcheck.Test}}'` → `[/healthcheck.sh]`.

## Critérios de aceite
- [ ] guest, admin, turismo **healthy** após start-period
- [ ] Sem alterar soak monitorado durante janela (rebuild só pós-soak)
- [ ] G1/G4 smoke nas portas 3004–3006 sem regressão

## Risco se não corrigir
CI/CD e operação interpretam stack degradada; alertas ruidosos.

## Relacionadas
#245 #242 #250

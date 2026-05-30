# Trilha 0 — Observabilidade mínima

Stack definida em `docker-compose.yml` (serviços `prometheus`, `grafana`).

## Critérios mínimos (T2)

| ID | Check | PASS |
|----|-------|------|
| O1 | `rsv360-prometheus` container Up | Sim |
| O2 | `rsv360-grafana` container Up | Sim |
| O3 | Backend expõe métricas ou logs estruturados sem crash loop | `docker logs rsv360-backend --tail 50` sem erro fatal repetido |
| O4 | Health endpoints respondem durante coleta | `:3002/health` 200 |

## Opcional (não bloqueia Trilha 0)

- Expor `:9090` / `:3007` no host (compose pode não publicar)
- Dashboards Grafana importados
- Alertmanager routing em produção

## Comandos de verificação

```bash
docker ps --filter name=rsv360-prometheus --format '{{.Status}}'
docker ps --filter name=rsv360-grafana --format '{{.Status}}'
docker logs rsv360-backend --tail 30
curl -s http://127.0.0.1:3002/health | head -c 200
```

## Evidência

Registrar saída em `logs/trilha0-observability.log` (gerado pelo preflight).

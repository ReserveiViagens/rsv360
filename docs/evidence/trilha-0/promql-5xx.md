# PromQL — taxa 5xx (issue #254)

**Stack:** `docker compose -p rsv360` · Prometheus `:9090` · Grafana `:3007`

## Backend API (`:3002`)

```promql
# Taxa 5xx (5m) — job rsv360-backend
sum(rate(http_requests_total{job="rsv360-backend",status=~"5.."}[5m]))
/
sum(rate(http_requests_total{job="rsv360-backend"}[5m]))
```

Se métricas HTTP não estiverem expostas, usar probe:

```promql
# Indisponibilidade via up{}
1 - avg_over_time(up{job="rsv360-backend"}[1h])
```

## BFF site-publico (`:3000`)

Preferir logs/container até métricas Next estarem no scrape:

```promql
up{job="rsv360-site-publico"}
```

## Alinhamento soak F5

- Soak: 5xx > 5% / 1h → investigar (ver `SOAK-72H-PLAN.md` F5).
- Produção: regra `RSV360BackendHigh5xxRate` em `monitoring/prometheus/alerts.yml`.

## Runbook rápido

1. Grafana → http://127.0.0.1:3007  
2. Prometheus → http://127.0.0.1:9090  
3. Logs: `docker logs rsv360-backend --tail 200`  
4. Health: `Invoke-WebRequest http://127.0.0.1:3002/health`

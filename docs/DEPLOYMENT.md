# RSV360 PMS/CRM — Reservei Viagens
<!--
  Copyright (c) 2024-2026 Reservei Viagens LTDA.
  Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
  @author Douglas P. Figueiredo
  @license UNLICENSED
-->

# RSV360 Deploy & Observability

Este repositório agora inclui uma base de deploy em Docker Compose para:

- `backend` em `http://localhost:3002`
- `apps/admin` em `http://localhost:3004`
- `apps/guest` em `http://localhost:3006`
- `apps/site-publico` em `http://localhost:3000`
- `apps/turismo` em `http://localhost:3005`
- `Prometheus` em `http://localhost:9090`
- `Grafana` em `http://localhost:3007`

### Principais arquivos

- `backend/Dockerfile`
- `docker/frontend/Dockerfile`
- `docker-compose.yml`
- `backend/src/routes/docs.route.js`
- `backend/src/routes/metrics.route.js`
- `backend/src/docs/openapi.js`
- `backend/src/monitoring/prometheus.js`
- `monitoring/prometheus/prometheus.yml`
- `monitoring/prometheus/alerts.yml`
- `monitoring/alertmanager/alertmanager.yml`
- `monitoring/grafana/provisioning/datasources/datasource.yml`
- `monitoring/grafana/provisioning/dashboards/dashboards.yml`

### Comandos úteis

- Subir stack: `npm run docker:up`
- Derrubar stack: `npm run docker:down`
- Ver logs: `npm run docker:logs`
- Smoke E2E: `npm run test:e2e`

### Endpoints de observabilidade

- Health: `GET /health`
- Metrics: `GET /metrics`
- OpenAPI JSON: `GET /api/openapi.json`
- Swagger UI: `GET /api/docs/ui`

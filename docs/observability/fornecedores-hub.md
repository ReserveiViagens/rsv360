# Observabilidade — Hub Fornecedores (Cotação v2 / PR 3)

Métricas expostas no endpoint existente do backend S2:

```text
GET http://localhost:3002/metrics
```

## Métricas do Hub

| Métrica | Tipo | Labels | Descrição |
|---------|------|--------|-----------|
| `rsv360_fornecedor_adapter_duration_seconds` | Histogram | `adapter`, `fornecedor` | Latência de busca por adapter |
| `rsv360_fornecedor_adapter_errors_total` | Counter | `adapter`, `fornecedor`, `tipo` | Erros (`timeout`, `reject`, `breaker_open`, `erro`) |
| `rsv360_propostas_por_status` | Gauge | `status` | Propostas por status de aprovação |

## Métricas de processo (já existentes)

O `collectDefaultMetrics` do `prom-client` (prefixo `rsv360_`) inclui:

- `rsv360_process_resident_memory_bytes` — RSS do processo Node (equivalente ao log `[heap]` do S1, mas contínuo no Grafana)

## Grafana (mínimo)

1. Adicionar Prometheus como data source (`http://prometheus:9090` no stack Docker).
2. Painel de linha: `rsv360_process_resident_memory_bytes{job="rsv360-backend"}`.
3. Painel de heatmap ou histograma: `rate(rsv360_fornecedor_adapter_duration_seconds_bucket[5m])`.
4. Alerta sugerido: `rsv360_fornecedor_adapter_errors_total{tipo="breaker_open"}` > 0 por 5 min.

## Criptografia `api_key`

- Configure `FORNECEDORES_ENCRYPTION_KEY` (mín. 16 caracteres; recomendado 32+).
- Se a tabela `fornecedores_api` tiver linhas em texto plano, execute antes de subir:

```bash
cd backend
FORNECEDORES_ENCRYPTION_KEY=... node scripts/reencrypt-fornecedores-api-keys.mjs
```

- Rotas `GET /api/v1/fornecedores-api` retornam `hasApiKey: true|false` — nunca o valor da chave.

# 📊 Guia Completo de Setup de Monitoring - RSV Gen 2

## 📋 Visão Geral

Este guia descreve como configurar e deployar a stack completa de monitoring do RSV Gen 2, incluindo:
- **Prometheus**: Coleta e armazenamento de métricas
- **Grafana**: Visualização e dashboards
- **Alertmanager**: Gerenciamento de alertas e notificações

## 🏗️ Arquitetura

```
┌─────────────┐
│  Next.js    │───métricas───┐
│  App        │               │
└─────────────┘               │
                               ▼
┌─────────────┐         ┌──────────────┐
│  WebSocket  │───métricas───│ Prometheus │
│  Server     │         └──────────────┘
└─────────────┘               │
                              │ alertas
                              ▼
                       ┌──────────────┐
                       │ Alertmanager │───notificações───► Email/Slack
                       └──────────────┘
                              │
                              │ métricas
                              ▼
                       ┌──────────────┐
                       │   Grafana    │
                       └──────────────┘
```

## 📦 Pré-requisitos

- Cluster Kubernetes configurado
- `kubectl` configurado e conectado ao cluster
- Namespace `rsv-gen2` criado
- StorageClass configurado (para PVCs)

## 🚀 Deploy Passo a Passo

### 1. Criar Namespace (se não existir)

```bash
kubectl create namespace rsv-gen2
```

### 2. Deploy do Prometheus

```bash
# Aplicar ConfigMap de regras de alerta
kubectl apply -f k8s/prometheus/alert-rules-configmap.yaml

# Aplicar ConfigMap principal
kubectl apply -f k8s/prometheus/configmap.yaml

# Criar PVC
kubectl apply -f k8s/prometheus/pvc.yaml

# Deploy do Prometheus
kubectl apply -f k8s/prometheus/deployment.yaml

# Criar Service
kubectl apply -f k8s/prometheus/service.yaml

# Verificar deploy
kubectl get pods -n rsv-gen2 | grep prometheus
kubectl get svc -n rsv-gen2 | grep prometheus
```

### 3. Deploy do Alertmanager

```bash
# Criar Secret (opcional, para notificações)
kubectl create secret generic alertmanager-secrets \
  --from-literal=smtp-username=alerts@rsv-gen2.com \
  --from-literal=smtp-password=SUA_SENHA \
  --from-literal=slack-webhook-url=https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -n rsv-gen2

# Aplicar ConfigMap
kubectl apply -f k8s/alertmanager/configmap.yaml

# Criar PVC
kubectl apply -f k8s/alertmanager/pvc.yaml

# Deploy do Alertmanager
kubectl apply -f k8s/alertmanager/deployment.yaml

# Criar Service
kubectl apply -f k8s/alertmanager/service.yaml

# Verificar deploy
kubectl get pods -n rsv-gen2 | grep alertmanager
kubectl get svc -n rsv-gen2 | grep alertmanager
```

### 4. Deploy do Grafana

```bash
# Criar Secret para credenciais do admin
kubectl create secret generic grafana-secrets \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=SUA_SENHA_SEGURA \
  -n rsv-gen2

# Criar ConfigMap de dashboards
kubectl create configmap grafana-dashboards \
  --from-file=k8s/grafana/dashboards/ \
  -n rsv-gen2

# Aplicar ConfigMap principal
kubectl apply -f k8s/grafana/configmap.yaml

# Criar PVC
kubectl apply -f k8s/grafana/pvc.yaml

# Deploy do Grafana
kubectl apply -f k8s/grafana/deployment.yaml

# Criar Service
kubectl apply -f k8s/grafana/service.yaml

# Verificar deploy
kubectl get pods -n rsv-gen2 | grep grafana
kubectl get svc -n rsv-gen2 | grep grafana
```

### 5. Verificar Tudo Está Funcionando

```bash
# Verificar todos os pods
kubectl get pods -n rsv-gen2

# Verificar todos os services
kubectl get svc -n rsv-gen2

# Verificar PVCs
kubectl get pvc -n rsv-gen2
```

## 🔍 Acessar as Interfaces

### Prometheus UI

```bash
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# Acessar: http://localhost:9090
```

**Verificações:**
- Status > Targets: Verificar se todos os targets estão "UP"
- Alerts: Verificar se as regras de alerta estão carregadas
- Graph: Testar queries PromQL

### Grafana UI

```bash
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000
# Acessar: http://localhost:3001
# Login: admin / SUA_SENHA_SEGURA
```

**Verificações:**
- Configuration > Data Sources: Verificar se Prometheus está configurado e testado
- Dashboards: Verificar se os 4 dashboards aparecem
- Explore: Testar queries PromQL

### Alertmanager UI

```bash
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
# Acessar: http://localhost:9093
```

**Verificações:**
- Alerts: Verificar se alertas estão sendo recebidos
- Silences: Gerenciar silenciamento de alertas
- Status: Verificar configuração e receivers

## 📧 Configurar Notificações

### Email (SMTP)

1. **Editar ConfigMap do Alertmanager:**
   ```bash
   kubectl edit configmap alertmanager-config -n rsv-gen2
   ```

2. **Descomentar e configurar seção `smtp_*` em `global:`:**
   ```yaml
   global:
     smtp_smarthost: 'smtp.gmail.com:587'
     smtp_from: 'alerts@rsv-gen2.com'
     smtp_auth_username: 'alerts@rsv-gen2.com'
     smtp_auth_password: 'SUA_SENHA_APP'
     smtp_require_tls: true
   ```

3. **Descomentar seções `email_configs` nos receivers:**
   ```yaml
   receivers:
     - name: 'critical-alerts'
       email_configs:
         - to: 'on-call@rsv-gen2.com'
           headers:
             Subject: '🚨 CRÍTICO - RSV Gen 2: {{ .GroupLabels.alertname }}'
   ```

4. **Aplicar mudanças:**
   ```bash
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

### Slack

1. **Criar Webhook no Slack:**
   - Acessar: https://api.slack.com/apps
   - Criar novo app
   - Adicionar "Incoming Webhooks"
   - Copiar webhook URL

2. **Editar ConfigMap do Alertmanager:**
   ```bash
   kubectl edit configmap alertmanager-config -n rsv-gen2
   ```

3. **Descomentar e configurar `slack_api_url` em `global:`:**
   ```yaml
   global:
     slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
   ```

4. **Descomentar seções `slack_configs` nos receivers:**
   ```yaml
   receivers:
     - name: 'critical-alerts'
       slack_configs:
         - channel: '#alerts-critical'
           title: '🚨 CRÍTICO: {{ .GroupLabels.alertname }}'
           text: |
             *Severidade:* {{ .CommonLabels.severity }}
             *Componente:* {{ .CommonLabels.component }}
             *Descrição:* {{ .CommonAnnotations.description }}
           color: 'danger'
   ```

5. **Aplicar mudanças:**
   ```bash
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

## 🧪 Testar Alertas

### 1. Criar Alerta de Teste

```bash
# Acessar Prometheus UI
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090

# Navegar para: Alerts
# Verificar se as regras aparecem
```

### 2. Simular Alerta (Opcional)

Você pode criar um alerta de teste temporário editando uma regra:

```yaml
# Em k8s/prometheus/alert-rules-configmap.yaml
- alert: TestAlert
  expr: vector(1) == 1  # Sempre verdadeiro
  for: 1m
  labels:
    severity: warning
  annotations:
    summary: "Alerta de teste"
    description: "Este é um alerta de teste"
```

Aplicar e verificar se o alerta aparece no Alertmanager.

### 3. Verificar Notificações

- **Email:** Verificar caixa de entrada configurada
- **Slack:** Verificar canal configurado
- **Alertmanager UI:** Verificar se alertas aparecem em "Alerts"

## 🔧 Troubleshooting

### Prometheus não coleta métricas

1. Verificar se a aplicação está expondo `/api/metrics`:
   ```bash
   kubectl exec -n rsv-gen2 deployment/rsv-gen2-app -- \
     wget -O- http://localhost:3000/api/metrics
   ```

2. Verificar targets no Prometheus UI:
   - Status > Targets
   - Verificar se targets aparecem como "UP"

3. Verificar logs do Prometheus:
   ```bash
   kubectl logs -n rsv-gen2 deployment/prometheus
   ```

### Grafana não mostra dados

1. Verificar data source:
   - Configuration > Data Sources
   - Testar conexão com Prometheus

2. Verificar se métricas existem:
   - Explore > Prometheus
   - Testar query: `up`

3. Verificar logs do Grafana:
   ```bash
   kubectl logs -n rsv-gen2 deployment/grafana
   ```

### Alertas não são enviados

1. Verificar se Prometheus está conectado ao Alertmanager:
   - Prometheus UI > Status > Configuration
   - Verificar se `alerting.alertmanagers` está configurado

2. Verificar se regras de alerta estão carregadas:
   - Prometheus UI > Alerts
   - Verificar se regras aparecem

3. Verificar logs do Alertmanager:
   ```bash
   kubectl logs -n rsv-gen2 deployment/alertmanager
   ```

### Notificações não chegam

1. Verificar configuração SMTP/Slack no ConfigMap:
   ```bash
   kubectl get configmap alertmanager-config -n rsv-gen2 -o yaml
   ```

2. Verificar conectividade:
   ```bash
   kubectl exec -n rsv-gen2 deployment/alertmanager -- \
     wget -O- https://smtp.gmail.com:587
   ```

3. Verificar logs do Alertmanager:
   ```bash
   kubectl logs -n rsv-gen2 deployment/alertmanager | grep -i error
   ```

## 📊 Métricas Disponíveis

### HTTP
- `http_requests_total`
- `http_request_duration_seconds`
- `http_requests_by_status`

### Database
- `db_query_duration_seconds`
- `db_query_total`
- `db_connections_active`
- `db_pool_size`
- `db_pool_idle`
- `db_pool_waiting`
- `db_query_errors_total`

### Redis
- `redis_operations_total`
- `redis_hit_rate`
- `redis_miss_rate`
- `redis_memory_used_bytes`
- `redis_keys_total`
- `redis_operation_duration_seconds`
- `redis_errors_total`

### Business
- `bookings_created_total`
- `bookings_active`
- `tickets_created_total`
- `tickets_resolved_total`
- `tickets_open`
- `ticket_resolution_time_seconds`
- `tickets_sla_breached`
- `checkins_created_total`
- `checkins_completed_total`
- `checkin_duration_seconds`
- `payments_processed_total`

## 🚨 Alertas Configurados

### Critical (4)
- ServiceDown
- DatabaseConnectionPoolExhausted
- RedisDown
- HighPaymentFailureRate

### Warning (12)
- HighErrorRate
- HighLatency
- HighCPUUsage
- HighMemoryUsage
- HighNodeJSHeapMemory
- HighEventLoopLag
- HighDatabaseQueryDuration
- HighDatabaseErrorRate
- DatabaseConnectionsWaiting
- LowRedisHitRate
- HighRedisMemoryUsage
- HighRedisErrorRate
- HighTicketSLABreachRate

### Info (2)
- HighRequestRate
- HighNumberOfOpenTickets

## 📚 Recursos Adicionais

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)

## ✅ Checklist Final

- [ ] Prometheus deployado e coletando métricas
- [ ] Alertmanager deployado e conectado ao Prometheus
- [ ] Grafana deployado e conectado ao Prometheus
- [ ] Dashboards aparecendo no Grafana
- [ ] Regras de alerta carregadas no Prometheus
- [ ] Alertas aparecendo no Alertmanager
- [ ] Notificações configuradas e testadas (email/Slack)
- [ ] Todos os pods rodando sem erros
- [ ] PVCs criados e montados corretamente

---

**Última atualização:** 2025-12-05


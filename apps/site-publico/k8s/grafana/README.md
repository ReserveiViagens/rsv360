# 📊 Grafana - Setup e Configuração

## 📋 Visão Geral

Este diretório contém os manifestos Kubernetes para deploy do Grafana no namespace `rsv-gen2`.

## 📁 Estrutura de Arquivos

```
k8s/grafana/
├── deployment.yaml          # Deployment do Grafana
├── service.yaml            # Service para expor Grafana
├── configmap.yaml          # Configuração (data sources, dashboards provisioning)
├── pvc.yaml                # Persistent Volume Claim (10GB)
├── secret.yaml.example     # Exemplo de Secret para credenciais
├── dashboards/             # Dashboards JSON
│   ├── application-overview.json
│   ├── business-metrics.json
│   ├── infrastructure.json
│   └── sla-performance.json
└── README.md               # Este arquivo
```

## 🚀 Deploy

### 1. Criar Secret para Credenciais

```bash
# Criar secret com credenciais do admin
kubectl create secret generic grafana-secrets \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=SUA_SENHA_SEGURA \
  -n rsv-gen2
```

**⚠️ IMPORTANTE:** Altere a senha padrão em produção!

### 2. Criar ConfigMap para Dashboards

```bash
# Criar ConfigMap com os dashboards
kubectl create configmap grafana-dashboards \
  --from-file=dashboards/ \
  -n rsv-gen2
```

### 3. Aplicar Manifestos

```bash
# Aplicar todos os recursos
kubectl apply -f k8s/grafana/

# OU aplicar individualmente
kubectl apply -f k8s/grafana/deployment.yaml
kubectl apply -f k8s/grafana/service.yaml
kubectl apply -f k8s/grafana/configmap.yaml
kubectl apply -f k8s/grafana/pvc.yaml
```

### 4. Verificar Deploy

```bash
# Verificar pods
kubectl get pods -n rsv-gen2 | grep grafana

# Verificar logs
kubectl logs -n rsv-gen2 deployment/grafana

# Verificar service
kubectl get svc -n rsv-gen2 | grep grafana
```

### 5. Acessar Grafana

```bash
# Port-forward para acesso local
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000

# Acessar em: http://localhost:3001
# Login: admin / SUA_SENHA_SEGURA
```

## 📊 Dashboards Disponíveis

### 1. **Application Overview**
- HTTP Requests per Second
- HTTP Request Duration (p50, p95, p99)
- HTTP Error Rate
- HTTP Requests by Status Code
- Node.js Heap Memory
- Event Loop Lag

### 2. **Business Metrics**
- Bookings Created (Today)
- Active Bookings
- Tickets Created (Today)
- Open Tickets
- Ticket Resolution Time
- Tickets SLA Breached
- Check-ins Completed
- Check-in Duration
- Payments Processed

### 3. **Infrastructure**
- Database Query Duration
- Database Connections (Active, Pool Size, Idle, Waiting)
- Database Query Rate
- Database Errors
- Redis Operations
- Redis Hit/Miss Rate
- Redis Memory Usage
- Redis Keys Total
- Redis Operation Duration

### 4. **SLA & Performance**
- Tickets SLA Breached
- SLA Compliance Rate
- Average Ticket Resolution Time
- HTTP Response Time (p95)
- Ticket Resolution Time by Priority
- HTTP Response Time Distribution
- Database Query Performance
- Throughput (Requests/sec)

## 🔧 Configuração

### Data Source Prometheus

O Prometheus é configurado automaticamente via ConfigMap:
- **URL:** `http://prometheus.rsv-gen2.svc.cluster.local:9090`
- **Access:** Proxy (default)
- **Time Interval:** 15s

### Provisioning de Dashboards

Os dashboards são provisionados automaticamente do ConfigMap `grafana-dashboards`:
- **Path:** `/var/lib/grafana/dashboards`
- **Update Interval:** 10s
- **UI Updates:** Permitido

## 📝 Personalização

### Adicionar Novo Dashboard

1. Criar arquivo JSON em `k8s/grafana/dashboards/`
2. Recriar ConfigMap:
   ```bash
   kubectl create configmap grafana-dashboards \
     --from-file=dashboards/ \
     -n rsv-gen2 \
     --dry-run=client -o yaml | kubectl apply -f -
   ```
3. Reiniciar pod do Grafana (se necessário):
   ```bash
   kubectl rollout restart deployment/grafana -n rsv-gen2
   ```

### Modificar Configuração

1. Editar `k8s/grafana/configmap.yaml`
2. Aplicar mudanças:
   ```bash
   kubectl apply -f k8s/grafana/configmap.yaml
   kubectl rollout restart deployment/grafana -n rsv-gen2
   ```

## 🔍 Troubleshooting

### Grafana não inicia

```bash
# Verificar logs
kubectl logs -n rsv-gen2 deployment/grafana

# Verificar eventos
kubectl describe pod -n rsv-gen2 -l app=grafana
```

### Dashboards não aparecem

1. Verificar se ConfigMap foi criado:
   ```bash
   kubectl get configmap grafana-dashboards -n rsv-gen2
   ```

2. Verificar logs do Grafana:
   ```bash
   kubectl logs -n rsv-gen2 deployment/grafana | grep dashboard
   ```

3. Verificar se data source está configurado:
   - Acessar Grafana UI
   - Configuration > Data Sources
   - Verificar se Prometheus está listado e testado

### Data Source não conecta

1. Verificar se Prometheus está rodando:
   ```bash
   kubectl get pods -n rsv-gen2 | grep prometheus
   ```

2. Verificar service do Prometheus:
   ```bash
   kubectl get svc -n rsv-gen2 | grep prometheus
   ```

3. Testar conectividade do pod do Grafana:
   ```bash
   kubectl exec -n rsv-gen2 deployment/grafana -- \
     wget -O- http://prometheus.rsv-gen2.svc.cluster.local:9090/api/v1/status/config
   ```

## 📚 Recursos

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Data Source](https://grafana.com/docs/grafana/latest/datasources/prometheus/)
- [Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/json-model/)

## ✅ Checklist de Deploy

- [ ] Secret `grafana-secrets` criado
- [ ] ConfigMap `grafana-dashboards` criado
- [ ] PVC `grafana-pvc` criado
- [ ] Deployment aplicado e pods rodando
- [ ] Service aplicado e acessível
- [ ] Data source Prometheus configurado e testado
- [ ] Dashboards aparecendo na UI
- [ ] Credenciais alteradas (se produção)

---

**Última atualização:** 2025-12-04


# ⚡ Guia Rápido - Deploy de Monitoring

## 🚀 Deploy em 5 Minutos

### 1. Criar Namespace

```bash
kubectl create namespace rsv-gen2
```

### 2. Deploy Prometheus

```bash
kubectl apply -f k8s/prometheus/
```

### 3. Deploy Alertmanager

```bash
kubectl apply -f k8s/alertmanager/
```

### 4. Deploy Grafana

```bash
# Criar secret
kubectl create secret generic grafana-secrets \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=admin123 \
  -n rsv-gen2

# Criar configmap de dashboards
kubectl create configmap grafana-dashboards \
  --from-file=k8s/grafana/dashboards/ \
  -n rsv-gen2

# Deploy
kubectl apply -f k8s/grafana/
```

### 5. Verificar

```bash
kubectl get pods -n rsv-gen2
kubectl get svc -n rsv-gen2
```

### 6. Acessar

```bash
# Prometheus
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# http://localhost:9090

# Grafana
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000
# http://localhost:3001 (admin/admin123)

# Alertmanager
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
# http://localhost:9093
```

## 🔧 Configurar Notificações

### Email

1. Editar ConfigMap:
   ```bash
   kubectl edit configmap alertmanager-config -n rsv-gen2
   ```

2. Descomentar e configurar:
   ```yaml
   global:
     smtp_smarthost: 'smtp.gmail.com:587'
     smtp_from: 'alerts@rsv-gen2.com'
     smtp_auth_username: 'alerts@rsv-gen2.com'
     smtp_auth_password: 'SUA_SENHA'
   ```

3. Reiniciar:
   ```bash
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

### Slack

1. Criar webhook no Slack
2. Editar ConfigMap:
   ```bash
   kubectl edit configmap alertmanager-config -n rsv-gen2
   ```

3. Descomentar e configurar:
   ```yaml
   global:
     slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
   ```

4. Reiniciar:
   ```bash
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

## ✅ Verificações Rápidas

```bash
# Verificar pods
kubectl get pods -n rsv-gen2

# Verificar logs
kubectl logs -n rsv-gen2 deployment/prometheus
kubectl logs -n rsv-gen2 deployment/grafana
kubectl logs -n rsv-gen2 deployment/alertmanager

# Verificar targets no Prometheus
# Acessar: http://localhost:9090/targets
```

## 📚 Documentação Completa

Ver `docs/MONITORING_SETUP.md` para documentação detalhada.

---

**Tempo estimado:** 5-10 minutos


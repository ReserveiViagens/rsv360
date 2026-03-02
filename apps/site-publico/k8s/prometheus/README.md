# 📊 Prometheus - Configuração Kubernetes

## 📋 Arquivos

- **configmap.yaml**: Configuração principal do Prometheus (com service discovery do Kubernetes)
- **configmap-simple.yaml**: Versão simplificada usando static_configs (alternativa)
- **deployment.yaml**: Deployment do Prometheus
- **service.yaml**: Service para expor o Prometheus
- **pvc.yaml**: Persistent Volume Claim para armazenar dados

## 🚀 Deploy

### Aplicar todos os recursos:

```bash
# Aplicar PVC primeiro
kubectl apply -f k8s/prometheus/pvc.yaml

# Aplicar ConfigMap
kubectl apply -f k8s/prometheus/configmap.yaml

# Aplicar Deployment
kubectl apply -f k8s/prometheus/deployment.yaml

# Aplicar Service
kubectl apply -f k8s/prometheus/service.yaml
```

### Ou aplicar tudo de uma vez:

```bash
kubectl apply -f k8s/prometheus/
```

## ✅ Verificação

### Verificar pods:

```bash
kubectl get pods -n rsv-gen2 | grep prometheus
```

### Verificar logs:

```bash
kubectl logs -n rsv-gen2 deployment/prometheus --tail=50
```

### Verificar ConfigMap:

```bash
kubectl get configmap -n rsv-gen2 prometheus-config -o yaml
```

### Verificar PVC:

```bash
kubectl get pvc -n rsv-gen2 | grep prometheus
```

## 🌐 Acesso

### Port-forward para acesso local:

```bash
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
```

### Acessar UI:

Abra no navegador: http://localhost:9090

## 📊 Verificar Targets

1. Acesse http://localhost:9090
2. Vá em **Status > Targets**
3. Verifique se os targets aparecem como **UP**:
   - `rsv-gen2-app`
   - `rsv-gen2-websocket`
   - `prometheus` (self-monitoring)

## 🔧 Configuração

### Alterar intervalo de scrape:

Edite `configmap.yaml` e altere `scrape_interval: 15s` para o valor desejado.

### Adicionar novos targets:

Adicione novos jobs em `scrape_configs` no `configmap.yaml`.

### Recarregar configuração sem restart:

```bash
# Recarregar configuração via API
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
curl -X POST http://localhost:9090/-/reload
```

## 🐛 Troubleshooting

### Pod não inicia:

```bash
# Verificar eventos
kubectl describe pod -n rsv-gen2 -l app=prometheus

# Verificar logs
kubectl logs -n rsv-gen2 -l app=prometheus
```

### Targets não aparecem como UP:

1. Verifique se os serviços estão rodando:
   ```bash
   kubectl get svc -n rsv-gen2
   ```

2. Verifique se o endpoint `/api/metrics` está acessível:
   ```bash
   kubectl exec -n rsv-gen2 deployment/rsv-gen2-app -- curl http://localhost:3000/api/metrics
   ```

3. Verifique a configuração do ConfigMap:
   ```bash
   kubectl get configmap -n rsv-gen2 prometheus-config -o yaml
   ```

### PVC não é criado:

Verifique se há um StorageClass disponível:

```bash
kubectl get storageclass
```

Se não houver, ajuste o `pvc.yaml` removendo ou alterando `storageClassName`.

## 📝 Notas

- **Retenção**: Configurado para 30 dias ou 50GB (o que vier primeiro)
- **Recursos**: 2 CPU, 4GB RAM (ajustar conforme necessidade)
- **Storage**: 50GB (ajustar conforme volume de métricas)

## 🔄 Próximos Passos

1. ✅ Configurar métricas na aplicação (`lib/metrics.ts`)
2. ✅ Criar endpoint `/api/metrics`
3. ✅ Configurar Grafana
4. ✅ Configurar Alertmanager
5. ✅ Criar dashboards


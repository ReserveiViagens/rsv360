# 🔧 Runbook de Troubleshooting - Monitoring RSV Gen 2

## 📋 Índice

1. [Problemas Comuns](#problemas-comuns)
2. [Prometheus](#prometheus)
3. [Grafana](#grafana)
4. [Alertmanager](#alertmanager)
5. [Métricas](#métricas)
6. [Alertas](#alertas)
7. [Notificações](#notificações)

---

## 🚨 Problemas Comuns

### Pod não inicia

**Sintomas:**
- Pod fica em estado `Pending` ou `CrashLoopBackOff`
- Logs mostram erros de inicialização

**Diagnóstico:**
```bash
# Verificar status do pod
kubectl get pods -n rsv-gen2

# Verificar eventos
kubectl describe pod <pod-name> -n rsv-gen2

# Verificar logs
kubectl logs <pod-name> -n rsv-gen2
```

**Soluções:**
1. **PVC não está pronto:**
   ```bash
   kubectl get pvc -n rsv-gen2
   kubectl describe pvc <pvc-name> -n rsv-gen2
   ```

2. **Recursos insuficientes:**
   ```bash
   kubectl top nodes
   kubectl top pods -n rsv-gen2
   ```

3. **ConfigMap/Secret não existe:**
   ```bash
   kubectl get configmap -n rsv-gen2
   kubectl get secret -n rsv-gen2
   ```

---

## 📊 Prometheus

### Prometheus não coleta métricas

**Sintomas:**
- Targets aparecem como `DOWN` no Prometheus UI
- Métricas não aparecem nas queries

**Diagnóstico:**
```bash
# Verificar targets
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# Acessar: http://localhost:9090/targets

# Verificar configuração
kubectl get configmap prometheus-config -n rsv-gen2 -o yaml

# Verificar se aplicação está expondo /api/metrics
kubectl exec -n rsv-gen2 deployment/rsv-gen2-app -- \
  wget -O- http://localhost:3000/api/metrics
```

**Soluções:**
1. **Verificar se endpoint está acessível:**
   ```bash
   # Testar localmente
   curl http://localhost:3000/api/metrics
   ```

2. **Verificar scrape configs:**
   ```bash
   kubectl get configmap prometheus-config -n rsv-gen2 -o yaml | grep -A 10 "scrape_configs"
   ```

3. **Verificar Service Discovery:**
   - Verificar se Services estão criados
   - Verificar se labels estão corretos
   - Verificar se portas estão corretas

### Prometheus não carrega regras de alerta

**Sintomas:**
- Alertas não aparecem em `/alerts`
- Logs mostram erro ao carregar regras

**Diagnóstico:**
```bash
# Verificar se ConfigMap existe
kubectl get configmap prometheus-alert-rules -n rsv-gen2

# Verificar conteúdo
kubectl get configmap prometheus-alert-rules -n rsv-gen2 -o yaml

# Verificar logs
kubectl logs -n rsv-gen2 -l app=prometheus | grep -i "rule\|alert"
```

**Soluções:**
1. **Verificar se ConfigMap está montado:**
   ```bash
   kubectl describe deployment prometheus -n rsv-gen2 | grep -A 5 "Volume"
   ```

2. **Verificar sintaxe YAML:**
   ```bash
   # Validar YAML
   kubectl get configmap prometheus-alert-rules -n rsv-gen2 -o yaml | yq eval '.data."alerts.yaml"' -
   ```

3. **Recarregar Prometheus:**
   ```bash
   # Prometheus tem --web.enable-lifecycle, então pode recarregar via API
   curl -X POST http://localhost:9090/-/reload
   ```

### Prometheus consome muita memória

**Sintomas:**
- Pod é OOMKilled
- Prometheus fica lento

**Soluções:**
1. **Aumentar limites de recursos:**
   ```bash
   kubectl edit deployment prometheus -n rsv-gen2
   # Aumentar memory limits
   ```

2. **Reduzir retenção:**
   ```bash
   kubectl edit configmap prometheus-config -n rsv-gen2
   # Reduzir --storage.tsdb.retention.time
   ```

3. **Reduzir scrape interval:**
   ```bash
   kubectl edit configmap prometheus-config -n rsv-gen2
   # Aumentar scrape_interval
   ```

---

## 📈 Grafana

### Grafana não conecta ao Prometheus

**Sintomas:**
- Data source mostra erro de conexão
- Dashboards não mostram dados

**Diagnóstico:**
```bash
# Verificar se Prometheus está acessível
kubectl get svc prometheus -n rsv-gen2

# Testar conectividade
kubectl exec -n rsv-gen2 deployment/grafana -- \
  wget -O- http://prometheus.rsv-gen2.svc.cluster.local:9090/-/healthy
```

**Soluções:**
1. **Verificar URL do data source:**
   ```bash
   kubectl get configmap grafana-config -n rsv-gen2 -o yaml | grep -A 10 "datasources"
   ```
   - URL deve ser: `http://prometheus.rsv-gen2.svc.cluster.local:9090`

2. **Verificar se Prometheus está rodando:**
   ```bash
   kubectl get pods -n rsv-gen2 -l app=prometheus
   ```

3. **Recriar data source manualmente:**
   - Acessar Grafana UI
   - Configuration > Data Sources
   - Adicionar Prometheus
   - URL: `http://prometheus.rsv-gen2.svc.cluster.local:9090`

### Dashboards não aparecem

**Sintomas:**
- Dashboards não aparecem na lista
- Erro ao importar dashboards

**Diagnóstico:**
```bash
# Verificar se ConfigMap existe
kubectl get configmap grafana-dashboards -n rsv-gen2

# Verificar conteúdo
kubectl get configmap grafana-dashboards -n rsv-gen2 -o yaml | head -50
```

**Soluções:**
1. **Verificar se ConfigMap está montado:**
   ```bash
   kubectl describe deployment grafana -n rsv-gen2 | grep -A 5 "grafana-dashboards"
   ```

2. **Recriar ConfigMap:**
   ```bash
   kubectl delete configmap grafana-dashboards -n rsv-gen2
   kubectl create configmap grafana-dashboards \
     --from-file=k8s/grafana/dashboards/ \
     -n rsv-gen2
   kubectl rollout restart deployment/grafana -n rsv-gen2
   ```

3. **Importar manualmente:**
   - Acessar Grafana UI
   - Dashboards > Import
   - Upload JSON do dashboard

### Grafana não salva configurações

**Sintomas:**
- Mudanças são perdidas após restart
- PVC não está montado

**Soluções:**
1. **Verificar PVC:**
   ```bash
   kubectl get pvc grafana-pvc -n rsv-gen2
   kubectl describe pvc grafana-pvc -n rsv-gen2
   ```

2. **Verificar se PVC está montado:**
   ```bash
   kubectl describe deployment grafana -n rsv-gen2 | grep -A 5 "grafana-storage"
   ```

---

## 🔔 Alertmanager

### Alertmanager não recebe alertas

**Sintomas:**
- Alertas não aparecem no Alertmanager UI
- Prometheus mostra erro ao enviar alertas

**Diagnóstico:**
```bash
# Verificar configuração do Prometheus
kubectl get configmap prometheus-config -n rsv-gen2 -o yaml | grep -A 5 "alerting"

# Verificar se Alertmanager está acessível
kubectl get svc alertmanager -n rsv-gen2

# Testar conectividade
kubectl exec -n rsv-gen2 deployment/prometheus -- \
  wget -O- http://alertmanager.rsv-gen2.svc.cluster.local:9093/-/healthy
```

**Soluções:**
1. **Verificar URL no Prometheus:**
   ```bash
   kubectl edit configmap prometheus-config -n rsv-gen2
   # Verificar se alerting.alertmanagers está configurado
   ```

2. **Verificar se Alertmanager está rodando:**
   ```bash
   kubectl get pods -n rsv-gen2 -l app=alertmanager
   ```

3. **Recarregar Prometheus:**
   ```bash
   curl -X POST http://localhost:9090/-/reload
   ```

### Notificações não são enviadas

**Sintomas:**
- Alertas aparecem no Alertmanager mas não são enviados
- Logs mostram erro ao enviar

**Diagnóstico:**
```bash
# Verificar logs do Alertmanager
kubectl logs -n rsv-gen2 -l app=alertmanager | grep -i "error\|notification"

# Verificar configuração
kubectl get configmap alertmanager-config -n rsv-gen2 -o yaml
```

**Soluções:**
1. **Verificar configuração SMTP/Slack:**
   ```bash
   kubectl get configmap alertmanager-config -n rsv-gen2 -o yaml | grep -A 10 "smtp\|slack"
   ```

2. **Testar conectividade SMTP:**
   ```bash
   kubectl exec -n rsv-gen2 deployment/alertmanager -- \
     nc -zv smtp.gmail.com 587
   ```

3. **Verificar Secret (se usado):**
   ```bash
   kubectl get secret alertmanager-secrets -n rsv-gen2
   ```

4. **Recarregar Alertmanager:**
   ```bash
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

---

## 📊 Métricas

### Métricas não aparecem

**Sintomas:**
- Endpoint `/api/metrics` retorna vazio
- Métricas não aparecem no Prometheus

**Diagnóstico:**
```bash
# Testar endpoint localmente
curl http://localhost:3000/api/metrics

# Verificar se middleware está ativo
# Verificar logs da aplicação
```

**Soluções:**
1. **Verificar se middleware está registrado:**
   ```typescript
   // Verificar middleware.ts
   import { metricsMiddleware } from '@/lib/middleware/metrics';
   ```

2. **Verificar se métricas estão sendo incrementadas:**
   ```typescript
   // Adicionar logs temporários
   console.log('Métrica incrementada:', metricName);
   ```

3. **Verificar se prom-client está instalado:**
   ```bash
   npm list prom-client
   ```

### Métricas aparecem mas valores estão errados

**Sintomas:**
- Métricas aparecem mas valores são 0 ou incorretos

**Soluções:**
1. **Verificar se métricas estão sendo incrementadas:**
   - Adicionar logs
   - Verificar código de instrumentação

2. **Verificar labels:**
   - Labels devem ser consistentes
   - Verificar se labels estão sendo passados corretamente

---

## 🚨 Alertas

### Alertas não são disparados

**Sintomas:**
- Condição é atendida mas alerta não dispara
- Alerta fica em estado `pending`

**Diagnóstico:**
```bash
# Verificar regras de alerta
kubectl get configmap prometheus-alert-rules -n rsv-gen2 -o yaml

# Testar query PromQL
# Acessar: http://localhost:9090/graph
```

**Soluções:**
1. **Verificar query PromQL:**
   - Testar query no Prometheus UI
   - Verificar se retorna dados

2. **Verificar `for` duration:**
   - Alerta pode estar configurado com `for: 5m`
   - Condição precisa ser verdadeira por 5 minutos

3. **Verificar sintaxe:**
   ```bash
   # Validar YAML
   kubectl get configmap prometheus-alert-rules -n rsv-gen2 -o yaml | yq eval '.data."alerts.yaml"' -
   ```

### Alertas são disparados mas não chegam no Alertmanager

**Sintomas:**
- Alertas aparecem no Prometheus mas não no Alertmanager

**Soluções:**
1. **Verificar conexão Prometheus -> Alertmanager:**
   - Verificar configuração do Prometheus
   - Verificar se Alertmanager está acessível

2. **Verificar logs do Prometheus:**
   ```bash
   kubectl logs -n rsv-gen2 -l app=prometheus | grep -i "alertmanager\|alert"
   ```

---

## 📧 Notificações

### Email não é enviado

**Sintomas:**
- Alertas chegam no Alertmanager mas email não é enviado

**Soluções:**
1. **Verificar configuração SMTP:**
   ```bash
   kubectl get configmap alertmanager-config -n rsv-gen2 -o yaml | grep -A 10 "smtp"
   ```

2. **Verificar credenciais:**
   - Verificar se senha está correta
   - Verificar se está usando Secret

3. **Testar SMTP:**
   ```bash
   kubectl exec -n rsv-gen2 deployment/alertmanager -- \
     telnet smtp.gmail.com 587
   ```

### Slack não recebe notificações

**Sintomas:**
- Alertas chegam no Alertmanager mas Slack não recebe

**Soluções:**
1. **Verificar webhook URL:**
   ```bash
   kubectl get configmap alertmanager-config -n rsv-gen2 -o yaml | grep "slack_api_url"
   ```

2. **Testar webhook:**
   ```bash
   curl -X POST <webhook-url> \
     -H 'Content-Type: application/json' \
     -d '{"text":"Teste"}'
   ```

3. **Verificar configuração do receiver:**
   - Verificar se `slack_configs` está descomentado
   - Verificar se channel está correto

---

## 🔍 Comandos Úteis

### Verificar status geral
```bash
kubectl get all -n rsv-gen2
kubectl get pvc -n rsv-gen2
kubectl get configmap -n rsv-gen2
kubectl get secret -n rsv-gen2
```

### Verificar logs
```bash
# Prometheus
kubectl logs -n rsv-gen2 -l app=prometheus --tail=50

# Grafana
kubectl logs -n rsv-gen2 -l app=grafana --tail=50

# Alertmanager
kubectl logs -n rsv-gen2 -l app=alertmanager --tail=50
```

### Recarregar configurações
```bash
# Prometheus
curl -X POST http://localhost:9090/-/reload

# Alertmanager
kubectl rollout restart deployment/alertmanager -n rsv-gen2

# Grafana
kubectl rollout restart deployment/grafana -n rsv-gen2
```

### Port-forward para acesso local
```bash
# Prometheus
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090

# Grafana
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000

# Alertmanager
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
```

---

**Última atualização:** 2025-12-05


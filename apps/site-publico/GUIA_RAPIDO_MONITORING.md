# 🚀 GUIA RÁPIDO - SEMANA 3: MONITORING COMPLETO

## 📋 Início Rápido

### **Passo 1: Revisar Documentação**
1. Ler `LISTA_TAREFAS_MONITORING_COMPLETO.md` (detalhado)
2. Ler `RESUMO_EXECUTIVO_MONITORING.md` (visão geral)
3. Este guia (referência rápida)

### **Passo 2: Preparar Ambiente**
```bash
# Verificar se Kubernetes está acessível
kubectl cluster-info

# Verificar namespace
kubectl get namespace rsv-gen2 || kubectl create namespace rsv-gen2

# Verificar se há recursos disponíveis
kubectl top nodes
```

### **Passo 3: Começar pelo Dia 1**
Seguir ordem sequencial das tarefas no `LISTA_TAREFAS_MONITORING_COMPLETO.md`

---

## 🎯 Ordem de Execução Recomendada

### **DIA 1 (9h):**
1. ✅ Criar `k8s/prometheus/configmap.yaml`
2. ✅ Criar `k8s/prometheus/deployment.yaml`
3. ✅ Criar `k8s/prometheus/service.yaml`
4. ✅ Criar `k8s/prometheus/pvc.yaml`
5. ✅ Aplicar e testar Prometheus
6. ✅ Instalar `prom-client`
7. ✅ Criar `lib/metrics.ts`
8. ✅ Criar `app/api/metrics/route.ts`
9. ✅ Testar coleta de métricas

### **DIA 2 (11h):**
1. ✅ Criar middleware de métricas HTTP
2. ✅ Instrumentar ticket-service.ts
3. ✅ Instrumentar booking-service.ts
4. ✅ Instrumentar checkin-service.ts
5. ✅ Instrumentar payment-service.ts
6. ✅ Instrumentar lib/db.ts
7. ✅ Instrumentar lib/cache-integration.ts
8. ✅ Adicionar métricas de sistema
9. ✅ Testar todas as métricas

### **DIA 3 (10h):**
1. ✅ Criar `k8s/grafana/deployment.yaml`
2. ✅ Criar `k8s/grafana/configmap.yaml`
3. ✅ Criar `k8s/grafana/service.yaml`
4. ✅ Criar `k8s/grafana/pvc.yaml`
5. ✅ Aplicar e testar Grafana
6. ✅ Configurar data source Prometheus
7. ✅ Criar dashboard Application Overview
8. ✅ Criar dashboard Business Metrics
9. ✅ Criar dashboard Infrastructure
10. ✅ Criar dashboard SLA Performance
11. ✅ Configurar provisioning

### **DIA 4 (8h):**
1. ✅ Criar `k8s/prometheus/alert-rules.yaml`
2. ✅ Atualizar Prometheus configmap com alerting
3. ✅ Criar `k8s/alertmanager/configmap.yaml`
4. ✅ Criar `k8s/alertmanager/deployment.yaml`
5. ✅ Criar `k8s/alertmanager/service.yaml`
6. ✅ Configurar notificações (email)
7. ✅ Configurar notificações (Slack - opcional)
8. ✅ Testar alertas

### **DIA 5 (7h):**
1. ✅ Criar `lib/logger.ts`
2. ✅ Instrumentar aplicação com logs
3. ✅ Criar `docs/MONITORING_SETUP.md`
4. ✅ Criar `docs/MONITORING_RUNBOOK.md`
5. ✅ Criar `docs/METRICS_REFERENCE.md`
6. ✅ Testar stack completo
7. ✅ Executar teste de carga
8. ✅ Validação final

---

## 🔍 Verificações Rápidas

### **Prometheus Funcionando:**
```bash
# Verificar pod
kubectl get pods -n rsv-gen2 | grep prometheus

# Verificar logs
kubectl logs -n rsv-gen2 deployment/prometheus --tail=50

# Acessar UI
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# Abrir: http://localhost:9090
```

### **Métricas Coletando:**
```bash
# Testar endpoint
curl http://localhost:3000/api/metrics

# Verificar no Prometheus
# Ir em: Status > Targets
# Verificar se target está "UP"
```

### **Grafana Funcionando:**
```bash
# Verificar pod
kubectl get pods -n rsv-gen2 | grep grafana

# Acessar UI
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000
# Abrir: http://localhost:3001
# Login: admin/admin (ou credenciais configuradas)
```

### **Alertas Funcionando:**
```bash
# Verificar Alertmanager
kubectl get pods -n rsv-gen2 | grep alertmanager

# Acessar UI
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
# Abrir: http://localhost:9093

# Ver alertas no Prometheus
# Ir em: Alerts
```

---

## 📊 Métricas Essenciais (Checklist)

### **HTTP:**
- [ ] `http_requests_total`
- [ ] `http_request_duration_seconds`
- [ ] Requisições por rota funcionando

### **Negócio:**
- [ ] `bookings_created_total`
- [ ] `tickets_created_total`
- [ ] `tickets_resolved_total`
- [ ] `checkins_completed_total`
- [ ] `payments_processed_total`

### **Infraestrutura:**
- [ ] `db_query_duration_seconds`
- [ ] `db_connections_active`
- [ ] `redis_operations_total`
- [ ] `redis_hit_rate`
- [ ] `nodejs_heap_size_used_bytes`

---

## 🚨 Alertas Essenciais (Checklist)

- [ ] High Error Rate (>5%)
- [ ] High Latency (p95 >1s)
- [ ] Service Down
- [ ] High CPU Usage (>80%)
- [ ] High Memory Usage (>85%)
- [ ] Database Pool Exhausted
- [ ] High SLA Breach Rate
- [ ] Redis Down

---

## 📚 Documentação de Referência

- **Detalhado:** `LISTA_TAREFAS_MONITORING_COMPLETO.md`
- **Resumo:** `RESUMO_EXECUTIVO_MONITORING.md`
- **Este guia:** `GUIA_RAPIDO_MONITORING.md`

---

## ⚡ Comandos Úteis

```bash
# Aplicar tudo de uma vez
kubectl apply -f k8s/prometheus/
kubectl apply -f k8s/grafana/
kubectl apply -f k8s/alertmanager/

# Verificar tudo
kubectl get all -n rsv-gen2 | grep -E "prometheus|grafana|alertmanager"

# Deletar tudo (se necessário recomeçar)
kubectl delete -f k8s/prometheus/
kubectl delete -f k8s/grafana/
kubectl delete -f k8s/alertmanager/

# Ver logs de todos
kubectl logs -n rsv-gen2 -l app=prometheus
kubectl logs -n rsv-gen2 -l app=grafana
kubectl logs -n rsv-gen2 -l app=alertmanager
```

---

## 🎯 Próximo Passo Imediato

**Começar pelo Dia 1, Tarefa 1.1.1:**
Criar `k8s/prometheus/configmap.yaml`

**Referência completa:** `LISTA_TAREFAS_MONITORING_COMPLETO.md` (seção DIA 1)

---

**Status:** ✅ Pronto para começar
**Tempo Total Estimado:** 45 horas (5 dias úteis)


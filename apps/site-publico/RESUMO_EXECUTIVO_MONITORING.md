# 📊 RESUMO EXECUTIVO - SEMANA 3: MONITORING COMPLETO

## 🎯 Objetivo Geral
Implementar um sistema completo de monitoramento, observabilidade e alertas para o RSV Gen 2, garantindo visibilidade total da aplicação, infraestrutura e métricas de negócio.

---

## ⏱️ Timeline: 5 Dias

| Dia | Foco | Horas Estimadas | Entregas Principais |
|-----|------|----------------|---------------------|
| **Dia 1** | Setup Prometheus e Métricas Básicas | 9h | Prometheus deployado, prom-client configurado, endpoint /api/metrics |
| **Dia 2** | Métricas de Aplicação e Middleware | 11h | Middleware HTTP, métricas de negócio, DB e cache |
| **Dia 3** | Setup Grafana e Dashboards | 10h | Grafana deployado, 4 dashboards principais |
| **Dia 4** | Alertas e Alertmanager | 8h | Alertmanager configurado, 8+ regras de alerta, notificações |
| **Dia 5** | Logs, Tracing e Finalização | 7h | Logging estruturado, documentação completa |

**Total:** 45 horas (5 dias úteis)

---

## 📋 DIA 1: Setup Prometheus e Métricas Básicas

### 🎯 Objetivo do Dia
Configurar o Prometheus no Kubernetes e criar a base de coleta de métricas na aplicação.

### ✅ Checklist de Tarefas

#### **TAREFA 1.1: Deploy do Prometheus no Kubernetes**

**1.1.1: Criar ConfigMap do Prometheus**
- **Arquivo:** `k8s/prometheus/configmap.yaml`
- **Tempo:** 2 horas
- **Detalhes:**
  - Configurar `scrape_configs` para:
    - Next.js app (porta 3000)
    - WebSocket server (porta 3001)
    - PostgreSQL exporter (se disponível)
    - Redis exporter (se disponível)
  - Intervalo de scrape: 15s
  - Retenção: 30 dias
  - Evaluation interval: 15s

**1.1.2: Criar Deployment do Prometheus**
- **Arquivo:** `k8s/prometheus/deployment.yaml`
- **Tempo:** 1 hora
- **Especificações:**
  - Image: `prom/prometheus:latest`
  - Resources: 2 CPU, 4GB RAM
  - Volume mount para ConfigMap
  - Volume mount para PVC
  - Health checks configurados

**1.1.3: Criar Service do Prometheus**
- **Arquivo:** `k8s/prometheus/service.yaml`
- **Tempo:** 30 minutos
- **Configuração:**
  - Tipo: ClusterIP (ou NodePort para acesso externo)
  - Porta: 9090
  - Labels apropriados

**1.1.4: Criar PVC para Prometheus**
- **Arquivo:** `k8s/prometheus/pvc.yaml`
- **Tempo:** 30 minutos
- **Especificações:**
  - Storage: 50GB
  - StorageClass: padrão
  - AccessMode: ReadWriteOnce

**1.1.5: Testar Deploy**
- **Tempo:** 1 hora
- **Comandos:**
  ```bash
  kubectl apply -f k8s/prometheus/
  kubectl get pods -n rsv-gen2 | grep prometheus
  kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
  ```
- **Verificações:**
  - ✅ Pod rodando
  - ✅ UI acessível em http://localhost:9090
  - ✅ Targets aparecem como "UP"

#### **TAREFA 1.2: Configurar Métricas na Aplicação**

**1.2.1: Instalar prom-client**
- **Tempo:** 15 minutos
- **Comando:**
  ```bash
  npm install prom-client
  npm install --save-dev @types/prom-client
  ```

**1.2.2: Criar lib/metrics.ts**
- **Tempo:** 2 horas
- **Funcionalidades:**
  - Registry do Prometheus
  - Métricas HTTP básicas
  - Métricas de negócio (estrutura)
  - Função `getMetrics()` para exportar

**1.2.3: Criar endpoint /api/metrics**
- **Arquivo:** `app/api/metrics/route.ts`
- **Tempo:** 1 hora
- **Funcionalidades:**
  - GET retorna métricas em formato Prometheus
  - Content-Type: text/plain
  - Sem autenticação (ou básica em produção)

**1.2.4: Testar Coleta**
- **Tempo:** 30 minutos
- **Verificações:**
  - ✅ Endpoint retorna métricas
  - ✅ Prometheus consegue fazer scrape
  - ✅ Métricas aparecem no Prometheus

---

## 📋 DIA 2: Métricas de Aplicação e Middleware

### 🎯 Objetivo do Dia
Instrumentar completamente a aplicação com métricas de HTTP, negócio, banco de dados e cache.

### ✅ Checklist de Tarefas

#### **TAREFA 2.1: Middleware de Métricas HTTP**

**2.1.1: Criar middleware de métricas**
- **Arquivo:** `middleware.ts` (raiz) ou `lib/middleware/metrics.ts`
- **Tempo:** 2 horas
- **Funcionalidades:**
  - Interceptar todas as requisições
  - Registrar duração (histogram)
  - Incrementar contador por método/rota/status
  - Excluir rotas de health e metrics

**2.1.2: Integrar no Next.js**
- **Tempo:** 30 minutos
- **Configuração:**
  - Aplicar a todas as rotas de API
  - Configurar matcher apropriado

#### **TAREFA 2.2: Métricas de Negócio**

**2.2.1: Instrumentar ticket-service.ts**
- **Tempo:** 1 hora
- **Métricas:**
  - `tickets_created_total` (labels: category, priority)
  - `tickets_resolved_total`
  - `ticket_resolution_time_seconds` (histogram)
  - `tickets_open` (gauge)
  - `tickets_sla_breached` (gauge)

**2.2.2: Instrumentar booking-service.ts**
- **Tempo:** 1 hora
- **Métricas:**
  - `bookings_created_total`
  - `bookings_cancelled_total`
  - `booking_revenue_total`
  - `bookings_active` (gauge)

**2.2.3: Instrumentar checkin-service.ts**
- **Tempo:** 1 hora
- **Métricas:**
  - `checkins_created_total`
  - `checkins_completed_total`
  - `checkin_duration_seconds` (histogram)

**2.2.4: Instrumentar payment-service.ts**
- **Tempo:** 1 hora
- **Métricas:**
  - `payments_processed_total`
  - `payments_failed_total`
  - `payment_amount_total`
  - `payment_processing_time_seconds` (histogram)

#### **TAREFA 2.3: Métricas de Banco de Dados**

**2.3.1: Instrumentar queryDatabase**
- **Arquivo:** `lib/db.ts`
- **Tempo:** 2 horas
- **Métricas:**
  - `db_query_duration_seconds` (histogram, label: type)
  - `db_query_total` (counter, labels: type, status)
  - `db_connections_active` (gauge)
  - `db_query_errors_total` (counter)

**2.3.2: Métricas de Pool**
- **Tempo:** 30 minutos
- **Métricas:**
  - `db_pool_size` (gauge)
  - `db_pool_waiting` (gauge)
  - `db_pool_idle` (gauge)

#### **TAREFA 2.4: Métricas de Cache (Redis)**

**2.4.1: Instrumentar cache-integration.ts**
- **Tempo:** 2 horas
- **Métricas:**
  - `redis_operations_total` (counter, labels: operation, status)
  - `redis_hit_rate` (gauge)
  - `redis_miss_rate` (gauge)
  - `redis_operation_duration_seconds` (histogram)
  - `redis_errors_total` (counter)

**2.4.2: Métricas de Memória Redis**
- **Tempo:** 30 minutos
- **Métricas:**
  - `redis_memory_used_bytes` (gauge)
  - `redis_keys_total` (gauge)

#### **TAREFA 2.5: Métricas de Sistema**

**2.5.1: Adicionar métricas Node.js**
- **Tempo:** 1 hora
- **Métricas:**
  - `nodejs_heap_size_total_bytes`
  - `nodejs_heap_size_used_bytes`
  - `nodejs_eventloop_lag_seconds`
  - `nodejs_active_handles`
  - `nodejs_active_requests`

**2.5.2: Testar Todas as Métricas**
- **Tempo:** 1 hora
- **Verificações:**
  - ✅ Todas as métricas aparecem no Prometheus
  - ✅ Valores estão sendo atualizados
  - ✅ Labels estão corretos

---

## 📋 DIA 3: Setup Grafana e Dashboards

### 🎯 Objetivo do Dia
Deploy do Grafana e criação de dashboards completos para visualização de métricas.

### ✅ Checklist de Tarefas

#### **TAREFA 3.1: Deploy do Grafana**

**3.1.1: Criar Deployment do Grafana**
- **Arquivo:** `k8s/grafana/deployment.yaml`
- **Tempo:** 1 hora
- **Especificações:**
  - Image: `grafana/grafana:latest`
  - Resources: 1 CPU, 2GB RAM
  - Volume para dashboards
  - Health checks

**3.1.2: Criar ConfigMap do Grafana**
- **Arquivo:** `k8s/grafana/configmap.yaml`
- **Tempo:** 1 hora
- **Conteúdo:**
  - Data source Prometheus (provisioning)
  - Configurações de segurança
  - Configurações de SMTP

**3.1.3: Criar Service do Grafana**
- **Arquivo:** `k8s/grafana/service.yaml`
- **Tempo:** 30 minutos
- **Porta:** 3000 (ou outra se conflito)

**3.1.4: Criar PVC para Grafana**
- **Arquivo:** `k8s/grafana/pvc.yaml`
- **Tempo:** 30 minutos
- **Storage:** 10GB

**3.1.5: Criar Secret para Credenciais**
- **Arquivo:** `k8s/grafana/secret.yaml.example`
- **Tempo:** 30 minutos
- **Conteúdo:** Admin user e password

**3.1.6: Testar Deploy**
- **Tempo:** 30 minutos
- **Verificações:**
  - ✅ Grafana acessível
  - ✅ Login funciona
  - ✅ Prometheus data source configurado

#### **TAREFA 3.2: Criar Dashboards**

**3.2.1: Dashboard Application Overview**
- **Arquivo:** `k8s/grafana/dashboards/application-overview.json`
- **Tempo:** 2 horas
- **Painéis:**
  - Requests por segundo
  - Latência (p50, p95, p99)
  - Taxa de erro
  - Requisições por rota
  - CPU/Memory usage
  - Event loop lag

**3.2.2: Dashboard Business Metrics**
- **Arquivo:** `k8s/grafana/dashboards/business-metrics.json`
- **Tempo:** 2 horas
- **Painéis:**
  - Reservas (criadas, canceladas, receita)
  - Tickets (criados, resolvidos, SLA)
  - Check-ins (criados, completados)
  - Pagamentos (processados, valor total)

**3.2.3: Dashboard Infrastructure**
- **Arquivo:** `k8s/grafana/dashboards/infrastructure.json`
- **Tempo:** 1.5 horas
- **Painéis:**
  - Database (queries, latência, conexões)
  - Redis (operações, hit rate, memória)
  - WebSocket (conexões, mensagens)

**3.2.4: Dashboard SLA e Performance**
- **Arquivo:** `k8s/grafana/dashboards/sla-performance.json`
- **Tempo:** 1 hora
- **Painéis:**
  - SLA compliance
  - Tempo de resposta por endpoint
  - Throughput
  - Availability

**3.2.5: Configurar Provisioning**
- **Arquivo:** `k8s/grafana/dashboards/dashboards.yaml`
- **Tempo:** 30 minutos
- **Configuração:** Provisionamento automático de dashboards

---

## 📋 DIA 4: Alertas e Alertmanager

### 🎯 Objetivo do Dia
Configurar sistema completo de alertas com regras, Alertmanager e notificações.

### ✅ Checklist de Tarefas

#### **TAREFA 4.1: Regras de Alerta**

**4.1.1: Criar alert-rules.yaml**
- **Arquivo:** `k8s/prometheus/alert-rules.yaml`
- **Tempo:** 2 horas
- **Alertas:**
  1. High Error Rate (>5% por 5min) - warning
  2. High Latency (p95 >1s por 5min) - warning
  3. Service Down (1min) - critical
  4. High CPU Usage (>80% por 10min) - warning
  5. High Memory Usage (>85% por 10min) - warning
  6. Database Pool Exhausted (>90%) - critical
  7. High SLA Breach Rate (>10%) - warning
  8. Redis Down - critical

**4.1.2: Configurar Prometheus para usar regras**
- **Arquivo:** `k8s/prometheus/configmap.yaml`
- **Tempo:** 30 minutos
- **Configuração:** Adicionar `rule_files` e `alerting`

#### **TAREFA 4.2: Deploy do Alertmanager**

**4.2.1: Criar ConfigMap do Alertmanager**
- **Arquivo:** `k8s/alertmanager/configmap.yaml`
- **Tempo:** 1 hora
- **Conteúdo:**
  - Route configuration
  - Receivers (email, Slack)
  - Grouping rules
  - Repeat intervals

**4.2.2: Criar Deployment do Alertmanager**
- **Arquivo:** `k8s/alertmanager/deployment.yaml`
- **Tempo:** 1 hora
- **Resources:** 500m CPU, 512MB RAM

**4.2.3: Criar Service do Alertmanager**
- **Arquivo:** `k8s/alertmanager/service.yaml`
- **Tempo:** 30 minutos
- **Porta:** 9093

**4.2.4: Criar Secret para Notificações**
- **Arquivo:** `k8s/alertmanager/secret.yaml.example`
- **Tempo:** 30 minutos
- **Conteúdo:** Credenciais SMTP/Slack

#### **TAREFA 4.3: Configurar Notificações**

**4.3.1: Configurar Email**
- **Tempo:** 1 hora
- **Configuração:** SMTP no Alertmanager

**4.3.2: Configurar Slack (opcional)**
- **Tempo:** 1 hora
- **Configuração:** Webhook URL

**4.3.3: Testar Alertas**
- **Tempo:** 1 hora
- **Verificações:**
  - ✅ Alertas são disparados
  - ✅ Notificações são enviadas
  - ✅ Alertas são resolvidos corretamente

---

## 📋 DIA 5: Logs, Tracing e Finalização

### 🎯 Objetivo do Dia
Completar observabilidade com logs estruturados, documentação e validação final.

### ✅ Checklist de Tarefas

#### **TAREFA 5.1: Logging Estruturado**

**5.1.1: Configurar logger estruturado**
- **Arquivo:** `lib/logger.ts`
- **Tempo:** 2 horas
- **Funcionalidades:**
  - Formato JSON
  - Níveis: error, warn, info, debug
  - Contexto (requestId, userId)
  - Integração com Winston ou Pino

**5.1.2: Instrumentar aplicação**
- **Tempo:** 2 horas
- **Locais:**
  - Início/fim de requisições
  - Erros
  - Operações de negócio
  - Mudanças de estado

#### **TAREFA 5.2: Documentação**

**5.2.1: Criar MONITORING_SETUP.md**
- **Arquivo:** `docs/MONITORING_SETUP.md`
- **Tempo:** 1.5 horas
- **Conteúdo:**
  - Pré-requisitos
  - Passo a passo de instalação
  - Configuração
  - Troubleshooting

**5.2.2: Criar MONITORING_RUNBOOK.md**
- **Arquivo:** `docs/MONITORING_RUNBOOK.md`
- **Tempo:** 1 hora
- **Conteúdo:**
  - Problemas comuns
  - Como investigar alertas
  - Análise de métricas
  - Contatos de emergência

**5.2.3: Criar METRICS_REFERENCE.md**
- **Arquivo:** `docs/METRICS_REFERENCE.md`
- **Tempo:** 1 hora
- **Conteúdo:**
  - Lista completa de métricas
  - Descrições
  - Labels
  - Exemplos de queries PromQL

#### **TAREFA 5.3: Testes e Validação**

**5.3.1: Testar stack completo**
- **Tempo:** 1 hora
- **Checklist:**
  - ✅ Prometheus coletando
  - ✅ Grafana exibindo
  - ✅ Alertas funcionando
  - ✅ Notificações enviando
  - ✅ Logs coletando

**5.3.2: Teste de carga**
- **Tempo:** 1 hora
- **Ações:**
  - Executar teste de carga
  - Observar métricas
  - Verificar alertas

---

## 📦 Arquivos a Criar (Resumo)

### **Kubernetes (15 arquivos):**
```
k8s/
├── prometheus/
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── pvc.yaml
│   └── alert-rules.yaml
├── grafana/
│   ├── deployment.yaml
│   ├── configmap.yaml
│   ├── service.yaml
│   ├── pvc.yaml
│   ├── secret.yaml.example
│   └── dashboards/
│       ├── application-overview.json
│       ├── business-metrics.json
│       ├── infrastructure.json
│       ├── sla-performance.json
│       └── dashboards.yaml
└── alertmanager/
    ├── configmap.yaml
    ├── deployment.yaml
    ├── service.yaml
    └── secret.yaml.example
```

### **Código (3-5 arquivos):**
```
lib/
├── metrics.ts
├── logger.ts (opcional)
└── middleware/
    └── metrics.ts (ou middleware.ts na raiz)

app/
└── api/
    └── metrics/
        └── route.ts
```

### **Documentação (3 arquivos):**
```
docs/
├── MONITORING_SETUP.md
├── MONITORING_RUNBOOK.md
└── METRICS_REFERENCE.md
```

---

## 🔧 Dependências

```bash
# Métricas (obrigatório)
npm install prom-client
npm install --save-dev @types/prom-client

# Logging (opcional)
npm install winston
# ou
npm install pino pino-pretty
```

---

## ✅ Checklist Final de Validação

### **Infraestrutura:**
- [ ] Prometheus deployado e acessível
- [ ] Grafana deployado e acessível
- [ ] Alertmanager deployado e funcionando
- [ ] PVCs criados e montados
- [ ] Services configurados corretamente

### **Métricas:**
- [ ] Endpoint /api/metrics retornando dados
- [ ] Prometheus fazendo scrape com sucesso
- [ ] Métricas HTTP coletadas
- [ ] Métricas de negócio coletadas
- [ ] Métricas de banco coletadas
- [ ] Métricas de cache coletadas
- [ ] Métricas de sistema coletadas

### **Dashboards:**
- [ ] Application Overview criado e funcionando
- [ ] Business Metrics criado e funcionando
- [ ] Infrastructure criado e funcionando
- [ ] SLA Performance criado e funcionando
- [ ] Dashboards provisionados automaticamente

### **Alertas:**
- [ ] 8+ regras de alerta criadas
- [ ] Alertmanager configurado
- [ ] Notificações por email testadas
- [ ] Notificações por Slack testadas (se configurado)
- [ ] Alertas sendo disparados corretamente
- [ ] Alertas sendo resolvidos corretamente

### **Documentação:**
- [ ] Setup documentado completamente
- [ ] Runbook criado com troubleshooting
- [ ] Referência de métricas criada
- [ ] Dashboards documentados
- [ ] Alertas documentados

---

## 🚀 Comandos Rápidos de Referência

### **Deploy:**
```bash
# Prometheus
kubectl apply -f k8s/prometheus/

# Grafana
kubectl apply -f k8s/grafana/

# Alertmanager
kubectl apply -f k8s/alertmanager/
```

### **Acesso:**
```bash
# Prometheus
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090

# Grafana
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000

# Alertmanager
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
```

### **Verificação:**
```bash
# Ver pods
kubectl get pods -n rsv-gen2 | grep -E "prometheus|grafana|alertmanager"

# Ver logs
kubectl logs -n rsv-gen2 deployment/prometheus
kubectl logs -n rsv-gen2 deployment/grafana

# Testar métricas
curl http://localhost:3000/api/metrics
```

---

## 📊 Métricas Principais a Implementar

### **HTTP:**
- `http_requests_total` - Total de requisições
- `http_request_duration_seconds` - Duração das requisições
- `http_requests_by_status` - Requisições por status code

### **Negócio:**
- `bookings_created_total` - Reservas criadas
- `tickets_created_total` - Tickets criados
- `tickets_resolved_total` - Tickets resolvidos
- `checkins_completed_total` - Check-ins completados
- `payments_processed_total` - Pagamentos processados

### **Infraestrutura:**
- `db_query_duration_seconds` - Duração de queries
- `db_connections_active` - Conexões ativas
- `redis_operations_total` - Operações Redis
- `redis_hit_rate` - Taxa de cache hit
- `nodejs_heap_size_used_bytes` - Uso de memória

---

## 🎯 Critérios de Sucesso

1. ✅ **Prometheus coletando métricas de todos os serviços**
2. ✅ **Grafana exibindo 4+ dashboards funcionais**
3. ✅ **8+ alertas configurados e testados**
4. ✅ **Notificações sendo enviadas corretamente**
5. ✅ **Documentação completa e atualizada**
6. ✅ **Métricas de negócio sendo coletadas**
7. ✅ **Sistema de logs estruturado funcionando**

---

## 📝 Notas Importantes

1. **Segurança:**
   - Proteger endpoints de métricas em produção
   - Usar autenticação no Grafana
   - Restringir acesso ao Prometheus

2. **Performance:**
   - Ajustar recursos conforme volume
   - Monitorar uso do Prometheus
   - Considerar retenção de dados

3. **Custos:**
   - Estimar storage necessário
   - Considerar HA se necessário
   - Avaliar custos de cloud

---

**Status:** ✅ Lista Completa e Pronta para Execução
**Próximo Passo:** Começar pelo Dia 1, Tarefa 1.1.1


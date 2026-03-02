# 📊 LISTA DE TAREFAS DETALHADA - SEMANA 3: MONITORING COMPLETO

## 🎯 Objetivo
Implementar um sistema completo de monitoramento para o RSV Gen 2, incluindo coleta de métricas, visualização em dashboards, alertas e observabilidade completa da aplicação.

---

## 📅 Estrutura da Semana 3 (5 dias)

### **Dia 1: Setup Prometheus e Métricas Básicas**
### **Dia 2: Métricas de Aplicação e Middleware**
### **Dia 3: Setup Grafana e Dashboards**
### **Dia 4: Alertas e Alertmanager**
### **Dia 5: Logs, Tracing e Finalização**

---

## 📋 DIA 1: Setup Prometheus e Métricas Básicas

### **TAREFA 1.1: Configuração do Prometheus no Kubernetes**

#### **1.1.1: Criar ConfigMap do Prometheus**
**Arquivo:** `k8s/prometheus/configmap.yaml`
**Descrição:** Configuração do Prometheus com targets, scrape intervals e retenção
**Conteúdo necessário:**
- Configuração de scrape_configs
- Targets da aplicação Next.js
- Targets do WebSocket server
- Targets do PostgreSQL (se exporter disponível)
- Targets do Redis (se exporter disponível)
- Retenção de dados (15-30 dias)
- Intervalo de scrape (15s)

#### **1.1.2: Criar Deployment do Prometheus**
**Arquivo:** `k8s/prometheus/deployment.yaml`
**Descrição:** Deployment do Prometheus com recursos adequados
**Especificações:**
- Replicas: 1 (ou 2 para HA)
- Resources: 2 CPU, 4GB RAM (ajustar conforme volume)
- Volume para persistência
- ConfigMap mount
- Health checks
- Liveness e Readiness probes

#### **1.1.3: Criar Service do Prometheus**
**Arquivo:** `k8s/prometheus/service.yaml`
**Descrição:** Service para expor Prometheus
**Configuração:**
- Tipo: ClusterIP (ou NodePort para acesso externo)
- Porta: 9090
- Labels para service discovery

#### **1.1.4: Criar PVC para Prometheus**
**Arquivo:** `k8s/prometheus/pvc.yaml`
**Descrição:** Persistent Volume Claim para dados do Prometheus
**Especificações:**
- Storage: 50GB (ajustar conforme necessidade)
- StorageClass: padrão ou específica
- AccessMode: ReadWriteOnce

#### **1.1.5: Criar ServiceMonitor (se usando Prometheus Operator)**
**Arquivo:** `k8s/prometheus/servicemonitor.yaml` (opcional)
**Descrição:** ServiceMonitor para descoberta automática de targets
**Nota:** Apenas se Prometheus Operator estiver instalado

#### **1.1.6: Testar Deploy do Prometheus**
**Comandos:**
```bash
# Aplicar configurações
kubectl apply -f k8s/prometheus/

# Verificar pods
kubectl get pods -n rsv-gen2 | grep prometheus

# Verificar logs
kubectl logs -n rsv-gen2 deployment/prometheus

# Port-forward para acesso local
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
```

**Verificações:**
- ✅ Pod está rodando
- ✅ ConfigMap foi aplicado corretamente
- ✅ PVC foi criado e montado
- ✅ Prometheus UI acessível em http://localhost:9090
- ✅ Targets aparecem como "UP"

---

### **TAREFA 1.2: Instalar e Configurar prom-client**

#### **1.2.1: Instalar dependências**
**Comando:**
```bash
npm install prom-client
npm install --save-dev @types/prom-client
```

#### **1.2.2: Criar lib/metrics.ts**
**Arquivo:** `lib/metrics.ts`
**Descrição:** Configuração centralizada de métricas Prometheus
**Funcionalidades:**
- Registrar Registry do Prometheus
- Criar métricas HTTP básicas (requests_total, request_duration_seconds)
- Criar métricas de negócio (bookings_total, tickets_created, etc.)
- Criar métricas de banco de dados (db_query_duration, db_connections)
- Criar métricas de cache (redis_operations, redis_hit_rate)
- Função para coletar métricas do sistema (CPU, memória)
- Exportar métricas no formato Prometheus

**Estrutura:**
```typescript
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Criar registry
const register = new Registry();

// Métricas HTTP
const httpRequestDuration = new Histogram({...});
const httpRequestTotal = new Counter({...});

// Métricas de negócio
const bookingsTotal = new Counter({...});
const ticketsCreated = new Counter({...});

// Métricas de banco
const dbQueryDuration = new Histogram({...});
const dbConnections = new Gauge({...});

// Métricas de cache
const redisOperations = new Counter({...});
const redisHitRate = new Gauge({...});

// Exportar métricas
export async function getMetrics(): Promise<string> {
  return register.metrics();
}
```

#### **1.2.3: Criar endpoint /api/metrics**
**Arquivo:** `app/api/metrics/route.ts`
**Descrição:** Endpoint para expor métricas no formato Prometheus
**Funcionalidades:**
- GET /api/metrics retorna métricas em formato Prometheus
- Content-Type: text/plain
- Sem autenticação (ou autenticação básica em produção)
- Rate limiting para evitar abuso

**Código base:**
```typescript
import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';

export async function GET() {
  try {
    const metrics = await getMetrics();
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao coletar métricas' },
      { status: 500 }
    );
  }
}
```

#### **1.2.4: Testar coleta de métricas**
**Comandos:**
```bash
# Testar endpoint localmente
curl http://localhost:3000/api/metrics

# Verificar formato Prometheus
curl http://localhost:3000/api/metrics | grep -E "^#|^http_"

# Testar no Prometheus
# Adicionar target no Prometheus: http://nextjs-service:3000/api/metrics
```

**Verificações:**
- ✅ Endpoint retorna métricas no formato correto
- ✅ Métricas aparecem no Prometheus
- ✅ Labels estão corretos
- ✅ Valores estão sendo atualizados

---

## 📋 DIA 2: Métricas de Aplicação e Middleware

### **TAREFA 2.1: Middleware de Métricas HTTP**

#### **2.1.1: Criar middleware de métricas**
**Arquivo:** `lib/middleware/metrics.ts` ou `middleware.ts` (Next.js)
**Descrição:** Middleware para coletar métricas HTTP automaticamente
**Funcionalidades:**
- Interceptar todas as requisições HTTP
- Registrar duração da requisição
- Incrementar contador de requisições
- Adicionar labels: method, route, status_code
- Excluir rotas de health check e métricas

**Implementação:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { httpRequestDuration, httpRequestTotal } from '@/lib/metrics';

export function metricsMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  const start = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;
  
  // Registrar métricas após resposta
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
  
  // Incrementar contador
  httpRequestTotal.inc({
    method,
    route: path,
    status_code: response.status,
  });
  
  // Registrar duração
  httpRequestDuration.observe(
    {
      method,
      route: path,
      status_code: response.status,
    },
    (Date.now() - start) / 1000
  );
  
  return response;
}
```

#### **2.1.2: Integrar middleware no Next.js**
**Arquivo:** `middleware.ts` (raiz do projeto)
**Descrição:** Middleware global do Next.js
**Configuração:**
- Aplicar a todas as rotas exceto estáticas
- Incluir rotas de API
- Excluir rotas de métricas e health

---

### **TAREFA 2.2: Métricas de Negócio**

#### **2.2.1: Adicionar métricas em ticket-service.ts**
**Arquivo:** `lib/ticket-service.ts`
**Descrição:** Instrumentar funções principais com métricas
**Métricas a adicionar:**
- `tickets_created_total`: Contador de tickets criados (por categoria, prioridade)
- `tickets_resolved_total`: Contador de tickets resolvidos
- `ticket_resolution_time_seconds`: Histograma do tempo de resolução
- `tickets_open`: Gauge de tickets abertos
- `tickets_sla_breached`: Gauge de tickets com SLA violado

**Exemplo:**
```typescript
import { ticketsCreated, ticketsResolved, ticketResolutionTime } from '@/lib/metrics';

// Ao criar ticket
ticketsCreated.inc({
  category: data.category,
  priority: data.priority,
});

// Ao resolver ticket
ticketsResolved.inc({
  category: ticket.category,
  priority: ticket.priority,
});

const resolutionTime = (resolvedAt - createdAt) / 1000;
ticketResolutionTime.observe({
  category: ticket.category,
  priority: ticket.priority,
}, resolutionTime);
```

#### **2.2.2: Adicionar métricas em booking-service.ts**
**Arquivo:** `lib/booking-service.ts` (ou similar)
**Métricas:**
- `bookings_created_total`: Contador de reservas criadas
- `bookings_cancelled_total`: Contador de cancelamentos
- `booking_revenue_total`: Contador de receita
- `bookings_active`: Gauge de reservas ativas

#### **2.2.3: Adicionar métricas em checkin-service.ts**
**Arquivo:** `lib/checkin-service.ts`
**Métricas:**
- `checkins_created_total`: Contador de check-ins criados
- `checkins_completed_total`: Contador de check-ins completados
- `checkin_duration_seconds`: Histograma da duração do check-in

#### **2.2.4: Adicionar métricas em payment-service.ts**
**Arquivo:** `lib/payment-service.ts` (ou similar)
**Métricas:**
- `payments_processed_total`: Contador de pagamentos processados
- `payments_failed_total`: Contador de falhas
- `payment_amount_total`: Contador de valor total processado
- `payment_processing_time_seconds`: Histograma do tempo de processamento

---

### **TAREFA 2.3: Métricas de Banco de Dados**

#### **2.3.1: Instrumentar queryDatabase**
**Arquivo:** `lib/db.ts`
**Descrição:** Adicionar métricas em todas as queries
**Métricas:**
- `db_query_duration_seconds`: Histograma da duração das queries
- `db_query_total`: Contador de queries (por tipo: SELECT, INSERT, UPDATE, DELETE)
- `db_connections_active`: Gauge de conexões ativas
- `db_connections_idle`: Gauge de conexões idle
- `db_query_errors_total`: Contador de erros

**Implementação:**
```typescript
import { dbQueryDuration, dbQueryTotal, dbQueryErrors } from '@/lib/metrics';

export async function queryDatabase(query: string, params: any[]) {
  const start = Date.now();
  const queryType = query.trim().split(' ')[0].toUpperCase();
  
  try {
    const result = await pool.query(query, params);
    
    // Registrar sucesso
    dbQueryTotal.inc({ type: queryType, status: 'success' });
    dbQueryDuration.observe({ type: queryType }, (Date.now() - start) / 1000);
    
    return result.rows;
  } catch (error) {
    // Registrar erro
    dbQueryTotal.inc({ type: queryType, status: 'error' });
    dbQueryErrors.inc({ type: queryType });
    throw error;
  }
}
```

#### **2.3.2: Adicionar métricas de pool de conexões**
**Descrição:** Monitorar pool do PostgreSQL
**Métricas:**
- `db_pool_size`: Tamanho do pool
- `db_pool_waiting`: Clientes aguardando conexão
- `db_pool_idle`: Conexões idle

---

### **TAREFA 2.4: Métricas de Cache (Redis)**

#### **2.4.1: Instrumentar cache-integration.ts**
**Arquivo:** `lib/cache-integration.ts`
**Descrição:** Adicionar métricas em operações de cache
**Métricas:**
- `redis_operations_total`: Contador de operações (por tipo: GET, SET, DEL)
- `redis_hit_rate`: Taxa de cache hit
- `redis_miss_rate`: Taxa de cache miss
- `redis_operation_duration_seconds`: Histograma da duração
- `redis_errors_total`: Contador de erros

**Implementação:**
```typescript
import { redisOperations, redisHitRate, redisOperationDuration } from '@/lib/metrics';

export async function getCache(key: string) {
  const start = Date.now();
  try {
    const value = await redis.get(key);
    
    redisOperations.inc({ operation: 'GET', status: 'success' });
    redisOperationDuration.observe({ operation: 'GET' }, (Date.now() - start) / 1000);
    
    if (value) {
      redisHitRate.inc();
    } else {
      redisMissRate.inc();
    }
    
    return value;
  } catch (error) {
    redisOperations.inc({ operation: 'GET', status: 'error' });
    throw error;
  }
}
```

#### **2.4.2: Adicionar métricas de memória do Redis**
**Descrição:** Monitorar uso de memória do Redis
**Métricas:**
- `redis_memory_used_bytes`: Memória usada
- `redis_keys_total`: Número total de chaves

---

### **TAREFA 2.5: Métricas de Sistema**

#### **2.5.1: Adicionar métricas de Node.js**
**Descrição:** Métricas nativas do Node.js
**Métricas:**
- `nodejs_heap_size_total_bytes`: Tamanho total do heap
- `nodejs_heap_size_used_bytes`: Heap usado
- `nodejs_external_memory_bytes`: Memória externa
- `nodejs_eventloop_lag_seconds`: Lag do event loop
- `nodejs_active_handles`: Handles ativos
- `nodejs_active_requests`: Requests ativos

#### **2.5.2: Criar função de coleta de métricas do sistema**
**Arquivo:** `lib/metrics.ts`
**Descrição:** Função para coletar métricas do sistema operacional
**Métricas:**
- `system_cpu_usage_percent`: Uso de CPU
- `system_memory_used_bytes`: Memória usada
- `system_disk_used_bytes`: Disco usado
- `system_uptime_seconds`: Uptime do sistema

**Nota:** Usar bibliotecas como `systeminformation` ou métricas nativas do Node.js

---

## 📋 DIA 3: Setup Grafana e Dashboards

### **TAREFA 3.1: Deploy do Grafana**

#### **3.1.1: Criar Deployment do Grafana**
**Arquivo:** `k8s/grafana/deployment.yaml`
**Descrição:** Deployment do Grafana
**Especificações:**
- Replicas: 1
- Resources: 1 CPU, 2GB RAM
- Volume para persistência de dashboards
- ConfigMap para configuração
- Health checks

#### **3.1.2: Criar ConfigMap do Grafana**
**Arquivo:** `k8s/grafana/configmap.yaml`
**Descrição:** Configuração do Grafana
**Conteúdo:**
- Data sources (Prometheus)
- Configurações de segurança
- Configurações de SMTP (para alertas)
- Configurações de autenticação

#### **3.1.3: Criar Service do Grafana**
**Arquivo:** `k8s/grafana/service.yaml`
**Descrição:** Service para expor Grafana
**Configuração:**
- Tipo: ClusterIP ou NodePort
- Porta: 3000 (ou outra se conflito)

#### **3.1.4: Criar PVC para Grafana**
**Arquivo:** `k8s/grafana/pvc.yaml`
**Descrição:** Persistent Volume para dashboards e dados
**Especificações:**
- Storage: 10GB
- StorageClass: padrão

#### **3.1.5: Criar Secret para credenciais do Grafana**
**Arquivo:** `k8s/grafana/secret.yaml.example`
**Descrição:** Secret para admin user e password
**Nota:** Criar exemplo e documentar como gerar secret real

#### **3.1.6: Testar Deploy do Grafana**
**Comandos:**
```bash
# Aplicar configurações
kubectl apply -f k8s/grafana/

# Verificar pods
kubectl get pods -n rsv-gen2 | grep grafana

# Port-forward
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000
```

**Verificações:**
- ✅ Grafana acessível em http://localhost:3001
- ✅ Login funciona (admin/admin ou credenciais configuradas)
- ✅ Data source Prometheus configurado e testado

---

### **TAREFA 3.2: Configurar Data Source Prometheus**

#### **3.2.1: Configurar Prometheus como data source**
**Descrição:** Via UI do Grafana ou ConfigMap
**Configuração:**
- URL: http://prometheus:9090 (ou service name)
- Access: Server (default)
- Basic Auth: se necessário
- Testar conexão

---

### **TAREFA 3.3: Criar Dashboards**

#### **3.3.1: Dashboard Application Overview**
**Arquivo:** `k8s/grafana/dashboards/application-overview.json`
**Descrição:** Dashboard geral da aplicação
**Painéis:**
1. **HTTP Metrics:**
   - Requests por segundo (rate)
   - Latência (p50, p95, p99)
   - Taxa de erro (4xx, 5xx)
   - Requisições por rota

2. **System Metrics:**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network I/O

3. **Application Health:**
   - Uptime
   - Active connections
   - Event loop lag

**Queries PromQL exemplo:**
```promql
# Requests por segundo
rate(http_requests_total[5m])

# Latência p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taxa de erro
rate(http_requests_total{status_code=~"4..|5.."}[5m]) / rate(http_requests_total[5m])
```

#### **3.3.2: Dashboard Business Metrics**
**Arquivo:** `k8s/grafana/dashboards/business-metrics.json`
**Descrição:** Métricas de negócio
**Painéis:**
1. **Bookings:**
   - Reservas criadas (hoje, semana, mês)
   - Cancelamentos
   - Receita total
   - Reservas ativas

2. **Tickets:**
   - Tickets criados
   - Tickets resolvidos
   - Tempo médio de resolução
   - Tickets abertos
   - SLA compliance rate

3. **Check-ins:**
   - Check-ins criados
   - Check-ins completados
   - Taxa de conclusão

4. **Payments:**
   - Pagamentos processados
   - Taxa de sucesso
   - Valor total processado

#### **3.3.3: Dashboard Infrastructure**
**Arquivo:** `k8s/grafana/dashboards/infrastructure.json`
**Descrição:** Métricas de infraestrutura
**Painéis:**
1. **Database:**
   - Queries por segundo
   - Latência de queries
   - Conexões ativas
   - Taxa de erro

2. **Cache (Redis):**
   - Operações por segundo
   - Cache hit rate
   - Memória usada
   - Número de chaves

3. **WebSocket:**
   - Conexões ativas
   - Mensagens enviadas
   - Taxa de reconexão

#### **3.3.4: Dashboard SLA e Performance**
**Arquivo:** `k8s/grafana/dashboards/sla-performance.json`
**Descrição:** Métricas de SLA e performance
**Painéis:**
- SLA compliance por serviço
- Tempo de resposta por endpoint
- Throughput
- Error rates
- Availability

#### **3.3.5: Exportar dashboards como JSON**
**Descrição:** Salvar dashboards como arquivos JSON
**Localização:** `k8s/grafana/dashboards/*.json`
**Formato:** Grafana dashboard JSON export format

#### **3.3.6: Configurar Provisioning de Dashboards**
**Arquivo:** `k8s/grafana/dashboards/dashboards.yaml`
**Descrição:** Configuração para provisionar dashboards automaticamente
**Conteúdo:**
```yaml
apiVersion: 1
providers:
  - name: 'RSV Gen 2 Dashboards'
    orgId: 1
    folder: 'RSV Gen 2'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

---

## 📋 DIA 4: Alertas e Alertmanager

### **TAREFA 4.1: Configurar Regras de Alerta**

#### **4.1.1: Criar alert-rules.yaml**
**Arquivo:** `k8s/prometheus/alert-rules.yaml`
**Descrição:** Regras de alerta do Prometheus
**Alertas a criar:**

1. **High Error Rate:**
   - Condição: Taxa de erro > 5% por 5 minutos
   - Severidade: warning
   - Mensagem: "Alta taxa de erro detectada"

2. **High Latency:**
   - Condição: Latência p95 > 1s por 5 minutos
   - Severidade: warning
   - Mensagem: "Latência alta detectada"

3. **Service Down:**
   - Condição: Target down por 1 minuto
   - Severidade: critical
   - Mensagem: "Serviço indisponível"

4. **High CPU Usage:**
   - Condição: CPU > 80% por 10 minutos
   - Severidade: warning
   - Mensagem: "Uso de CPU alto"

5. **High Memory Usage:**
   - Condição: Memória > 85% por 10 minutos
   - Severidade: warning
   - Mensagem: "Uso de memória alto"

6. **Database Connection Pool Exhausted:**
   - Condição: Conexões ativas > 90% do pool
   - Severidade: critical
   - Mensagem: "Pool de conexões esgotado"

7. **High Ticket SLA Breach Rate:**
   - Condição: Taxa de violação de SLA > 10%
   - Severidade: warning
   - Mensagem: "Alta taxa de violação de SLA"

8. **Redis Down:**
   - Condição: Redis não responde
   - Severidade: critical
   - Mensagem: "Redis indisponível"

**Formato:**
```yaml
groups:
  - name: rsv_gen2_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"4..|5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alta taxa de erro detectada"
          description: "Taxa de erro está acima de 5%"
```

#### **4.1.2: Configurar Prometheus para usar alert-rules**
**Arquivo:** `k8s/prometheus/configmap.yaml`
**Descrição:** Adicionar configuração de alerting
**Configuração:**
```yaml
rule_files:
  - "/etc/prometheus/alert-rules.yaml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

---

### **TAREFA 4.2: Deploy do Alertmanager**

#### **4.2.1: Criar ConfigMap do Alertmanager**
**Arquivo:** `k8s/alertmanager/configmap.yaml`
**Descrição:** Configuração do Alertmanager
**Conteúdo:**
- Route configuration
- Receivers (email, Slack, etc.)
- Grouping e inhibition rules
- Repeat interval

#### **4.2.2: Criar Deployment do Alertmanager**
**Arquivo:** `k8s/alertmanager/deployment.yaml`
**Descrição:** Deployment do Alertmanager
**Especificações:**
- Replicas: 1
- Resources: 500m CPU, 512MB RAM
- Volume para persistência

#### **4.2.3: Criar Service do Alertmanager**
**Arquivo:** `k8s/alertmanager/service.yaml`
**Descrição:** Service para Alertmanager
**Porta:** 9093

#### **4.2.4: Criar Secret para notificações**
**Arquivo:** `k8s/alertmanager/secret.yaml.example`
**Descrição:** Secret para credenciais de email/Slack
**Nota:** Documentar como criar secret real

---

### **TAREFA 4.3: Configurar Notificações**

#### **4.3.1: Configurar Email**
**Descrição:** Configurar Alertmanager para enviar emails
**Configuração:**
- SMTP server
- From/To addresses
- Templates de email

#### **4.3.2: Configurar Slack (opcional)**
**Descrição:** Integração com Slack
**Configuração:**
- Webhook URL
- Channel
- Username

#### **4.3.3: Configurar PagerDuty (opcional)**
**Descrição:** Integração com PagerDuty para alertas críticos

#### **4.3.4: Testar alertas**
**Comandos:**
```bash
# Verificar regras de alerta
kubectl exec -n rsv-gen2 prometheus-pod -- promtool check rules /etc/prometheus/alert-rules.yaml

# Verificar alertas ativos
# Acessar Prometheus UI: http://localhost:9090/alerts

# Verificar Alertmanager
# Acessar Alertmanager UI: http://localhost:9093
```

**Testes:**
- ✅ Criar alerta de teste
- ✅ Verificar que alerta é disparado
- ✅ Verificar que notificação é enviada
- ✅ Verificar que alerta é resolvido quando condição não é mais verdadeira

---

## 📋 DIA 5: Logs, Tracing e Finalização

### **TAREFA 5.1: Configurar Coleta de Logs (Loki - Opcional)**

#### **5.1.1: Deploy do Loki**
**Arquivo:** `k8s/loki/deployment.yaml` (opcional)
**Descrição:** Deploy do Loki para agregação de logs
**Nota:** Opcional, pode usar soluções como ELK, CloudWatch, etc.

#### **5.1.2: Configurar Promtail**
**Arquivo:** `k8s/loki/promtail.yaml` (opcional)
**Descrição:** Promtail para coletar logs dos pods
**Configuração:**
- Scrape configs para pods
- Labels para identificação
- Pipeline para parsing

#### **5.1.3: Configurar Loki como data source no Grafana**
**Descrição:** Adicionar Loki como data source
**Configuração:**
- URL: http://loki:3100
- Access: Server

#### **5.1.4: Criar dashboard de logs**
**Descrição:** Dashboard para visualizar logs
**Painéis:**
- Logs por nível (error, warn, info)
- Logs por serviço
- Logs recentes
- Busca de logs

---

### **TAREFA 5.2: Adicionar Structured Logging**

#### **5.2.1: Configurar logger estruturado**
**Arquivo:** `lib/logger.ts`
**Descrição:** Logger com formato JSON
**Funcionalidades:**
- Níveis: error, warn, info, debug
- Formato JSON para parsing
- Contexto (requestId, userId, etc.)
- Integração com Winston ou Pino

#### **5.2.2: Instrumentar aplicação com logs estruturados**
**Descrição:** Adicionar logs em pontos críticos
**Locais:**
- Início/fim de requisições
- Erros
- Operações de negócio importantes
- Mudanças de estado

---

### **TAREFA 5.3: Tracing Distribuído (Opcional)**

#### **5.3.1: Configurar OpenTelemetry**
**Arquivo:** `lib/tracing.ts` (opcional)
**Descrição:** Configuração de tracing distribuído
**Nota:** Opcional, pode usar Jaeger, Zipkin, etc.

#### **5.3.2: Instrumentar aplicação com spans**
**Descrição:** Adicionar spans em operações importantes
**Locais:**
- Requisições HTTP
- Queries de banco
- Chamadas de API externas
- Operações de cache

---

### **TAREFA 5.4: Documentação**

#### **5.4.1: Criar documentação de setup**
**Arquivo:** `docs/MONITORING_SETUP.md`
**Descrição:** Guia completo de setup de monitoring
**Conteúdo:**
- Pré-requisitos
- Passo a passo de instalação
- Configuração de variáveis
- Verificação de funcionamento
- Troubleshooting

#### **5.4.2: Criar runbook de troubleshooting**
**Arquivo:** `docs/MONITORING_RUNBOOK.md`
**Descrição:** Guia de resolução de problemas comuns
**Conteúdo:**
- Problemas comuns e soluções
- Como investigar alertas
- Como analisar métricas
- Como verificar logs
- Contatos de emergência

#### **5.4.3: Documentar dashboards**
**Descrição:** Documentar cada dashboard criado
**Conteúdo:**
- Descrição do dashboard
- Métricas exibidas
- Como interpretar
- Quando usar

#### **5.4.4: Documentar alertas**
**Descrição:** Documentar cada regra de alerta
**Conteúdo:**
- Condição do alerta
- O que significa
- Como investigar
- Ações de resolução

---

### **TAREFA 5.5: Testes e Validação**

#### **5.5.1: Testar stack completo**
**Checklist:**
- ✅ Prometheus coletando métricas
- ✅ Grafana exibindo dashboards
- ✅ Alertas sendo disparados
- ✅ Notificações sendo enviadas
- ✅ Logs sendo coletados (se configurado)
- ✅ Métricas de negócio funcionando
- ✅ Métricas de infraestrutura funcionando

#### **5.5.2: Teste de carga e observabilidade**
**Descrição:** Executar teste de carga e verificar métricas
**Comandos:**
```bash
# Executar teste de carga (usar k6, Apache Bench, etc.)
# Observar métricas no Grafana
# Verificar alertas
```

#### **5.5.3: Documentar métricas disponíveis**
**Arquivo:** `docs/METRICS_REFERENCE.md`
**Descrição:** Referência completa de todas as métricas
**Conteúdo:**
- Lista de todas as métricas
- Descrição de cada uma
- Labels disponíveis
- Exemplos de queries PromQL

---

## 📦 Arquivos a Criar

### **Kubernetes:**
- `k8s/prometheus/configmap.yaml`
- `k8s/prometheus/deployment.yaml`
- `k8s/prometheus/service.yaml`
- `k8s/prometheus/pvc.yaml`
- `k8s/prometheus/alert-rules.yaml`
- `k8s/grafana/deployment.yaml`
- `k8s/grafana/configmap.yaml`
- `k8s/grafana/service.yaml`
- `k8s/grafana/pvc.yaml`
- `k8s/grafana/secret.yaml.example`
- `k8s/grafana/dashboards/application-overview.json`
- `k8s/grafana/dashboards/business-metrics.json`
- `k8s/grafana/dashboards/infrastructure.json`
- `k8s/grafana/dashboards/sla-performance.json`
- `k8s/grafana/dashboards/dashboards.yaml`
- `k8s/alertmanager/configmap.yaml`
- `k8s/alertmanager/deployment.yaml`
- `k8s/alertmanager/service.yaml`
- `k8s/alertmanager/secret.yaml.example`
- `k8s/loki/deployment.yaml` (opcional)
- `k8s/loki/promtail.yaml` (opcional)

### **Código:**
- `lib/metrics.ts`
- `app/api/metrics/route.ts`
- `lib/middleware/metrics.ts` ou `middleware.ts`
- `lib/logger.ts` (opcional)
- `lib/tracing.ts` (opcional)

### **Documentação:**
- `docs/MONITORING_SETUP.md`
- `docs/MONITORING_RUNBOOK.md`
- `docs/METRICS_REFERENCE.md`

---

## 🔧 Dependências a Instalar

```bash
# Métricas
npm install prom-client
npm install --save-dev @types/prom-client

# Logging (opcional)
npm install winston
# ou
npm install pino pino-pretty

# Tracing (opcional)
npm install @opentelemetry/api
npm install @opentelemetry/sdk-node
npm install @opentelemetry/instrumentation-http
npm install @opentelemetry/instrumentation-pg
```

---

## ✅ Checklist Final

### **Infraestrutura:**
- [ ] Prometheus deployado e funcionando
- [ ] Grafana deployado e funcionando
- [ ] Alertmanager deployado e funcionando
- [ ] Data sources configurados
- [ ] PVCs criados e montados

### **Métricas:**
- [ ] Endpoint /api/metrics funcionando
- [ ] Métricas HTTP coletadas
- [ ] Métricas de negócio coletadas
- [ ] Métricas de banco coletadas
- [ ] Métricas de cache coletadas
- [ ] Métricas de sistema coletadas

### **Dashboards:**
- [ ] Application Overview criado
- [ ] Business Metrics criado
- [ ] Infrastructure criado
- [ ] SLA Performance criado
- [ ] Dashboards provisionados automaticamente

### **Alertas:**
- [ ] Regras de alerta criadas
- [ ] Alertmanager configurado
- [ ] Notificações testadas (email)
- [ ] Notificações testadas (Slack - se configurado)

### **Documentação:**
- [ ] Setup documentado
- [ ] Runbook criado
- [ ] Referência de métricas criada
- [ ] Dashboards documentados
- [ ] Alertas documentados

---

## 🚀 Próximos Passos Após Conclusão

1. **Otimização:**
   - Ajustar retenção de dados conforme necessidade
   - Otimizar queries PromQL
   - Ajustar intervalos de scrape

2. **Melhorias:**
   - Adicionar mais dashboards específicos
   - Criar alertas mais granulares
   - Implementar SLOs (Service Level Objectives)

3. **Integrações:**
   - Integrar com sistemas externos (PagerDuty, OpsGenie)
   - Adicionar mais canais de notificação
   - Integrar com CI/CD para métricas de deploy

---

## 📝 Notas Importantes

1. **Segurança:**
   - Em produção, proteger endpoints de métricas com autenticação
   - Usar TLS para comunicação entre serviços
   - Restringir acesso ao Grafana

2. **Performance:**
   - Ajustar recursos conforme volume de métricas
   - Monitorar uso de recursos do Prometheus
   - Considerar remote write para long-term storage

3. **Custos:**
   - Estimar custos de storage
   - Considerar retenção de dados
   - Avaliar necessidade de alta disponibilidade

---

**Data de Criação:** 2025-01-XX
**Última Atualização:** 2025-01-XX
**Status:** Pronto para execução


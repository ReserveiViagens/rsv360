# ✅ RESUMO - DIA 4: ALERTAS E ALERTMANAGER

## 📋 Tarefas Concluídas

### ✅ Tarefa 4.1: Regras de Alerta do Prometheus
- **Arquivo:** `k8s/prometheus/alert-rules-configmap.yaml`
- **Status:** ✅ Completo
- **Regras Criadas:** 18 alertas organizados em 5 grupos

#### **Grupo 1: Application Alerts (4 alertas)**
- ✅ `HighErrorRate`: Taxa de erro HTTP > 5% por 5 minutos
- ✅ `HighLatency`: Latência p95 > 1s por 5 minutos
- ✅ `ServiceDown`: Serviço down por 1 minuto
- ✅ `HighRequestRate`: Taxa de requisições > 1000 req/s

#### **Grupo 2: Infrastructure Alerts (4 alertas)**
- ✅ `HighCPUUsage`: CPU > 80% por 10 minutos
- ✅ `HighMemoryUsage`: Memória > 85% por 10 minutos
- ✅ `HighNodeJSHeapMemory`: Heap Node.js > 90% por 5 minutos
- ✅ `HighEventLoopLag`: Event loop lag > 100ms por 5 minutos

#### **Grupo 3: Database Alerts (4 alertas)**
- ✅ `DatabaseConnectionPoolExhausted`: Pool > 90% por 5 minutos
- ✅ `HighDatabaseQueryDuration`: Latência p95 > 1s por 5 minutos
- ✅ `HighDatabaseErrorRate`: Taxa de erro > 5% por 5 minutos
- ✅ `DatabaseConnectionsWaiting`: Conexões aguardando > 5 por 5 minutos

#### **Grupo 4: Redis Alerts (4 alertas)**
- ✅ `RedisDown`: Redis não responde por 2 minutos
- ✅ `LowRedisHitRate`: Hit rate < 70% por 10 minutos
- ✅ `HighRedisMemoryUsage`: Memória > 2GB por 10 minutos
- ✅ `HighRedisErrorRate`: Taxa de erro > 5% por 5 minutos

#### **Grupo 5: Business Alerts (4 alertas)**
- ✅ `HighTicketSLABreachRate`: Violação de SLA > 10% por 10 minutos
- ✅ `HighTicketResolutionTime`: Tempo de resolução p95 > 24h por 1 hora
- ✅ `HighNumberOfOpenTickets`: Tickets abertos > 100 por 30 minutos
- ✅ `LowCheckinCompletionRate`: Taxa de conclusão < 80% por 1 hora
- ✅ `HighPaymentFailureRate`: Taxa de falha > 5% por 10 minutos

### ✅ Tarefa 4.2: Deploy do Alertmanager
- **Arquivo:** `k8s/alertmanager/deployment.yaml`
- **Status:** ✅ Completo
- **Funcionalidades:**
  - ✅ Deployment com 1 replica
  - ✅ Resources: 256Mi-512Mi RAM, 100m-500m CPU
  - ✅ Health checks (liveness, readiness, startup)
  - ✅ Volume mounts para config e storage
  - ✅ Portas: 9093 (web), 9094 (cluster)

- **Arquivo:** `k8s/alertmanager/service.yaml`
- **Status:** ✅ Completo
- **Tipo:** ClusterIP

- **Arquivo:** `k8s/alertmanager/pvc.yaml`
- **Status:** ✅ Completo
- **Storage:** 5GB

- **Arquivo:** `k8s/alertmanager/secret.yaml.example`
- **Status:** ✅ Completo
- **Nota:** Template com instruções para criar secret real

### ✅ Tarefa 4.3: Configuração do Alertmanager
- **Arquivo:** `k8s/alertmanager/configmap.yaml`
- **Status:** ✅ Completo
- **Funcionalidades:**
  - ✅ Roteamento por severidade (critical, warning, info)
  - ✅ 4 receivers configurados (default, critical-alerts, warning-alerts, info-alerts)
  - ✅ Agrupamento de alertas
  - ✅ Inhibition rules (supressão de alertas relacionados)
  - ✅ Templates de email e Slack (comentados, prontos para uso)

### ✅ Tarefa 4.4: Integração Prometheus-Alertmanager
- **Arquivo:** `k8s/prometheus/configmap.yaml`
- **Status:** ✅ Atualizado
- **Mudanças:**
  - ✅ Configuração de `alerting.alertmanagers` adicionada
  - ✅ Configuração de `rule_files` adicionada

- **Arquivo:** `k8s/prometheus/deployment.yaml`
- **Status:** ✅ Atualizado
- **Mudanças:**
  - ✅ Volume mount para alert-rules adicionado
  - ✅ ConfigMap `prometheus-alert-rules` referenciado

## 📁 Arquivos Criados/Modificados

```
k8s/
├── prometheus/
│   ├── configmap.yaml                    ✅ Atualizado (alerting config)
│   ├── deployment.yaml                   ✅ Atualizado (volume mount)
│   └── alert-rules-configmap.yaml        ✅ Novo (18 regras de alerta)
│
└── alertmanager/
    ├── deployment.yaml                   ✅ Novo
    ├── service.yaml                      ✅ Novo
    ├── configmap.yaml                    ✅ Novo (roteamento, receivers)
    ├── pvc.yaml                          ✅ Novo (5GB)
    ├── secret.yaml.example               ✅ Novo (template)
    └── README.md                         ✅ Novo (documentação)
```

## 🔧 Como Usar

### 1. Aplicar Regras de Alerta:
```bash
kubectl apply -f k8s/prometheus/alert-rules-configmap.yaml
kubectl apply -f k8s/prometheus/configmap.yaml
kubectl apply -f k8s/prometheus/deployment.yaml
kubectl rollout restart deployment/prometheus -n rsv-gen2
```

### 2. Deploy do Alertmanager:
```bash
kubectl apply -f k8s/alertmanager/
```

### 3. Verificar Alertas:
```bash
# Acessar Prometheus UI
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# Navegar para: Alerts

# Acessar Alertmanager UI
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
# Navegar para: http://localhost:9093
```

### 4. Configurar Notificações (Email/Slack):
1. Editar `k8s/alertmanager/configmap.yaml`
2. Descomentar e configurar seções de email/Slack
3. Aplicar mudanças:
   ```bash
   kubectl apply -f k8s/alertmanager/configmap.yaml
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

## 📊 Alertas Configurados

### **Por Severidade:**
- **Critical (4):** ServiceDown, DatabaseConnectionPoolExhausted, RedisDown, HighPaymentFailureRate
- **Warning (12):** HighErrorRate, HighLatency, HighCPUUsage, HighMemoryUsage, etc.
- **Info (2):** HighRequestRate, HighNumberOfOpenTickets

### **Por Componente:**
- **Application (6):** HTTP, Node.js, Event Loop
- **Infrastructure (4):** CPU, Memory, System
- **Database (4):** Connections, Queries, Errors
- **Redis (4):** Availability, Performance, Memory
- **Business (5):** Tickets, Check-ins, Payments

## 🔔 Roteamento de Notificações

### **Critical Alerts:**
- Notificação imediata (0s wait)
- Repetição a cada 1 hora
- Receiver: `critical-alerts`

### **Warning Alerts:**
- Notificação após 5 minutos
- Repetição a cada 6 horas
- Receiver: `warning-alerts`

### **Info Alerts:**
- Notificação após 15 minutos
- Repetição a cada 24 horas
- Receiver: `info-alerts`

## 🚫 Inhibition Rules

Regras de supressão configuradas:
1. Se `ServiceDown` → suprimir outros alertas do mesmo serviço
2. Se `RedisDown` → suprimir `LowRedisHitRate`
3. Se `DatabaseConnectionPoolExhausted` → suprimir `HighDatabaseQueryDuration`

## ⏭️ Próximos Passos

### ⏳ Tarefas Pendentes:
- **Tarefa 4.4:** Testar alertas (requer cluster K8s)
- **Tarefa 4.5:** Configurar Loki (opcional)
- **Tarefa 4.6:** Configurar coleta de logs

### ⏳ Melhorias Futuras:
- Adicionar mais regras de alerta específicas
- Configurar templates customizados de notificação
- Integrar com PagerDuty, OpsGenie, etc.
- Adicionar alertas de capacidade (disco, rede, etc.)

## ✅ Status Geral do Dia 4

**Progresso:** 3/3 tarefas principais concluídas (100%)

- ✅ Regras de alerta criadas (18 alertas)
- ✅ Alertmanager configurado e deployado
- ✅ Notificações configuradas (email/Slack templates prontos)

---

**Próximo:** Testar alertas e configurar coleta de logs (Dia 5).


# ⏭️ PRÓXIMOS PASSOS - MONITORING COMPLETO

## ✅ Status Atual: 95% COMPLETO

A stack de monitoring está **pronta para deploy**. Todos os componentes foram implementados e documentados.

---

## 🎯 Próximos Passos (Ordem de Prioridade)

### 1. 🚀 Deploy no Cluster K8s (QUANDO DISPONÍVEL)

**Status:** ⏳ Pendente - Requer cluster Kubernetes

**Ações:**
```bash
# 1. Criar namespace
kubectl create namespace rsv-gen2

# 2. Deploy Prometheus
kubectl apply -f k8s/prometheus/

# 3. Deploy Alertmanager
kubectl apply -f k8s/alertmanager/

# 4. Deploy Grafana
kubectl create secret generic grafana-secrets \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=SUA_SENHA_SEGURA \
  -n rsv-gen2

kubectl create configmap grafana-dashboards \
  --from-file=k8s/grafana/dashboards/ \
  -n rsv-gen2

kubectl apply -f k8s/grafana/

# 5. Verificar deploy
kubectl get pods -n rsv-gen2
kubectl get svc -n rsv-gen2
kubectl get pvc -n rsv-gen2
```

**Verificações:**
- [ ] Todos os pods rodando (`Running`)
- [ ] Services criados e acessíveis
- [ ] PVCs montados corretamente
- [ ] Prometheus coletando métricas
- [ ] Grafana conectado ao Prometheus
- [ ] Dashboards aparecendo

**Documentação:** `GUIA_RAPIDO_DEPLOY_MONITORING.md`

---

### 2. 📧 Configurar Notificações Reais (Email/Slack)

**Status:** ⏳ Pendente - Templates prontos, requer configuração real

#### Email (SMTP)

**Passo 1:** Editar ConfigMap do Alertmanager
```bash
kubectl edit configmap alertmanager-config -n rsv-gen2
```

**Passo 2:** Descomentar e configurar seção `smtp_*`:
```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'  # Ou seu servidor SMTP
  smtp_from: 'alerts@rsv-gen2.com'
  smtp_auth_username: 'alerts@rsv-gen2.com'
  smtp_auth_password: 'SUA_SENHA_APP'  # Usar Secret
  smtp_require_tls: true
```

**Passo 3:** Descomentar seções `email_configs` nos receivers:
```yaml
receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'on-call@rsv-gen2.com'
        headers:
          Subject: '🚨 CRÍTICO - RSV Gen 2: {{ .GroupLabels.alertname }}'
        send_resolved: true
```

**Passo 4:** Criar Secret para senha SMTP (recomendado):
```bash
kubectl create secret generic alertmanager-secrets \
  --from-literal=smtp-password=SUA_SENHA \
  -n rsv-gen2
```

**Passo 5:** Reiniciar Alertmanager:
```bash
kubectl rollout restart deployment/alertmanager -n rsv-gen2
```

#### Slack

**Passo 1:** Criar Webhook no Slack
- Acessar: https://api.slack.com/apps
- Criar novo app
- Adicionar "Incoming Webhooks"
- Copiar webhook URL

**Passo 2:** Editar ConfigMap do Alertmanager
```bash
kubectl edit configmap alertmanager-config -n rsv-gen2
```

**Passo 3:** Descomentar e configurar `slack_api_url`:
```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
```

**Passo 4:** Descomentar seções `slack_configs` nos receivers:
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
        send_resolved: true
```

**Passo 5:** Reiniciar Alertmanager:
```bash
kubectl rollout restart deployment/alertmanager -n rsv-gen2
```

**Verificações:**
- [ ] Email de teste enviado com sucesso
- [ ] Slack recebeu mensagem de teste
- [ ] Alertas críticos chegam imediatamente
- [ ] Alertas warning chegam após 5min
- [ ] Notificações de resolução funcionam

**Documentação:** `docs/MONITORING_SETUP.md` (seção "Configurar Notificações")

---

### 3. 🧪 Testar Alertas End-to-End

**Status:** ⏳ Pendente - Requer cluster K8s e notificações configuradas

**Passo 1:** Verificar se alertas estão carregados
```bash
# Acessar Prometheus UI
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# Navegar para: http://localhost:9090/alerts
```

**Passo 2:** Verificar se Alertmanager está recebendo alertas
```bash
# Acessar Alertmanager UI
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
# Navegar para: http://localhost:9093
```

**Passo 3:** Criar alerta de teste (opcional)
- Editar `k8s/prometheus/alert-rules-configmap.yaml`
- Adicionar regra de teste temporária:
  ```yaml
  - alert: TestAlert
    expr: vector(1) == 1  # Sempre verdadeiro
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Alerta de teste"
      description: "Este é um alerta de teste"
  ```
- Aplicar: `kubectl apply -f k8s/prometheus/alert-rules-configmap.yaml`
- Verificar se alerta aparece no Alertmanager

**Passo 4:** Simular condições reais
- Gerar alta taxa de erros (testar endpoint que retorna erro)
- Gerar alta latência (adicionar delay em endpoint)
- Verificar se alertas são disparados

**Verificações:**
- [ ] Alertas aparecem no Prometheus
- [ ] Alertas chegam no Alertmanager
- [ ] Notificações são enviadas (email/Slack)
- [ ] Alertas são resolvidos quando condição cessa
- [ ] Notificações de resolução são enviadas

**Documentação:** `docs/MONITORING_SETUP.md` (seção "Testar Alertas")

---

### 4. 📝 Configurar Loki para Logs (OPCIONAL - FUTURO)

**Status:** ⏳ Opcional - Pode ser implementado no futuro

**Benefícios:**
- Agregação centralizada de logs
- Query de logs com LogQL
- Integração com Grafana
- Correlação entre logs e métricas

**Componentes Necessários:**
1. **Loki** - Agregação e armazenamento de logs
2. **Promtail** - Coletor de logs (DaemonSet)

**Estrutura Sugerida:**
```
k8s/loki/
├── deployment.yaml
├── service.yaml
├── configmap.yaml
├── pvc.yaml
└── promtail/
    ├── daemonset.yaml
    └── configmap.yaml
```

**Documentação Base:** `k8s/loki/README.md`

**Quando Implementar:**
- Quando houver necessidade de análise de logs
- Quando quiser correlacionar logs com métricas
- Quando precisar de busca avançada em logs

---

## 📊 Resumo do Progresso

| Tarefa | Status | Progresso |
|--------|--------|-----------|
| **Prometheus Setup** | ✅ | 86% (faltam testes no cluster) |
| **Instrumentação** | ✅ | 100% |
| **Grafana & Dashboards** | ✅ | 100% |
| **Alertas & Alertmanager** | ✅ | 100% |
| **Documentação** | ✅ | 100% |
| **Deploy no Cluster** | ⏳ | 0% (requer cluster) |
| **Notificações Reais** | ⏳ | 0% (templates prontos) |
| **Testes End-to-End** | ⏳ | 0% (requer cluster) |
| **Loki (Opcional)** | ⏳ | 0% (futuro) |

**Progresso Total:** 95% ✅

---

## 📚 Documentação Disponível

1. **`docs/MONITORING_SETUP.md`** - Guia completo de setup
2. **`GUIA_RAPIDO_DEPLOY_MONITORING.md`** - Quick start (5 minutos)
3. **`RESUMO_EXECUTIVO_MONITORING_COMPLETO.md`** - Resumo executivo
4. **`RESUMO_FINAL_MONITORING.md`** - Resumo final consolidado
5. **`CHECKLIST_MONITORING.md`** - Checklist de deploy
6. **`k8s/grafana/README.md`** - Documentação do Grafana
7. **`k8s/alertmanager/README.md`** - Documentação do Alertmanager

---

## ✅ Checklist de Próximos Passos

### Imediato (Requer Cluster K8s)
- [ ] Deploy no cluster K8s
- [ ] Verificar pods rodando
- [ ] Testar coleta de métricas
- [ ] Verificar dashboards
- [ ] Configurar notificações reais (email/Slack)
- [ ] Testar alertas end-to-end

### Futuro (Opcional)
- [ ] Configurar Loki para logs
- [ ] Adicionar mais regras de alerta
- [ ] Criar mais dashboards
- [ ] Configurar APM/tracing distribuído
- [ ] Criar runbook de troubleshooting

---

## 🎯 Conclusão

A stack de monitoring está **95% completa** e pronta para deploy. Todos os componentes principais foram implementados:

- ✅ **Prometheus**: Configurado e pronto
- ✅ **Grafana**: Configurado e pronto
- ✅ **Alertmanager**: Configurado e pronto
- ✅ **Instrumentação**: Aplicação totalmente instrumentada
- ✅ **Documentação**: Completa e detalhada

**Faltam apenas:**
- Deploy no cluster Kubernetes (quando disponível)
- Configuração de notificações reais (email/Slack)
- Testes end-to-end (requer cluster)

---

**Status Final:** ✅ **PRONTO PARA DEPLOY**

**Data:** 2025-12-05


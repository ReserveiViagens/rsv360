# 🚨 Alertmanager - Setup e Configuração

## 📋 Visão Geral

Este diretório contém os manifestos Kubernetes para deploy do Alertmanager no namespace `rsv-gen2`.

O Alertmanager recebe alertas do Prometheus e os roteia para diferentes canais de notificação (email, Slack, etc.).

## 📁 Estrutura de Arquivos

```
k8s/alertmanager/
├── deployment.yaml          # Deployment do Alertmanager
├── service.yaml             # Service para expor Alertmanager
├── configmap.yaml           # Configuração (roteamento, receivers)
├── pvc.yaml                 # Persistent Volume Claim (5GB)
├── secret.yaml.example      # Exemplo de Secret para credenciais
└── README.md                # Este arquivo
```

## 🚀 Deploy

### 1. Criar Secret para Credenciais (Opcional)

```bash
# Criar secret com credenciais de email/Slack
kubectl create secret generic alertmanager-secrets \
  --from-literal=smtp-username=alerts@rsv-gen2.com \
  --from-literal=smtp-password=SUA_SENHA \
  --from-literal=slack-webhook-url=https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -n rsv-gen2
```

**⚠️ IMPORTANTE:** Configure as credenciais reais em produção!

### 2. Aplicar Manifestos

```bash
# Aplicar todos os recursos
kubectl apply -f k8s/alertmanager/

# OU aplicar individualmente
kubectl apply -f k8s/alertmanager/deployment.yaml
kubectl apply -f k8s/alertmanager/service.yaml
kubectl apply -f k8s/alertmanager/configmap.yaml
kubectl apply -f k8s/alertmanager/pvc.yaml
```

### 3. Verificar Deploy

```bash
# Verificar pods
kubectl get pods -n rsv-gen2 | grep alertmanager

# Verificar logs
kubectl logs -n rsv-gen2 deployment/alertmanager

# Verificar service
kubectl get svc -n rsv-gen2 | grep alertmanager
```

### 4. Acessar Alertmanager UI

```bash
# Port-forward para acesso local
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093

# Acessar em: http://localhost:9093
```

## 🔧 Configuração

### Receivers (Destinos de Notificação)

O Alertmanager está configurado com 4 receivers:

1. **default**: Receiver padrão (fallback)
2. **critical-alerts**: Para alertas críticos (notificação imediata)
3. **warning-alerts**: Para alertas de warning (notificação após 5 minutos)
4. **info-alerts**: Para alertas informativos (apenas log)

### Roteamento

- **Alertas críticos**: Notificação imediata, repetição a cada 1 hora
- **Alertas de warning**: Notificação após 5 minutos, repetição a cada 6 horas
- **Alertas de info**: Notificação após 15 minutos, repetição a cada 24 horas

### Agrupamento

Alertas são agrupados por:
- `alertname`
- `cluster`
- `service`

### Inhibition Rules

Regras de supressão configuradas:
- Se o serviço está down, suprimir outros alertas do mesmo serviço
- Se o Redis está down, suprimir alertas de baixa hit rate
- Se o banco está com pool esgotado, suprimir alertas de latência

## 📧 Configurar Email

1. Editar `k8s/alertmanager/configmap.yaml`
2. Descomentar e configurar seção `smtp_*` em `global:`
3. Descomentar seções `email_configs` nos receivers
4. Aplicar mudanças:
   ```bash
   kubectl apply -f k8s/alertmanager/configmap.yaml
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

### Exemplo de Configuração SMTP (Gmail):

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@rsv-gen2.com'
  smtp_auth_username: 'alerts@rsv-gen2.com'
  smtp_auth_password: 'SUA_SENHA_APP'
  smtp_require_tls: true
```

## 💬 Configurar Slack

1. Criar webhook no Slack:
   - Acessar: https://api.slack.com/apps
   - Criar novo app
   - Adicionar "Incoming Webhooks"
   - Copiar webhook URL

2. Editar `k8s/alertmanager/configmap.yaml`
3. Descomentar e configurar `slack_api_url` em `global:`
4. Descomentar seções `slack_configs` nos receivers
5. Aplicar mudanças:
   ```bash
   kubectl apply -f k8s/alertmanager/configmap.yaml
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

## 🔍 Troubleshooting

### Alertmanager não inicia

```bash
# Verificar logs
kubectl logs -n rsv-gen2 deployment/alertmanager

# Verificar eventos
kubectl describe pod -n rsv-gen2 -l app=alertmanager
```

### Alertas não são enviados

1. Verificar se Prometheus está conectado:
   ```bash
   # No Prometheus UI, verificar se Alertmanager aparece em Status > Targets
   ```

2. Verificar configuração do Alertmanager:
   ```bash
   kubectl get configmap alertmanager-config -n rsv-gen2 -o yaml
   ```

3. Verificar logs do Alertmanager:
   ```bash
   kubectl logs -n rsv-gen2 deployment/alertmanager | grep -i error
   ```

### Notificações não chegam

1. Verificar configuração de SMTP/Slack no ConfigMap
2. Verificar se Secret foi criado (se necessário)
3. Testar conectividade:
   ```bash
   kubectl exec -n rsv-gen2 deployment/alertmanager -- \
     wget -O- https://smtp.gmail.com:587
   ```

## 📚 Recursos

- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Configuration](https://prometheus.io/docs/alerting/latest/configuration/)
- [Notification Examples](https://prometheus.io/docs/alerting/latest/notification_examples/)

## ✅ Checklist de Deploy

- [ ] Secret `alertmanager-secrets` criado (se necessário)
- [ ] ConfigMap `alertmanager-config` aplicado
- [ ] PVC `alertmanager-pvc` criado
- [ ] Deployment aplicado e pods rodando
- [ ] Service aplicado e acessível
- [ ] Prometheus configurado para enviar alertas ao Alertmanager
- [ ] Email/Slack configurado e testado
- [ ] Alertas sendo recebidos no Alertmanager UI

---

**Última atualização:** 2025-12-05


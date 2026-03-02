# 📧 Guia Completo: Configurar Notificações no Alertmanager

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configurar Email (SMTP)](#configurar-email-smtp)
3. [Configurar Slack](#configurar-slack)
4. [Configurar Ambos](#configurar-ambos)
5. [Usando Secrets](#usando-secrets)
6. [Testar Notificações](#testar-notificações)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Alertmanager suporta vários canais de notificação:
- ✅ **Email (SMTP)** - Mais comum, fácil de configurar
- ✅ **Slack** - Popular para equipes de desenvolvimento
- ⏳ **PagerDuty** - Para on-call (futuro)
- ⏳ **OpsGenie** - Para on-call (futuro)
- ⏳ **Webhook** - Para integrações customizadas (futuro)

---

## 📧 Configurar Email (SMTP)

### Passo 1: Obter Credenciais SMTP

#### Gmail
1. Acesse: https://myaccount.google.com/apppasswords
2. Gere uma "App Password"
3. Use essa senha (não sua senha normal)

#### Outros Provedores
- **SendGrid**: Use API Key
- **Mailgun**: Use API Key
- **AWS SES**: Use Access Key

### Passo 2: Editar ConfigMap

```bash
kubectl edit configmap alertmanager-config -n rsv-gen2
```

### Passo 3: Adicionar Configuração SMTP

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'  # Seu servidor SMTP
  smtp_from: 'alerts@rsv-gen2.com'      # Email remetente
  smtp_auth_username: 'alerts@rsv-gen2.com'  # Usuário SMTP
  smtp_auth_password: 'SUA_SENHA_APP'    # Senha (use Secret em produção!)
  smtp_require_tls: true

receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'on-call@rsv-gen2.com'
        headers:
          Subject: '🚨 CRÍTICO - RSV Gen 2: {{ .GroupLabels.alertname }}'
        html: |
          <h2>🚨 Alerta Crítico</h2>
          <p><strong>Alerta:</strong> {{ .GroupLabels.alertname }}</p>
          <p><strong>Severidade:</strong> {{ .CommonLabels.severity }}</p>
          <p><strong>Descrição:</strong> {{ .CommonAnnotations.description }}</p>
        send_resolved: true

  - name: 'warning-alerts'
    email_configs:
      - to: 'team@rsv-gen2.com'
        headers:
          Subject: '⚠️ WARNING - RSV Gen 2: {{ .GroupLabels.alertname }}'
        send_resolved: true
```

### Passo 4: Reiniciar Alertmanager

```bash
kubectl rollout restart deployment/alertmanager -n rsv-gen2
```

### Passo 5: Verificar Logs

```bash
kubectl logs -n rsv-gen2 -l app=alertmanager --tail=50
```

---

## 💬 Configurar Slack

### Passo 1: Criar Webhook no Slack

1. Acesse: https://api.slack.com/apps
2. Clique em "Create New App" > "From scratch"
3. Dê um nome (ex: "RSV Gen 2 Alerts")
4. Escolha o workspace
5. Vá em "Incoming Webhooks"
6. Ative "Activate Incoming Webhooks"
7. Clique em "Add New Webhook to Workspace"
8. Escolha o canal (ex: #alerts)
9. Copie a URL do webhook

### Passo 2: Editar ConfigMap

```bash
kubectl edit configmap alertmanager-config -n rsv-gen2
```

### Passo 3: Adicionar Configuração Slack

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

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
        fields:
          - title: 'Alerta'
            value: '{{ .GroupLabels.alertname }}'
            short: false
          - title: 'Severidade'
            value: '{{ .CommonLabels.severity }}'
            short: true

  - name: 'warning-alerts'
    slack_configs:
      - channel: '#alerts-warning'
        title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
        text: |
          *Descrição:* {{ .CommonAnnotations.description }}
        color: 'warning'
        send_resolved: true
```

### Passo 4: Reiniciar Alertmanager

```bash
kubectl rollout restart deployment/alertmanager -n rsv-gen2
```

---

## 🔄 Configurar Ambos (Email + Slack)

Você pode configurar ambos os canais para receber notificações em email E Slack:

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@rsv-gen2.com'
  smtp_auth_username: 'alerts@rsv-gen2.com'
  smtp_auth_password: 'SUA_SENHA_APP'
  smtp_require_tls: true
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'on-call@rsv-gen2.com'
        headers:
          Subject: '🚨 CRÍTICO - RSV Gen 2: {{ .GroupLabels.alertname }}'
        send_resolved: true
    slack_configs:
      - channel: '#alerts-critical'
        title: '🚨 CRÍTICO: {{ .GroupLabels.alertname }}'
        color: 'danger'
        send_resolved: true
```

---

## 🔐 Usando Secrets (Recomendado)

Para maior segurança, use Secrets para armazenar senhas:

### Passo 1: Criar Secret

```bash
kubectl create secret generic alertmanager-secrets \
  --from-literal=smtp-password=SUA_SENHA_APP \
  --from-literal=slack-webhook-url=https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -n rsv-gen2
```

### Passo 2: Atualizar Deployment

Edite `k8s/alertmanager/deployment.yaml` e adicione:

```yaml
env:
  - name: SMTP_PASSWORD
    valueFrom:
      secretKeyRef:
        name: alertmanager-secrets
        key: smtp-password
  - name: SLACK_WEBHOOK_URL
    valueFrom:
      secretKeyRef:
        name: alertmanager-secrets
        key: slack-webhook-url
```

### Passo 3: Usar Variáveis no ConfigMap

```yaml
global:
  smtp_auth_password: '${SMTP_PASSWORD}'
  slack_api_url: '${SLACK_WEBHOOK_URL}'
```

**Nota:** Alertmanager não suporta variáveis de ambiente diretamente. Você precisará usar um init container ou template engine como Helm.

---

## 🧪 Testar Notificações

### Método 1: Criar Alerta de Teste

1. Edite o ConfigMap de regras de alerta:
   ```bash
   kubectl edit configmap prometheus-alert-rules -n rsv-gen2
   ```

2. Adicione uma regra de teste:
   ```yaml
   - alert: TestNotification
     expr: vector(1) == 1  # Sempre verdadeiro
     for: 1m
     labels:
       severity: warning
     annotations:
       summary: "Teste de notificação"
       description: "Este é um alerta de teste"
   ```

3. Aguarde 1-2 minutos
4. Verifique se recebeu email/Slack

### Método 2: Usar Alertmanager UI

1. Acesse Alertmanager UI:
   ```bash
   kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
   ```

2. Vá em: http://localhost:9093
3. Clique em "New Silence"
4. Crie um silence temporário para testar

### Método 3: Enviar Alerta Manualmente

```bash
# Via curl
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning"
    },
    "annotations": {
      "summary": "Teste de notificação",
      "description": "Este é um alerta de teste"
    }
  }]'
```

---

## 🔧 Troubleshooting

### Email não é enviado

**Verificar:**
1. Logs do Alertmanager:
   ```bash
   kubectl logs -n rsv-gen2 -l app=alertmanager | grep -i smtp
   ```

2. Conectividade SMTP:
   ```bash
   kubectl exec -n rsv-gen2 deployment/alertmanager -- \
     nc -zv smtp.gmail.com 587
   ```

3. Credenciais corretas
4. Firewall não bloqueando porta 587

**Soluções:**
- Verificar se `smtp_require_tls: true` está configurado
- Para Gmail, usar App Password (não senha normal)
- Verificar se porta está correta (587 para TLS, 465 para SSL)

### Slack não recebe notificações

**Verificar:**
1. Logs do Alertmanager:
   ```bash
   kubectl logs -n rsv-gen2 -l app=alertmanager | grep -i slack
   ```

2. Webhook URL está correto
3. Canal existe no Slack

**Soluções:**
- Testar webhook manualmente:
  ```bash
  curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
    -H "Content-Type: application/json" \
    -d '{"text":"Teste"}'
  ```
- Verificar se o app tem permissão para postar no canal
- Verificar se o canal existe e o bot foi adicionado

### Notificações duplicadas

**Causa:** Múltiplos receivers configurados ou roteamento incorreto

**Solução:** Verificar configuração de `route` no ConfigMap

---

## 📚 Recursos Adicionais

- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Email Configuration](https://prometheus.io/docs/alerting/latest/configuration/#email_config)
- [Slack Configuration](https://prometheus.io/docs/alerting/latest/configuration/#slack_config)

---

**Última atualização:** 2025-12-05


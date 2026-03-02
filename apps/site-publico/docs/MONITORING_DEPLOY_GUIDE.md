# 🚀 Guia Completo de Deploy - Módulo Monitoring

Este guia fornece instruções passo a passo para fazer o deploy completo do módulo Monitoring no cluster Kubernetes.

## 📋 Pré-requisitos

Antes de começar, certifique-se de que:

- ✅ Cluster Kubernetes está configurado e rodando
- ✅ `kubectl` está instalado e configurado
- ✅ Você tem permissões para criar recursos no namespace `rsv-gen2`
- ✅ StorageClass está configurado (para PVCs)

## 🔍 Passo 1: Validar Pré-requisitos

Execute o script de validação:

**Windows:**
```powershell
.\scripts\pre-deploy-validation.ps1
```

**Linux/Mac:**
```bash
./scripts/pre-deploy-validation.sh
```

Este script verifica:
- ✅ kubectl instalado e configurado
- ✅ Conexão com cluster
- ✅ Arquivos Kubernetes presentes
- ✅ Sintaxe YAML válida
- ✅ Dashboards do Grafana
- ✅ Regras de alerta
- ✅ Endpoint de métricas
- ✅ StorageClass disponível

## 🚀 Passo 2: Deploy do Stack de Monitoring

Execute o script de deploy completo:

**Windows:**
```powershell
.\scripts\deploy-monitoring-stack.ps1
```

**Linux/Mac:**
```bash
./scripts/deploy-monitoring-stack.sh
```

Este script faz o deploy de:
1. **Namespace** `rsv-gen2`
2. **Prometheus** (ConfigMap, PVC, Deployment, Service)
3. **Alertmanager** (ConfigMap, PVC, Deployment, Service)
4. **Grafana** (Secret, ConfigMap, PVC, Deployment, Service)

### 2.1 - Deploy Prometheus

O script aplica automaticamente:
- `k8s/prometheus/alert-rules-configmap.yaml`
- `k8s/prometheus/configmap.yaml`
- `k8s/prometheus/pvc.yaml`
- `k8s/prometheus/deployment.yaml`
- `k8s/prometheus/service.yaml`

**Verificar:**
```bash
kubectl get pods -n rsv-gen2 -l app=prometheus
kubectl get svc -n rsv-gen2 prometheus
```

### 2.2 - Deploy Alertmanager

O script aplica automaticamente:
- `k8s/alertmanager/configmap.yaml`
- `k8s/alertmanager/pvc.yaml`
- `k8s/alertmanager/deployment.yaml`
- `k8s/alertmanager/service.yaml`

**Verificar:**
```bash
kubectl get pods -n rsv-gen2 -l app=alertmanager
kubectl get svc -n rsv-gen2 alertmanager
```

### 2.3 - Deploy Grafana

O script cria automaticamente:
- Secret `grafana-secrets` (usuário: admin, senha: admin123)
- ConfigMap `grafana-dashboards` (com todos os dashboards)
- Aplica `k8s/grafana/configmap.yaml`
- Aplica `k8s/grafana/pvc.yaml`
- Aplica `k8s/grafana/deployment.yaml`
- Aplica `k8s/grafana/service.yaml`

**⚠️ IMPORTANTE:** A senha padrão é `admin123`. **MUDE EM PRODUÇÃO!**

**Verificar:**
```bash
kubectl get pods -n rsv-gen2 -l app=grafana
kubectl get svc -n rsv-gen2 grafana
```

## ✅ Passo 3: Verificar Deploy Completo

Execute o script de verificação:

**Linux/Mac:**
```bash
./scripts/post-deploy-verification.sh
```

Este script verifica:
- ✅ Todos os pods estão rodando
- ✅ Serviços estão expostos
- ✅ Prometheus está coletando métricas
- ✅ Grafana está acessível
- ✅ Alertmanager está configurado

**Verificação Manual:**
```bash
# Verificar pods
kubectl get pods -n rsv-gen2

# Verificar serviços
kubectl get svc -n rsv-gen2

# Verificar logs do Prometheus
kubectl logs -n rsv-gen2 -l app=prometheus --tail=50

# Verificar logs do Grafana
kubectl logs -n rsv-gen2 -l app=grafana --tail=50

# Verificar logs do Alertmanager
kubectl logs -n rsv-gen2 -l app=alertmanager --tail=50
```

## 📧 Passo 4: Configurar Notificações

### 4.1 - Configurar Email/SMTP

**Opção 1: Editar ConfigMap diretamente**

```bash
kubectl edit configmap alertmanager-config -n rsv-gen2
```

**Opção 2: Usar script de configuração**

**Linux/Mac:**
```bash
./scripts/configure-notifications.sh email
```

Siga as instruções para configurar:
- SMTP host
- SMTP port
- Usuário
- Senha
- Destinatários

**Exemplo de configuração:**
```yaml
receivers:
  - name: email-notifications
    email_configs:
      - to: 'admin@example.com'
        from: 'alerts@example.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-password'
        headers:
          Subject: 'RSV Gen2 Alert: {{ .GroupLabels.alertname }}'
```

### 4.2 - Configurar Slack

**Opção 1: Criar webhook do Slack**

1. Acesse: https://api.slack.com/apps
2. Crie um novo app
3. Ative "Incoming Webhooks"
4. Crie um webhook para seu canal
5. Copie a URL do webhook

**Opção 2: Usar script de configuração**

**Linux/Mac:**
```bash
./scripts/configure-notifications.sh slack
```

**Exemplo de configuração:**
```yaml
receivers:
  - name: slack-notifications
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        title: 'RSV Gen2 Alert'
        text: '{{ .GroupLabels.alertname }}: {{ .CommonAnnotations.summary }}'
```

**Aplicar configuração:**
```bash
kubectl apply -f k8s/alertmanager/configmap.yaml
kubectl rollout restart deployment/alertmanager -n rsv-gen2
```

### 4.3 - Testar Notificações

**Simular alerta:**
```bash
# Criar um alerta de teste
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# Acesse http://localhost:9090
# Vá em Alerts > New Alert
# Crie um alerta de teste
```

**Verificar recebimento:**
- Verifique seu email
- Verifique o canal do Slack
- Verifique logs do Alertmanager:
  ```bash
  kubectl logs -n rsv-gen2 -l app=alertmanager --tail=100
  ```

## 🧪 Passo 5: Testar Alertas End-to-End

Execute o script de teste:

**Linux/Mac:**
```bash
./scripts/test-alerts-end-to-end.sh
```

Este script:
1. Cria um alerta de teste
2. Verifica se o Prometheus detecta
3. Verifica se o Alertmanager recebe
4. Verifica se a notificação é enviada

**Teste Manual:**
```bash
# 1. Port-forward do Prometheus
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090

# 2. Acesse http://localhost:9090
# 3. Vá em Alerts
# 4. Verifique se os alertas estão aparecendo

# 5. Port-forward do Alertmanager
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093

# 6. Acesse http://localhost:9093
# 7. Verifique se os alertas estão sendo processados
```

## ✅ Passo 6: Validar Regras de Alerta

Execute o script de validação:

**Linux/Mac:**
```bash
./scripts/validate-alert-rules.sh
```

Este script:
- ✅ Valida sintaxe das regras de alerta
- ✅ Verifica se as regras estão carregadas no Prometheus
- ✅ Testa cada regra individualmente

**Validação Manual:**
```bash
# Verificar regras no Prometheus
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# Acesse http://localhost:9090/rules
# Verifique se todas as regras estão ativas
```

## 🌐 Passo 7: Acessar Interfaces

### Prometheus

```bash
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
```

Acesse: http://localhost:9090

### Grafana

```bash
kubectl port-forward -n rsv-gen2 svc/grafana 3000:3000
```

Acesse: http://localhost:3000
- Usuário: `admin`
- Senha: `admin123` (mude após primeiro login)

### Alertmanager

```bash
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
```

Acesse: http://localhost:9093

## 🔧 Configuração de Ingress (Opcional)

Para acesso externo, configure Ingress:

```bash
kubectl apply -f k8s/ingress.yaml
```

Ajuste os hosts no arquivo `k8s/ingress.yaml` conforme necessário.

## 🐛 Troubleshooting

### Pods não iniciam

```bash
# Verificar eventos
kubectl describe pod <pod-name> -n rsv-gen2

# Verificar logs
kubectl logs <pod-name> -n rsv-gen2

# Verificar PVCs
kubectl get pvc -n rsv-gen2
```

### Prometheus não coleta métricas

```bash
# Verificar targets
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# Acesse http://localhost:9090/targets

# Verificar configuração
kubectl get configmap prometheus-config -n rsv-gen2 -o yaml
```

### Grafana não carrega dashboards

```bash
# Verificar ConfigMap de dashboards
kubectl get configmap grafana-dashboards -n rsv-gen2

# Recriar ConfigMap
kubectl create configmap grafana-dashboards \
  --from-file=k8s/grafana/dashboards/ \
  -n rsv-gen2 --dry-run=client -o yaml | kubectl apply -f -

# Reiniciar Grafana
kubectl rollout restart deployment/grafana -n rsv-gen2
```

### Alertmanager não envia notificações

```bash
# Verificar configuração
kubectl get configmap alertmanager-config -n rsv-gen2 -o yaml

# Verificar logs
kubectl logs -n rsv-gen2 -l app=alertmanager --tail=100

# Testar configuração
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
# Acesse http://localhost:9093/#/status
```

## 📚 Recursos Adicionais

- [Documentação Prometheus](https://prometheus.io/docs/)
- [Documentação Grafana](https://grafana.com/docs/)
- [Documentação Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## ✅ Checklist Final

- [ ] Cluster Kubernetes configurado
- [ ] Pré-requisitos validados
- [ ] Prometheus deployado e rodando
- [ ] Alertmanager deployado e rodando
- [ ] Grafana deployado e rodando
- [ ] Notificações configuradas (Email/Slack)
- [ ] Alertas testados end-to-end
- [ ] Regras de alerta validadas
- [ ] Dashboards carregados no Grafana
- [ ] Métricas sendo coletadas
- [ ] Acesso configurado (port-forward ou ingress)

## 🎯 Próximos Passos

Após o deploy completo:

1. **Configurar alertas customizados** conforme necessário
2. **Ajustar retenção de dados** no Prometheus
3. **Configurar backup** dos dados do Grafana
4. **Monitorar recursos** (CPU, memória, disco)
5. **Configurar escalonamento** se necessário


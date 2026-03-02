# ⚡ Quick Start - Deploy Monitoring

## 🚀 Deploy em 3 Comandos

```bash
# 1. Validar
./scripts/pre-deploy-validation.sh

# 2. Deploy
./scripts/deploy-monitoring-stack.sh

# 3. Verificar
./scripts/post-deploy-verification.sh
```

---

## 📋 Checklist Rápido

### Antes do Deploy
- [ ] Cluster Kubernetes disponível
- [ ] `kubectl` configurado e conectado
- [ ] Validação passou: `./scripts/pre-deploy-validation.sh`

### Deploy
- [ ] Executar: `./scripts/deploy-monitoring-stack.sh`
- [ ] Aguardar pods ficarem prontos (2-5 minutos)

### Após Deploy
- [ ] Verificar: `./scripts/post-deploy-verification.sh`
- [ ] Configurar notificações (ver abaixo)
- [ ] Testar acesso às interfaces

---

## 🔧 Configurar Notificações (2 minutos)

### Email (Gmail)

```bash
# 1. Editar ConfigMap
kubectl edit configmap alertmanager-config -n rsv-gen2

# 2. Descomentar e configurar:
# global:
#   smtp_smarthost: 'smtp.gmail.com:587'
#   smtp_from: 'seu-email@gmail.com'
#   smtp_auth_username: 'seu-email@gmail.com'
#   smtp_auth_password: 'SUA_APP_PASSWORD'  # Gerar em: https://myaccount.google.com/apppasswords
#   smtp_require_tls: true

# 3. Descomentar email_configs nos receivers

# 4. Reiniciar
kubectl rollout restart deployment/alertmanager -n rsv-gen2
```

### Slack

```bash
# 1. Criar webhook: https://api.slack.com/apps

# 2. Editar ConfigMap
kubectl edit configmap alertmanager-config -n rsv-gen2

# 3. Descomentar e configurar:
# global:
#   slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

# 4. Descomentar slack_configs nos receivers

# 5. Reiniciar
kubectl rollout restart deployment/alertmanager -n rsv-gen2
```

**Ver exemplos completos:** `k8s/alertmanager/notifications-examples.yaml`

---

## 🌐 Acessar Interfaces

```bash
# Prometheus
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090
# http://localhost:9090

# Grafana
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000
# http://localhost:3001
# Login: admin / (senha do Secret)

# Alertmanager
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093
# http://localhost:9093
```

---

## ✅ Verificações Rápidas

```bash
# Status geral
kubectl get all -n rsv-gen2

# Logs
kubectl logs -n rsv-gen2 -l app=prometheus --tail=20
kubectl logs -n rsv-gen2 -l app=grafana --tail=20
kubectl logs -n rsv-gen2 -l app=alertmanager --tail=20

# Verificar targets no Prometheus
# Acessar: http://localhost:9090/targets
# Todos devem estar "UP"
```

---

## 🆘 Problemas?

**Ver:** `docs/RUNBOOK_TROUBLESHOOTING.md`

**Comandos úteis:**
```bash
# Ver eventos
kubectl get events -n rsv-gen2 --sort-by='.lastTimestamp'

# Descrever pod
kubectl describe pod <pod-name> -n rsv-gen2

# Ver logs
kubectl logs <pod-name> -n rsv-gen2
```

---

**Guia completo:** `docs/GUIA_DEPLOY_COMPLETO.md`


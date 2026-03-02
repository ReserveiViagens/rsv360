# 🚀 Guia Completo de Deploy - Monitoring RSV Gen 2

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Validação Pré-Deploy](#validação-pré-deploy)
3. [Deploy Passo a Passo](#deploy-passo-a-passo)
4. [Configurar Notificações](#configurar-notificações)
5. [Verificação Pós-Deploy](#verificação-pós-deploy)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Pré-requisitos

### 1. Cluster Kubernetes

Você precisa de um cluster Kubernetes funcionando. Opções:

- **Minikube** (local)
- **Kind** (local)
- **Docker Desktop** (com Kubernetes habilitado)
- **Cloud Provider** (GKE, EKS, AKS, etc.)

### 2. Ferramentas Necessárias

```bash
# Verificar kubectl
kubectl version --client

# Verificar conexão com cluster
kubectl cluster-info

# Verificar permissões
kubectl auth can-i create deployments
```

### 3. Recursos do Cluster

**Mínimo recomendado:**
- CPU: 4 cores
- Memória: 8GB RAM
- Storage: 100GB (para PVCs)

**Recursos por componente:**
- Prometheus: 2 CPU, 4GB RAM, 50GB storage
- Grafana: 1 CPU, 2GB RAM, 10GB storage
- Alertmanager: 500m CPU, 512MB RAM, 5GB storage

---

## 🔍 Validação Pré-Deploy

Antes de fazer o deploy, valide tudo:

```bash
# Executar validação
./scripts/pre-deploy-validation.sh
```

Este script verifica:
- ✅ kubectl disponível e conectado
- ✅ Arquivos Kubernetes presentes
- ✅ Sintaxe YAML válida
- ✅ Dashboards do Grafana
- ✅ Regras de alerta
- ✅ Endpoint de métricas
- ✅ StorageClass disponível

**Se houver erros, corrija antes de continuar.**

---

## 🚀 Deploy Passo a Passo

### Opção 1: Deploy Automatizado (Recomendado)

```bash
# Bash/Linux/Mac
./scripts/deploy-monitoring-stack.sh

# PowerShell/Windows
.\scripts\deploy-monitoring-stack.ps1
```

### Opção 2: Deploy Manual

#### Passo 1: Criar Namespace

```bash
kubectl create namespace rsv-gen2
```

#### Passo 2: Deploy Prometheus

```bash
# Aplicar ConfigMap de regras de alerta
kubectl apply -f k8s/prometheus/alert-rules-configmap.yaml

# Aplicar ConfigMap principal
kubectl apply -f k8s/prometheus/configmap.yaml

# Criar PVC
kubectl apply -f k8s/prometheus/pvc.yaml

# Deploy
kubectl apply -f k8s/prometheus/deployment.yaml

# Service
kubectl apply -f k8s/prometheus/service.yaml

# Verificar
kubectl get pods -n rsv-gen2 -l app=prometheus
```

#### Passo 3: Deploy Alertmanager

```bash
# ConfigMap
kubectl apply -f k8s/alertmanager/configmap.yaml

# PVC
kubectl apply -f k8s/alertmanager/pvc.yaml

# Deploy
kubectl apply -f k8s/alertmanager/deployment.yaml

# Service
kubectl apply -f k8s/alertmanager/service.yaml

# Verificar
kubectl get pods -n rsv-gen2 -l app=alertmanager
```

#### Passo 4: Deploy Grafana

```bash
# Criar Secret (IMPORTANTE: Mude a senha!)
kubectl create secret generic grafana-secrets \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=SUA_SENHA_SEGURA \
  -n rsv-gen2

# Criar ConfigMap de dashboards
kubectl create configmap grafana-dashboards \
  --from-file=k8s/grafana/dashboards/ \
  -n rsv-gen2

# ConfigMap principal
kubectl apply -f k8s/grafana/configmap.yaml

# PVC
kubectl apply -f k8s/grafana/pvc.yaml

# Deploy
kubectl apply -f k8s/grafana/deployment.yaml

# Service
kubectl apply -f k8s/grafana/service.yaml

# Verificar
kubectl get pods -n rsv-gen2 -l app=grafana
```

#### Passo 5: Aguardar Pods Ficarem Prontos

```bash
# Verificar status
kubectl get pods -n rsv-gen2

# Aguardar todos ficarem Ready
kubectl wait --for=condition=Ready pod -l app=prometheus -n rsv-gen2 --timeout=300s
kubectl wait --for=condition=Ready pod -l app=alertmanager -n rsv-gen2 --timeout=300s
kubectl wait --for=condition=Ready pod -l app=grafana -n rsv-gen2 --timeout=300s
```

---

## 📧 Configurar Notificações

### Passo 1: Escolher Tipo de Notificação

Você tem 3 opções:
1. **Email (SMTP)** - Mais comum
2. **Slack** - Popular para equipes
3. **Ambos** - Email + Slack

### Passo 2: Usar Script Interativo

```bash
./scripts/configure-notifications.sh
```

### Passo 3: Ou Configurar Manualmente

#### Para Email:

1. Editar ConfigMap:
   ```bash
   kubectl edit configmap alertmanager-config -n rsv-gen2
   ```

2. Descomentar e configurar seção `smtp_*`:
   ```yaml
   global:
     smtp_smarthost: 'smtp.gmail.com:587'
     smtp_from: 'alerts@rsv-gen2.com'
     smtp_auth_username: 'alerts@rsv-gen2.com'
     smtp_auth_password: 'SUA_SENHA_APP'
     smtp_require_tls: true
   ```

3. Descomentar `email_configs` nos receivers

4. Reiniciar Alertmanager:
   ```bash
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

#### Para Slack:

1. Criar webhook no Slack (https://api.slack.com/apps)

2. Editar ConfigMap:
   ```bash
   kubectl edit configmap alertmanager-config -n rsv-gen2
   ```

3. Descomentar e configurar:
   ```yaml
   global:
     slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
   ```

4. Descomentar `slack_configs` nos receivers

5. Reiniciar Alertmanager:
   ```bash
   kubectl rollout restart deployment/alertmanager -n rsv-gen2
   ```

**Ver exemplos completos em:** `k8s/alertmanager/notifications-examples.yaml`

**Guia detalhado:** `docs/CONFIGURAR_NOTIFICACOES.md`

---

## ✅ Verificação Pós-Deploy

### 1. Verificar Status dos Pods

```bash
kubectl get pods -n rsv-gen2
```

Todos devem estar `Running` e `Ready`.

### 2. Verificar Services

```bash
kubectl get svc -n rsv-gen2
```

### 3. Verificar PVCs

```bash
kubectl get pvc -n rsv-gen2
```

Todos devem estar `Bound`.

### 4. Acessar Prometheus

```bash
# Port-forward
kubectl port-forward -n rsv-gen2 svc/prometheus 9090:9090

# Acessar
# http://localhost:9090
```

**Verificações:**
- Status > Targets: Todos devem estar "UP"
- Alerts: Regras de alerta devem aparecer
- Graph: Testar queries PromQL

### 5. Acessar Grafana

```bash
# Port-forward
kubectl port-forward -n rsv-gen2 svc/grafana 3001:3000

# Acessar
# http://localhost:3001
# Login: admin / SUA_SENHA_SEGURA
```

**Verificações:**
- Configuration > Data Sources: Prometheus deve estar configurado
- Dashboards: 4 dashboards devem aparecer
- Explore: Testar queries PromQL

### 6. Acessar Alertmanager

```bash
# Port-forward
kubectl port-forward -n rsv-gen2 svc/alertmanager 9093:9093

# Acessar
# http://localhost:9093
```

**Verificações:**
- Alerts: Alertas devem aparecer (se houver)
- Status: Configuração deve estar correta
- Silences: Deve estar funcionando

### 7. Testar Coleta de Métricas

```bash
# Verificar se aplicação está expondo métricas
kubectl exec -n rsv-gen2 deployment/rsv-gen2-app -- \
  wget -O- http://localhost:3000/api/metrics

# Verificar no Prometheus
# http://localhost:9090/targets
# Target "rsv-gen2-app" deve estar "UP"
```

### 8. Testar Alertas

```bash
# Executar script de teste
./scripts/test-alerts-end-to-end.sh
```

---

## 🔧 Troubleshooting

### Pod não inicia

```bash
# Verificar eventos
kubectl describe pod <pod-name> -n rsv-gen2

# Verificar logs
kubectl logs <pod-name> -n rsv-gen2

# Verificar recursos
kubectl top pod <pod-name> -n rsv-gen2
```

### PVC não está Bound

```bash
# Verificar StorageClass
kubectl get storageclass

# Verificar PVC
kubectl describe pvc <pvc-name> -n rsv-gen2

# Verificar se há storage disponível
kubectl get nodes
```

### Prometheus não coleta métricas

```bash
# Verificar targets
# http://localhost:9090/targets

# Verificar logs
kubectl logs -n rsv-gen2 -l app=prometheus

# Verificar se endpoint está acessível
kubectl exec -n rsv-gen2 deployment/rsv-gen2-app -- \
  wget -O- http://localhost:3000/api/metrics
```

### Grafana não conecta ao Prometheus

```bash
# Verificar data source
# Configuration > Data Sources > Prometheus > Test

# Verificar se Prometheus está acessível
kubectl exec -n rsv-gen2 deployment/grafana -- \
  wget -O- http://prometheus.rsv-gen2.svc.cluster.local:9090/-/healthy
```

### Alertas não são enviados

```bash
# Verificar logs do Alertmanager
kubectl logs -n rsv-gen2 -l app=alertmanager | grep -i error

# Verificar configuração
kubectl get configmap alertmanager-config -n rsv-gen2 -o yaml

# Verificar se Prometheus está conectado
# http://localhost:9090/status
# Verificar seção "Alertmanagers"
```

**Mais troubleshooting:** `docs/RUNBOOK_TROUBLESHOOTING.md`

---

## 📚 Próximos Passos

### 1. Adicionar Mais Regras de Alerta

```bash
# Editar ConfigMap
kubectl edit configmap prometheus-alert-rules -n rsv-gen2

# Adicionar regras de: scripts/add-more-alert-rules.yaml
```

### 2. Configurar Ingress (Opcional)

Para acesso externo sem port-forward:

```bash
# Criar Ingress para Prometheus
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prometheus-ingress
  namespace: rsv-gen2
spec:
  rules:
  - host: prometheus.rsv-gen2.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: prometheus
            port:
              number: 9090
EOF
```

### 3. Configurar TLS (Opcional)

Use cert-manager ou similar para TLS automático.

---

## ✅ Checklist Final

- [ ] Cluster Kubernetes disponível
- [ ] kubectl configurado e conectado
- [ ] Validação pré-deploy passou
- [ ] Deploy executado com sucesso
- [ ] Todos os pods rodando
- [ ] Prometheus acessível e coletando métricas
- [ ] Grafana acessível e conectado ao Prometheus
- [ ] Alertmanager acessível e conectado ao Prometheus
- [ ] Notificações configuradas (email/Slack)
- [ ] Alertas sendo gerados e enviados
- [ ] Dashboards mostrando dados

---

**Última atualização:** 2025-12-05


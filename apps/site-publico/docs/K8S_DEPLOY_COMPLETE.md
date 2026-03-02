# 🚀 Guia Completo de Deploy no Kubernetes

Este documento descreve como fazer o deploy completo do RSV Gen 2 no Kubernetes.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Preparação](#preparação)
- [Deploy](#deploy)
- [Verificação](#verificação)
- [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

### 1. Cluster Kubernetes

Você precisa de um cluster Kubernetes funcionando. Opções:

**Local:**
- **Minikube**: `minikube start`
- **Kind**: `kind create cluster`
- **K3s**: `curl -sfL https://get.k3s.io | sh -`
- **Docker Desktop**: Habilitar Kubernetes nas configurações

**Cloud:**
- **GKE** (Google Kubernetes Engine)
- **EKS** (Amazon Elastic Kubernetes Service)
- **AKS** (Azure Kubernetes Service)

### 2. Ferramentas Necessárias

- **kubectl**: Cliente Kubernetes
  ```bash
  # Windows
  winget install Kubernetes.kubectl
  
  # Linux
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  
  # Mac
  brew install kubectl
  ```

- **Docker**: Para construir imagens (opcional, se usar registry externo)

### 3. Verificar Cluster

```bash
# PowerShell
.\scripts\verify-k8s-cluster.ps1

# Bash
bash scripts/verify-k8s-cluster.sh
```

## 📦 Preparação

### 1. Criar Secrets

Os secrets contêm informações sensíveis (senhas, tokens, etc.).

**Opção 1: Criar manualmente**

```bash
kubectl create namespace rsv-gen2

kubectl create secret generic rsv-gen2-secrets -n rsv-gen2 \
  --from-literal=DATABASE_URL="postgresql://user:password@postgres-service:5432/rsv_gen2" \
  --from-literal=REDIS_URL="redis://redis-service:6379" \
  --from-literal=JWT_SECRET="seu-jwt-secret-aqui" \
  --from-literal=POSTGRES_USER="postgres" \
  --from-literal=POSTGRES_PASSWORD="sua-senha-aqui"
```

**Opção 2: Usar arquivo**

1. Copie `k8s/secret.yaml.example` para `k8s/secret.yaml`
2. Edite e preencha os valores
3. Aplique: `kubectl apply -f k8s/secret.yaml`

### 2. Construir Imagem Docker (Opcional)

Se você não usar um registry externo, precisa construir a imagem localmente:

```bash
# Construir imagem
docker build -t rsv-gen2:latest .

# Para Minikube, carregar imagem
minikube image load rsv-gen2:latest

# Para Kind, carregar imagem
kind load docker-image rsv-gen2:latest
```

**Recomendado:** Use um registry (Docker Hub, GCR, ECR, ACR) e atualize `k8s/deployment.yaml` com a URL da imagem.

## 🚀 Deploy

### Deploy Automático

**PowerShell:**
```powershell
.\scripts\deploy-k8s.ps1
```

**Bash:**
```bash
bash scripts/deploy-k8s.sh
```

O script irá:
1. ✅ Criar namespace
2. ✅ Verificar/criar secrets
3. ✅ Aplicar ConfigMap
4. ✅ Deploy PostgreSQL
5. ✅ Deploy Redis
6. ✅ Aguardar PostgreSQL e Redis estarem prontos
7. ✅ Deploy aplicação
8. ✅ Deploy services
9. ✅ Deploy HPA (Horizontal Pod Autoscaler)
10. ✅ Deploy Ingress (opcional)
11. ✅ Deploy Monitoring Stack (opcional)

### Deploy Manual

Se preferir fazer manualmente:

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Secrets (criar antes)
kubectl create secret generic rsv-gen2-secrets -n rsv-gen2 ...

# 3. ConfigMap
kubectl apply -f k8s/configmap.yaml

# 4. PostgreSQL
kubectl apply -f k8s/postgres.yaml

# 5. Redis
kubectl apply -f k8s/redis.yaml

# 6. Aguardar PostgreSQL e Redis
kubectl wait --for=condition=ready pod -l app=postgres -n rsv-gen2 --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n rsv-gen2 --timeout=300s

# 7. Aplicação
kubectl apply -f k8s/deployment.yaml

# 8. Services
kubectl apply -f k8s/service.yaml

# 9. HPA
kubectl apply -f k8s/hpa.yaml

# 10. Ingress (opcional)
kubectl apply -f k8s/ingress.yaml

# 11. Monitoring (opcional)
kubectl apply -f k8s/prometheus/
kubectl apply -f k8s/grafana/
kubectl apply -f k8s/alertmanager/
```

## ✅ Verificação

### Verificar Status

```bash
# Ver todos os recursos
kubectl get all -n rsv-gen2

# Ver pods
kubectl get pods -n rsv-gen2

# Ver services
kubectl get services -n rsv-gen2

# Ver deployments
kubectl get deployments -n rsv-gen2
```

### Verificar Logs

```bash
# Logs da aplicação
kubectl logs -f deployment/rsv-gen2-app -n rsv-gen2

# Logs do WebSocket
kubectl logs -f deployment/rsv-gen2-websocket -n rsv-gen2

# Logs do PostgreSQL
kubectl logs -f deployment/postgres -n rsv-gen2
```

### Testar Aplicação

**Port-forward:**
```bash
# Aplicação
kubectl port-forward service/rsv-gen2-app-service 3000:80 -n rsv-gen2

# WebSocket
kubectl port-forward service/rsv-gen2-websocket-service 3001:80 -n rsv-gen2

# Prometheus
kubectl port-forward service/prometheus-service 9090:9090 -n rsv-gen2

# Grafana
kubectl port-forward service/grafana-service 3000:3000 -n rsv-gen2
```

**Acessar:**
- Aplicação: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (usuário: admin, senha: admin)

## 🔍 Troubleshooting

### Pods não iniciam

```bash
# Verificar eventos
kubectl describe pod <pod-name> -n rsv-gen2

# Verificar logs
kubectl logs <pod-name> -n rsv-gen2

# Verificar recursos
kubectl top pods -n rsv-gen2
```

### Erro de conexão com banco

1. Verificar se PostgreSQL está rodando:
   ```bash
   kubectl get pods -l app=postgres -n rsv-gen2
   ```

2. Verificar DATABASE_URL no secret:
   ```bash
   kubectl get secret rsv-gen2-secrets -n rsv-gen2 -o yaml
   ```

3. Testar conexão:
   ```bash
   kubectl exec -it deployment/postgres -n rsv-gen2 -- psql -U postgres -d rsv_gen2
   ```

### Erro de imagem não encontrada

1. Verificar se a imagem existe:
   ```bash
   docker images | grep rsv-gen2
   ```

2. Para Minikube, carregar imagem:
   ```bash
   minikube image load rsv-gen2:latest
   ```

3. Para Kind, carregar imagem:
   ```bash
   kind load docker-image rsv-gen2:latest
   ```

### Ingress não funciona

1. Verificar se ingress controller está instalado:
   ```bash
   kubectl get ingressclass
   ```

2. Instalar NGINX Ingress Controller:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   ```

### HPA não escala

1. Verificar métricas:
   ```bash
   kubectl get hpa -n rsv-gen2
   kubectl describe hpa rsv-gen2-app-hpa -n rsv-gen2
   ```

2. Verificar se metrics-server está instalado:
   ```bash
   kubectl get deployment metrics-server -n kube-system
   ```

3. Instalar metrics-server (se necessário):
   ```bash
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   ```

## 📊 Monitoramento

### Acessar Prometheus

```bash
kubectl port-forward service/prometheus-service 9090:9090 -n rsv-gen2
```

Acesse: http://localhost:9090

### Acessar Grafana

```bash
kubectl port-forward service/grafana-service 3000:3000 -n rsv-gen2
```

Acesse: http://localhost:3000
- Usuário: `admin`
- Senha: `admin` (alterar no primeiro login)

### Configurar Alertmanager

1. Editar `k8s/alertmanager/configmap.yaml` com suas configurações
2. Aplicar: `kubectl apply -f k8s/alertmanager/configmap.yaml`
3. Reiniciar: `kubectl rollout restart deployment/alertmanager -n rsv-gen2`

## 🔄 Atualização

### Atualizar Aplicação

```bash
# Atualizar imagem
docker build -t rsv-gen2:v1.1.0 .
minikube image load rsv-gen2:v1.1.0

# Atualizar deployment
kubectl set image deployment/rsv-gen2-app app=rsv-gen2:v1.1.0 -n rsv-gen2

# Verificar rollout
kubectl rollout status deployment/rsv-gen2-app -n rsv-gen2
```

### Rollback

```bash
# Ver histórico
kubectl rollout history deployment/rsv-gen2-app -n rsv-gen2

# Rollback para versão anterior
kubectl rollout undo deployment/rsv-gen2-app -n rsv-gen2
```

## 🗑️ Remover Deploy

```bash
# Remover tudo
kubectl delete namespace rsv-gen2

# Ou remover recursos específicos
kubectl delete -f k8s/
```

## 📝 Próximos Passos

1. ✅ Configurar CI/CD para deploy automático
2. ✅ Configurar backup automático do banco de dados
3. ✅ Configurar monitoramento avançado
4. ✅ Configurar SSL/TLS com cert-manager
5. ✅ Configurar autoscaling baseado em métricas customizadas


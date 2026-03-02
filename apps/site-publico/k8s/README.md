# ✅ Kubernetes Deployment - RSV Gen 2

**Versão:** 2.0.0  
**Data:** 22/11/2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Deploy](#deploy)
4. [Manifests](#manifests)
5. [Monitoramento](#monitoramento)

---

## 🎯 Visão Geral

Configurações completas do Kubernetes para deploy do RSV Gen 2 em produção, incluindo:

- ✅ Deployments (App + WebSocket)
- ✅ Services (ClusterIP)
- ✅ Ingress (NGINX)
- ✅ HPA (Horizontal Pod Autoscaler)
- ✅ Health Checks
- ✅ PostgreSQL e Redis

---

## 📦 Pré-requisitos

- Kubernetes cluster (1.20+)
- kubectl configurado
- NGINX Ingress Controller
- cert-manager (para SSL)
- StorageClass configurado

---

## 🚀 Deploy

### 1. Criar Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Criar Secrets

```bash
# Copiar template
cp k8s/secret.yaml.example k8s/secret.yaml

# Editar com valores reais
nano k8s/secret.yaml

# Aplicar
kubectl apply -f k8s/secret.yaml
```

### 3. Criar ConfigMap

```bash
kubectl apply -f k8s/configmap.yaml
```

### 4. Deploy PostgreSQL e Redis

```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
```

### 5. Build e Push das Imagens

```bash
# Build app
docker build -f Dockerfile.production -t rsv-gen2:latest .

# Build websocket
docker build -f Dockerfile.websocket -t rsv-gen2-websocket:latest .

# Push para registry
docker tag rsv-gen2:latest registry.example.com/rsv-gen2:latest
docker tag rsv-gen2-websocket:latest registry.example.com/rsv-gen2-websocket:latest
docker push registry.example.com/rsv-gen2:latest
docker push registry.example.com/rsv-gen2-websocket:latest
```

### 6. Deploy Aplicação

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

### 7. Verificar Status

```bash
kubectl get pods -n rsv-gen2
kubectl get services -n rsv-gen2
kubectl get ingress -n rsv-gen2
kubectl get hpa -n rsv-gen2
```

---

## 📁 Manifests

### namespace.yaml
Namespace para isolar recursos do RSV Gen 2.

### configmap.yaml
Variáveis de ambiente não-sensíveis.

### secret.yaml
Secrets (DATABASE_URL, JWT_SECRET, etc.). **NUNCA commitar!**

### deployment.yaml
- **rsv-gen2-app:** Aplicação Next.js (3 réplicas)
- **rsv-gen2-websocket:** Servidor WebSocket (2 réplicas)

### service.yaml
Services ClusterIP para app e websocket.

### ingress.yaml
NGINX Ingress com SSL/TLS e suporte a WebSocket.

### hpa.yaml
Horizontal Pod Autoscaler baseado em CPU/Memory.

### postgres.yaml
Deployment do PostgreSQL (opcional, usar serviço gerenciado em produção).

### redis.yaml
Deployment do Redis (opcional, usar serviço gerenciado em produção).

---

## 🔍 Monitoramento

### Health Checks

- **Liveness Probe:** `/api/health` (30s delay, 10s interval)
- **Readiness Probe:** `/api/health` (10s delay, 5s interval)
- **Startup Probe:** `/api/health` (0s delay, 10s interval, 30 failures)

### Logs

```bash
# App logs
kubectl logs -f deployment/rsv-gen2-app -n rsv-gen2

# WebSocket logs
kubectl logs -f deployment/rsv-gen2-websocket -n rsv-gen2
```

### Métricas

```bash
# Ver uso de recursos
kubectl top pods -n rsv-gen2

# Ver HPA status
kubectl describe hpa rsv-gen2-app-hpa -n rsv-gen2
```

---

## 🔧 Configurações

### Recursos

**App:**
- Requests: 512Mi memory, 250m CPU
- Limits: 1Gi memory, 500m CPU

**WebSocket:**
- Requests: 256Mi memory, 100m CPU
- Limits: 512Mi memory, 250m CPU

### Auto-scaling

**App:**
- Min: 3 pods
- Max: 10 pods
- CPU: 70%
- Memory: 80%

**WebSocket:**
- Min: 2 pods
- Max: 5 pods
- CPU: 70%
- Memory: 80%

---

## 🚨 Troubleshooting

### Pods não iniciam

```bash
kubectl describe pod <pod-name> -n rsv-gen2
kubectl logs <pod-name> -n rsv-gen2
```

### Health checks falhando

```bash
kubectl exec -it <pod-name> -n rsv-gen2 -- curl http://localhost:3000/api/health
```

### Secrets não encontrados

```bash
kubectl get secrets -n rsv-gen2
kubectl describe secret rsv-gen2-secrets -n rsv-gen2
```

---

## 📝 Notas

- **PostgreSQL/Redis:** Em produção, use serviços gerenciados (RDS, Cloud SQL, ElastiCache, etc.)
- **Secrets:** Use ferramentas como Sealed Secrets ou External Secrets Operator
- **Monitoring:** Configure Prometheus + Grafana
- **Backup:** Configure backups automáticos do PostgreSQL

---

**Última atualização:** 22/11/2025


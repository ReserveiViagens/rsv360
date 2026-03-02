# 🚀 Guia de Setup do Cluster Kubernetes

Este guia fornece instruções completas para configurar um cluster Kubernetes para o sistema RSV Gen 2.

## 📋 Opções de Cluster

### Para Desenvolvimento Local

1. **Minikube** (Recomendado para Windows/Linux/Mac)
   - Fácil de instalar e usar
   - Requer Docker ou Hyper-V (Windows)
   - Ideal para desenvolvimento e testes

2. **Kind** (Kubernetes in Docker)
   - Leve e rápido
   - Usa containers Docker
   - Ideal para CI/CD

3. **Docker Desktop** (Windows/Mac)
   - Kubernetes integrado
   - Fácil de habilitar
   - Requer Docker Desktop instalado

### Para Produção

1. **K3s** (Kubernetes leve)
   - Leve e fácil de instalar
   - Ideal para edge computing
   - Bom para ambientes pequenos/médios

2. **Kubeadm** (Kubernetes completo)
   - Kubernetes completo
   - Requer múltiplos nós
   - Ideal para produção enterprise

## 🛠️ Setup Rápido

### Windows (PowerShell)

```powershell
# Opção 1: Minikube
.\scripts\setup-k8s-cluster.ps1 -ClusterType minikube

# Opção 2: Docker Desktop (requer Docker Desktop instalado)
.\scripts\setup-k8s-cluster.ps1 -ClusterType docker-desktop

# Opção 3: Kind
.\scripts\setup-k8s-cluster.ps1 -ClusterType kind
```

### Linux/Mac (Bash)

```bash
# Opção 1: Minikube
./scripts/setup-k8s-cluster.sh minikube

# Opção 2: Kind
./scripts/setup-k8s-cluster.sh kind

# Opção 3: K3s
./scripts/setup-k8s-cluster.sh k3s
```

## 📝 Instalação Manual

### Minikube (Windows)

1. **Instalar Chocolatey** (se não tiver):
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
   iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Instalar Minikube**:
   ```powershell
   choco install minikube -y
   ```

3. **Iniciar Minikube**:
   ```powershell
   minikube start --driver=hyperv --memory=4096 --cpus=2
   ```

4. **Habilitar addons**:
   ```powershell
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```

### Minikube (Linux)

1. **Instalar Minikube**:
   ```bash
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube
   ```

2. **Iniciar Minikube**:
   ```bash
   minikube start --driver=docker --memory=4096 --cpus=2
   ```

3. **Habilitar addons**:
   ```bash
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```

### Docker Desktop (Windows/Mac)

1. **Instalar Docker Desktop**:
   - Baixe de: https://www.docker.com/products/docker-desktop

2. **Habilitar Kubernetes**:
   - Abra Docker Desktop
   - Vá em Settings > Kubernetes
   - Marque "Enable Kubernetes"
   - Clique em "Apply & Restart"

3. **Verificar**:
   ```powershell
   kubectl get nodes
   ```

### Kind (Windows/Linux/Mac)

1. **Instalar Kind**:
   ```bash
   # Windows (Chocolatey)
   choco install kind -y
   
   # Linux/Mac
   curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
   chmod +x ./kind
   sudo mv ./kind /usr/local/bin/kind
   ```

2. **Criar cluster**:
   ```bash
   kind create cluster --name rsv-gen2-cluster
   ```

### K3s (Linux)

1. **Instalar K3s**:
   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```

2. **Configurar kubectl**:
   ```bash
   mkdir -p ~/.kube
   sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
   sudo chown $USER:$USER ~/.kube/config
   ```

3. **Verificar**:
   ```bash
   kubectl get nodes
   ```

## ✅ Verificação

Após configurar o cluster, verifique se está funcionando:

```bash
# Verificar conexão
kubectl cluster-info

# Verificar nós
kubectl get nodes

# Verificar namespaces
kubectl get namespaces
```

## 🔧 Configuração do Namespace

Criar o namespace `rsv-gen2`:

```bash
kubectl create namespace rsv-gen2
```

Ou aplicar o arquivo:

```bash
kubectl apply -f k8s/namespace.yaml
```

## 📦 Próximos Passos

Após configurar o cluster:

1. **Validar pré-requisitos**:
   ```bash
   # Linux/Mac
   ./scripts/pre-deploy-validation.sh
   
   # Windows
   .\scripts\pre-deploy-validation.ps1
   ```

2. **Deploy do stack de monitoring**:
   ```bash
   # Linux/Mac
   ./scripts/deploy-monitoring-stack.sh
   
   # Windows
   .\scripts\deploy-monitoring-stack.ps1
   ```

## 🐛 Troubleshooting

### Minikube não inicia

**Windows (Hyper-V)**:
```powershell
# Verificar se Hyper-V está habilitado
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All

# Habilitar Hyper-V (requer reinicialização)
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
```

**Linux/Mac**:
```bash
# Verificar Docker
docker ps

# Se Docker não estiver rodando, inicie:
sudo systemctl start docker  # Linux
# ou abra Docker Desktop no Mac
```

### kubectl não encontra o cluster

```bash
# Verificar contexto atual
kubectl config current-context

# Listar contextos disponíveis
kubectl config get-contexts

# Mudar contexto
kubectl config use-context <context-name>
```

### Erro de permissões

```bash
# Verificar permissões
kubectl auth can-i create deployments

# Se necessário, configurar RBAC ou usar usuário com permissões adequadas
```

## 📚 Recursos Adicionais

- [Documentação do Kubernetes](https://kubernetes.io/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Kind Documentation](https://kind.sigs.k8s.io/docs/)
- [K3s Documentation](https://k3s.io/)

## 🎯 Recomendações

### Para Desenvolvimento
- Use **Minikube** ou **Docker Desktop** para simplicidade
- Configure pelo menos 4GB de RAM e 2 CPUs

### Para Produção
- Use **Kubeadm** para clusters completos
- Use **K3s** para ambientes menores
- Configure múltiplos nós para alta disponibilidade
- Configure storage class adequado para PVCs


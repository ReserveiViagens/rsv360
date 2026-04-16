# RSV360 Continuous Deployment

Este documento descreve os workflows de Continuous Deployment (CD) para Staging e Production.

## 📋 Visão Geral

O CD é dividido em dois ambientes independentes:

### 🧪 **Staging Environment**
- **Trigger**: Push automático para branch `develop`
- **Deploy**: Imediato após CI passar
- **URL**: `https://staging.yourdomain.com`
- **Strategy**: Rolling update

### 🏭 **Production Environment**
- **Trigger**: Tags de versão (`v*`) ou manual
- **Deploy**: Com aprovação manual obrigatória
- **URL**: `https://yourdomain.com`
- **Strategy**: Blue-green deployment

## 🚀 Fluxo de Deployment

### Staging Flow
```
Push to develop
       │
       ▼
┌─────────────┐    ┌─────────────────┐
│   CI Pass   │───▶│  CD Staging     │
│             │    │                 │
│ • Quality   │    │ • Build images  │
│ • Tests     │    │ • Push to GHCR  │
│ • E2E       │    │ • SSH deploy    │
└─────────────┘    │ • Health check  │
                   └─────────────────┘
```

### Production Flow
```
Version Tag (v*)
       │
       ▼
┌─────────────┐    ┌─────────────────┐
│  Approval   │───▶│ CD Production   │
│  Required   │    │                 │
└─────────────┘    │ • DB backup     │
                   │ • Blue-green    │
                   │ • Health check  │
                   │ • Rollback      │
                   └─────────────────┘
```

## 🏗️ Estratégias de Deployment

### Staging: Rolling Update
- Deploy direto sobre versão atual
- Zero-downtime com health checks
- Rollback automático em caso de falha
- Ideal para testes contínuos

### Production: Blue-Green
- Deploy nova versão paralelamente
- Traffic switching após health checks
- Rollback instantâneo se necessário
- Backup de database obrigatório

## 🐳 Container Registry

### GitHub Container Registry (GHCR)
- **Registry**: `ghcr.io`
- **Images**:
  - `ghcr.io/owner/repo/backend:staging`
  - `ghcr.io/owner/repo/frontend:staging`
  - `ghcr.io/owner/repo/backend:latest`
  - `ghcr.io/owner/repo/frontend:latest`

### Tagging Strategy
```bash
# Staging tags
:staging          # Latest staging
:abc1234          # Commit SHA
:abc1234-staging  # Commit + environment

# Production tags
:latest           # Latest production
:v1.2.3           # Version tag
:1.2.3            # Clean version
```

## 🔐 Segurança e Controle

### Environment Protection
- **Staging**: Deploy automático (baixo risco)
- **Production**: Aprovação manual obrigatória

### Secrets Management
- SSH keys criptografadas
- Acesso restrito por ambiente
- No logs de credenciais

### Rollback Automation
- **Staging**: Rollback em health check failure
- **Production**: Rollback imediato + backup restore

## 📊 Health Checks

### Staging Health Checks
```bash
# Nginx health
curl https://staging.yourdomain.com/health

# Application health
curl http://staging-server:8080/health
```

### Production Health Checks
```bash
# Nginx health
curl https://yourdomain.com/health

# Application health
curl http://production-server/health

# Database connectivity
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

## 🔄 Rollback Procedures

### Automatic Rollback (Production)
1. **Detection**: Health check failure
2. **Action**: Scale down new instances
3. **Restore**: Scale up old instances
4. **Verify**: Health checks pass
5. **Notify**: Slack alert sent

### Manual Rollback
```bash
# SSH to server
ssh user@production-server

# Navigate to project
cd /path/to/app

# Restore from backup
cp backups/docker-compose.prod.yml.timestamp docker-compose.prod.yml

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## 📱 Notificações

### Slack Integration
- ✅ Deploy success/failure
- ✅ Rollback notifications
- ✅ Production approval requests
- ✅ Health check failures

### GitHub Integration
- ✅ Deployment status
- ✅ Environment URLs
- ✅ Commit links
- ✅ Deployment history

## 🛠️ Troubleshooting

### Common Issues

#### SSH Connection Failed
```bash
# Test SSH connection
ssh -i ~/.ssh/github_key user@server

# Check SSH key permissions
chmod 600 ~/.ssh/github_key
```

#### Health Check Failed
```bash
# Check service logs
docker-compose -f docker-compose.staging.yml logs backend

# Test health endpoint
curl http://localhost:3002/health
```

#### Image Pull Failed
```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin

# Pull manually
docker pull ghcr.io/owner/repo/backend:staging
```

#### Database Backup Failed
```bash
# Check backup script
cat scripts/backup-db.sh

# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

## 📈 Monitoramento

### Deployment Metrics
- Tempo de deployment
- Taxa de sucesso/falha
- Frequência de rollback
- Tempo de health checks

### Application Metrics
- Tempo de resposta
- Taxa de erro
- Uso de recursos
- Atividade do usuário

## 🔧 Manutenção

### Regular Tasks
- ✅ Limpeza de imagens antigas
- ✅ Rotação de backups
- ✅ Atualização de secrets
- ✅ Revisão de approvals

### Emergency Procedures
- ✅ Stop deployment
- ✅ Force rollback
- ✅ Database restore
- ✅ Communication plan

## 📚 Referências

- [CI/CD Pipeline](./CI-CD-README.md)
- [Secrets Setup](./secrets-setup.md)
- [Environments Setup](./environments-setup.md)
- [Deployment Scripts](../scripts/README.md)
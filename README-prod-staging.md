# RSV360 - Produção e Staging

Este documento descreve como configurar e executar os ambientes de produção e staging do RSV360.

## 📋 Pré-requisitos

- Docker Desktop ou Docker Engine
- Docker Compose V2
- Pelo menos 8GB de RAM disponível
- Pelo menos 20GB de espaço em disco
- Certificados SSL válidos (para produção)

## 🔐 Configuração Inicial

### 1. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

### 2. Gerar Certificados SSL (Desenvolvimento)
```bash
# Executar script de geração
./generate-ssl.bat
```

### 3. Configurar Certificados SSL (Produção)
```bash
# Colocar certificados em docker/nginx/ssl/
# - cert.pem (certificado completo)
# - key.pem (chave privada)
```

## 🚀 Início dos Ambientes

### Produção
```bash
# Construir e iniciar produção
docker-compose -f docker-compose.prod.yml up --build -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Staging
```bash
# Construir e iniciar staging
docker-compose -f docker-compose.staging.yml up --build -d

# Verificar status
docker-compose -f docker-compose.staging.yml ps

# Ver logs
docker-compose -f docker-compose.staging.yml logs -f
```

## 🌐 Acesso aos Ambientes

| Ambiente | URL | Porta | SSL |
|----------|-----|-------|-----|
| Produção | https://yourdomain.com | 80/443 | ✅ |
| Staging | https://yourdomain.com | 8080/8443 | ✅ |

## 🏗️ Arquitetura

### Produção
- **Nginx**: Reverse proxy com SSL/TLS
- **Backend**: 2 réplicas com load balancing
- **Frontend**: 1 instância otimizada
- **PostgreSQL**: Banco de dados persistente
- **Redis**: Cache com autenticação e limites

### Staging
- **Mesma arquitetura da produção**
- **1 réplica do backend** (para economia de recursos)
- **Portas diferentes** (8080/8443)
- **Volumes separados** (dados isolados)

## 🔧 Comandos Úteis

### Gerenciamento
```bash
# Parar produção
docker-compose -f docker-compose.prod.yml down

# Parar staging
docker-compose -f docker-compose.staging.yml down

# Limpar volumes (⚠️ perde dados!)
docker-compose -f docker-compose.prod.yml down -v

# Escalar backend (produção)
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Monitoramento
```bash
# Health checks
curl https://localhost/health
curl https://localhost:8080/health

# Status dos serviços
docker-compose -f docker-compose.prod.yml ps

# Recursos utilizados
docker stats
```

### Debug
```bash
# Logs específicos
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs nginx

# Executar comandos nos containers
docker-compose -f docker-compose.prod.yml exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD
```

## 🔒 Segurança

### Configurações Implementadas
- ✅ SSL/TLS obrigatório (HTTP → HTTPS redirect)
- ✅ Rate limiting (API: 10req/s, Frontend: 30req/s)
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ Autenticação Redis obrigatória
- ✅ Resource limits em todos os serviços
- ✅ Network isolada por ambiente

### Certificados SSL
```bash
# Verificar validade
openssl x509 -in docker/nginx/ssl/cert.pem -text -noout

# Testar conectividade SSL
openssl s_client -connect localhost:443 -servername localhost
```

## 📊 Recursos e Limites

| Serviço | CPU Limit | Memória Limit | Memória Reserva |
|---------|-----------|---------------|-----------------|
| Nginx | 0.5 | 256M | 128M |
| PostgreSQL | 1.0 | 2G | 1G |
| Redis | 0.5 | 1G | 512M |
| Backend | 1.0 | 1G | 512M |
| Frontend | 1.0 | 1G | 512M |

## 🔄 Atualização Zero-Downtime

### Estratégia de Deploy
1. **Build das novas imagens**
2. **Deploy gradual** (escalar novas réplicas)
3. **Health checks** em todas as instâncias
4. **Remover réplicas antigas**
5. **Rollback automático** se health checks falharem

### Comando de Update
```bash
# Produção com zero-downtime
docker-compose -f docker-compose.prod.yml up --build -d --scale backend=2 --no-deps backend
docker-compose -f docker-compose.prod.yml up --build -d --scale backend=0 --no-deps backend
```

## 🚨 Troubleshooting

### Problemas Comuns

**SSL Certificate Errors**
```bash
# Verificar certificados
ls -la docker/nginx/ssl/
openssl x509 -in docker/nginx/ssl/cert.pem -noout -dates
```

**Database Connection Failed**
```bash
# Verificar PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB
```

**Redis Authentication Failed**
```bash
# Testar Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD ping
```

**Backend Health Check Failed**
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs backend
# Testar endpoint
curl http://localhost:3002/health
```

## 📈 Monitoramento

### Métricas Principais
- **Response Time**: < 500ms API, < 2s Frontend
- **Error Rate**: < 1% geral
- **Resource Usage**: < 80% CPU/Memória
- **Uptime**: 99.9% SLA

### Logs e Alertas
- Nginx access/error logs
- Application logs (backend/frontend)
- Database slow queries
- Health check failures

## 🔧 Manutenção

### Backup
```bash
# Backup PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d).sql

# Backup Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $REDIS_PASSWORD --rdb backup.rdb
```

### Limpeza
```bash
# Limpar imagens não utilizadas
docker image prune -f

# Limpar volumes órfãos
docker volume prune -f

# Limpar sistema completo
docker system prune -f
```

## 📝 Notas de Produção

- **Monitoramento 24/7** é recomendado
- **Backups automáticos** devem ser configurados
- **Log aggregation** (ELK stack ou similar)
- **Load balancer** externo pode ser adicionado
- **CDN** para assets estáticos
- **Database replication** para alta disponibilidade
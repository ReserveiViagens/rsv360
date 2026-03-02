# 🚀 GUIA DE DEPLOY - RSV GEN 2

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)
- PostgreSQL 15+ (ou usar Docker)
- Redis 7+ (ou usar Docker)
- Variáveis de ambiente configuradas

---

## 🐳 Deploy com Docker

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp env.example .env
```

Edite o `.env` com suas configurações:

```env
# Database
POSTGRES_USER=rsv_user
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_DB=rsv_db
DATABASE_URL=postgresql://rsv_user:sua_senha_segura@postgres:5432/rsv_db

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
```

### 2. Build e Start

```bash
# Build das imagens
docker-compose build

# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

### 3. Executar Migrations

```bash
# Entrar no container
docker-compose exec app sh

# Executar migrations
npm run migrate
# ou
psql $DATABASE_URL -f scripts/migration-017-complete-rsv-gen2-schema.sql
```

### 4. Verificar Saúde

```bash
# Health check
curl http://localhost:3000/api/health
```

---

## 🔄 CI/CD com GitHub Actions

O pipeline está configurado em `.github/workflows/ci-cd.yml`:

### Fluxo Automático:

1. **Push para `main` ou `develop`:**
   - ✅ Executa testes
   - ✅ Executa linter
   - ✅ Gera relatório de cobertura
   - ✅ Build da imagem Docker
   - ✅ Push para GitHub Container Registry
   - ✅ Deploy automático (se em `main`)

### Executar Manualmente:

```bash
# Testes locais
npm run test

# Linter
npm run lint

# Build
npm run build

# Coverage
npm run test:coverage
```

---

## 📊 Monitoring

### Health Check Endpoint

```bash
GET /api/health
```

Resposta:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  },
  "version": "1.0.0"
}
```

### Logs

```bash
# Logs do app
docker-compose logs -f app

# Logs do PostgreSQL
docker-compose logs -f postgres

# Logs do Redis
docker-compose logs -f redis
```

---

## 🔧 Comandos Úteis

### Docker

```bash
# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild
docker-compose up -d --build

# Executar comando no container
docker-compose exec app npm run <comando>

# Ver status
docker-compose ps
```

### Database

```bash
# Backup
docker-compose exec postgres pg_dump -U rsv_user rsv_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U rsv_user rsv_db < backup.sql

# Acessar PostgreSQL
docker-compose exec postgres psql -U rsv_user rsv_db
```

### Redis

```bash
# Acessar Redis CLI
docker-compose exec redis redis-cli

# Limpar cache
docker-compose exec redis redis-cli FLUSHALL
```

---

## 🚨 Troubleshooting

### App não inicia

```bash
# Verificar logs
docker-compose logs app

# Verificar variáveis de ambiente
docker-compose exec app env | grep DATABASE_URL

# Verificar conexão com banco
docker-compose exec app npm run test:db
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar health check
docker-compose exec postgres pg_isready -U rsv_user

# Verificar logs
docker-compose logs postgres
```

### Erro de memória

```bash
# Aumentar memória do Docker
# Editar docker-compose.yml e adicionar:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

---

## 📈 Produção

### Recomendações:

1. **Variáveis de Ambiente:**
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault)
   - Nunca commite `.env` no repositório
   - Use diferentes secrets para cada ambiente

2. **Banco de Dados:**
   - Use managed database (RDS, Cloud SQL)
   - Configure backups automáticos
   - Use connection pooling

3. **Redis:**
   - Use managed Redis (ElastiCache, Cloud Memorystore)
   - Configure persistence
   - Configure eviction policies

4. **SSL/TLS:**
   - Configure HTTPS
   - Use Let's Encrypt ou certificado gerenciado
   - Force HTTPS redirects

5. **Monitoring:**
   - Configure Prometheus + Grafana
   - Configure alertas
   - Configure log aggregation (ELK, CloudWatch)

---

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Docker e Docker Compose instalados
- [ ] Migrations executadas
- [ ] Health check respondendo
- [ ] Testes passando
- [ ] Logs configurados
- [ ] Backup configurado
- [ ] SSL/TLS configurado
- [ ] Monitoring configurado
- [ ] Documentação atualizada

---

## 📞 Suporte

Para problemas ou dúvidas:
- Verifique os logs: `docker-compose logs -f`
- Verifique a documentação: `README.md`
- Abra uma issue no repositório


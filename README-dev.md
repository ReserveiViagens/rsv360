# RSV360 - Ambiente de Desenvolvimento

Este documento descreve como configurar e executar o ambiente de desenvolvimento completo do RSV360 usando Docker Compose.

## 📋 Pré-requisitos

- Docker Desktop ou Docker Engine
- Docker Compose V2
- Pelo menos 4GB de RAM disponível
- Pelo menos 10GB de espaço em disco

## 🚀 Início Rápido

### 1. Clonar o repositório
```bash
git clone <repository-url>
cd rsv360
```

### 2. Construir e iniciar todos os serviços
```bash
docker-compose up --build
```

### 3. Verificar se tudo está funcionando
```bash
# Backend health check
curl http://localhost:3002/health

# Frontend health check
curl http://localhost:3000/api/health

# PostgreSQL connection
psql -h localhost -p 5433 -U rsv360 -d rsv360_db
```

## 🏗️ Arquitetura dos Serviços

### PostgreSQL (Porta 5433)
- **Imagem**: postgres:16-alpine
- **Banco**: rsv360_db
- **Usuário**: rsv360
- **Senha**: rsv360_dev_2024
- **Extensões**: uuid-ossp, pg_trgm
- **Volume**: rsv360_pgdata (persistente)

### Redis (Porta 6379)
- **Imagem**: redis:7-alpine
- **Senha**: rsv360_dev_2024
- **Persistência**: AOF (Append Only File)
- **Volume**: rsv360_redis_data (persistente)

### Backend (Porta 3002)
- **Framework**: Express.js + TypeScript
- **Runtime**: tsx (desenvolvimento com hot-reload)
- **Health Check**: `/health`
- **Dependências**: PostgreSQL e Redis devem estar saudáveis

### Frontend (Porta 3000)
- **Framework**: Next.js 14
- **Modo**: Desenvolvimento com hot-reload
- **Health Check**: `/api/health`
- **Dependência**: Backend deve estar saudável

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Iniciar todos os serviços
docker-compose up

# Iniciar em background
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Reconstruir e reiniciar
docker-compose up --build --force-recreate

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
```

### Debug e Troubleshooting
```bash
# Verificar status dos serviços
docker-compose ps

# Executar comandos no container
docker-compose exec backend sh
docker-compose exec postgres psql -U rsv360 -d rsv360_db

# Verificar health checks
docker-compose exec backend wget --no-verbose --tries=1 --spider http://localhost:3002/health
```

### Limpeza
```bash
# Parar e remover containers, networks
docker-compose down

# Remover volumes (⚠️ perde dados!)
docker-compose down -v

# Limpar imagens não utilizadas
docker system prune -f
```

## 🔍 Health Checks

Todos os serviços incluem health checks automáticos:

- **PostgreSQL**: `pg_isready` a cada 10s
- **Redis**: `redis-cli incr ping` a cada 10s
- **Backend**: HTTP GET `/health` a cada 30s
- **Frontend**: HTTP GET `/api/health` a cada 30s

## 📊 Volumes Persistentes

- `rsv360_pgdata`: Dados do PostgreSQL
- `rsv360_redis_data`: Dados do Redis

Os volumes persistem entre reinícios dos containers.

## 🔐 Credenciais de Desenvolvimento

| Serviço | Usuário | Senha | Porta |
|---------|---------|-------|-------|
| PostgreSQL | rsv360 | rsv360_dev_2024 | 5433 |
| Redis | - | rsv360_dev_2024 | 6379 |

## 🐛 Resolução de Problemas

### Serviços não iniciam
1. Verificar se as portas 3000, 3002, 5433, 6379 estão livres
2. Verificar logs: `docker-compose logs`
3. Verificar recursos do sistema (RAM/CPU)

### Backend não conecta ao banco
1. Aguardar health check do PostgreSQL completar
2. Verificar variáveis de ambiente no docker-compose.yml
3. Verificar conexão: `docker-compose exec postgres pg_isready -U rsv360 -d rsv360_db`

### Frontend não carrega
1. Aguardar backend estar saudável
2. Verificar variáveis NEXT_PUBLIC_API_URL e NEXT_PUBLIC_BACKEND_URL
3. Verificar logs do frontend: `docker-compose logs frontend`

## 📝 Desenvolvimento Local

Para desenvolvimento local sem Docker:

1. Instalar PostgreSQL e Redis localmente
2. Configurar variáveis de ambiente
3. Executar backend: `cd backend && npx tsx watch server.ts`
4. Executar frontend: `cd apps/site-publico && npm run dev`

## 🔄 Atualização do Ambiente

Quando houver mudanças no código:

```bash
# Reconstruir apenas serviços modificados
docker-compose up --build backend frontend

# Ou reconstruir tudo
docker-compose up --build
```

## 📈 Monitoramento

- **Logs**: `docker-compose logs -f [service]`
- **Status**: `docker-compose ps`
- **Recursos**: `docker stats`
- **Health**: Verificar endpoints de health check
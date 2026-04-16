# RSV360 CI/CD Pipeline

Este documento descreve o pipeline de Integração Contínua e Entrega Contínua (CI/CD) do RSV360.

## 📋 Visão Geral

O pipeline CI/CD é executado automaticamente em:
- **Push** para branches `main` e `develop`
- **Pull Requests** para branches `main` e `develop`

## 🏗️ Jobs do Pipeline

### 1. Quality Checks
**Propósito**: Garantir qualidade do código antes de builds
- ✅ TypeScript type checking (Backend + Frontend)
- ✅ ESLint linting (Backend + Frontend)
- ✅ Prettier code formatting
- ⏱️ **Timeout**: 10 minutos

### 2. Build Backend
**Propósito**: Construir e validar imagem Docker do backend
- ✅ Build Docker image com cache GHA
- ✅ Teste de startup do container
- ✅ Health check validation
- ⏱️ **Timeout**: 15 minutos
- 📦 **Dependências**: Quality Checks

### 3. Build Frontend
**Propósito**: Construir e validar imagem Docker do frontend
- ✅ Build Next.js application
- ✅ Build Docker image com cache GHA
- ✅ Teste de startup do container
- ✅ Health check validation
- ⏱️ **Timeout**: 15 minutos
- 📦 **Dependências**: Quality Checks

### 4. Unit & Integration Tests
**Propósito**: Executar testes automatizados
- ✅ PostgreSQL e Redis services
- ✅ Backend unit/integration tests
- ✅ Frontend unit tests
- ✅ Coverage report (Codecov)
- ⏱️ **Timeout**: 20 minutos
- 📦 **Dependências**: Quality Checks

### 5. End-to-End Tests
**Propósito**: Testes completos com aplicações reais
- ✅ PostgreSQL e Redis services
- ✅ Backend container running
- ✅ Frontend container running
- ✅ Playwright E2E tests
- ✅ Test artifacts upload
- ⏱️ **Timeout**: 25 minutos
- 📦 **Dependências**: Build Backend + Build Frontend

## 🔄 Estratégia de Execução

```
Push/PR Trigger
       │
       ▼
┌─────────────┐
│ Quality     │ ← Parallel jobs start here
│ Checks      │
└──────┬──────┘
       │
    ┌──▼──┐
    │     │
┌───▼──┐ ┌▼──┐
│Build  │ │Unit│
│Backend│ │Test│
└───┬───┘ └─┬──┘
    │       │
    └─┬─────┘
      │
   ┌──▼──┐
   │Build │
   │Frontend│
   └────┬──┘
        │
     ┌──▼──┐
     │ E2E  │
     │ Tests │
     └──────┘
```

## 🐳 Docker & Cache

### BuildKit
- ✅ `DOCKER_BUILDKIT=1` habilitado
- ✅ Cache layers otimizado
- ✅ Build contexts minimizados

### GitHub Actions Cache
- ✅ NPM dependencies cache
- ✅ Docker layers cache (GHA)
- ✅ Build artifacts reutilização

## 🧪 Testes e Serviços

### Serviços de Teste
```yaml
postgres:
  image: postgres:16-alpine
  health-check: pg_isready

redis:
  image: redis:7-alpine
  health-check: redis-cli ping
```

### Variáveis de Ambiente
```bash
# Test Environment
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=test_jwt_secret
```

## 📊 Relatórios e Artefatos

### Coverage Reports
- ✅ Codecov integration
- ✅ LCOV format
- ✅ Pull request comments

### Test Artifacts
- ✅ Playwright reports
- ✅ Test screenshots/videos
- ✅ E2E test results

### Logs e Debug
- ✅ Job logs preservation
- ✅ Container logs capture
- ✅ Failure diagnostics

## 🔒 Segurança

### CodeQL Analysis
- ✅ Automated security scanning
- ✅ JavaScript/TypeScript analysis
- ✅ Weekly scheduled scans
- ✅ Security alerts integration

### Dependabot
- ✅ Automated dependency updates
- ✅ Weekly schedule (Monday 9 AM)
- ✅ NPM, Docker, GitHub Actions
- ✅ Pull request automation

## 🚨 Status e Notificações

### Status Checks
- ✅ Required for branch protection
- ✅ GitHub branch protection rules
- ✅ PR merge blocking on failures

### Notificações
- ✅ Slack/Discord integration (opcional)
- ✅ Email notifications (opcional)
- ✅ GitHub notifications

## 🛠️ Configuração Local

### Executar Pipeline Localmente
```bash
# Usar Act (GitHub Actions local)
act -j quality
act -j build-backend
act -j build-frontend
act -j test
act -j e2e
```

### Debug de Jobs
```bash
# Ver logs detalhados
act -j <job-name> --verbose

# Usar artifacts locais
act -j e2e --artifact-server-path ./artifacts
```

## 📈 Otimização de Performance

### Paralelização
- ✅ Jobs independentes executam em paralelo
- ✅ Build cache reduz tempo de build
- ✅ Service health checks evitam esperas desnecessárias

### Timeouts
- ✅ Jobs com timeouts apropriados
- ✅ Fail-fast para erros críticos
- ✅ Resource limits para evitar overuse

### Cache Strategy
```yaml
# Docker cache
cache-from: type=gha
cache-to: type=gha,mode=max

# NPM cache
cache: 'npm'
```

## 🔧 Manutenção

### Atualização de Actions
- ✅ Dependabot mantém actions atualizadas
- ✅ Version pinning para estabilidade
- ✅ Security updates automáticas

### Monitoramento
- ✅ Pipeline metrics no GitHub
- ✅ Failure rate tracking
- ✅ Performance trends

## 🚀 Próximos Passos

### CD Pipeline (Step 7)
- Deploy automático para staging
- Deploy manual para produção
- Rollback automation
- Environment-specific configs

### Advanced Features
- Multi-environment deployments
- Blue-green deployments
- Feature flags integration
- Performance monitoring
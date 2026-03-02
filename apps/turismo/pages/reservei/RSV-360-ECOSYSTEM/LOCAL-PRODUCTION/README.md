# 🏭 AMBIENTE DE PRODUÇÃO LOCAL - RSV 360° ECOSYSTEM

## 📋 Visão Geral

Este ambiente permite testar a produção localmente antes de fazer deploy no servidor real, garantindo que tudo funcione corretamente. É uma réplica completa do ambiente de produção, mas rodando localmente para testes e validação.

## 🎯 Objetivos

- ✅ **Separar produção local da produção real**
- ✅ **Verificar funcionamento antes do deploy**
- ✅ **Inicialização automatizada e completa**
- ✅ **Testes de integração local**
- ✅ **Validação de performance**

## 🏗️ Arquitetura

```
LOCAL-PRODUCTION/
├── docker-compose.local.yml          # Orquestração completa dos serviços
├── env.local                         # Variáveis de ambiente local
├── scripts/
│   ├── start-local-production.sh     # Script de inicialização (Linux/Mac)
│   ├── start-local-production.ps1    # Script de inicialização (Windows)
│   ├── health-check.sh              # Verificação de saúde
│   └── cleanup.sh                   # Limpeza do ambiente
├── config/
│   ├── local-database.yml           # Configuração DB local
│   └── local-services.yml           # Configuração serviços
└── logs/                            # Logs do ambiente local
```

## 🚀 Inicialização Rápida

### Windows (PowerShell)
```powershell
# Navegar para o diretório
cd LOCAL-PRODUCTION

# Executar script de inicialização
.\scripts\start-local-production.ps1

# Ou com parâmetros
.\scripts\start-local-production.ps1 -SkipBuild -Verbose
```

### Linux/Mac (Bash)
```bash
# Navegar para o diretório
cd LOCAL-PRODUCTION

# Tornar script executável
chmod +x scripts/start-local-production.sh

# Executar script de inicialização
./scripts/start-local-production.sh

# Ou com parâmetros
./scripts/start-local-production.sh --skip-build --verbose
```

## 🌐 Serviços Disponíveis

| Serviço | Porta | URL | Descrição |
|---------|-------|-----|-----------|
| 🌐 Ecosystem Master | 3000 | http://localhost:3000 | Servidor principal do ecossistema |
| 👥 CRM System | 3001 | http://localhost:3001 | Sistema de gestão de clientes |
| 🎯 Booking Engine | 3002 | http://localhost:3002 | Motor de reservas |
| 🏨 Hotel Management | 3003 | http://localhost:3003 | Gestão de hotéis |
| 📊 Analytics Intelligence | 3004 | http://localhost:3004 | Inteligência de dados |
| 📈 Grafana Dashboard | 3005 | http://localhost:3005 | Dashboard de monitoramento |
| 🔍 Prometheus | 9090 | http://localhost:9090 | Métricas e monitoramento |
| 🗄️ PostgreSQL | 5432 | localhost:5432 | Banco de dados principal |
| 🔴 Redis | 6379 | localhost:6379 | Cache e sessões |

## 🔐 Credenciais

### Banco de Dados
- **Host**: localhost
- **Porta**: 5432
- **Database**: rsv_ecosystem_local
- **Usuário**: rsvuser
- **Senha**: rsvpassword

### Grafana
- **URL**: http://localhost:3005
- **Usuário**: admin
- **Senha**: rsvadmin2025

## 🔧 Comandos Úteis

### Gerenciamento de Serviços
```bash
# Ver status dos containers
docker-compose -f docker-compose.local.yml ps

# Ver logs em tempo real
docker-compose -f docker-compose.local.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.local.yml logs -f ecosystem-master-local

# Reiniciar um serviço
docker-compose -f docker-compose.local.yml restart ecosystem-master-local

# Reiniciar todos os serviços
docker-compose -f docker-compose.local.yml restart
```

### Parar e Limpar
```bash
# Parar todos os serviços
docker-compose -f docker-compose.local.yml down

# Parar e remover volumes
docker-compose -f docker-compose.local.yml down -v

# Limpeza completa
./scripts/cleanup.sh
```

### Verificação de Saúde
```bash
# Verificação completa de saúde
./scripts/health-check.sh

# Verificação manual de um serviço
curl -f http://localhost:3000/health
```

## 📊 Monitoramento

### Grafana Dashboards
- **Ecosystem Overview**: Visão geral do ecossistema
- **Database Performance**: Performance do banco de dados
- **Application Metrics**: Métricas das aplicações

### Prometheus Metrics
- **Application Metrics**: Métricas customizadas das aplicações
- **System Metrics**: Métricas do sistema operacional
- **Database Metrics**: Métricas do PostgreSQL
- **Redis Metrics**: Métricas do Redis

## 🧪 Testes

### Testes de Conectividade
```bash
# Testar banco de dados
docker-compose -f docker-compose.local.yml exec -T db-local psql -U rsvuser -d rsv_ecosystem_local -c "SELECT 1;"

# Testar Redis
docker-compose -f docker-compose.local.yml exec -T redis-local redis-cli ping

# Testar API
curl -f http://localhost:3000/health
```

### Testes de Performance
```bash
# Teste de carga simples
ab -n 1000 -c 10 http://localhost:3000/

# Teste de stress
wrk -t12 -c400 -d30s http://localhost:3000/
```

## 🔍 Troubleshooting

### Problemas Comuns

#### Porta já em uso
```bash
# Verificar portas em uso
netstat -tulpn | grep :3000

# Parar processo na porta
sudo lsof -ti:3000 | xargs kill -9
```

#### Container não inicia
```bash
# Ver logs do container
docker-compose -f docker-compose.local.yml logs ecosystem-master-local

# Verificar recursos do sistema
docker stats

# Limpar e reconstruir
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d --build
```

#### Banco de dados não conecta
```bash
# Verificar se o banco está rodando
docker-compose -f docker-compose.local.yml ps db-local

# Ver logs do banco
docker-compose -f docker-compose.local.yml logs db-local

# Testar conectividade
docker-compose -f docker-compose.local.yml exec -T db-local pg_isready -U rsvuser -d rsv_ecosystem_local
```

### Logs Importantes
- **Aplicação**: `./logs/rsv-ecosystem.log`
- **Docker**: `docker-compose -f docker-compose.local.yml logs`
- **Sistema**: `/var/log/syslog` (Linux) ou Event Viewer (Windows)

## 📈 Performance

### Recursos Recomendados
- **CPU**: 4 cores ou mais
- **RAM**: 8GB ou mais
- **Disco**: 20GB livres
- **Docker**: 4GB de memória alocada

### Otimizações
- Use SSD para melhor performance de I/O
- Aloque mais memória para o Docker
- Use Docker Desktop com WSL2 no Windows
- Configure swap se necessário

## 🔄 Integração com CI/CD

### GitHub Actions
```yaml
# Exemplo de workflow para testes locais
name: Local Production Tests
on: [push, pull_request]

jobs:
  test-local-production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start Local Production
        run: |
          cd LOCAL-PRODUCTION
          ./scripts/start-local-production.sh
      - name: Run Health Checks
        run: |
          cd LOCAL-PRODUCTION
          ./scripts/health-check.sh
      - name: Run Tests
        run: |
          cd LOCAL-PRODUCTION
          npm run test:integration
```

## 📚 Documentação Adicional

- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique os logs dos serviços
2. Execute o script de health check
3. Consulte a documentação
4. Abra uma issue no repositório

## 📝 Changelog

### v1.0.0 (2025-01-02)
- ✅ Configuração inicial do ambiente local
- ✅ Scripts de inicialização automatizada
- ✅ Monitoramento com Grafana e Prometheus
- ✅ Health checks automatizados
- ✅ Documentação completa

---

**🎉 Ambiente de Produção Local - RSV 360° Ecosystem**
*Desenvolvido para testes e validação antes do deploy em produção*

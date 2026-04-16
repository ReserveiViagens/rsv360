---
name: rsv360-monitoring-skill
description: '**WORKFLOW SKILL** — Health checks contínuos e monitoramento de produção para RSV360. Verifica APIs, bancos de dados, serviços externos, métricas de performance. USE FOR: RSV360 monitoring, health checks, production monitoring, API monitoring, database monitoring. DO NOT USE FOR: development debugging, one-time diagnostics.'
---

# RSV360 Monitoring Skill: Health Checks e Monitoramento

## Visão Geral
Este skill implementa monitoramento contínuo para o monorepo RSV360, incluindo health checks automatizados, alertas, métricas de performance, e dashboards de observabilidade.

## Pré-requisitos
- Monorepo RSV360 totalmente configurado
- Application Insights ou similar configurado
- Alertas por email/Slack configurados

## Processo Passo a Passo

### Passo 1: Health Check Endpoints
Criar endpoints /health em cada serviço:

```javascript
// backend/src/api/v1/health/routes.js
router.get('/', async (req, res) => {
  try {
    // Verificar conexão DB
    await knex.raw('SELECT 1');
    
    // Verificar dependências externas
    // const externalHealth = await checkExternalServices();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        // external: externalHealth ? 'up' : 'down'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

### Passo 2: Métricas de Performance
Implementar coleta de métricas:

```typescript
// apps/site-publico/lib/metrics.ts
import { NextWebVitalsMetric } from 'next/app';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Enviar para Application Insights
  console.log(metric);
}

// API response times
export function trackApiCall(endpoint: string, duration: number, status: number) {
  // Log métricas
}
```

### Passo 3: Monitoramento de Banco de Dados
Queries de monitoramento:

```sql
-- Conexões ativas
SELECT count(*) FROM pg_stat_activity;

-- Queries lentas
SELECT query, total_time, calls FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;

-- Tamanho das tabelas
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Passo 4: Alertas Automatizados
Configurar alertas para:
- CPU/Memória alta
- Erros 5xx > 5%
- Latência > 2s
- DB connections > 80%
- Disk space < 10%

### Passo 5: Dashboard de Observabilidade
Criar dashboard com:
- Uptime dos serviços
- Response times
- Error rates
- User metrics
- Business KPIs

### Passo 6: Testes de Carga
Implementar testes com Artillery:

```yaml
# artillery.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Health check'
    requests:
      - get:
          url: '/api/v1/health'
```

## Critérios de Qualidade
- Health checks respondem < 1s
- Alertas configurados para todos os serviços críticos
- Métricas coletadas em tempo real
- Dashboard acessível 24/7
- Testes de carga executados semanalmente

## Pontos de Decisão
- Usar Application Insights ou DataDog?
- Alertas por email ou Slack?
- Métricas em tempo real ou batch?

## Verificações de Conclusão
- Todos os health checks verdes
- Alertas testados
- Dashboard funcional
- Documentação de runbooks criada
---
name: rsv360-deployment-skill
description: '**WORKFLOW SKILL** — Deploy automatizado para Azure com CI/CD pipelines, staging/production environments, rollbacks, e blue-green deployments. USE FOR: RSV360 deployment, Azure deployment, CI/CD pipelines, staging deployment, production deployment. DO NOT USE FOR: local development, manual deployments.'
---

# RSV360 Deployment Skill: CI/CD e Deploy para Azure

## Visão Geral
Este skill implementa deployment automatizado para Azure, incluindo pipelines GitHub Actions, ambientes staging/production, rollbacks seguros, e estratégias de deployment.

## Pré-requisitos
- Conta Azure configurada
- Repositório GitHub com Actions habilitado
- Recursos Azure provisionados (App Services, DB, etc.)

## Processo Passo a Passo

### Passo 1: Configurar GitHub Actions
Criar workflows para CI/CD:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build apps
      run: npm run build
    
    - name: Deploy to Staging
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'rsv360-staging'
        publish-profile: ${{ secrets.AZURE_STAGING_PUBLISH_PROFILE }}
        package: './dist'
    
    - name: Deploy to Production
      if: github.ref == 'refs/heads/main' && github.event_name == 'push' && contains(github.event.head_commit.message, '[deploy]')
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'rsv360-production'
        publish-profile: ${{ secrets.AZURE_PRODUCTION_PUBLISH_PROFILE }}
        package: './dist'
```

### Passo 2: Configurar Ambientes Azure
Provisionar recursos:
- App Service para backend (Node.js)
- Static Web Apps para frontend
- Azure Database for PostgreSQL
- Azure Cache for Redis (opcional)
- Azure Storage para arquivos

### Passo 3: Estratégia Blue-Green
Implementar deployment blue-green:

```yaml
# Deploy para slot staging primeiro
- name: Deploy to Staging Slot
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'rsv360-production'
    slot-name: 'staging'
    publish-profile: ${{ secrets.AZURE_STAGING_SLOT_PUBLISH_PROFILE }}

# Swap para produção após testes
- name: Swap Slots
  run: |
    az webapp deployment slot swap --name rsv360-production --resource-group rsv360-rg --slot staging
```

### Passo 4: Rollback Automático
Configurar rollback em caso de falha:

```yaml
- name: Rollback on Failure
  if: failure()
  run: |
    az webapp deployment slot swap --name rsv360-production --resource-group rsv360-rg --slot production --target-slot staging
```

### Passo 5: Migrações de Banco
Executar migrations automaticamente:

```yaml
- name: Run Database Migrations
  run: |
    npm run migrate
  env:
    DATABASE_URL: ${{ secrets.AZURE_DB_CONNECTION_STRING }}
```

### Passo 6: Testes Pós-Deploy
Executar smoke tests após deploy:

```yaml
- name: Smoke Tests
  run: |
    curl -f https://rsv360-staging.azurewebsites.net/api/v1/health
    curl -f https://rsv360-staging.azurewebsites.net/
```

## Critérios de Qualidade
- Deploy automático em push para main
- Staging sempre atualizado
- Rollback automático em falhas
- Zero downtime deployments
- Testes passando em todos os ambientes

## Pontos de Decisão
- Blue-green ou rolling updates?
- Staging obrigatório antes de produção?
- Rollback manual ou automático?

## Verificações de Conclusão
- Pipeline executando com sucesso
- Staging e produção funcionais
- Rollback testado
- Documentação de deployment criada
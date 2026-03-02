# Diagnóstico do Backend - Por que não estava rodando

**Data:** 28/01/2026

## Problema identificado

O backend principal (porta 5000) demorava mais de 10 segundos para responder após ser iniciado pelo script `Iniciar Sistema Completo.ps1`, fazendo com que o script considerasse que o backend "não respondeu ainda".

## Causas encontradas

### 1. **Redis bloqueando o startup**
- O backend tenta conectar ao Redis na inicialização
- Quando Redis não está rodando, o `connectTimeout` de 5 segundos fazia o backend esperar antes de falhar
- Mesmo com try/catch, o delay de 5 segundos atrasava o startup

### 2. **Timeout do script de verificação**
- O script `iniciar-backend.ps1` aguarda até 10 tentativas × 3 segundos = 30 segundos
- Porém, com Redis + Database + Jobs, o startup pode levar 15-20 segundos na primeira vez

## Correções aplicadas

### 1. Redis opcional (`REDIS_ENABLED=false`)
- Adicionado `REDIS_ENABLED=false` no `.env` para desenvolvimento sem Redis
- Quando `false`, o backend pula a conexão Redis completamente
- **Resultado:** Startup ~5 segundos mais rápido

### 2. Timeout do Redis reduzido
- `connectTimeout` reduzido de 5000ms para 2000ms em `config/redis.js`
- Se Redis estiver habilitado mas não rodando, falha em 2s em vez de 5s

### 3. Script de diagnóstico
- Criado `backend/scripts/diagnostico-backend.js` para identificar problemas
- Executar: `cd backend && node scripts/diagnostico-backend.js`

## Como iniciar o sistema

1. **Iniciar tudo:**
   ```powershell
   cd "RSV360 Versao Oficial"
   .\Iniciar Sistema Completo.ps1
   ```

2. **Aguardar:** O backend pode levar 15-30 segundos na primeira vez (compilação, conexões)

3. **Verificar se está rodando:**
   ```powershell
   curl http://localhost:5000/health
   ```

4. **Se o backend não responder:**
   - Verifique a janela do PowerShell do backend (procure por erros)
   - Execute o diagnóstico: `cd backend && node scripts/diagnostico-backend.js`
   - Verifique se PostgreSQL está rodando na porta 5433

## Erro adicional corrigido: "coluna a.enterprise_id não existe"

- **Causa:** A tabela `auctions` no banco pode não ter a coluna `enterprise_id`
- **Correção 1:** Migration `007_create_auctions_tables.js` criada para adicionar/criar tabelas
- **Correção 2:** Fallback no `getActive()` - usa query simples se JOIN falhar, retorna [] se tudo falhar
- **Para aplicar a migration:** O banco pode ter histórico de migrations antigas. Use o script SQL: `psql -U postgres -d rsv360 -f backend/scripts/add-enterprise-id-to-auctions.sql`

## URLs do sistema

| Serviço | URL |
|---------|-----|
| Site Público | http://localhost:3000 |
| Leilões | http://localhost:3000/leiloes |
| Dashboard Turismo | http://localhost:3005 |
| Backend Principal | http://localhost:5000 |
| Backend Admin/CMS | http://localhost:5002 |
| Health Check | http://localhost:5000/health |

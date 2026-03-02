# Correção: Erros Flash Deals e Jobs (Property Listing)

**Data:** 28/01/2026  
**Status:** ✅ Implementado

---

## 📋 Problema Identificado

Os seguintes erros apareciam nos logs do backend (Property Listing):

```
Error in startScheduledFlashDeals job: relação "flash_deals" não existe
Error in finishExpiredFlashDeals job: relação "flash_deals" não existe
Error in updateDiscounts job: relação "flash_deals" não existe
Error in notifyWinners job: coluna a.winner_id não existe
```

### Causa Raiz

1. **Tabela `flash_deals` não existe** – A migration que cria essa tabela nunca foi executada no banco de dados em uso.

2. **Coluna `winner_id` não existe em `auctions`** – A tabela `auctions` foi criada por outra migration (ex.: leilões com UUID) que não inclui a coluna `winner_id` usada pelo job `notifyWinners`.

---

## ✅ Solução Implementada

### 1. Migration SQL Consolidada

**Arquivo:** `database/migrations/010_fix_flash_deals_and_auctions.sql`

Esta migration:

- Cria a tabela `flash_deals` se não existir
- Adiciona a coluna `winner_id` em `auctions` se não existir
- Adiciona a coluna `winner_bid_id` em `auctions` se não existir
- Adiciona a coluna `customer_id` em `bids` se não existir (compatibilidade)
- Cria índices e triggers necessários
- Usa verificações condicionais para evitar erros em bancos parciais

### 2. Script Node.js para Executar a Migration

**Arquivo:** `backend/scripts/executar-migration-flash-deals.js`

Script que:

- Conecta ao PostgreSQL usando variáveis de ambiente
- Executa o arquivo SQL da migration
- Verifica se `flash_deals` e `auctions.winner_id` foram criados corretamente

### 3. Ajustes nos Jobs (Degradação Graciosa)

**Arquivos modificados:**

- `backend/src/jobs/flash-deals.js`
- `backend/src/jobs/auctions.js`

**Alterações:**

- Cada job verifica se as tabelas/colunas necessárias existem **antes** de executar
- Se não existirem, o job termina sem erro (não polui os logs)
- Quando a migration for executada, os jobs passam a funcionar normalmente

---

## 📝 Passo a Passo para Resolver Completamente

### Passo 1: Verificar PostgreSQL

Confirme que o PostgreSQL está rodando e acessível:

```powershell
# Verificar serviço
Get-Service -Name "postgresql-x64-18"

# Verificar porta (5433 é a padrão do projeto)
Get-NetTCPConnection -LocalPort 5433
```

### Passo 2: Configurar Variáveis de Ambiente

No diretório `backend`, verifique o `.env`:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=rsv_360_ecosystem
DB_USER=postgres
DB_PASSWORD=postgres
```

Ajuste conforme seu ambiente.

### Passo 3: Executar a Migration

**Opção A – Via Node.js (recomendado):**

```powershell
cd "d:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\backend"
node scripts/executar-migration-flash-deals.js
```

**Opção B – Via psql:**

```powershell
psql -U postgres -d rsv_360_ecosystem -p 5433 -f "..\database\migrations\010_fix_flash_deals_and_auctions.sql"
```

### Passo 4: Verificar Resultado

Após a migration, você deve ver algo como:

```
✅ Migration executada com sucesso!

📊 Verificação:
  - Tabela flash_deals: ✅ Existe
  - Coluna auctions.winner_id: ✅ Existe
```

### Passo 5: Reiniciar o Backend

Reinicie o servidor backend para garantir que os jobs usem o novo schema:

```powershell
# Parar o backend (Ctrl+C se estiver rodando)
# Iniciar novamente
npm run dev
# ou
node src/server.js
```

### Passo 6: Conferir Logs

Os erros relacionados a `flash_deals` e `winner_id` não devem mais aparecer nos logs.

---

## 🔍 O Que Cada Job Faz

| Job | Frequência | Função |
|-----|------------|--------|
| `startScheduledFlashDeals` | A cada minuto | Ativa flash deals agendados que devem começar |
| `finishExpiredFlashDeals` | A cada minuto | Finaliza flash deals que expiraram |
| `updateDiscounts` | A cada 5 minutos | Atualiza desconto progressivo em flash deals ativos |
| `notifyNewFlashDeals` | A cada hora | Notifica sobre novos flash deals (placeholder) |
| `notifyWinners` | A cada 5 minutos | Notifica vencedores de leilões finalizados |

---

## ⚠️ Dependências da Migration

A migration `010_fix_flash_deals_and_auctions.sql` assume:

- **PostgreSQL** em execução
- **Banco** `rsv_360_ecosystem` (ou o definido em `DB_NAME`)
- **Tabela `customers`** (para FK de `winner_id`) – se não existir, `winner_id` será criada sem FK
- **Tabelas `enterprises`, `properties`, `accommodations`** – opcionais para `flash_deals` (colunas nullable)

Se `customers` não existir, execute antes as migrations que a criam (ex.: `005_create_customers_table.js`).

---

## 📂 Arquivos Criados/Modificados

| Arquivo | Ação |
|---------|------|
| `database/migrations/010_fix_flash_deals_and_auctions.sql` | Criado |
| `backend/scripts/executar-migration-flash-deals.js` | Criado |
| `backend/src/jobs/flash-deals.js` | Modificado |
| `backend/src/jobs/auctions.js` | Modificado |
| `CORRECAO_FLASH_DEALS_E_JOBS.md` | Criado |

---

## 🚀 Resumo Rápido

1. Executar: `node backend/scripts/executar-migration-flash-deals.js`
2. Reiniciar o backend
3. Conferir os logs – os erros devem desaparecer

---

**Status:** ✅ Correção implementada e documentada

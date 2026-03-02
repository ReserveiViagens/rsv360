# 🗄️ GUIA DE CONFIGURAÇÃO DO BANCO DE DADOS

**Data:** 2025-12-30  
**Status:** ✅ Scripts Criados e Prontos

---

## 📋 PRÉ-REQUISITOS

- ✅ PostgreSQL instalado e rodando
- ✅ Acesso ao PostgreSQL (usuário e senha)
- ✅ Permissões para criar banco de dados

---

## 🚀 CONFIGURAÇÃO RÁPIDA

### **Opção 1: Script Automatizado (Recomendado)**

Execute o script que faz tudo automaticamente:

```powershell
.\scripts\CONFIGURAR_BANCO_DADOS.ps1
```

Este script irá:
1. ✅ Verificar se PostgreSQL está instalado
2. ✅ Criar arquivo `.env` no backend
3. ✅ Criar banco de dados `rsv360`
4. ✅ Executar todas as migrations SQL

**Parâmetros opcionais:**
```powershell
.\scripts\CONFIGURAR_BANCO_DADOS.ps1 `
  -DBName "rsv360" `
  -DBUser "postgres" `
  -DBHost "localhost" `
  -DBPort 5432
```

---

### **Opção 2: Passo a Passo Manual**

#### **1. Criar Arquivo .env**

Copie o arquivo de exemplo:
```powershell
Copy-Item backend\.env.example backend\.env
```

Edite `backend\.env` com suas credenciais:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsv360
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
NODE_ENV=development
PORT=5000
JWT_SECRET=dev_secret_change_in_production
```

#### **2. Criar Banco de Dados**

Conecte-se ao PostgreSQL e execute:
```sql
CREATE DATABASE rsv360;
```

Ou via linha de comando:
```powershell
psql -U postgres -c "CREATE DATABASE rsv360;"
```

#### **3. Executar Migrations SQL**

**Opção A: Script Automatizado**
```powershell
.\scripts\EXECUTAR_MIGRATIONS_SQL.ps1
```

**Opção B: Manualmente via psql**
```powershell
# Leilões
psql -U postgres -d rsv360 -f database\migrations\leiloes\001-create-leiloes-tables.sql

# Excursões
psql -U postgres -d rsv360 -f database\migrations\excursoes\001-create-excursoes-tables.sql

# Viagens em Grupo
psql -U postgres -d rsv360 -f database\migrations\viagens-grupo\001-create-viagens-grupo-tables.sql

# Atendimento IA
psql -U postgres -d rsv360 -f database\migrations\atendimento-ia\001-create-atendimento-ia-tables.sql
```

**Opção C: Via Knex (se configurado)**
```bash
cd backend
npm run migrate
```

---

## 📊 MIGRATIONS DISPONÍVEIS

### **1. Leilões** ✅
- **Arquivo:** `database/migrations/leiloes/001-create-leiloes-tables.sql`
- **Tabelas:**
  - `auctions` - Leilões e Flash Deals
  - `bids` - Lances dos usuários
- **Índices:** 5 índices criados

### **2. Excursões** ✅
- **Arquivo:** `database/migrations/excursoes/001-create-excursoes-tables.sql`
- **Tabelas:**
  - `excursoes` - Excursões
  - `excursoes_participantes` - Participantes
  - `roteiros` - Roteiros das excursões
- **Índices:** 3 índices criados

### **3. Viagens em Grupo** ✅
- **Arquivo:** `database/migrations/viagens-grupo/001-create-viagens-grupo-tables.sql`
- **Tabelas:**
  - `grupos_viagem` - Grupos de viagem
  - `grupos_membros` - Membros dos grupos
  - `wishlists_compartilhadas` - Wishlists compartilhadas
- **Índices:** 4 índices criados

### **4. Atendimento IA** ✅
- **Arquivo:** `database/migrations/atendimento-ia/001-create-atendimento-ia-tables.sql`
- **Tabelas:**
  - `agents` - Agentes IA
  - `conversations` - Conversas
  - `training_content` - Conteúdo de treinamento
  - `training_conversations` - Conversas de treinamento
- **Índices:** 5 índices criados

---

## ✅ VERIFICAR CONFIGURAÇÃO

### **1. Testar Conexão**

```powershell
# Via psql
psql -U postgres -d rsv360 -c "SELECT version();"

# Via script Node.js
cd backend
node -e "require('dotenv').config(); const db = require('./src/config/database'); db.raw('SELECT 1').then(() => console.log('OK')).catch(e => console.error(e));"
```

### **2. Verificar Tabelas Criadas**

```sql
-- Listar todas as tabelas
\dt

-- Ver estrutura de uma tabela
\d auctions
\d excursoes
\d grupos_viagem
\d agents
```

### **3. Verificar Índices**

```sql
-- Listar índices de uma tabela
\di auctions
```

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### **Erro: "database does not exist"**
```sql
-- Criar banco de dados manualmente
CREATE DATABASE rsv360;
```

### **Erro: "permission denied"**
- Verifique se o usuário tem permissões
- Tente usar um usuário com privilégios de superusuário

### **Erro: "relation already exists"**
- As tabelas já existem (normal se executar novamente)
- Para recriar, execute: `DROP TABLE IF EXISTS nome_tabela CASCADE;`

### **Erro: "could not connect to server"**
- Verifique se PostgreSQL está rodando
- Verifique host e porta no `.env`
- Teste: `psql -U postgres -h localhost`

---

## 📝 ESTRUTURA DO BANCO

Após executar todas as migrations, você terá:

```
rsv360
├── auctions (Leilões)
├── bids (Lances)
├── excursoes (Excursões)
├── excursoes_participantes (Participantes)
├── roteiros (Roteiros)
├── grupos_viagem (Grupos)
├── grupos_membros (Membros)
├── wishlists_compartilhadas (Wishlists)
├── agents (Agentes IA)
├── conversations (Conversas)
├── training_content (Treinamento)
└── training_conversations (Conversas de Treinamento)
```

---

## 🚀 PRÓXIMOS PASSOS

Após configurar o banco:

1. ✅ **Testar Backend:**
   ```bash
   npm run dev:backend
   ```

2. ✅ **Testar APIs:**
   - http://localhost:5000/api/v1/leiloes
   - http://localhost:5000/api/v1/excursoes
   - http://localhost:5000/api/v1/viagens-grupo
   - http://localhost:5000/api/v1/atendimento

3. ✅ **Iniciar Dashboard:**
   ```bash
   npm run dev:turismo
   ```

---

## 📚 RECURSOS ADICIONAIS

- **Documentação PostgreSQL:** https://www.postgresql.org/docs/
- **Knex.js Migrations:** https://knexjs.org/#Migrations
- **Arquivo .env.example:** `backend/.env.example`

---

**Última Atualização:** 2025-12-30


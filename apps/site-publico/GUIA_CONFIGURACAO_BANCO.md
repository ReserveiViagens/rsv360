# 🗄️ GUIA DE CONFIGURAÇÃO DO BANCO DE DADOS

**Data:** 2025-12-16  
**Status:** 📋 **GUIA DE CONFIGURAÇÃO**

---

## 📋 PRÉ-REQUISITOS

### 1. PostgreSQL Instalado
- ✅ PostgreSQL deve estar instalado e rodando
- ✅ Versão recomendada: PostgreSQL 12 ou superior

### 2. Banco de Dados Criado
- ✅ Criar banco de dados: `rsv_360_db` (ou outro nome de sua escolha)
- ✅ Usuário com permissões adequadas

---

## 🔧 CONFIGURAÇÃO PASSO A PASSO

### Passo 1: Verificar PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
# Windows (PowerShell):
Get-Service -Name postgresql*

# Ou verificar porta:
netstat -an | findstr 5432
```

### Passo 2: Criar Banco de Dados

```sql
-- Conectar ao PostgreSQL como superusuário
psql -U postgres

-- Criar banco de dados
CREATE DATABASE rsv_360_db;

-- Criar usuário (opcional, se não usar postgres)
CREATE USER rsv_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE rsv_360_db TO rsv_user;

-- Sair
\q
```

### Passo 3: Configurar Variáveis de Ambiente

#### Opção A: Usar DATABASE_URL (Recomendado)

Criar/atualizar arquivo `.env` na raiz do projeto:

```env
# Banco de Dados PostgreSQL
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/rsv_360_db

# OU se usar usuário específico:
# DATABASE_URL=postgresql://rsv_user:sua_senha@localhost:5432/rsv_360_db
```

#### Opção B: Usar Variáveis Individuais

Criar/atualizar arquivo `.env` na raiz do projeto:

```env
# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsv_360_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

### Passo 4: Variáveis Obrigatórias Adicionais

Adicionar ao `.env`:

```env
# JWT Secret (obrigatório)
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao_minimo_32_caracteres

# API URL (obrigatório)
NEXT_PUBLIC_API_URL=http://localhost:5002
```

---

## ✅ VALIDAÇÃO

### 1. Validar Variáveis de Ambiente

```bash
npm run validate:env
```

**Resultado esperado:**
```
✅ DATABASE_URL tem formato válido
✅ JWT_SECRET tem tamanho adequado (>= 32 caracteres)
✅ Todas as variáveis obrigatórias estão definidas!
```

### 2. Testar Conexão

```bash
# Verificar status das migrations
npm run db:check
```

**Resultado esperado:**
```
✅ Conexão com banco estabelecida
✅ Timestamp: [data/hora atual]
✅ Tabela schema_migrations existe
```

---

## 🛠️ TROUBLESHOOTING

### Erro: "autenticação do tipo senha falhou"

**Causa:** Senha incorreta ou usuário não existe

**Solução:**
1. Verificar senha do PostgreSQL
2. Verificar se usuário existe: `psql -U postgres -l`
3. Redefinir senha se necessário:
   ```sql
   ALTER USER postgres WITH PASSWORD 'nova_senha';
   ```

### Erro: "banco de dados não existe"

**Causa:** Banco de dados não foi criado

**Solução:**
```sql
CREATE DATABASE rsv_360_db;
```

### Erro: "não foi possível conectar ao servidor"

**Causa:** PostgreSQL não está rodando

**Solução:**
```bash
# Windows (PowerShell como Administrador):
Start-Service postgresql-x64-[versão]

# Ou iniciar manualmente pelo Services
```

---

## 📝 EXEMPLO DE ARQUIVO .env COMPLETO

```env
# ===========================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ===========================================

# Opção 1: DATABASE_URL (recomendado)
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/rsv_360_db

# Opção 2: Variáveis individuais (alternativa)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=rsv_360_db
# DB_USER=postgres
# DB_PASSWORD=sua_senha

# ===========================================
# CONFIGURAÇÕES OBRIGATÓRIAS
# ===========================================

JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao_minimo_32_caracteres
NEXT_PUBLIC_API_URL=http://localhost:5002

# ===========================================
# CONFIGURAÇÕES OPCIONAIS
# ===========================================

NODE_ENV=development
PORT=5002

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
```

---

## 🎯 PRÓXIMOS PASSOS APÓS CONFIGURAÇÃO

1. ✅ Validar ambiente: `npm run validate:env`
2. ✅ Verificar migrations: `npm run db:check`
3. ✅ Comparar migrations: `npm run db:compare`
4. ✅ Executar migrations: `npm run migrate`

---

**Última atualização:** 2025-12-16


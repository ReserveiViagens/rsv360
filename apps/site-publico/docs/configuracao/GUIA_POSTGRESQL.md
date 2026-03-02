# 🗄️ GUIA COMPLETO: CONFIGURAÇÃO POSTGRESQL

**Objetivo:** Configurar DATABASE_URL no arquivo `.env`  
**Tempo estimado:** 10-15 minutos  
**Dificuldade:** ⭐⭐ Média

---

## 📋 ÍNDICE

1. [Verificar Instalação do PostgreSQL](#1-verificar-instalação-do-postgresql)
2. [Criar Banco de Dados](#2-criar-banco-de-dados)
3. [Obter Credenciais](#3-obter-credenciais)
4. [Configurar DATABASE_URL](#4-configurar-database_url)
5. [Testar Conexão](#5-testar-conexão)
6. [Troubleshooting](#troubleshooting)

---

## 1. VERIFICAR INSTALAÇÃO DO POSTGRESQL

### Windows

**Opção A: Verificar se está instalado**

```powershell
# Verificar se PostgreSQL está rodando
Get-Service -Name postgresql*

# Ou verificar no gerenciador de serviços
services.msc
```

**Opção B: Instalar PostgreSQL (se não estiver instalado)**

1. Baixar: https://www.postgresql.org/download/windows/
2. Executar instalador
3. Durante instalação:
   - Porta: `5432` (padrão)
   - Usuário: `postgres` (padrão)
   - Senha: **ANOTAR A SENHA** (você vai precisar!)
   - Localização: `C:\Program Files\PostgreSQL\15` (ou versão instalada)

### Linux (Ubuntu/Debian)

```bash
# Verificar se está instalado
sudo systemctl status postgresql

# Se não estiver instalado
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Docker (Recomendado para Desenvolvimento)

```bash
# Criar container PostgreSQL
docker run --name postgres-rsv360 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=minhasenha123 \
  -e POSTGRES_DB=rsv360_dev \
  -p 5432:5432 \
  -d postgres:15

# Verificar se está rodando
docker ps | grep postgres
```

**Credenciais do Docker:**
- Host: `localhost`
- Porta: `5432`
- Usuário: `postgres`
- Senha: `minhasenha123` (ou a que você definiu)
- Banco: `rsv360_dev`

---

## 2. CRIAR BANCO DE DADOS

### Windows (pgAdmin)

1. Abrir **pgAdmin 4**
2. Conectar ao servidor (clique direito → Connect)
3. Inserir senha do PostgreSQL
4. Clicar direito em **Databases** → **Create** → **Database**
5. Nome: `rsv360_dev`
6. Owner: `postgres`
7. Clicar **Save**

### Windows (psql - Linha de Comando)

```powershell
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE rsv360_dev;

# Verificar se foi criado
\l

# Sair
\q
```

### Linux

```bash
# Conectar como usuário postgres
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE rsv360_dev;

# Verificar
\l

# Sair
\q
```

### Docker

O banco já é criado automaticamente com o comando Docker acima.

---

## 3. OBTER CREDENCIAIS

### Credenciais Padrão (Instalação Local)

- **Host:** `localhost` (ou `127.0.0.1`)
- **Porta:** `5432`
- **Usuário:** `postgres`
- **Senha:** A senha que você definiu durante a instalação
- **Banco:** `rsv360_dev` (criado no passo 2)

### Credenciais Docker

- **Host:** `localhost`
- **Porta:** `5432`
- **Usuário:** `postgres` (ou o que você definiu em `POSTGRES_USER`)
- **Senha:** A senha definida em `POSTGRES_PASSWORD`
- **Banco:** `rsv360_dev` (ou o definido em `POSTGRES_DB`)

### Credenciais Cloud (AWS RDS, Azure, etc.)

Use a string de conexão fornecida pelo serviço. Exemplo AWS:
```
postgresql://usuario:senha@seu-endpoint.rds.amazonaws.com:5432/rsv360_dev
```

---

## 4. CONFIGURAR DATABASE_URL

### Passo 1: Abrir arquivo .env

```powershell
# No PowerShell, navegar até o projeto
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"

# Abrir no editor (ou usar seu editor preferido)
notepad .env
# ou
code .env
```

### Passo 2: Localizar ou Criar DATABASE_URL

**Se já existir:**
```bash
DATABASE_URL=postgresql://postgres:senha@localhost:5432/rsv360_dev
```

**Se não existir, adicionar:**
```bash
# ===========================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ===========================================
DATABASE_URL=postgresql://postgres:senha@localhost:5432/rsv360_dev
```

### Passo 3: Substituir Valores

**Formato:**
```
postgresql://USUARIO:SENHA@HOST:PORTA/BANCO
```

**Exemplo Real:**
```bash
# Se suas credenciais forem:
# Usuário: postgres
# Senha: minhasenha123
# Host: localhost
# Porta: 5432
# Banco: rsv360_dev

DATABASE_URL=postgresql://postgres:minhasenha123@localhost:5432/rsv360_dev
```

### Passo 4: Salvar Arquivo

Salvar o arquivo `.env` após editar.

---

## 5. TESTAR CONEXÃO

### Opção 1: Via Script de Validação

```bash
npm run validate:env
```

**Resultado esperado:**
```
✅ DATABASE_URL = postgresql://postgres:***@localhost:5432/rsv360_dev
✅ Todas as variáveis obrigatórias estão definidas!
```

### Opção 2: Via psql

```powershell
# Testar conexão direta
psql $env:DATABASE_URL

# Se conectar com sucesso, você verá:
# rsv360_dev=#
```

### Opção 3: Via Script Node.js

```bash
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()', (err, res) => { if (err) console.error('❌ Erro:', err.message); else console.log('✅ Conexão OK:', res.rows[0]); pool.end(); });"
```

---

## 🔧 TROUBLESHOOTING

### Erro: "autenticação do tipo senha falhou"

**Causa:** Senha incorreta

**Solução:**
1. Verificar senha no arquivo `.env`
2. Testar senha manualmente:
   ```powershell
   psql -U postgres -h localhost
   ```
3. Se não lembrar a senha, redefinir:
   ```powershell
   # Windows: Editar pg_hba.conf
   # Localizar: C:\Program Files\PostgreSQL\15\data\pg_hba.conf
   # Mudar: md5 → trust (temporariamente)
   # Reiniciar PostgreSQL
   # Conectar sem senha e redefinir:
   ALTER USER postgres WITH PASSWORD 'novasenha';
   ```

### Erro: "banco de dados não existe"

**Causa:** Banco `rsv360_dev` não foi criado

**Solução:**
```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar banco
CREATE DATABASE rsv360_dev;

-- Verificar
\l
```

### Erro: "não foi possível conectar ao servidor"

**Causa:** PostgreSQL não está rodando

**Solução Windows:**
```powershell
# Verificar serviço
Get-Service -Name postgresql*

# Iniciar serviço
Start-Service -Name postgresql-x64-15
```

**Solução Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**Solução Docker:**
```bash
docker start postgres-rsv360
docker ps | grep postgres
```

### Erro: "porta 5432 já está em uso"

**Causa:** Outro serviço está usando a porta

**Solução:**
1. Verificar o que está usando a porta:
   ```powershell
   netstat -ano | findstr :5432
   ```
2. Parar o serviço conflitante ou mudar porta do PostgreSQL

### Erro: "permissão negada"

**Causa:** Usuário não tem permissão

**Solução:**
```sql
-- Conectar como superusuário
psql -U postgres

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE rsv360_dev TO postgres;
ALTER DATABASE rsv360_dev OWNER TO postgres;
```

---

## ✅ CHECKLIST FINAL

Antes de continuar, verifique:

- [ ] PostgreSQL está instalado e rodando
- [ ] Banco de dados `rsv360_dev` foi criado
- [ ] Credenciais (usuário, senha, host, porta) estão corretas
- [ ] `DATABASE_URL` foi adicionada no arquivo `.env`
- [ ] `DATABASE_URL` tem formato correto: `postgresql://usuario:senha@host:porta/banco`
- [ ] Arquivo `.env` foi salvo
- [ ] Teste de conexão passou (`npm run validate:env`)

---

## 🚀 PRÓXIMOS PASSOS

Após configurar DATABASE_URL:

1. **Validar:**
   ```bash
   npm run validate:env
   ```

2. **Executar migrations:**
   ```bash
   npm run migrate
   ```

3. **Executar seed:**
   ```bash
   npm run seed
   ```

4. **Ou executar tudo de uma vez:**
   ```bash
   npm run setup
   ```

---

**Última atualização:** 2025-12-13


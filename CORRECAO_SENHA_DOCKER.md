# ✅ Correção: Senha do Docker PostgreSQL

## 🔍 Problema Identificado

Você estava tentando conectar ao Docker (porta 5432) com a senha `290491Bb`, mas a senha correta do Docker é **`postgres`**.

## 🔐 Senhas Corretas

### 🐳 Docker PostgreSQL (Porta 5432)
- **Usuário:** `postgres`
- **Senha:** `postgres` ⚠️ **ESTA É A SENHA CORRETA!**
- **Banco:** `rsv_360_ecosystem`

### 💻 PostgreSQL Nativo (Porta 5433)
- **Usuário:** `postgres`
- **Senha:** `290491Bb`
- **Banco:** `rsv360`

---

## 📝 Como Conectar no pgAdmin

### Para o Docker (Porta 5432):
1. Clique em **"Servers"** → **"Create"** → **"Server"**
2. Na aba **General:**
   - **Name:** `Docker PostgreSQL (Porta 5432)`
3. Na aba **Connection:**
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Database:** `rsv_360_ecosystem`
   - **Username:** `postgres`
   - **Password:** `postgres` ⚠️ **USE ESTA SENHA!**
   - ✅ Marque **"Save Password"**

### Para o PostgreSQL Nativo (Porta 5433):
1. Clique em **"Servers"** → **"Create"** → **"Server"**
2. Na aba **General:**
   - **Name:** `PostgreSQL Nativo (Porta 5433)`
3. Na aba **Connection:**
   - **Host:** `localhost`
   - **Port:** `5433`
   - **Database:** `rsv360` (ou `postgres`)
   - **Username:** `postgres`
   - **Password:** `290491Bb`
   - ✅ Marque **"Save Password"**

---

## ✅ Próximos Passos para Migração

1. **Iniciar PostgreSQL Nativo:**
   ```powershell
   # Execute como Administrador
   Start-Service -Name "postgresql-x64-18"
   ```

2. **Verificar se iniciou:**
   ```powershell
   Get-Service -Name "postgresql-x64-18"
   ```

3. **Criar banco de dados (se não existir):**
   ```powershell
   $env:PGPASSWORD = "290491Bb"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -p 5433 -c "CREATE DATABASE rsv360;"
   ```

4. **Executar migração:**
   ```powershell
   cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
   node scripts\migrar-docker-via-docker-exec.js
   ```

---

## 📊 Resumo

| Instância | Porta | Usuário | Senha | Banco |
|-----------|-------|---------|-------|-------|
| Docker | 5432 | postgres | `postgres` | rsv_360_ecosystem |
| Nativo | 5433 | postgres | `290491Bb` | rsv360 |

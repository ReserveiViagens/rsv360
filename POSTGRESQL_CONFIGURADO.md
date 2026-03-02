# ✅ PostgreSQL Configurado com Sucesso!

**Data:** 2026-01-05  
**Status:** ✅ **FUNCIONANDO**

---

## 📋 CONFIGURAÇÃO ATUAL

- **Porta:** 5433 (alterada de 5432 devido ao conflito com Docker)
- **Serviço:** postgresql-x64-18 - PostgreSQL Server 18
- **Status:** ✅ Rodando
- **Usuário:** postgres
- **Senha:** 290491Bb (documentada no projeto)

---

## 🔌 COMO CONECTAR

### Via psql (linha de comando):

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -p 5433
```

**Senha:** `290491Bb`

### Via pgAdmin 4:

1. Abra o **pgAdmin 4**
2. Clique com botão direito em **Servers** → **Create** → **Server**
3. Na aba **General**:
   - **Name:** `PostgreSQL 18 (Porta 5433)`
4. Na aba **Connection**:
   - **Host name/address:** `localhost`
   - **Port:** `5433` ⚠️ **IMPORTANTE: Use 5433, não 5432!**
   - **Maintenance database:** `postgres`
   - **Username:** `postgres`
   - **Password:** `290491Bb`
   - ✅ Marque **Save password**
5. Clique em **Save**

---

## 📝 ATUALIZAR CONFIGURAÇÕES DO PROJETO

Se você tiver arquivos `.env` ou configurações que usam PostgreSQL, atualize a porta:

### Arquivo .env:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=rsv360
DB_USER=postgres
DB_PASSWORD=290491Bb
```

### Ou DATABASE_URL:

```env
DATABASE_URL=postgresql://postgres:290491Bb@localhost:5433/rsv360
```

---

## ⚠️ POR QUE A PORTA FOI MUDADA?

A porta padrão 5432 estava sendo usada por:
- **Docker** (`com.docker.backend`)
- **WSL Relay** (`wslrelay`)

Para não interromper esses serviços, mudamos o PostgreSQL para a porta **5433**, que é uma alternativa padrão comum.

---

## ✅ VERIFICAÇÃO

Para verificar se está funcionando:

```powershell
# Verificar serviço
Get-Service -Name "postgresql-x64-18"

# Verificar porta
Get-NetTCPConnection -LocalPort 5433

# Testar conexão
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -p 5433 -c "SELECT version();"
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Criar banco de dados** (se necessário):
   ```sql
   CREATE DATABASE rsv360;
   ```

2. ✅ **Executar migrations** do projeto

3. ✅ **Atualizar arquivos .env** com a nova porta (5433)

---

**Última Atualização:** 2026-01-05  
**Status:** ✅ PostgreSQL funcionando na porta 5433


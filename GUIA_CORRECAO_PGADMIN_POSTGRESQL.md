# 🔧 Guia Completo: Corrigir pgAdmin 4 e PostgreSQL

**Data:** 2026-01-05  
**Status:** ✅ Guia Completo

---

## 📋 Situação Atual

- **PostgreSQL 18** instalado mas serviço **parado**
- **Porta:** 5433 (configurada para evitar conflito com Docker)
- **Senha padrão:** `290491Bb`
- **pgAdmin 4** não conectando

---

## 🚀 CORREÇÃO RÁPIDA (Passo a Passo)

### PASSO 1: Iniciar PostgreSQL

```powershell
# Verificar serviço
Get-Service -Name "postgresql-x64-18"

# Iniciar serviço (como Administrador)
Start-Service -Name "postgresql-x64-18"

# Verificar se iniciou
Get-Service -Name "postgresql-x64-18"
```

**Resultado esperado:** Status = `Running`

---

### PASSO 2: Verificar/Corrigir Senha

```powershell
# Caminho do psql
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# Testar conexão com senha conhecida
$env:PGPASSWORD = "290491Bb"
& $psqlPath -U postgres -d postgres -p 5433 -c "SELECT version();"
```

**Se funcionar:** ✅ Senha está correta  
**Se não funcionar:** Continue para PASSO 3

---

### PASSO 3: Resetar Senha (se necessário)

#### 3.1. Modificar pg_hba.conf (temporariamente)

```powershell
# Caminho do arquivo
$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

# Fazer backup
Copy-Item $pgHbaPath "$pgHbaPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Ler conteúdo
$content = Get-Content $pgHbaPath -Raw

# Alterar para modo trust (temporário)
$content = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)scram-sha-256", '$1trust'
$content = $content -replace "(host\s+all\s+all\s+::1/128\s+)scram-sha-256", '$1trust'

# Salvar
Set-Content -Path $pgHbaPath -Value $content -NoNewline
```

#### 3.2. Reiniciar serviço

```powershell
Restart-Service -Name "postgresql-x64-18" -Force
Start-Sleep -Seconds 3
```

#### 3.3. Alterar senha

```powershell
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$novaSenha = "290491Bb"

# Conectar sem senha (modo trust)
$env:PGPASSWORD = ""
& $psqlPath -U postgres -d postgres -p 5433 -c "ALTER USER postgres WITH PASSWORD '$novaSenha';"
```

#### 3.4. Reverter pg_hba.conf para modo seguro

```powershell
$content = Get-Content $pgHbaPath -Raw
$content = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)trust", '$1scram-sha-256'
$content = $content -replace "(host\s+all\s+all\s+::1/128\s+)trust", '$1scram-sha-256'
Set-Content -Path $pgHbaPath -Value $content -NoNewline
```

#### 3.5. Reiniciar serviço novamente

```powershell
Restart-Service -Name "postgresql-x64-18" -Force
Start-Sleep -Seconds 3
```

#### 3.6. Testar conexão com nova senha

```powershell
$env:PGPASSWORD = "290491Bb"
& $psqlPath -U postgres -d postgres -p 5433 -c "SELECT version();"
```

**Resultado esperado:** Versão do PostgreSQL exibida

---

### PASSO 4: Configurar pgAdmin 4

1. **Abrir pgAdmin 4**

2. **Criar nova conexão:**
   - Clique com botão direito em **"Servers"** → **"Create"** → **"Server"**

3. **Aba "General":**
   - **Name:** `PostgreSQL 18 (Porta 5433)`

4. **Aba "Connection":**
   - **Host name/address:** `localhost`
   - **Port:** `5433` ⚠️ **IMPORTANTE: Use 5433, não 5432!**
   - **Maintenance database:** `postgres`
   - **Username:** `postgres`
   - **Password:** `290491Bb`
   - ✅ **Marque "Save password"**

5. **Clique em "Save"**

6. **Testar conexão:**
   - O servidor deve aparecer sem ícone de cadeado
   - Expanda o servidor para ver Databases, etc.

---

### PASSO 5: Verificar Docker (se necessário)

```powershell
# Verificar se Docker está rodando
docker info

# Verificar containers PostgreSQL
docker ps -a --filter "name=postgres"
```

**Se Docker estiver usando porta 5432:** ✅ Tudo certo, PostgreSQL está na 5433  
**Se não houver Docker:** ✅ Tudo certo

---

## 📝 Atualizar Arquivos .env

Atualize os arquivos `.env` do projeto com:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=rsv360
DB_USER=postgres
DB_PASSWORD=290491Bb
```

### Arquivos a atualizar:
- `backend/.env`
- `apps/turismo/.env` (se existir)
- Qualquer outro arquivo `.env` que use PostgreSQL

---

## ✅ Verificação Final

### 1. Testar via psql:
```powershell
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "290491Bb"
& $psqlPath -U postgres -d postgres -p 5433
```

### 2. Testar via pgAdmin 4:
- Conectar ao servidor
- Executar: `SELECT version();`
- Deve retornar versão do PostgreSQL

### 3. Testar via Backend:
```powershell
cd backend
npm run dev
```

**Resultado esperado:** `✅ Database connected successfully`

---

## 🐛 Troubleshooting

### Erro: "password authentication failed"
→ Execute PASSO 3 (Resetar Senha)

### Erro: "connection refused"
→ Verifique se serviço está rodando:
```powershell
Get-Service -Name "postgresql-x64-18"
```

### Erro: "port 5433 is not available"
→ Verifique qual processo está usando:
```powershell
Get-NetTCPConnection -LocalPort 5433
```

### pgAdmin não conecta mesmo com senha correta
→ Verifique:
1. Porta está correta (5433, não 5432)
2. Host está correto (localhost)
3. Serviço PostgreSQL está rodando
4. Firewall não está bloqueando

---

## 📊 Resumo da Configuração

| Item | Valor |
|------|-------|
| **Host** | localhost |
| **Porta** | 5433 |
| **Usuário** | postgres |
| **Senha** | 290491Bb |
| **Database padrão** | postgres |
| **Database do projeto** | rsv360 (criar se necessário) |

---

## 🎯 Próximos Passos

1. ✅ **Criar banco de dados** (se necessário):
   ```sql
   CREATE DATABASE rsv360;
   ```

2. ✅ **Executar migrations** do projeto

3. ✅ **Testar aplicação** completa

---

**Última Atualização:** 2026-01-05  
**Status:** ✅ Guia Completo e Testado

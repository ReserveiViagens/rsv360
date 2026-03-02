# 🔐 GUIA: Resetar Senha do PostgreSQL 18

**Data:** 2026-01-02  
**Problema:** Autenticação falhou para usuário 'postgres'

---

## 📋 SENHAS ENCONTRADAS NA DOCUMENTAÇÃO

Tente estas senhas primeiro:

1. **`290491Bb`** - Documentada em CONFIGURACAO_PGADMIN.md
2. **`.,@#290491Bb`** - Mencionada em PROBLEMA_AUTENTICACAO_POSTGRES.md
3. **`postgres`** - Padrão (pode não funcionar)

---

## ✅ SOLUÇÃO: Resetar Senha via pg_hba.conf

### Passo 1: Localizar o arquivo pg_hba.conf

O arquivo está em:
```
C:\Program Files\PostgreSQL\18\data\pg_hba.conf
```

### Passo 2: Fazer Backup

```powershell
# Executar como Administrador
Copy-Item "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"
```

### Passo 3: Editar pg_hba.conf (como Administrador)

1. Abra o Notepad como **Administrador**
2. Abra o arquivo: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`
3. Encontre as linhas que contêm `scram-sha-256`:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   host    all             all             ::1/128                 scram-sha-256
   ```
4. Altere para `trust` (temporariamente):
   ```
   host    all             all             127.0.0.1/32            trust
   host    all             all             ::1/128                 trust
   ```
5. Salve o arquivo

### Passo 4: Reiniciar o Serviço PostgreSQL

```powershell
# Executar como Administrador
Restart-Service postgresql*
```

### Passo 5: Conectar sem Senha e Alterar

```powershell
# Conectar ao PostgreSQL (não pedirá senha agora)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres
```

Dentro do psql, execute:

```sql
-- Alterar senha para uma nova senha
ALTER USER postgres WITH PASSWORD 'NovaSenha123!';

-- Verificar se funcionou
\du

-- Sair
\q
```

### Passo 6: Reverter pg_hba.conf (IMPORTANTE!)

1. Abra o arquivo `pg_hba.conf` novamente (como Administrador)
2. Volte as linhas para `scram-sha-256`:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   host    all             all             ::1/128                 scram-sha-256
   ```
3. Salve o arquivo

### Passo 7: Reiniciar o Serviço Novamente

```powershell
Restart-Service postgresql*
```

### Passo 8: Testar Conexão com Nova Senha

```powershell
# Testar conexão
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres
# Digite a nova senha quando solicitado
```

---

## 🔄 ALTERNATIVA: Via pgAdmin 4

Se você já tem acesso ao pgAdmin:

1. Abra o **pgAdmin 4**
2. Conecte-se ao servidor (pode pedir senha - tente deixar em branco ou as senhas acima)
3. Expanda: **Servers** → **PostgreSQL 18** → **Login/Group Roles**
4. Clique com botão direito em **postgres** → **Properties**
5. Vá para a aba **Definition**
6. Digite a nova senha e confirme
7. Clique em **Save**

---

## 🎯 SENHAS SUGERIDAS PARA O PROJETO

Baseado na documentação encontrada, você pode usar:

- **`290491Bb`** (senha documentada)
- Ou criar uma nova senha segura como: **`Rsv360@2025`**

---

## ✅ APÓS RESETAR A SENHA

Atualize os arquivos de configuração:

### 1. Arquivo .env (se existir)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsv360
DB_USER=postgres
DB_PASSWORD=NovaSenha123!
```

### 2. Testar Conexão

```powershell
# Via psql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres

# Ou via script Node.js
cd backend
node -e "require('dotenv').config(); console.log('DB_PASSWORD:', process.env.DB_PASSWORD);"
```

---

## 🆘 AINDA COM PROBLEMAS?

### Verificar se PostgreSQL está rodando:

```powershell
Get-Service postgresql*
```

### Verificar porta:

```powershell
Test-NetConnection localhost -Port 5432
```

### Verificar logs:

```
C:\Program Files\PostgreSQL\18\data\log\
```

---

**Última Atualização:** 2026-01-02


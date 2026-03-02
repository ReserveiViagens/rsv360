# 🔐 PROBLEMA: Autenticação PostgreSQL Falhou

## ❌ Erro Encontrado

```
FATAL: autenticação do tipo senha falhou para o usuário "postgres"
```

## 🔍 Diagnóstico

A senha fornecida (`.,@#290491Bb`) não está funcionando. Possíveis causas:

1. **Senha incorreta** - A senha pode ter sido alterada
2. **Usuário diferente** - Pode não ser `postgres`
3. **Método de autenticação** - PostgreSQL pode estar configurado para outro método
4. **Serviço não rodando** - PostgreSQL pode não estar ativo

---

## ✅ SOLUÇÕES

### Solução 1: Verificar/Resetar Senha do PostgreSQL

#### Opção A: Via pgAdmin (Interface Gráfica)

1. Abra o **pgAdmin 4**
2. Conecte-se ao servidor (pode pedir senha - tente deixar em branco ou a senha que você configurou na instalação)
3. Expanda: **Servers** → **PostgreSQL** → **Login/Group Roles**
4. Clique com botão direito em **postgres** → **Properties**
5. Vá para a aba **Definition**
6. Digite a nova senha e confirme
7. Clique em **Save**

#### Opção B: Via Arquivo pg_hba.conf (Método Trust Temporário)

1. **Localizar arquivo `pg_hba.conf`:**
   ```
   C:\Program Files\PostgreSQL\18\data\pg_hba.conf
   ```

2. **Fazer backup:**
   ```powershell
   Copy-Item "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"
   ```

3. **Editar arquivo** (como Administrador):
   - Abra o arquivo `pg_hba.conf` no Notepad (como Administrador)
   - Encontre a linha:
     ```
     host    all             all             127.0.0.1/32            scram-sha-256
     ```
   - Altere para:
     ```
     host    all             all             127.0.0.1/32            trust
     ```
   - Salve o arquivo

4. **Reiniciar serviço PostgreSQL:**
   ```powershell
   Restart-Service postgresql*
   ```

5. **Conectar sem senha e alterar senha:**
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres
   ```
   
   Dentro do psql:
   ```sql
   ALTER USER postgres WITH PASSWORD '.,@#290491Bb';
   \q
   ```

6. **Reverter pg_hba.conf:**
   - Volte a linha para `scram-sha-256`
   - Reinicie o serviço novamente

#### Opção C: Via Windows Authentication (se configurado)

Se o PostgreSQL foi instalado com autenticação Windows:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres
```

---

### Solução 2: Verificar Usuário e Banco de Dados

Teste com diferentes usuários:

```powershell
# Tentar com usuário padrão do Windows
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U $env:USERNAME -d postgres

# Listar usuários disponíveis
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -c "\du"
```

---

### Solução 3: Verificar se o Serviço está Rodando

```powershell
# Verificar status
Get-Service postgresql*

# Iniciar se não estiver rodando
Start-Service postgresql*
```

---

### Solução 4: Usar pgAdmin para Executar Scripts

Se não conseguir resolver a autenticação via linha de comando:

1. Abra **pgAdmin 4**
2. Conecte-se ao servidor
3. Expanda: **Servers** → **PostgreSQL** → **Databases** → **rsv_360_db**
4. Clique com botão direito em **rsv_360_db** → **Query Tool**
5. Para cada script em `scripts/`:
   - **File** → **Open**
   - Selecione o arquivo `.sql`
   - Clique em **Execute** (F5)

---

## 🎯 Scripts a Executar (Ordem)

1. `create-database-indexes.sql`
2. `create-credentials-table.sql`
3. `create-logs-table.sql`
4. `create-notification-queue-table.sql`
5. `create-saved-searches-table.sql`
6. `create-2fa-tables.sql`
7. `create-audit-logs-table.sql`
8. `create-lgpd-tables.sql`
9. `create-rate-limit-tables.sql`

---

## 📝 Após Resolver a Autenticação

Depois de configurar a senha correta, execute:

```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
.\scripts\executar-sql-scripts.ps1 -DBPassword "sua_senha_correta"
```

---

## 🔍 Verificar Conexão

Use o script de teste:

```powershell
.\scripts\testar-conexao-postgres.ps1
```

Este script vai:
- Testar a conexão
- Listar bancos disponíveis
- Verificar se `rsv_360_db` existe
- Oferecer criar o banco se não existir

---

## 🆘 Ainda com Problemas?

1. **Verifique os logs do PostgreSQL:**
   ```
   C:\Program Files\PostgreSQL\18\data\log\
   ```

2. **Tente conectar via localhost explícito:**
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d postgres
   ```

3. **Verifique a porta:**
   ```powershell
   # PostgreSQL padrão usa porta 5432
   # Verifique se está usando outra porta
   Get-Content "C:\Program Files\PostgreSQL\18\data\postgresql.conf" | Select-String "port"
   ```

4. **Reinstale o PostgreSQL** (último recurso):
   - Desinstale via Painel de Controle
   - Reinstale e configure a senha durante a instalação
   - Anote a senha escolhida

---

**Documento criado:** 2025-01-30  
**Versão:** 1.0


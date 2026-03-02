# 🔧 SOLUÇÃO: psql não encontrado no Windows

## ❌ Problema

Ao tentar executar `psql`, você recebe o erro:
```
psql : O termo 'psql' não é reconhecido como nome de cmdlet, função, arquivo de script ou programa operável.
```

## ✅ Soluções

### Solução 1: Usar o Script Automatizado (RECOMENDADO)

O script `executar-sql-scripts.ps1` foi atualizado para detectar automaticamente o PostgreSQL:

```powershell
# Navegue até a pasta do projeto
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"

# Execute o script
.\scripts\executar-sql-scripts.ps1
```

O script irá:
- ✅ Detectar automaticamente onde o PostgreSQL está instalado
- ✅ Adicionar ao PATH temporariamente
- ✅ Executar todos os scripts SQL

---

### Solução 2: Adicionar PostgreSQL ao PATH Permanentemente

#### Passo 1: Encontrar o PostgreSQL

```powershell
# Execute no PowerShell:
Get-ChildItem -Path "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 FullName
```

**Resultado esperado:**
```
C:\Program Files\PostgreSQL\18\bin\psql.exe
```

#### Passo 2: Adicionar ao PATH

**Opção A: Via Interface Gráfica (Mais Fácil)**

1. Pressione `Win + R`
2. Digite: `sysdm.cpl` e pressione Enter
3. Vá para a aba **"Avançado"**
4. Clique em **"Variáveis de Ambiente"**
5. Em **"Variáveis do sistema"**, encontre **"Path"**
6. Clique em **"Editar"**
7. Clique em **"Novo"**
8. Adicione: `C:\Program Files\PostgreSQL\18\bin` (substitua `18` pela sua versão)
9. Clique em **"OK"** em todas as janelas
10. **Reinicie o PowerShell** para aplicar as mudanças

**Opção B: Via PowerShell (Administrador)**

```powershell
# Execute como Administrador
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\Program Files\PostgreSQL\18\bin",
    "Machine"
)
```

**Substitua `18` pela sua versão do PostgreSQL!**

#### Passo 3: Verificar

```powershell
# Feche e abra um novo PowerShell, depois execute:
psql --version
```

---

### Solução 3: Usar Caminho Completo

Se não quiser adicionar ao PATH, use o caminho completo:

```powershell
# Definir senha
$env:PGPASSWORD="sua_senha_aqui"

# Executar scripts usando caminho completo
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d rsv_360_db -f scripts\create-database-indexes.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d rsv_360_db -f scripts\create-credentials-table.sql
# ... e assim por diante
```

**Substitua `18` pela sua versão do PostgreSQL!**

---

### Solução 4: Usar pgAdmin (Interface Gráfica)

Se preferir uma interface gráfica:

1. Abra o **pgAdmin 4**
2. Conecte-se ao servidor PostgreSQL
3. Expanda: **Servers** → **PostgreSQL** → **Databases** → **rsv_360_db**
4. Clique com botão direito em **rsv_360_db** → **Query Tool**
5. Para cada script:
   - **File** → **Open**
   - Selecione o arquivo `.sql` da pasta `scripts/`
   - Clique em **Execute** (F5)

---

## 🎯 Execução Rápida (Após Configurar)

### Método 1: Script Automatizado

```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
.\scripts\executar-sql-scripts.ps1
```

### Método 2: Comando Direto (se psql estiver no PATH)

```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
$env:PGPASSWORD="sua_senha_aqui"
psql -U postgres -d rsv_360_db -f scripts\create-database-indexes.sql
psql -U postgres -d rsv_360_db -f scripts\create-credentials-table.sql
# ... continue com os outros scripts
```

---

## 📋 Lista Completa de Scripts

Execute nesta ordem:

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

## ✅ Verificação

Após executar os scripts, verifique:

```sql
-- Conectar ao banco
psql -U postgres -d rsv_360_db

-- Verificar tabelas criadas
\dt

-- Verificar uma tabela específica
\d notification_queue
\d application_logs
\d credentials
```

---

## 🆘 Ainda com Problemas?

1. **Verifique se o PostgreSQL está instalado:**
   ```powershell
   Get-Service -Name "*postgresql*"
   ```

2. **Verifique se o serviço está rodando:**
   ```powershell
   Get-Service postgresql*
   ```

3. **Tente encontrar manualmente:**
   ```powershell
   Get-ChildItem -Path "C:\" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object FullName
   ```

4. **Use o caminho completo encontrado no script:**
   ```powershell
   .\scripts\executar-sql-scripts.ps1 -PSQLPath "C:\Program Files\PostgreSQL\18\bin\psql.exe"
   ```

---

**Documento criado:** 2025-01-30  
**Versão:** 1.0


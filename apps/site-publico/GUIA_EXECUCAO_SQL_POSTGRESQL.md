# 📘 GUIA PASSO A PASSO: EXECUTAR SCRIPTS SQL NO POSTGRESQL

## 🎯 OBJETIVO

Este guia mostra como executar todos os scripts SQL necessários para configurar o banco de dados do RSV 360° Ecosystem.

---

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- ✅ PostgreSQL instalado e rodando
- ✅ Acesso ao banco de dados `rsv_360_db`
- ✅ Credenciais de acesso (usuário e senha)
- ✅ Permissões para criar tabelas e índices

---

## 🔍 VERIFICAR INFORMAÇÕES DO BANCO

### 1. Verificar se o banco existe

```sql
-- Conecte-se ao PostgreSQL e execute:
\l
-- Procure por "rsv_360_db" na lista
```

### 2. Verificar usuário e permissões

```sql
-- Verificar usuário atual
SELECT current_user;

-- Verificar se tem permissões
SELECT has_database_privilege('rsv_360_db', 'CREATE');
```

---

## 📝 MÉTODO 1: USANDO psql (LINHA DE COMANDO)

### Passo 1: Abrir Terminal/Prompt de Comando

**Windows:**
- Pressione `Win + R`
- Digite `cmd` ou `powershell`
- Pressione Enter

**Linux/Mac:**
- Abra o Terminal

### Passo 2: Navegar até a pasta do projeto

```bash
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
```

### Passo 3: Conectar ao PostgreSQL

**Opção A: Com senha no comando (menos seguro)**
```bash
psql -U postgres -d rsv_360_db -W
# Digite a senha quando solicitado
```

**Opção B: Usando variável de ambiente (mais seguro)**
```bash
# Windows PowerShell
$env:PGPASSWORD="sua_senha_aqui"
psql -U postgres -d rsv_360_db

# Windows CMD
set PGPASSWORD=sua_senha_aqui
psql -U postgres -d rsv_360_db

# Linux/Mac
export PGPASSWORD="sua_senha_aqui"
psql -U postgres -d rsv_360_db
```

**Opção C: Usando arquivo .pgpass (mais seguro)**
```bash
# Criar arquivo ~/.pgpass (Linux/Mac) ou %APPDATA%\postgresql\pgpass.conf (Windows)
# Formato: hostname:port:database:username:password
# Exemplo:
localhost:5432:rsv_360_db:postgres:sua_senha_aqui

# Depois executar:
psql -U postgres -d rsv_360_db
```

### Passo 4: Executar os Scripts SQL

**IMPORTANTE:** Execute os scripts na ordem abaixo:

#### 4.1. Criar Índices (Performance)
```sql
\i scripts/create-database-indexes.sql
```

#### 4.2. Criar Tabela de Credenciais
```sql
\i scripts/create-credentials-table.sql
```

#### 4.3. Criar Tabela de Logs
```sql
\i scripts/create-logs-table.sql
```

#### 4.4. Criar Tabela de Fila de Notificações
```sql
\i scripts/create-notification-queue-table.sql
```

#### 4.5. Criar Tabela de Buscas Salvas
```sql
\i scripts/create-saved-searches-table.sql
```

#### 4.6. Criar Tabelas de 2FA (Autenticação de Dois Fatores)
```sql
\i scripts/create-2fa-tables.sql
```

#### 4.7. Criar Tabela de Logs de Auditoria
```sql
\i scripts/create-audit-logs-table.sql
```

#### 4.8. Criar Tabelas de LGPD (Compliance)
```sql
\i scripts/create-lgpd-tables.sql
```

#### 4.9. Criar Tabelas de Rate Limiting
```sql
\i scripts/create-rate-limit-tables.sql
```

### Passo 5: Verificar Execução

```sql
-- Verificar se as tabelas foram criadas
\dt

-- Verificar índices criados
\di

-- Verificar uma tabela específica
\d notification_queue
\d application_logs
\d credentials
```

### Passo 6: Sair do psql

```sql
\q
```

---

## 📝 MÉTODO 2: EXECUTAR DIRETAMENTE DO TERMINAL (SEM ENTRAR NO psql)

### Windows PowerShell

```powershell
# Definir senha (substitua pela sua senha)
$env:PGPASSWORD="sua_senha_aqui"

# Executar cada script
psql -U postgres -d rsv_360_db -f scripts/create-database-indexes.sql
psql -U postgres -d rsv_360_db -f scripts/create-credentials-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-logs-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-notification-queue-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-saved-searches-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-2fa-tables.sql
psql -U postgres -d rsv_360_db -f scripts/create-audit-logs-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-lgpd-tables.sql
psql -U postgres -d rsv_360_db -f scripts/create-rate-limit-tables.sql
```

### Windows CMD

```cmd
set PGPASSWORD=sua_senha_aqui

psql -U postgres -d rsv_360_db -f scripts/create-database-indexes.sql
psql -U postgres -d rsv_360_db -f scripts/create-credentials-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-logs-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-notification-queue-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-saved-searches-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-2fa-tables.sql
psql -U postgres -d rsv_360_db -f scripts/create-audit-logs-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-lgpd-tables.sql
psql -U postgres -d rsv_360_db -f scripts/create-rate-limit-tables.sql
```

### Linux/Mac

```bash
export PGPASSWORD="sua_senha_aqui"

psql -U postgres -d rsv_360_db -f scripts/create-database-indexes.sql
psql -U postgres -d rsv_360_db -f scripts/create-credentials-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-logs-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-notification-queue-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-saved-searches-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-2fa-tables.sql
psql -U postgres -d rsv_360_db -f scripts/create-audit-logs-table.sql
psql -U postgres -d rsv_360_db -f scripts/create-lgpd-tables.sql
psql -U postgres -d rsv_360_db -f scripts/create-rate-limit-tables.sql
```

---

## 📝 MÉTODO 3: USANDO pgAdmin (INTERFACE GRÁFICA)

### Passo 1: Abrir pgAdmin

1. Abra o pgAdmin 4
2. Conecte-se ao servidor PostgreSQL
3. Expanda o servidor → Databases → `rsv_360_db`

### Passo 2: Abrir Query Tool

1. Clique com botão direito em `rsv_360_db`
2. Selecione **Query Tool**

### Passo 3: Executar Scripts

Para cada script:

1. Clique em **File → Open**
2. Navegue até `scripts/` e selecione o arquivo `.sql`
3. Clique em **Execute** (F5) ou pressione `Ctrl + Enter`
4. Verifique a mensagem de sucesso na aba **Messages**

**Ordem de execução:**
1. `create-database-indexes.sql`
2. `create-credentials-table.sql`
3. `create-logs-table.sql`
4. `create-notification-queue-table.sql`
5. `create-saved-searches-table.sql`
6. `create-2fa-tables.sql`
7. `create-audit-logs-table.sql`
8. `create-lgpd-tables.sql`
9. `create-rate-limit-tables.sql`

### Passo 4: Verificar Tabelas Criadas

1. No painel esquerdo, expanda `rsv_360_db` → **Schemas** → **public** → **Tables**
2. Verifique se as seguintes tabelas foram criadas:
   - `credentials`
   - `application_logs`
   - `notification_queue`
   - `saved_searches`
   - `user_2fa` (e outras tabelas de 2FA)
   - `audit_logs`
   - `lgpd_consents` (e outras tabelas de LGPD)
   - `rate_limit_*` (tabelas de rate limiting)

---

## 📝 MÉTODO 4: SCRIPT AUTOMATIZADO (POWERSHELL)

Crie um arquivo `executar-sql-scripts.ps1`:

```powershell
# Script para executar todos os SQL scripts
# Uso: .\executar-sql-scripts.ps1

param(
    [string]$DBUser = "postgres",
    [string]$DBName = "rsv_360_db",
    [string]$DBPassword = ""
)

# Solicitar senha se não fornecida
if ([string]::IsNullOrEmpty($DBPassword)) {
    $securePassword = Read-Host "Digite a senha do PostgreSQL" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $DBPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Definir variável de ambiente
$env:PGPASSWORD = $DBPassword

# Lista de scripts na ordem de execução
$scripts = @(
    "create-database-indexes.sql",
    "create-credentials-table.sql",
    "create-logs-table.sql",
    "create-notification-queue-table.sql",
    "create-saved-searches-table.sql",
    "create-2fa-tables.sql",
    "create-audit-logs-table.sql",
    "create-lgpd-tables.sql",
    "create-rate-limit-tables.sql"
)

Write-Host "🚀 Iniciando execução de scripts SQL..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($script in $scripts) {
    $scriptPath = "scripts\$script"
    
    if (Test-Path $scriptPath) {
        Write-Host "📄 Executando: $script..." -ForegroundColor Yellow
        
        $result = psql -U $DBUser -d $DBName -f $scriptPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $script executado com sucesso!" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ Erro ao executar $script" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            $failCount++
        }
        Write-Host ""
    } else {
        Write-Host "⚠️ Arquivo não encontrado: $scriptPath" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO:" -ForegroundColor Cyan
Write-Host "   ✅ Sucesso: $successCount" -ForegroundColor Green
Write-Host "   ❌ Falhas: $failCount" -ForegroundColor Red
Write-Host "==================================================" -ForegroundColor Cyan

# Limpar senha da memória
$env:PGPASSWORD = ""
```

**Executar:**
```powershell
.\executar-sql-scripts.ps1
```

---

## ✅ VERIFICAÇÃO FINAL

Após executar todos os scripts, verifique se tudo foi criado corretamente:

### 1. Verificar Tabelas

```sql
-- Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'credentials',
    'application_logs',
    'notification_queue',
    'saved_searches',
    'user_2fa',
    'user_2fa_backup_codes',
    'audit_logs',
    'lgpd_consents',
    'lgpd_data_requests',
    'rate_limit_rules',
    'rate_limit_logs'
  )
ORDER BY table_name;
```

### 2. Verificar Índices

```sql
-- Contar índices criados
SELECT COUNT(*) as total_indices
FROM pg_indexes
WHERE schemaname = 'public';
```

### 3. Verificar Estrutura de uma Tabela

```sql
-- Ver estrutura da tabela notification_queue
\d notification_queue

-- Ver estrutura da tabela application_logs
\d application_logs
```

---

## 🚨 RESOLUÇÃO DE PROBLEMAS

### Erro: "password authentication failed"

**Solução:**
- Verifique se a senha está correta
- Verifique se o usuário tem permissões
- Tente usar `-h localhost` se estiver conectando remotamente

### Erro: "database does not exist"

**Solução:**
```sql
-- Criar o banco se não existir
CREATE DATABASE rsv_360_db;
```

### Erro: "permission denied"

**Solução:**
```sql
-- Conceder permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE rsv_360_db TO postgres;
```

### Erro: "relation already exists"

**Solução:**
- Este erro é normal se a tabela já existe
- Os scripts usam `CREATE TABLE IF NOT EXISTS`, então são seguros de executar novamente

### Erro: "syntax error"

**Solução:**
- Verifique se está usando a versão correta do PostgreSQL (recomendado: 12+)
- Verifique se o arquivo SQL não foi corrompido
- Tente executar o script linha por linha para identificar o problema

---

## 📊 LISTA COMPLETA DE SCRIPTS

| # | Script | Descrição | Prioridade |
|---|--------|-----------|------------|
| 1 | `create-database-indexes.sql` | Cria índices para otimização | 🔴 Alta |
| 2 | `create-credentials-table.sql` | Tabela de credenciais criptografadas | 🔴 Alta |
| 3 | `create-logs-table.sql` | Tabela de logs da aplicação | 🔴 Alta |
| 4 | `create-notification-queue-table.sql` | Fila de notificações assíncronas | 🟡 Média |
| 5 | `create-saved-searches-table.sql` | Buscas salvas pelos usuários | 🟡 Média |
| 6 | `create-2fa-tables.sql` | Autenticação de dois fatores | 🟡 Média |
| 7 | `create-audit-logs-table.sql` | Logs de auditoria | 🟢 Baixa |
| 8 | `create-lgpd-tables.sql` | Compliance LGPD | 🟢 Baixa |
| 9 | `create-rate-limit-tables.sql` | Rate limiting | 🟢 Baixa |

---

## 🎯 PRÓXIMOS PASSOS

Após executar todos os scripts SQL:

1. ✅ Verificar se todas as tabelas foram criadas
2. ✅ Configurar variáveis de ambiente (já feito)
3. ✅ Iniciar o servidor: `npm run dev`
4. ✅ Executar testes: `npm test`

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique os logs do PostgreSQL
2. Verifique se todas as dependências estão instaladas
3. Consulte a documentação do PostgreSQL
4. Verifique o arquivo `RESULTADO_EXECUCAO.md` para mais detalhes

---

**Documento criado:** 2025-01-30  
**Versão:** 1.0  
**Última atualização:** 2025-01-30


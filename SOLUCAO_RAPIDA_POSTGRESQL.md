# 🚨 SOLUÇÃO RÁPIDA: PostgreSQL Não Inicia

**Problema:** O serviço PostgreSQL não consegue iniciar - fica em loop de inicialização

---

## ✅ SOLUÇÃO AUTOMÁTICA (Recomendado)

Execute o script de reparação:

```powershell
# Navegar para o diretório
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

# Executar como Administrador
.\REPARAR_POSTGRESQL.ps1
```

Este script irá:
1. ✅ Parar o serviço completamente
2. ✅ Remover arquivo de lock (postmaster.pid)
3. ✅ Corrigir pg_hba.conf temporariamente
4. ✅ Iniciar o serviço
5. ✅ Alterar a senha para `290491Bb`
6. ✅ Reverter para modo seguro

---

## 🔧 SOLUÇÃO MANUAL (Se o script não funcionar)

### Passo 1: Parar o Serviço

```powershell
# Executar como Administrador
Stop-Service -Name "postgresql-x64-18" -Force
```

### Passo 2: Remover Arquivo de Lock

```powershell
# Remover arquivo que impede inicialização
Remove-Item "C:\Program Files\PostgreSQL\18\data\postmaster.pid" -Force -ErrorAction SilentlyContinue
```

### Passo 3: Verificar Logs para Erros

```powershell
# Ver últimos erros
Get-Content "C:\Program Files\PostgreSQL\18\data\log\*.log" -Tail 20 | Select-String -Pattern "FATAL|ERROR"
```

### Passo 4: Tentar Iniciar Manualmente

```powershell
# Iniciar serviço
Start-Service -Name "postgresql-x64-18"

# Aguardar alguns segundos
Start-Sleep -Seconds 10

# Verificar status
Get-Service -Name "postgresql-x64-18"
```

---

## 🔍 VERIFICAR PROBLEMAS COMUNS

### 1. Arquivo de Lock Bloqueando

O arquivo `postmaster.pid` pode estar bloqueando a inicialização:

```powershell
# Verificar se existe
Test-Path "C:\Program Files\PostgreSQL\18\data\postmaster.pid"

# Remover se existir
Remove-Item "C:\Program Files\PostgreSQL\18\data\postmaster.pid" -Force
```

### 2. Porta 5432 em Uso

```powershell
# Verificar o que está usando a porta
Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue

# Se houver outro processo, pare-o
```

### 3. Permissões do Diretório

```powershell
# Verificar permissões
$acl = Get-Acl "C:\Program Files\PostgreSQL\18\data"
$acl.Owner
```

### 4. Arquivo pg_hba.conf Corrompido

```powershell
# Fazer backup
Copy-Item "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"

# Verificar conteúdo
Get-Content "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" | Select-String -Pattern "127.0.0.1"
```

---

## 🆘 SE NADA FUNCIONAR

### Opção 1: Reinstalar PostgreSQL

1. Desinstalar via Painel de Controle
2. Remover diretório: `C:\Program Files\PostgreSQL\18`
3. Reinstalar PostgreSQL 18
4. **ANOTAR A SENHA** durante a instalação!

### Opção 2: Usar pgAdmin para Conectar

1. Abra o **pgAdmin 4**
2. Tente conectar ao servidor
3. Se pedir senha, tente:
   - `290491Bb`
   - `postgres`
   - Deixar em branco

### Opção 3: Verificar Event Viewer

```powershell
# Ver eventos do Windows relacionados ao PostgreSQL
Get-EventLog -LogName Application -Source "PostgreSQL*" -Newest 10
```

---

## 📋 SENHAS PARA TESTAR

Baseado na documentação encontrada:

1. **`290491Bb`** - Senha documentada
2. **`postgres`** - Padrão comum
3. **Deixar em branco** - Se configurado sem senha

---

## ✅ APÓS RESOLVER

Teste a conexão:

```powershell
# Via psql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres

# Ou via pgAdmin
# Abra pgAdmin 4 e conecte ao servidor
```

---

**Última Atualização:** 2026-01-02


# 🔍 PROBLEMA IDENTIFICADO: Porta 5432 Ocupada

**Data:** 2026-01-05  
**Erro:** `FATAL: não foi possível criar nenhum soquete TCP/IP`

---

## ❌ CAUSA DO PROBLEMA

A porta **5432** está sendo usada por outros processos:

1. **Docker** (`com.docker.backend` - PID 12588)
2. **WSL Relay** (`wslrelay` - PID 4532)

Isso impede o PostgreSQL de iniciar.

---

## ✅ SOLUÇÕES

### **Opção 1: Parar Docker (Recomendado se não estiver usando)**

```powershell
# Parar Docker Desktop
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Stop-Process -Id 12588 -Force -ErrorAction SilentlyContinue

# Verificar se a porta foi liberada
Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
```

### **Opção 2: Mudar Porta do PostgreSQL**

Se você precisa do Docker rodando, mude a porta do PostgreSQL:

1. **Editar postgresql.conf:**
   ```powershell
   # Abrir arquivo
   notepad "C:\Program Files\PostgreSQL\18\data\postgresql.conf"
   ```

2. **Alterar a linha:**
   ```
   port = 5432
   ```
   Para:
   ```
   port = 5433
   ```

3. **Salvar e tentar iniciar novamente:**
   ```powershell
   Start-Service -Name "postgresql-x64-18"
   ```

### **Opção 3: Verificar se Docker está usando PostgreSQL**

Se o Docker estiver rodando um container PostgreSQL, você pode:

1. **Listar containers:**
   ```powershell
   docker ps -a
   ```

2. **Parar container PostgreSQL do Docker:**
   ```powershell
   docker stop <container_id>
   ```

3. **Ou mudar a porta do container Docker:**
   ```powershell
   docker run -p 5434:5432 postgres
   ```

---

## 🔍 VERIFICAR QUAL PROCESSO ESTÁ USANDO A PORTA

```powershell
# Ver processos usando porta 5432
Get-NetTCPConnection -LocalPort 5432 | Select-Object OwningProcess, @{Name='ProcessName';Expression={(Get-Process -Id $_.OwningProcess).ProcessName}}

# Ou via netstat
netstat -ano | findstr ":5432"
```

---

## ✅ APÓS RESOLVER

Teste se o PostgreSQL inicia:

```powershell
# Tentar iniciar
Start-Service -Name "postgresql-x64-18"

# Verificar status
Get-Service -Name "postgresql-x64-18"

# Testar conexão (se mudou a porta, use -p 5433)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -p 5433
```

---

## 📋 RESUMO

- **Problema:** Porta 5432 ocupada por Docker/WSL
- **Solução 1:** Parar Docker (mais simples)
- **Solução 2:** Mudar porta do PostgreSQL para 5433
- **Solução 3:** Parar container PostgreSQL do Docker

**Recomendação:** Se você não está usando Docker no momento, pare o Docker. Se estiver usando, mude a porta do PostgreSQL para 5433.

---

**Última Atualização:** 2026-01-05


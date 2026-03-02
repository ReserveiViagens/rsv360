# 🚀 SERVIDORES INICIADOS

**Data:** 2026-01-05  
**Status:** ✅ **SERVIDORES EM EXECUÇÃO**

---

## ✅ SERVIDORES ATIVOS

### 1. ✅ Backend API
- **Status:** ✅ Rodando
- **Porta:** 5000
- **URL:** http://localhost:5000
- **Diretório:** `backend/`
- **Comando:** `npm run dev`

### 2. ✅ Frontend (Dashboard de Turismo)
- **Status:** ✅ Rodando
- **Porta:** 3005
- **URL:** http://localhost:3005
- **Diretório:** `apps/turismo/`
- **Comando:** `npm run dev`

### 3. ✅ PostgreSQL
- **Status:** ✅ Rodando
- **Porta:** 5433
- **Database:** rsv360
- **Usuário:** postgres
- **Senha:** 290491Bb

---

## 🔗 ACESSO RÁPIDO

### Backend API:
```
http://localhost:5000
```

### Frontend Dashboard:
```
http://localhost:3005
```

### Dashboard de Leilões:
```
http://localhost:3005/dashboard/modulos-turismo
```

---

## 📋 VERIFICAR STATUS

### Verificar se os servidores estão rodando:

```powershell
# Verificar portas
Get-NetTCPConnection -LocalPort 5000,3005,5433 -ErrorAction SilentlyContinue | Select-Object LocalPort, State

# Testar Backend
Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 3

# Testar Frontend
Invoke-WebRequest -Uri "http://localhost:3005" -TimeoutSec 3
```

### Verificar processos Node.js:

```powershell
Get-Process -Name node | Select-Object Id, ProcessName, StartTime
```

---

## 🛑 PARAR SERVIDORES

### Parar Backend:
```powershell
# Encontrar processo
Get-Process -Name node | Where-Object { $_.Path -like "*backend*" }

# Parar (substitua PID pelo ID do processo)
Stop-Process -Id <PID> -Force
```

### Parar Frontend:
```powershell
# Encontrar processo
Get-Process -Name node | Where-Object { $_.Path -like "*turismo*" }

# Parar (substitua PID pelo ID do processo)
Stop-Process -Id <PID> -Force
```

### Parar Todos os Servidores Node.js:
```powershell
Stop-Process -Name node -Force
```

---

## 📝 LOGS

Os logs dos servidores aparecem nas janelas do PowerShell onde foram iniciados.

### Backend:
- Logs aparecem no console do PowerShell
- Verificar erros de conexão com banco de dados
- Verificar se as rotas estão funcionando

### Frontend:
- Logs aparecem no console do PowerShell
- Verificar erros de compilação
- Verificar se o Next.js está compilando corretamente

---

## ✅ PRÓXIMOS PASSOS

1. **Acessar o Dashboard:**
   - Abra o navegador em: http://localhost:3005
   - Navegue para: http://localhost:3005/dashboard/modulos-turismo
   - O módulo de Leilões já estará ativo por padrão

2. **Testar APIs do Backend:**
   - Acesse: http://localhost:5000
   - Verifique rotas disponíveis

3. **Verificar Conexão com Banco:**
   - O backend deve estar conectado ao PostgreSQL na porta 5433
   - Verifique logs do backend para confirmar conexão

---

## 🔍 TROUBLESHOOTING

### Backend não inicia:
- Verifique se a porta 5000 está livre
- Verifique se o arquivo `.env` está configurado corretamente
- Verifique logs no console

### Frontend não inicia:
- Verifique se a porta 3005 está livre
- Verifique se as dependências estão instaladas (`npm install`)
- Verifique logs no console

### Erro de conexão com banco:
- Verifique se PostgreSQL está rodando na porta 5433
- Verifique se o arquivo `.env` tem as configurações corretas
- Teste conexão manual: `psql -U postgres -p 5433 -d rsv360`

---

**Última Atualização:** 2026-01-05  
**Status:** ✅ Servidores iniciados e rodando


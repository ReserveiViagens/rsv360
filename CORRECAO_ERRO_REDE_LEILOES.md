# 🔧 Correção: Erro de Rede no Sistema de Leilões

**Data:** 2025-01-05

---

## 🔍 Problema Identificado

### Erro
```
AxiosError: Network Error
GET /api/v1/leiloes
```

### Causas

1. **Backend não está rodando**
   - O frontend tenta conectar em `http://localhost:5000/api/v1/leiloes`
   - O backend não está respondendo na porta 5000

2. **CORS não configurado para porta 3005**
   - O CORS estava configurado apenas para portas 3000 e 3001
   - A porta 3005 (Dashboard Turismo) não estava incluída

---

## ✅ Soluções Aplicadas

### 1. CORS Atualizado

**Arquivo:** `backend/src/server.js`

**Antes:**
```javascript
origin: ["http://localhost:3000", "http://localhost:3001"]
```

**Depois:**
```javascript
origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3005"]
```

---

## 🚀 Como Resolver

### Passo 1: Iniciar o Backend

```powershell
cd backend
npm run dev
```

**Verificar se está rodando:**
```powershell
Get-NetTCPConnection -LocalPort 5000
```

**Deve mostrar:**
- ✅ Porta 5000 em uso
- ✅ PID do processo Node.js

### Passo 2: Verificar Rotas

O backend deve ter as seguintes rotas registradas:
- ✅ `/api/v1/leiloes` - Sistema de leilões
- ✅ `/api/v1/excursoes` - Sistema de excursões
- ✅ `/api/v1/viagens-grupo` - Sistema de viagens em grupo

**Verificar no `server.js`:**
```javascript
checkAndUseRoute("/api/v1/leiloes", leiloesRoutes, true);
checkAndUseRoute("/api/v1/excursoes", excursoesRoutes, true);
checkAndUseRoute("/api/v1/viagens-grupo", viagensGrupoRoutes, true);
```

### Passo 3: Testar Conexão

Após iniciar o backend, acesse:
- **Frontend:** http://localhost:3005/dashboard/leiloes
- **Backend Health:** http://localhost:5000/health

---

## 🔍 Verificação

### 1. Backend Rodando?

```powershell
# Verificar porta 5000
Get-NetTCPConnection -LocalPort 5000

# Ou testar conexão
Test-NetConnection -ComputerName localhost -Port 5000
```

### 2. CORS Configurado?

Verificar em `backend/src/server.js`:
```javascript
origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3005"]
```

### 3. Rotas Registradas?

Verificar logs do backend ao iniciar:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

---

## 📋 Checklist

- [x] CORS atualizado para incluir porta 3005
- [ ] Backend iniciado na porta 5000
- [ ] Rotas de leilões registradas
- [ ] Testar conexão do frontend

---

## 🚨 Se o Erro Persistir

### 1. Verificar Backend

```powershell
cd backend
npm run dev
```

**Procurar por:**
- ✅ "Server running on port 5000"
- ✅ "Database connected successfully"
- ❌ "Port 5000 is already in use" (porta ocupada)

### 2. Verificar Porta Ocupada

```powershell
# Ver processos na porta 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess

# Parar processo se necessário
Stop-Process -Id <PID>
```

### 3. Verificar Logs do Backend

Procurar por erros ao iniciar:
- Erro de conexão com banco de dados
- Erro ao registrar rotas
- Erro de módulos não encontrados

---

## 📝 Arquivos Modificados

### `backend/src/server.js`
- ✅ CORS atualizado para incluir `http://localhost:3005`

---

## 🎯 Resumo

**Problema:** Backend não está rodando + CORS não incluía porta 3005

**Solução:**
1. ✅ CORS atualizado
2. ⏳ **Iniciar backend** (próximo passo)

**Status:** ✅ CORS corrigido | ⏳ Aguardando backend iniciar

---

**Última atualização:** 2025-01-05


# ✅ INSTRUÇÕES PÓS-INICIALIZAÇÃO

**Data:** 02/12/2025  
**Status:** ⏳ Servidores Iniciando

---

## 🚀 SERVIDORES SENDO INICIADOS

O script `iniciarsistemacrmesite.ps1` está executando e iniciando:

1. **Sistema (Dashboard)** - Porta 3001
2. **CRM e Site** - Porta 3000
3. **Backend Principal** - Porta 5000
4. **Backend Admin APIs** - Porta 5002

---

## ⏱️ TEMPO DE ESPERA

**Aguardar:** 1-2 minutos para todos os servidores iniciarem completamente

---

## ✅ VERIFICAÇÃO APÓS 1-2 MINUTOS

### 1. Verificar se Servidores Estão Rodando

Abra uma nova janela PowerShell e execute:
```powershell
Get-NetTCPConnection -LocalPort 3000,3001,5000,5002 -ErrorAction SilentlyContinue | 
  Select-Object LocalPort, State, @{Name='Process';Expression={(Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).ProcessName}}
```

**Esperado:** 4 portas em estado `Listen`

### 2. Testar URLs

#### Backend Principal
- ✅ `http://localhost:5000/` - Deve retornar JSON com informações
- ✅ `http://localhost:5000/health` - Deve retornar status OK

#### Site e CRM
- ✅ `http://localhost:3000/` - Homepage deve carregar
- ✅ `http://localhost:3000/hoteis` - **CRÍTICO** - Deve carregar sem erros
- ✅ `http://localhost:3000/admin/cms` - CMS deve carregar sem erros

#### Dashboard
- ✅ `http://localhost:3001/dashboard` - Dashboard deve carregar

---

## 🧪 TESTE CRÍTICO - PÁGINA DE HOTÉIS

### URL: `http://localhost:3000/hoteis`

### O que verificar:
- [ ] Página carrega completamente
- [ ] **Sem erros de `Cannot read properties of undefined (reading 'call')`**
- [ ] Todos os ícones exibem corretamente
- [ ] Mapas funcionam (se aplicável)
- [ ] Filtros funcionam
- [ ] Console sem erros críticos

### Se houver erro:
1. Verificar se servidor foi reiniciado após correções
2. Limpar cache do navegador (Ctrl+Shift+Delete)
3. Verificar console do navegador para erros específicos

---

## 📋 PRÓXIMOS PASSOS

### Se tudo estiver funcionando:
1. ✅ Testar outras páginas críticas
2. ✅ Executar script de migração automática:
   ```powershell
   cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
   .\scripts\migrar-todos-lucide-imports.ps1
   ```
3. ✅ Verificar se há ícones faltantes
4. ✅ Adicionar ícones ao barrel file se necessário

### Se houver erros:
1. Verificar qual página está com erro
2. Verificar console do navegador
3. Verificar se o arquivo foi migrado corretamente
4. Adicionar ícones faltantes ao barrel file se necessário

---

## 🔍 VERIFICAÇÃO DE ERROS

### Console do Navegador (F12)
Verificar se há:
- ❌ `ChunkLoadError`
- ❌ `Cannot read properties of undefined (reading 'call')`
- ❌ `is not exported from '@/lib/lucide-icons'`
- ❌ `require is not defined`
- ❌ Erros de CSP

### Se encontrar erros:
1. Identificar qual componente está causando o erro
2. Verificar se está usando o barrel file
3. Migrar se necessário
4. Adicionar ícones faltantes ao barrel file

---

## 📊 STATUS ESPERADO

### Após 1-2 minutos:
```
✅ Sistema (Dashboard) - http://localhost:3001/dashboard
✅ CRM Admin - http://localhost:3000/admin/cms
✅ Site - http://localhost:3000/
✅ Backend Principal - http://localhost:5000/
✅ Backend Admin APIs - http://localhost:5002
```

### Correções Aplicadas:
- ✅ Página de hotéis migrada
- ✅ CSP corrigido
- ✅ Cache limpo
- ✅ Backend com rota raiz

---

**Versão:** 1.0  
**Data:** 02/12/2025  
**Status:** ⏳ Aguardando Inicialização Completa


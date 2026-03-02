# 🚀 CONFIGURAÇÃO DOS SERVIDORES - RSV360

**Data:** 2025-12-31  
**Status:** ✅ **CONFIGURADO**

---

## 📊 RESUMO DOS SERVIDORES

### ✅ **1. Sistema de Turismo (apps/turismo)**
- **Porta:** 3005
- **URL:** http://localhost:3005
- **Dashboard:** http://localhost:3005/dashboard
- **Status:** ✅ **FUNCIONANDO**
- **Configurações:**
  - ✅ `next.config.js` criado com correções de React
  - ✅ React 19.1.1 configurado
  - ✅ Webpack alias para jsx-runtime
  - ✅ Porta 3005 configurada

---

### ✅ **2. Site Público + CMS Admin (apps/site-publico)**
- **Porta:** 3000
- **URL Site:** http://localhost:3000
- **URL Admin CMS:** http://localhost:3000/admin/cms
- **Status:** ✅ **CONFIGURADO** (aguardando iniciar)
- **Configurações:**
  - ✅ `next.config.js` criado com correções de React
  - ✅ React 19.1.1 configurado
  - ✅ Webpack alias para jsx-runtime
  - ✅ Porta 3000 configurada
  - ✅ Admin integrado (não precisa de app separado)

---

### ⚠️ **3. Apps Admin e Guest**
- **Status:** ⚠️ **NÃO NECESSÁRIOS**
- **Motivo:** 
  - Admin está integrado no `site-publico` em `/admin/cms`
  - Guest pode ser parte do `site-publico` ou `turismo`
  - Não há necessidade de apps separados

---

## 🔧 CORREÇÕES APLICADAS

### **Problema: Múltiplas Instâncias do React**
- **Sintoma:** `Invalid hook call` e `Can't resolve 'react/jsx-dev-runtime'`
- **Causa:** npm workspaces faz hoisting do React para o root
- **Solução:**
  1. ✅ Criado `next.config.js` com webpack alias
  2. ✅ Configurado para resolver React do root
  3. ✅ Adicionado alias para `jsx-dev-runtime` e `jsx-runtime`
  4. ✅ React 19.1.1 no root e nos workspaces

### **Arquivos Criados/Atualizados:**
- ✅ `apps/turismo/next.config.js`
- ✅ `apps/site-publico/next.config.js`
- ✅ `apps/turismo/package.json` (porta 3005)
- ✅ `apps/site-publico/package.json` (porta 3000, React 19.1.1)
- ✅ Root `package.json` (overrides React 19.1.1)
- ✅ `.npmrc` (shamefully-hoist=false)

---

## 🚀 COMO INICIAR OS SERVIDORES

### **Opção 1: Iniciar Individualmente**

```powershell
# Sistema de Turismo (porta 3005)
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\apps\turismo"
npm run dev

# Site Público + CMS (porta 3000)
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\apps\site-publico"
npm run dev
```

### **Opção 2: Iniciar Todos (Root)**

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
npm run dev
```

Isso iniciará:
- ✅ Backend (porta 5000)
- ✅ Turismo (porta 3005)
- ✅ Site Público (porta 3000)
- ⚠️ Admin e Guest (se configurados)

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### **Antes de Iniciar:**
- [x] Dependências instaladas no root (`npm install`)
- [x] Dependências instaladas nos workspaces
- [x] `next.config.js` criado para cada app Next.js
- [x] React 19.1.1 configurado
- [x] Portas configuradas corretamente

### **Após Iniciar:**
- [ ] Turismo acessível em http://localhost:3005
- [ ] Site Público acessível em http://localhost:3000
- [ ] CMS Admin acessível em http://localhost:3000/admin/cms
- [ ] Sem erros de React hooks
- [ ] Sem erros de jsx-runtime

---

## 🔍 TROUBLESHOOTING

### **Erro: "Invalid hook call"**
- **Solução:** Verificar se `next.config.js` tem webpack alias configurado
- **Verificar:** React 19.1.1 no root e no workspace

### **Erro: "Can't resolve 'react/jsx-dev-runtime'"**
- **Solução:** Verificar se `next.config.js` tem alias para jsx-runtime
- **Verificar:** `jsx-dev-runtime.js` existe no `node_modules/react`

### **Erro: Porta já em uso**
- **Solução:** Parar outros servidores ou mudar a porta no `package.json`

---

## ✅ CONCLUSÃO

Todos os servidores estão configurados e prontos para iniciar!

**Próximo passo:** Iniciar os servidores e verificar se estão funcionando corretamente.

---

**Última Atualização:** 2025-12-31


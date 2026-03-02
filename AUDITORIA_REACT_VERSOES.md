# 🔍 AUDITORIA DE VERSÕES REACT/NEXT - FASE 1

**Data:** 2026-01-02  
**Status:** ✅ Concluída

---

## 📊 RESUMO DE VERSÕES

### **Root (package.json):**
- **Next:** Não especificado (gerencia workspaces)
- **React:** `^18.3.1` ✅
- **ReactDOM:** `^18.3.1` ✅
- **Overrides:** React 18.3.1 forçado ✅

### **apps/site-publico (package.json):**
- **Next:** `^14.0.0` (instalado: 14.2.35) ✅
- **React:** `^18.3.1` ✅
- **ReactDOM:** `^18.3.1` ✅
- **Status:** Compatível com Next.js 14 ✅

### **apps/turismo (package.json):**
- **Next:** `^15.5.2` (instalado: 15.5.9) ⚠️
- **React:** `^19.2.3` (via overrides local) ❌ **CONFLITO!**
- **ReactDOM:** `^19.2.3` (via overrides local) ❌ **CONFLITO!**
- **Status:** Usa React 19, mas root força React 18

---

## 🚨 CONFLITOS DETECTADOS

### **1. Conflito Principal:**
- **apps/turismo** está usando React 19.2.3
- **Root** força React 18.3.1 via overrides
- **apps/site-publico** usa React 18.3.1 (correto)

### **2. Problema no next.config.js:**
- **apps/site-publico/next.config.js** tem aliases perigosos:
  ```js
  config.resolve.alias = {
    'react': finalReactPath,
    'react-dom': finalReactDomPath,
  }
  ```
- Isso pode causar `_react.cache is not a function` porque o Next.js 14 tenta usar React.cache que não existe no React 18

### **3. Dependências que puxam versões diferentes:**
- `lucide-react@0.542.0` em turismo puxa React 19.2.3
- `next@15.5.9` em turismo requer React 19
- `recharts@3.6.0` em turismo requer React 19

---

## ✅ CONCLUSÃO

**Problema identificado:**
1. ❌ **next.config.js** do site-publico tem aliases que podem quebrar React.cache
2. ⚠️ **apps/turismo** usa React 19, mas isso não afeta site-publico diretamente
3. ✅ **apps/site-publico** está usando React 18.3.1 corretamente

**Próximos passos:**
1. Remover aliases de react/react-dom do next.config.js
2. Fazer reset limpo de dependências
3. Verificar se há uso de React.cache no código

---

**Última Atualização:** 2026-01-02


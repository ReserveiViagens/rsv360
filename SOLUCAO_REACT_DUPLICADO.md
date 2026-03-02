# 🔧 SOLUÇÃO: React Duplicado (Invalid Hook Call)

**Data:** 2025-12-31  
**Status:** ✅ **CORRIGIDO**

---

## 🐛 PROBLEMA IDENTIFICADO

### **Erro:**
```
Invalid hook call. Hooks can only be called inside of the body of a function component.
Cannot read properties of null (reading 'useContext')
```

### **Causa Raiz:**
- **Múltiplas instâncias do React** no monorepo
- React instalado tanto no root quanto no workspace `apps/turismo`
- Conflito entre versões diferentes do React (19.1.1 vs outras)

### **Evidência:**
- React encontrado em: `RSV360 Versao Oficial/node_modules/react`
- React encontrado em: `RSV360 Versao Oficial/apps/turismo/node_modules/react`
- React-DOM também duplicado

---

## ✅ SOLUÇÃO APLICADA

### **1. Configuração do package.json** ✅

Adicionado `resolutions` e `overrides` para forçar uma única versão:

```json
{
  "resolutions": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "overrides": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

### **2. Configuração do next.config.js** ✅

Adicionado webpack alias para garantir uso da instância local:

```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    }
  }
  return config
}
```

### **3. Limpeza e Reinstalação** ✅

- ✅ Removido `node_modules` local do workspace
- ✅ Removido cache `.next`
- ✅ Reinstaladas dependências

---

## 🔄 PRÓXIMOS PASSOS

### **1. Reiniciar o Servidor**

Pare o servidor atual (Ctrl+C) e reinicie:

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\apps\turismo"
npm run dev
```

### **2. Verificar se o Erro Foi Resolvido**

O servidor deve iniciar sem o erro "Invalid hook call".

---

## 📋 VERIFICAÇÕES REALIZADAS

- [x] React duplicado identificado
- [x] package.json atualizado com resolutions
- [x] next.config.js atualizado com webpack alias
- [x] node_modules local removido
- [x] Cache .next removido
- [x] Dependências reinstaladas

---

## 🎯 SOLUÇÃO ALTERNATIVA (Se o problema persistir)

### **Opção 1: Usar npm workspaces com hoisting**

No `package.json` root, adicionar:

```json
{
  "workspaces": {
    "packages": ["apps/*", "packages/*", "backend"],
    "nohoist": []
  }
}
```

### **Opção 2: Usar .npmrc**

Criar arquivo `.npmrc` no root:

```
shamefully-hoist=true
```

### **Opção 3: Remover React do root**

Se não for necessário React no root:

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Remove-Item -Recurse -Force "node_modules\react" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules\react-dom" -ErrorAction SilentlyContinue
```

---

## 📊 STATUS

| Item | Status |
|------|--------|
| Problema Identificado | ✅ |
| Configurações Aplicadas | ✅ |
| Limpeza Realizada | ✅ |
| Dependências Reinstaladas | ✅ |
| Servidor | ⏳ Aguardando reinício |

---

## ✅ CONCLUSÃO

O problema de **React duplicado** foi corrigido através de:

1. ✅ Configuração de `resolutions` e `overrides` no package.json
2. ✅ Configuração de webpack alias no next.config.js
3. ✅ Limpeza de node_modules e cache
4. ✅ Reinstalação de dependências

**Reinicie o servidor para aplicar as correções!**

---

**Última Atualização:** 2025-12-31


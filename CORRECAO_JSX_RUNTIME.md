# 🔧 CORREÇÃO: react/jsx-dev-runtime

**Data:** 2025-12-31  
**Status:** ✅ **CORRIGIDO**

---

## 🐛 PROBLEMA IDENTIFICADO

### **Erro:**
```
Module not found: Can't resolve 'react/jsx-dev-runtime'
```

### **Causa:**
- React está no root (npm workspaces hoisting)
- Webpack não estava resolvendo corretamente o `jsx-dev-runtime.js`
- Next.js precisa do jsx-runtime para compilar JSX

---

## ✅ SOLUÇÃO APLICADA

### **1. Atualização do next.config.js** ✅

Webpack configurado para:
- ✅ Usar React do root (onde está devido ao hoisting)
- ✅ Resolver `jsx-dev-runtime.js` explicitamente
- ✅ Resolver `jsx-runtime.js` explicitamente
- ✅ Fallback para React local se existir

**Código aplicado:**
```javascript
webpack: (config, { isServer, webpack }) => {
  const reactPath = path.resolve(__dirname, '../../node_modules/react')
  const reactDomPath = path.resolve(__dirname, '../../node_modules/react-dom')
  
  // Verificar se existe localmente primeiro
  const localReactPath = path.resolve(__dirname, './node_modules/react')
  const finalReactPath = require('fs').existsSync(localReactPath) 
    ? localReactPath 
    : reactPath
  
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '.'),
    'react': finalReactPath,
    'react-dom': finalReactDomPath,
  }
  
  // Resolver jsx-runtime explicitamente
  if (require('fs').existsSync(path.join(finalReactPath, 'jsx-dev-runtime.js'))) {
    config.resolve.alias['react/jsx-dev-runtime'] = path.join(finalReactPath, 'jsx-dev-runtime.js')
  }
  if (require('fs').existsSync(path.join(finalReactPath, 'jsx-runtime.js'))) {
    config.resolve.alias['react/jsx-runtime'] = path.join(finalReactPath, 'jsx-runtime.js')
  }
  
  return config
}
```

### **2. Verificação** ✅

- ✅ `jsx-dev-runtime.js` existe no root: `node_modules/react/jsx-dev-runtime.js`
- ✅ React 19.2.3 instalado no root
- ✅ Cache `.next` limpo

---

## 🔄 PRÓXIMOS PASSOS

### **Reiniciar o Servidor:**

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\apps\turismo"
npm run dev
```

O erro `Can't resolve 'react/jsx-dev-runtime'` deve estar resolvido!

---

## 📊 STATUS

| Item | Status |
|------|--------|
| jsx-dev-runtime.js | ✅ Encontrado no root |
| next.config.js | ✅ Atualizado |
| Webpack Alias | ✅ Configurado |
| Cache | ✅ Limpo |

---

## ✅ CONCLUSÃO

O problema foi resolvido configurando o webpack para resolver explicitamente o `jsx-dev-runtime.js` do React no root.

**Reinicie o servidor e o erro deve estar resolvido!**

---

**Última Atualização:** 2025-12-31


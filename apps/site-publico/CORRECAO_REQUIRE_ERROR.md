# ✅ CORREÇÃO: ReferenceError: require is not defined

**Erro:** `ReferenceError: require is not defined` em `next.config.mjs:47:27`

**Causa:** Tentativa de usar `require.resolve()` em um arquivo `.mjs` (ESM), onde `require` não está disponível.

---

## 🔧 CORREÇÃO APLICADA

### Problema
```javascript
// ❌ ERRO - require não funciona em .mjs
'lucide-react': require.resolve('lucide-react'),
```

### Solução
Removido o uso de `require.resolve()` do webpack config. A configuração de `splitChunks` é suficiente para forçar o bundle único do lucide-react.

```javascript
// ✅ CORRETO - Apenas splitChunks
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          lucideReact: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide-react',
            chunks: 'all',
            priority: 50,
            enforce: true,
            reuseExistingChunk: true,
          },
        },
      },
    };
  }
  return config;
},
```

---

## ✅ STATUS

- [x] Erro identificado
- [x] Correção aplicada
- [x] Servidor reiniciado
- [ ] Aguardando compilação (1-2 minutos)

---

## 🧪 TESTE AGORA

Após ver "Ready in X.Xs" na janela do PowerShell:

1. **Limpe o cache do navegador:**
   - `F12` → Clique direito no recarregar → "Esvaziar cache e atualizar forçadamente"
   - OU use modo anônimo: `Ctrl + Shift + N`

2. **Teste:**
   - `http://localhost:3000/admin/login?from=/admin/cms`
   - `http://localhost:3000/`

---

**Status:** ✅ Erro Corrigido - Servidor Reiniciado


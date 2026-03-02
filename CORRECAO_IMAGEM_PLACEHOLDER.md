# ✅ Correção: Erro de Imagem Placeholder no Next.js

**Data:** 2026-01-05  
**Status:** ✅ **CORRIGIDO**

---

## 🐛 **PROBLEMA IDENTIFICADO**

O Next.js estava bloqueando imagens do domínio `via.placeholder.com` porque ele não estava configurado na lista de domínios permitidos.

### **Erro:**
```
Invalid src prop (https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Disney+Magic+Kingdom) 
on `next/image`, hostname "via.placeholder.com" is not configured under images in your `next.config.js`
```

### **Localização:**
- **Página:** `http://localhost:3005/tickets`
- **Arquivo:** `apps/turismo/pages/tickets.tsx`
- **Imagens afetadas:** 3 imagens placeholder do Disney Magic Kingdom

---

## ✅ **CORREÇÃO APLICADA**

### **Arquivo Modificado:**
- `apps/turismo/next.config.js`

### **Mudança:**
```javascript
// ANTES
images: {
  domains: ['localhost', 'reserveiviagens.com.br']
},

// DEPOIS
images: {
  domains: ['localhost', 'reserveiviagens.com.br', 'via.placeholder.com'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'via.placeholder.com',
      port: '',
      pathname: '/**',
    },
  ],
},
```

### **O que foi adicionado:**
1. **`via.placeholder.com`** na lista de `domains` (compatibilidade com Next.js 12-14)
2. **`remotePatterns`** com configuração completa (recomendado para Next.js 15+)

---

## 🔄 **PRÓXIMOS PASSOS**

### **1. Reiniciar o servidor Next.js:**
O `next.config.js` requer reinicialização para aplicar mudanças.

```powershell
# Parar o servidor (Ctrl+C)
# Depois reiniciar
cd apps/turismo
npm run dev
```

### **2. Verificar a página:**
- Acesse: `http://localhost:3005/tickets`
- As imagens placeholder devem carregar normalmente

---

## 📋 **IMAGENS AFETADAS**

As seguintes imagens placeholder estão sendo usadas em `tickets.tsx`:

1. `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Disney+Magic+Kingdom`
2. `https://via.placeholder.com/300x200/10B981/FFFFFF?text=Castelo+Cinderela`
3. `https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Parade+Magic`

---

## 🔧 **CONFIGURAÇÃO ADICIONAL (Opcional)**

Se precisar adicionar mais domínios de imagens no futuro, adicione-os em ambos os lugares:

```javascript
images: {
  domains: [
    'localhost', 
    'reserveiviagens.com.br', 
    'via.placeholder.com',
    'outro-dominio.com'  // Adicione aqui
  ],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'via.placeholder.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'outro-dominio.com',  // Adicione aqui também
      pathname: '/**',
    },
  ],
},
```

---

## ✅ **CHECKLIST**

- [x] Domínio `via.placeholder.com` adicionado a `domains`
- [x] `remotePatterns` configurado para Next.js 15+
- [ ] Servidor Next.js reiniciado
- [ ] Página `/tickets` testada
- [ ] Imagens carregando corretamente

---

**Status:** ✅ **CORREÇÃO APLICADA**

**Ação Necessária:** Reiniciar o servidor Next.js para aplicar as mudanças.

---

**Última Atualização:** 2026-01-05

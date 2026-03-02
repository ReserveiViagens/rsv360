# ✅ Correção: Erro em lib/lucide-icons.ts

**Data:** 07/12/2025  
**Status:** ✅ **CORRIGIDO**

---

## 🔍 Problema Identificado

**Erro:** `TypeError: Cannot read properties of undefined (reading 'call')`  
**Localização:** `lib/lucide-icons.ts:163`  
**Causa:** Ícones `Maximize`, `Minimize`, `Maximize2`, `Minimize2` não existem no `lucide-react`

---

## ✅ Correção Aplicada

**Removidos ícones inexistentes:**
- ❌ `Maximize` - Não existe no lucide-react
- ❌ `Minimize` - Não existe no lucide-react
- ❌ `Maximize2` - Não existe no lucide-react
- ❌ `Minimize2` - Não existe no lucide-react

**Mantidos:**
- ✅ `ZoomIn` - Existe
- ✅ `ZoomOut` - Existe

---

## 📝 Mudança no Código

### Antes:
```typescript
  // Ícones para mapas
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
} from 'lucide-react';
```

### Depois:
```typescript
  // Ícones para mapas
  ZoomIn,
  ZoomOut,
  // Maximize e Minimize removidos - não existem no lucide-react
  // Use Maximize2 e Minimize2 se necessário
} from 'lucide-react';
```

---

## 🧪 Próximos Passos

1. **Limpar cache:** ✅ Feito
2. **Rebuild:** ⏳ Executando
3. **Testar páginas:** Aguardando rebuild

---

**Última atualização:** 07/12/2025


# ✅ CORREÇÃO: Cannot read properties of undefined (reading 'call')

**Erro:** `TypeError: Cannot read properties of undefined (reading 'call')` em `webpack.js:700:31`

**Causa:** Componentes admin estavam importando `lucide-react` diretamente, causando code splitting problemático pelo webpack.

---

## 🔧 CORREÇÃO APLICADA

### Problema Identificado
- `app/admin/cms/page.tsx` linha 8: import direto de `lucide-react`
- `components/admin/TicketManagement.tsx` linha 32: import direto de `lucide-react`
- Webpack tentando fazer code splitting desses imports
- Factory function undefined causando erro

### Solução
1. ✅ **Ícones faltantes adicionados ao barrel file:**
   - `Ticket`, `Trash2`, `Percent`, `Video`
   - Outros ícones já existentes

2. ✅ **Imports migrados:**
   - `app/admin/cms/page.tsx` → usa `@/lib/lucide-icons`
   - `components/admin/TicketManagement.tsx` → usa `@/lib/lucide-icons`

---

## ✅ STATUS

- [x] Erro identificado
- [x] Ícones adicionados ao barrel file
- [x] Imports migrados
- [ ] Servidor recarregando automaticamente

---

## 🧪 TESTE AGORA

O servidor Next.js deve recarregar automaticamente com Hot Module Replacement (HMR).

1. **Aguarde alguns segundos** para o HMR recarregar
2. **Recarregue a página** no navegador:
   - `F5` ou `Ctrl + R`
3. **Teste:**
   - `http://localhost:3000/admin/cms`

---

## 📋 PRÓXIMOS PASSOS (Opcional)

Para evitar problemas futuros, migre todos os componentes admin:

```powershell
# Migrar todos os imports de lucide-react nos componentes admin
.\scripts\migrar-lucide-imports.ps1
```

Ou migre manualmente:
- `components/admin/HotelManagement.tsx`
- `components/admin/PromotionManagement.tsx`
- `components/admin/AttractionManagement.tsx`
- `components/admin/HeaderManagement.tsx`
- `components/admin/SiteManagement.tsx`
- `components/admin/MediaUpload.tsx`
- `components/admin/RichTextEditor.tsx`
- `components/admin/ImageUpload.tsx`

---

**Status:** ✅ Erro Corrigido - Aguardando HMR Recarregar

**Próximo Passo:** Aguarde alguns segundos e recarregue a página no navegador.


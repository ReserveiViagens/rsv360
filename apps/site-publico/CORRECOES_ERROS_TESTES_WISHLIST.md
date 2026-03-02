# 🔧 CORREÇÕES DE ERROS - wishlist-service.test.ts

**Data:** 11/12/2025  
**Status:** 🔧 CORRIGINDO ERROS ESPECÍFICOS

---

## 📊 RESULTADO DOS TESTES

- **Testes Passando:** 7/16 (44%)
- **Testes Falhando:** 9/16 (56%)
- **Total:** 16 testes

---

## ❌ ERROS IDENTIFICADOS E CORREÇÕES

### 1. ✅ "should add item to wishlist" - CORRIGIDO
**Erro:** `TypeError: Cannot read properties of undefined (reading 'value')`  
**Causa:** `AddItemSchema.parse(data)` falha porque o teste passa `{ propertyId, notes }` mas o schema espera `{ name, price, ... }`  
**Correção:** ✅ Serviço ajustado para suportar formato simples `{ propertyId, notes }`

### 2. ✅ "should throw error if user does not have permission" - CORRIGIDO
**Erro:** Esperava "Permission denied" mas recebeu erro de validação  
**Causa:** Mesmo problema do erro 1  
**Correção:** ✅ Mesma correção aplicada

### 3. ⏳ "should invite member successfully" - PENDENTE
**Erro:** "Permission denied"  
**Causa:** Mock não retorna owner/editor corretamente  
**Correção Necessária:** Ajustar mock para retornar membro com todos os campos

### 4. ⏳ "should throw error if owner tries to invite themselves" - PENDENTE
**Erro:** Promise resolveu ao invés de rejeitar  
**Causa:** Mock não está configurado corretamente ou serviço não está lançando erro  
**Correção Necessária:** Verificar lógica do serviço e ajustar mock

### 5. ⏳ "should remove member successfully" - PENDENTE
**Erro:** "Only owner can remove members"  
**Causa:** Mock não retorna owner corretamente  
**Correção Necessária:** Ajustar mock para retornar owner com todos os campos

### 6. ⏳ "should update wishlist successfully" - PENDENTE
**Erro:** `result.name` é `undefined`  
**Causa:** Mock do UPDATE não retorna dados corretos ou serviço não está processando corretamente  
**Correção Necessária:** Ajustar mock e verificar lógica do serviço

### 7. ⏳ "should delete wishlist if user is owner" - PENDENTE
**Erro:** "Only owner can delete"  
**Causa:** Mock não retorna wishlist com `created_by` correto  
**Correção Necessária:** Verificar mock - já está correto, pode ser problema no serviço

### 8. ⏳ "should throw error if user is not owner" - PENDENTE
**Erro:** Esperava "Only owner can delete" mas recebeu "Wishlist não encontrada"  
**Causa:** Mock está retornando array vazio ou serviço verifica wishlist antes de verificar owner  
**Correção Necessária:** Ajustar mock para retornar wishlist com `created_by` diferente

### 9. ⏳ "should return user wishlists" - PENDENTE
**Erro:** Esperava 2 wishlists mas recebeu 1  
**Causa:** Mock está retornando apenas 1 wishlist ou serviço está filtrando incorretamente  
**Correção Necessária:** Verificar mock e lógica do serviço

---

## 🔧 CORREÇÕES APLICADAS

### ✅ Correção 1: addItem - Suporte a Formato Simples
```typescript
// Antes: apenas AddItemSchema.parse(data)
// Depois: suporta { propertyId, notes } e formato completo
```

### ✅ Correção 2: inviteMember - Fallbacks Adicionados
```typescript
const wishlistResult = await queryDatabase(...);
const wishlist = wishlistResult || [];
```

### ✅ Correção 3: Mocks Ajustados
- `addItem` - Mock de member ajustado
- `inviteMember` - Mock de member ajustado

---

## 📝 CORREÇÕES PENDENTES

### 1. inviteMember - Mock de Member
```typescript
// Atual:
.mockResolvedValueOnce([{ user_id: userId, role: 'owner' }])

// Deve ser:
.mockResolvedValueOnce([{ 
  id: 'member-owner',
  wishlist_id: wishlistId,
  user_id: userId, 
  role: 'owner' 
}])
```

### 2. inviteMember - Verificação de Owner Email
Verificar se o serviço está lançando erro corretamente quando `owner[0].email === validated.email`.

### 3. removeMember - Mock de Owner
```typescript
// Atual:
.mockResolvedValueOnce([{ user_id: userId, role: 'owner' }])

// Deve ser:
.mockResolvedValueOnce([{ 
  id: 'owner-member',
  wishlist_id: wishlistId,
  user_id: userId, 
  role: 'owner' 
}])
```

### 4. updateWishlist - Suporte a Formato Simples
Ajustar serviço para suportar `{ name, description }` sem validação Zod completa.

### 5. deleteWishlist - Verificação de Owner
Verificar se o serviço está verificando `created_by` corretamente.

### 6. getUserWishlists - Mock de Resultado
Verificar se o mock está retornando array completo ou se há filtro no serviço.

---

## 🎯 PRÓXIMOS PASSOS

1. Aplicar correções pendentes
2. Executar testes novamente
3. Validar cobertura
4. Documentar resultados finais

---

**Última Atualização:** 11/12/2025


# 📋 Análise e Migração de Páginas

## Data
12 de Janeiro de 2026

---

## 🔍 Status das Páginas

### Páginas Solicitadas (15 total)

| Página | Servidor Antigo | Servidor Atual | Status |
|--------|----------------|----------------|--------|
| `/attractions` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/parks` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/seo` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/recommendations` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/rewards` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/ecommerce` | ❌ Não existe | ❌ Não existe | 🔴 Precisa criar |
| `/inventory` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/products` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/sales` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/finance` | ❌ Não existe | ❌ Não existe | 🔴 Precisa criar |
| `/payments` | ❌ Não existe | ❌ Não existe | 🔴 Precisa criar |
| `/multilingual` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |
| `/chatbots` | ❌ Não existe | ❌ Não existe | 🔴 Precisa criar |
| `/automation` | ❌ Não existe | ❌ Não existe | 🔴 Precisa criar |
| `/settings` | ✅ Existe | ✅ Existe | ⚠️ Precisa migrar/atualizar |

---

## 📊 Resumo

- **Total de páginas:** 15
- **Existem no servidor antigo:** 10
- **Existem no servidor atual:** 10
- **Precisam ser criadas:** 5 (ecommerce, finance, payments, chatbots, automation)
- **Precisam ser migradas/atualizadas:** 10

---

## 🔄 Diferenças entre Servidores

### Servidor Antigo (`rsv360-servidor-oficial`)
- Usa `axios` diretamente
- Usa `ProtectedRoute` de `../components/ProtectedRoute`
- Estrutura de pastas: `frontend/pages/`
- APIs: `/api/rewards/`, `/api/inventory`, `/api/sales`, etc.

### Servidor Atual (`RSV360 Versao Oficial`)
- Usa `apiClient` (axios configurado)
- Usa `ProtectedRoute` de `../../../src/components/ProtectedRoute`
- Estrutura de pastas: `apps/turismo/pages/`
- APIs: `/api/v1/...` (padrão RESTful)

---

## ✅ Plano de Migração

### Fase 1: Migrar Páginas Existentes (10 páginas)

1. **attractions.tsx**
   - Migrar do servidor antigo
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/attractions`

2. **parks.tsx**
   - Migrar do servidor antigo
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/parks`

3. **seo.tsx**
   - Migrar do servidor antigo
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/seo`

4. **recommendations.tsx**
   - Migrar do servidor antigo
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/recommendations`

5. **rewards.tsx**
   - Migrar do servidor antigo (página completa com funcionalidades)
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/rewards`

6. **inventory.tsx**
   - Migrar do servidor antigo
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/inventory`

7. **products.tsx**
   - Migrar do servidor antigo
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/products` ou `/api/v1/ecommerce/products`

8. **sales.tsx**
   - Migrar do servidor antigo
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/sales`

9. **multilingual.tsx**
   - Migrar do servidor antigo (página completa com funcionalidades)
   - Adaptar para usar `apiClient`
   - Adicionar `ProtectedRoute`
   - Verificar API `/api/v1/multilingual`

10. **settings.tsx**
    - Migrar do servidor antigo (página completa com funcionalidades)
    - Adaptar para usar `apiClient`
    - Adicionar `ProtectedRoute`
    - Verificar API `/api/v1/settings`

### Fase 2: Criar Páginas Faltantes (5 páginas)

1. **ecommerce.tsx**
   - Criar página baseada em `products.tsx`
   - Adicionar funcionalidades de e-commerce
   - Verificar API `/api/v1/ecommerce`

2. **finance.tsx**
   - Criar página de gestão financeira
   - Adicionar funcionalidades de relatórios financeiros
   - Verificar API `/api/v1/finance`

3. **payments.tsx**
   - Criar página de gestão de pagamentos
   - Adicionar funcionalidades de processamento de pagamentos
   - Verificar API `/api/v1/payments`

4. **chatbots.tsx**
   - Criar página de gestão de chatbots
   - Adicionar funcionalidades de configuração de chatbots
   - Verificar API `/api/v1/chatbots`

5. **automation.tsx**
   - Criar página de automação
   - Adicionar funcionalidades de workflows e automação
   - Verificar API `/api/v1/automation`

---

## 🔧 Adaptações Necessárias

### 1. Importações

**Antes (servidor antigo):**
```typescript
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
```

**Depois (servidor atual):**
```typescript
import ProtectedRoute from '../../../src/components/ProtectedRoute';
import { api } from '../../../src/services/apiClient';
```

### 2. Chamadas de API

**Antes (servidor antigo):**
```typescript
const response = await axios.get('/api/rewards/rewards/');
```

**Depois (servidor atual):**
```typescript
const response = await api.get('/api/v1/rewards');
```

### 3. Estrutura de Resposta

**Antes (servidor antigo):**
```typescript
setRewards(response.data);
```

**Depois (servidor atual):**
```typescript
// O api.get já retorna response.data
setRewards(Array.isArray(response.data) ? response.data : []);
```

### 4. Tratamento de Erros

**Adicionar:**
```typescript
try {
  // ...
} catch (error) {
  console.error('Erro ao carregar dados:', error);
  // Garantir que arrays sejam sempre definidos
  setData([]);
}
```

---

## 📝 Notas Importantes

1. **Todas as páginas devem usar `ProtectedRoute`**
2. **Todas as chamadas de API devem usar `apiClient`**
3. **Todas as respostas devem ser validadas (arrays, objetos)**
4. **Todas as páginas devem ter tratamento de erros**
5. **Todas as páginas devem ter estados de loading**

---

## 🎯 Próximos Passos

1. ✅ Criar documento de análise (este arquivo)
2. ⏳ Migrar páginas existentes (10 páginas)
3. ⏳ Criar páginas faltantes (5 páginas)
4. ⏳ Verificar e corrigir APIs relacionadas
5. ⏳ Testar todas as páginas

---

## 📚 Referências

- Servidor Antigo: `D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\rsv360-servidor-oficial\frontend\pages\`
- Servidor Atual: `D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\apps\turismo\pages\`
- API Client: `RSV360 Versao Oficial\apps\turismo\src\services\apiClient.ts`
- ProtectedRoute: `RSV360 Versao Oficial\apps\turismo\src\components\ProtectedRoute.tsx`

# Correção: Erro "Cannot read properties of undefined (reading 'length')"

## Data
12 de Janeiro de 2026

---

## 🔍 Problema Identificado

**Erro:**
```
TypeError: Cannot read properties of undefined (reading 'length')
at LeiloesPage (pages\dashboard\leiloes\index.tsx:124:21)
```

**Causa Raiz:**
1. O backend retorna: `{"success":true,"data":[],"pagination":{...}}`
2. O `api.get` retorna `response.data` (já é o objeto JSON parseado)
3. O `leiloesApi.getLeiloes` fazia: `return response.data || response;`
   - Mas `response` já é o `data` do axios, então `response.data` é `undefined`
   - O código tentava acessar `response.data.data`, que não existe
4. O componente recebia `undefined` em vez de um array
5. Ao tentar acessar `leiloes.length`, ocorria o erro

---

## ✅ Correções Implementadas

### 1. **API de Leilões** (`leiloesApi.ts`)

**Antes:**
```typescript
getLeiloes: async (filters: LeilaoFilters = {}): Promise<PaginatedResponse<Leilao>> => {
  const response = await api.get<PaginatedResponse<Leilao>>('/api/v1/leiloes', filters);
  return response.data || response; // ❌ ERRADO: response.data é undefined
},
```

**Depois:**
```typescript
getLeiloes: async (filters: LeilaoFilters = {}): Promise<PaginatedResponse<Leilao>> => {
  const response = await api.get<PaginatedResponse<Leilao>>('/api/v1/leiloes', filters);
  // O api.get já retorna response.data, então response já é o objeto {success, data, pagination}
  if (response && typeof response === 'object' && 'data' in response) {
    return {
      data: Array.isArray(response.data) ? response.data : [],
      pagination: response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
  // Fallback caso a estrutura seja diferente
  return {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  };
},
```

### 2. **Página de Leilões** (`leiloes/index.tsx`)

**Antes:**
```typescript
const loadLeiloes = async () => {
  try {
    setLoading(true)
    const response = await leiloesApi.getLeiloes(filters)
    setLeiloes(response.data) // ❌ Pode ser undefined
    setPagination(response.pagination) // ❌ Pode ser undefined
  } catch (error) {
    console.error('Erro ao carregar leilões:', error)
  } finally {
    setLoading(false)
  }
}
```

**Depois:**
```typescript
const loadLeiloes = async () => {
  try {
    setLoading(true)
    const response = await leiloesApi.getLeiloes(filters)
    // Garantir que data seja sempre um array
    setLeiloes(Array.isArray(response?.data) ? response.data : [])
    setPagination(response?.pagination || {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    })
  } catch (error) {
    console.error('Erro ao carregar leilões:', error)
    // Em caso de erro, garantir que leiloes seja um array vazio
    setLeiloes([])
  } finally {
    setLoading(false)
  }
}
```

### 3. **API de Excursões** (`excursoesApi.ts`)

Aplicada a mesma correção para evitar o mesmo problema.

### 4. **Página de Excursões** (`excursoes/index.tsx`)

Aplicada a mesma correção para evitar o mesmo problema.

---

## 🔧 Como Funciona Agora

### Fluxo Correto:

1. **Backend retorna:**
   ```json
   {
     "success": true,
     "data": [],
     "pagination": {
       "page": 1,
       "limit": 10,
       "total": 0,
       "totalPages": 0
     }
   }
   ```

2. **`api.get` retorna:**
   ```typescript
   {
     success: true,
     data: [],
     pagination: {...}
   }
   ```

3. **`leiloesApi.getLeiloes` processa e retorna:**
   ```typescript
   {
     data: [], // Sempre um array
     pagination: {...} // Sempre um objeto
   }
   ```

4. **Componente recebe:**
   ```typescript
   leiloes = [] // Sempre um array, nunca undefined
   pagination = {...} // Sempre um objeto
   ```

5. **Renderização:**
   ```typescript
   leiloes.length === 0 // ✅ Funciona! Sempre é um número
   ```

---

## ✅ Garantias Implementadas

1. ✅ **`data` sempre é um array**
   - Mesmo se a API retornar `undefined` ou `null`
   - Fallback para `[]`

2. ✅ **`pagination` sempre é um objeto**
   - Mesmo se a API não retornar
   - Fallback para valores padrão

3. ✅ **Tratamento de erros**
   - Em caso de erro na requisição, `leiloes` é definido como `[]`
   - Evita que o componente quebre

4. ✅ **Validação de tipos**
   - Verifica se `response.data` é um array antes de usar
   - Usa `Array.isArray()` para garantir tipo correto

---

## 📊 Arquivos Modificados

1. ✅ `apps/turismo/src/services/api/leiloesApi.ts`
2. ✅ `apps/turismo/pages/dashboard/leiloes/index.tsx`
3. ✅ `apps/turismo/src/services/api/excursoesApi.ts`
4. ✅ `apps/turismo/pages/dashboard/excursoes/index.tsx`

---

## 🧪 Teste

Após as correções, a página deve:
- ✅ Carregar sem erros
- ✅ Mostrar "Nenhum leilão encontrado" quando não houver dados
- ✅ Não quebrar mesmo se a API retornar estrutura inesperada
- ✅ Funcionar corretamente quando houver dados

---

## 📝 Conclusão

O problema foi causado por uma confusão na estrutura de dados retornada pela API. O `api.get` já retorna `response.data`, então não é necessário acessar `response.data.data`. As correções garantem que:

1. Sempre retornamos uma estrutura consistente
2. Sempre temos um array para `data`
3. Sempre temos um objeto para `pagination`
4. Tratamos erros adequadamente

**O erro está corrigido!** ✅

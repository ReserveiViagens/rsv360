# Correção: API de Viagens em Grupo

## Data
12 de Janeiro de 2026

---

## 🔍 Problema Identificado

A API de Viagens em Grupo tinha o mesmo problema das APIs de Leilões e Excursões:
- O `api.get` já retorna `response.data` (objeto JSON parseado)
- O código tentava acessar `response.data.data`, que não existe
- Isso resultava em `undefined` em vez de arrays
- Ao acessar `.length` ou fazer `.map()`, ocorriam erros

---

## ✅ Correções Implementadas

### 1. **API de Viagens em Grupo** (`viagensGrupoApi.ts`)

#### Método `getGrupos` (Listagem com paginação)

**Antes:**
```typescript
getGrupos: async (filters: GrupoFilters = {}): Promise<PaginatedResponse<Grupo>> => {
  const response = await api.get<PaginatedResponse<Grupo>>('/api/v1/viagens-grupo', filters);
  return response.data || response; // ❌ ERRADO
},
```

**Depois:**
```typescript
getGrupos: async (filters: GrupoFilters = {}): Promise<PaginatedResponse<Grupo>> => {
  const response = await api.get<PaginatedResponse<Grupo>>('/api/v1/viagens-grupo', filters);
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

#### Método `getWishlists` (Lista de wishlists)

**Antes:**
```typescript
getWishlists: async (grupoId: string): Promise<WishlistItem[]> => {
  const response = await api.get<{ data: WishlistItem[] }>(`/api/v1/viagens-grupo/${grupoId}/wishlists`);
  return response.data?.data || []; // ❌ ERRADO
},
```

**Depois:**
```typescript
getWishlists: async (grupoId: string): Promise<WishlistItem[]> => {
  try {
    const response = await api.get<{ data: WishlistItem[] }>(`/api/v1/viagens-grupo/${grupoId}/wishlists`);
    // O api.get já retorna response.data, então response já é o objeto {success, data}
    if (response && typeof response === 'object' && 'data' in response) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  } catch (error) {
    console.error('Erro ao carregar wishlists:', error);
    return [];
  }
},
```

#### Método `getPagamentos` (Lista de pagamentos)

**Antes:**
```typescript
getPagamentos: async (grupoId: string): Promise<PagamentoDividido[]> => {
  const response = await api.get<{ data: PagamentoDividido[] }>(`/api/v1/viagens-grupo/${grupoId}/pagamentos`);
  return response.data?.data || []; // ❌ ERRADO
},
```

**Depois:**
```typescript
getPagamentos: async (grupoId: string): Promise<PagamentoDividido[]> => {
  try {
    const response = await api.get<{ data: PagamentoDividido[] }>(`/api/v1/viagens-grupo/${grupoId}/pagamentos`);
    // O api.get já retorna response.data, então response já é o objeto {success, data}
    if (response && typeof response === 'object' && 'data' in response) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error);
    return [];
  }
},
```

### 2. **Página de Viagens em Grupo** (`viagens-grupo/index.tsx`)

**Antes:**
```typescript
const loadGrupos = async () => {
  try {
    setLoading(true)
    const response = await viagensGrupoApi.getGrupos(filters)
    setGrupos(response.data) // ❌ Pode ser undefined
    setPagination(response.pagination) // ❌ Pode ser undefined
  } catch (error) {
    console.error('Erro ao carregar grupos:', error)
  } finally {
    setLoading(false)
  }
}
```

**Depois:**
```typescript
const loadGrupos = async () => {
  try {
    setLoading(true)
    const response = await viagensGrupoApi.getGrupos(filters)
    // Garantir que data seja sempre um array
    setGrupos(Array.isArray(response?.data) ? response.data : [])
    setPagination(response?.pagination || {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    })
  } catch (error) {
    console.error('Erro ao carregar grupos:', error)
    // Em caso de erro, garantir que grupos seja um array vazio
    setGrupos([])
  } finally {
    setLoading(false)
  }
}
```

### 3. **Página de Pagamentos** (`viagens-grupo/pagamentos.tsx`)

**Antes:**
```typescript
const loadPagamentos = async (id: string) => {
  try {
    setLoading(true)
    const data = await viagensGrupoApi.getPagamentos(id)
    setPagamentos(data) // ❌ Pode ser undefined
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error)
    toast.error('Erro ao carregar pagamentos')
  } finally {
    setLoading(false)
  }
}
```

**Depois:**
```typescript
const loadPagamentos = async (id: string) => {
  try {
    setLoading(true)
    const data = await viagensGrupoApi.getPagamentos(id)
    // Garantir que data seja sempre um array
    setPagamentos(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error)
    toast.error('Erro ao carregar pagamentos')
    // Em caso de erro, garantir que pagamentos seja um array vazio
    setPagamentos([])
  } finally {
    setLoading(false)
  }
}
```

### 4. **Página de Wishlists** (`viagens-grupo/wishlists.tsx`)

**Antes:**
```typescript
const loadWishlists = async (id: string) => {
  try {
    setLoading(true)
    const data = await viagensGrupoApi.getWishlists(id)
    setWishlists(data) // ❌ Pode ser undefined
  } catch (error) {
    console.error('Erro ao carregar wishlists:', error)
    toast.error('Erro ao carregar wishlists')
  } finally {
    setLoading(false)
  }
}
```

**Depois:**
```typescript
const loadWishlists = async (id: string) => {
  try {
    setLoading(true)
    const data = await viagensGrupoApi.getWishlists(id)
    // Garantir que data seja sempre um array
    setWishlists(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Erro ao carregar wishlists:', error)
    toast.error('Erro ao carregar wishlists')
    // Em caso de erro, garantir que wishlists seja um array vazio
    setWishlists([])
  } finally {
    setLoading(false)
  }
}
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
   - Em caso de erro na requisição, arrays são definidos como `[]`
   - Evita que os componentes quebrem

4. ✅ **Validação de tipos**
   - Verifica se `response.data` é um array antes de usar
   - Usa `Array.isArray()` para garantir tipo correto

---

## 📊 Arquivos Modificados

1. ✅ `apps/turismo/src/services/api/viagensGrupoApi.ts`
   - Método `getGrupos` corrigido
   - Método `getWishlists` corrigido
   - Método `getPagamentos` corrigido

2. ✅ `apps/turismo/pages/dashboard/viagens-grupo/index.tsx`
   - Função `loadGrupos` corrigida

3. ✅ `apps/turismo/pages/dashboard/viagens-grupo/pagamentos.tsx`
   - Função `loadPagamentos` corrigida

4. ✅ `apps/turismo/pages/dashboard/viagens-grupo/wishlists.tsx`
   - Função `loadWishlists` corrigida

---

## 🧪 Teste

Após as correções, as páginas devem:
- ✅ Carregar sem erros
- ✅ Mostrar "Nenhum grupo encontrado" quando não houver dados
- ✅ Não quebrar mesmo se a API retornar estrutura inesperada
- ✅ Funcionar corretamente quando houver dados
- ✅ Wishlists e pagamentos também funcionarem corretamente

---

## 📝 Conclusão

A API de Viagens em Grupo agora está corrigida com as mesmas garantias das APIs de Leilões e Excursões:

1. ✅ Sempre retornamos uma estrutura consistente
2. ✅ Sempre temos um array para `data`
3. ✅ Sempre temos um objeto para `pagination`
4. ✅ Tratamos erros adequadamente
5. ✅ Validação de tipos antes de usar

**Todas as APIs estão corrigidas!** ✅

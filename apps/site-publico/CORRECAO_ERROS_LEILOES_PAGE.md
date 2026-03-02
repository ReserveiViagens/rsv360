# Correção: Erros na Página de Leilões

**Data:** 28/01/2026  
**Status:** ✅ Implementado

---

## Problemas Corrigidos

### 1. Maximum update depth exceeded (useHotels.ts)
**Causa:** O objeto `filters` passado ao `useEffect` era recriado a cada render, gerando loop infinito.

**Solução:** Uso de `filtersKey` estável com `useMemo` e dependências primitivas.

### 2. Extra attributes from the server: data-np-intersection-state
**Causa:** Extensões do navegador (ex.: Norton Password Manager) injetam atributos em inputs, causando mismatch de hidratação.

**Solução:** `suppressHydrationWarning` nos inputs da página de leilões.

### 3. Google Maps BillingNotEnabledMapError
**Causa:** Chave de API sem faturamento habilitado no Google Cloud Console.

**Solução:**
- `use-google-maps.ts`: callback `gm_authFailure` para capturar erros de auth/billing
- `AuctionMap.tsx`: try-catch ao criar o mapa + mensagem amigável com link para o Console

### 4. Google Maps loading=async warning
**Causa:** Carregamento síncrono da API.

**Solução:** `script.async = true` + aguardar `window.google.maps` após `onload`.

---

## Arquivos Modificados

| Arquivo | Alterações |
|---------|------------|
| `hooks/useHotels.ts` | `filtersKey` estável para evitar loop infinito |
| `app/leiloes/page.tsx` | `suppressHydrationWarning` nos inputs |
| `hooks/use-google-maps.ts` | `gm_authFailure`, cleanup, aguardar maps após onload |
| `components/auctions/AuctionMap.tsx` | try-catch, tratamento de BillingNotEnabled |

---

## BillingNotEnabledMapError – Como Resolver

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto da API Key
3. Vá em **Billing** e vincule uma conta de faturamento
4. O Google oferece crédito gratuito mensal para Maps

---

**Status:** ✅ Correções aplicadas

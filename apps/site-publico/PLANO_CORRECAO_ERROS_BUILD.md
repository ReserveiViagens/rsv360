# Plano de Correção dos Erros de Build - RSV360 Site Público

Este documento descreve as causas reais dos erros e avisos de build e um plano passo a passo para corrigi-los.

---

## 1. Resumo Executivo

| Categoria | Qtd | Prioridade | Esforço |
|-----------|-----|------------|---------|
| Imports/Exports inexistentes | 8 | Alta | Médio |
| Pacotes npm faltando | 2 | Média | Baixo |
| Aliases/Wrappers em serviços | 6 | Alta | Médio |
| Erros React (404/500) | 1 | Média | Baixo |
| Dynamic server usage | N | Informacional | Não bloqueante |

---

## 2. Erros de Import/Export (Compile-Time)

### 2.1 `useToastHelpers` - Toast.tsx

**Arquivo:** `app/admin/ui-demo/page.tsx`  
**Causa:** O componente `Toast.tsx` (Radix UI) não exporta `useToastHelpers`. O projeto usa `toast-wrapper.tsx` que expõe `useToast()` com `success()`, `error()`, `warning()`, `info()`.

**Solução:**
- Substituir `import { useToastHelpers } from '@/components/ui/Toast'` por `import { useToast } from '@/components/providers/toast-wrapper'`
- Substituir `const { success, error, warning, info } = useToastHelpers()` por `const toast = useToast()`
- Ajustar chamadas: `success('Título', 'Mensagem')` → `toast.success('Título: Mensagem')` (ou similar)

**Arquivos afetados:** `app/admin/ui-demo/page.tsx`

---

### 2.2 `processUpload`, `validateUploadRequest`, `UploadConfig` - upload-service

**Arquivo:** `app/api/upload/files/route.ts`  
**Causa:** O `upload-service.ts` exporta `uploadFile(file, folder, options)` e `deleteFile(url)`, mas a rota espera:
- `validateUploadRequest(request)` – retorna usuário autenticado
- `processUpload(files, userId, config)` – processa múltiplos arquivos
- `UploadConfig` – interface de configuração

**Solução (opção A – criar adaptadores):**
1. Criar `validateUploadRequest` em `upload-service.ts`:
   - Extrair token do header `Authorization` ou cookies
   - Validar JWT e retornar `{ id, email }`
   - Lançar erro se não autenticado

2. Criar `processUpload(files, userId, config)`:
   - Iterar sobre `files` e chamar `uploadFile` para cada um
   - Mapear `UploadConfig` para `UploadOptions`
   - Retornar array de `{ id, name, url, ... }`

3. Exportar interface `UploadConfig` compatível com a rota

**Solução (opção B – simplificar):**
- Reescrever `app/api/upload/files/route.ts` para usar `uploadFile` diretamente

**Arquivos afetados:** `lib/upload-service.ts`, `app/api/upload/files/route.ts`

---

### 2.3 `getPendingVerifications`, `getVerificationByProperty`, `submitVerificationRequest` - verification-service

**Arquivos:** `app/api/verification/pending/route.ts`, `app/api/verification/submit/route.ts`  
**Causa:** O `verification-service.ts` exporta:
- `listVerificationRequests({ status, limit, offset })` – não `getPendingVerifications(limit, offset)`
- `getVerificationStatus(propertyId)` – retorna status diferente de `getVerificationByProperty`
- `createVerificationRequest(propertyId, hostId, photos?, video?)` – assinatura diferente de `submitVerificationRequest(data)`

**Solução:**
1. Adicionar em `verification-service.ts`:
   ```ts
   export async function getPendingVerifications(limit = 50, offset = 0) {
     return listVerificationRequests({ status: 'pending', limit, offset });
   }
   ```

2. Adicionar `getVerificationByProperty(propertyId)`:
   - Usar `getVerificationStatus` ou query direta em `property_verifications` por `property_id`

3. Adicionar `submitVerificationRequest(data)`:
   - Wrapper que chama `createVerificationRequest(data.property_id, data.requested_by, data.photos, data.video)` ou adaptar o body para a assinatura existente

**Arquivos afetados:** `lib/verification-service.ts`

**Nota crítica:** A rota está em `api/verification/submit/route.ts`, mas usa `params.propertyId`. Em Next.js 14 App Router, `params` só existe em rotas dinâmicas como `submit/[propertyId]/route.ts`. Atualmente `params` será `undefined` e causará erro. **Ação:** Mover para `api/verification/submit/[propertyId]/route.ts` OU alterar a rota para receber `propertyId` no body do POST.

---

### 2.4 `sendNotification` - notification-service e enhanced-notification-service

**Arquivos:** `lib/pricing-alerts-service.ts`, `lib/reviews-enhanced-service.ts` (notification-service); `lib/enhanced-split-payment.ts`, `lib/trip-planning-service.ts` (enhanced-notification-service)

**Causa:** 
- `notification-service.ts` exporta `sendEmailNotification`, `sendSMSNotification`, etc., mas não `sendNotification`
- `enhanced-notification-service.ts` exporta `sendNotificationWithTemplate`, `queueNotification`, mas não `sendNotification`

**Solução:**
1. Em `notification-service.ts`, criar função genérica:
   ```ts
   export async function sendNotification(params: {
     userId: number;
     type: 'email' | 'sms' | 'whatsapp' | 'push';
     subject?: string;
     message: string;
     [key: string]: any;
   }): Promise<boolean> {
     // Roteamento para sendEmailNotification, sendSMSNotification, etc.
   }
   ```

2. Em `enhanced-notification-service.ts`, criar:
   ```ts
   export async function sendNotification(params: {
     userId: number;
     templateId?: string;
     variables?: Record<string, any>;
     channels?: Array<'email' | 'sms' | 'whatsapp' | 'push'>;
     [key: string]: any;
   }): Promise<{ success: boolean }> {
     // Usar sendNotificationWithTemplate ou fallback para notification-service
   }
   ```

**Arquivos afetados:** `lib/notification-service.ts`, `lib/enhanced-notification-service.ts`

---

### 2.5 `cacheGetOrSet`, `invalidateCache` - cache-integration

**Arquivos:** `lib/leaderboard-cache-service.ts`, `lib/wishlist-service.ts`  
**Causa:** `cache-integration.ts` importa `cacheGetOrSet` de `redis-cache` mas não re-exporta. Também não exporta `invalidateCache` genérico. O `leaderboard-cache-service` chama `invalidateCache('rsv:leaderboard:*')` com padrão.

**Solução:**
1. Em `cache-integration.ts`, adicionar:
   ```ts
   export { cacheGetOrSet } from './redis-cache';
   export async function invalidateCache(pattern: string): Promise<number> {
     return redisCache.deletePattern(pattern);
   }
   ```

2. Verificar se `redisCache.deletePattern` aceita padrão com `*` (wildcard). O `redis-cache` usa `deletePattern` que itera sobre `memoryCache.keys()` – para Redis real, precisaria de `KEYS` ou `SCAN`.

**Arquivos afetados:** `lib/cache-integration.ts`

---

## 3. Pacotes npm Faltando

### 3.1 `@aws-sdk/client-sns`

**Arquivo:** `lib/notification-service.ts`  
**Causa:** O `sendSMSNotification` usa `require('@aws-sdk/client-sns')` para envio de SMS via AWS SNS. O pacote não está em `package.json`.

**Solução:**
```bash
cd apps/site-publico && npm install @aws-sdk/client-sns
```

**Alternativa:** Envolver o uso em try/catch e usar fallback (ex: log) quando o pacote não estiver instalado.

---

### 3.2 `cloudinary`

**Arquivo:** `lib/upload-service.ts`  
**Causa:** `require('cloudinary')` é usado quando `UPLOAD_METHOD=cloudinary`. O pacote não está em `package.json` do site-publico.

**Solução:**
```bash
cd apps/site-publico && npm install cloudinary
```

**Alternativa:** O código usa `try/catch` – o require falha silenciosamente. O erro "Module not found" no build pode vir do webpack tentando resolver o módulo. Usar `await import('cloudinary')` apenas quando necessário (lazy) pode evitar o erro em build.

---

### 3.3 `@aws-sdk/client-s3`, `sharp`, `nodemailer`

**Arquivos:** `lib/upload-service.ts` (S3, sharp), `lib/notification-service.ts` (nodemailer)  
**Causa:** O `package.json` do site-publico **não lista** essas dependências. Podem estar em `node_modules` por hoisting do monorepo.

**Solução:** Adicionar ao `package.json` do site-publico:
```bash
npm install @aws-sdk/client-s3 sharp nodemailer
```

---

## 5. Erros React (Páginas 404 e 500)

**Causa:** Erro React #31 – "Objects are not valid as a React child". Ocorre em páginas de erro (`/404`, `/500`).

**Possível causa:** Um componente está passando um objeto (ex: `Error`) em vez de string ou elemento React como filho.

**Solução:**
1. Localizar `app/not-found.tsx` e `app/error.tsx` (ou `pages/404.tsx`, `500.tsx`)
2. Verificar se há `{error}` ou similar sendo renderizado diretamente
3. Substituir por `{error?.message || String(error)}`

---

## 6. Ordem de Implementação Sugerida

### Fase 1 – Correções Rápidas (sem alterar lógica)

1. **ui-demo:** Trocar `useToastHelpers` por `useToast` do toast-wrapper
2. **cache-integration:** Re-exportar `cacheGetOrSet` e adicionar `invalidateCache`

### Fase 2 – Serviços e Aliases

3. **verification-service:** Adicionar `getPendingVerifications`, `getVerificationByProperty`, `submitVerificationRequest`
4. **notification-service:** Adicionar `sendNotification`
5. **enhanced-notification-service:** Adicionar `sendNotification`

### Fase 3 – Upload

6. **upload-service:** Implementar `validateUploadRequest` e `processUpload` (ou adaptar a rota)

### Fase 4 – Dependências

7. Instalar `@aws-sdk/client-sns` (se SMS for necessário)
8. Instalar `cloudinary` (se upload para Cloudinary for necessário) ou garantir import opcional

### Fase 5 – Páginas de Erro

9. Corrigir `not-found.tsx` e `error.tsx` para o React error #31

---

## 7. Checklist de Validação

Após cada correção:

- [ ] `npm run build` no site-publico
- [ ] Verificar ausência de "Attempted import error"
- [ ] Verificar ausência de "Module not found" para pacotes
- [ ] Testar páginas críticas: `/admin/ui-demo`, `/api/upload/files`, `/api/verification/*`

---

## 8. Referências de Código

| Arquivo | Funções/Exports Existentes |
|---------|---------------------------|
| `lib/verification-service.ts` | `createVerificationRequest`, `listVerificationRequests`, `getVerificationStatus`, `approveVerification`, `rejectVerification` |
| `lib/upload-service.ts` | `uploadFile`, `deleteFile`, `UploadOptions` |
| `lib/redis-cache.ts` | `cacheGetOrSet`, `redisCache.deletePattern` |
| `lib/cache-integration.ts` | `cacheWishlist`, `invalidateWishlistCache`, etc. (não exporta cacheGetOrSet) |
| `components/providers/toast-wrapper.tsx` | `useToast()` → `{ success, error, warning, info }` |

---

## 9. Notas sobre Dynamic Server Usage

As mensagens "Route X couldn't be rendered statically because it used `request.cookies`" são esperadas para rotas de API que usam autenticação. Essas rotas devem ser dinâmicas. Verificar se as rotas têm `export const dynamic = 'force-dynamic'` quando necessário. Isso não costuma falhar o build, apenas gera avisos durante a geração estática.

---

## 10. Avisos Secundários (Baixa Prioridade)

- **api/docs/route.ts:** "Critical dependency: the request of a dependency is an expression" – geralmente relacionado a import dinâmico ou Swagger. Não bloqueia o build.
- **require-in-the-middle / OpenTelemetry:** Avisos de instrumentação. Não bloqueiam o build.

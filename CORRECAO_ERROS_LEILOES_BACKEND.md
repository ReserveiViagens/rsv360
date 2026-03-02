# Correção: Erros Backend e Frontend - Leilões

**Data:** 28/01/2026  
**Status:** ✅ Implementado

---

## Problemas Corrigidos

### 1. Google Maps "loading=async" warning
**Solução:** Migração para `@googlemaps/js-api-loader` (API oficial do Google).

### 2. Error getting auction map data: coluna a.enterprise_id não existe
**Solução:** Fallback em `getMapData()` para schema antigo – usa coordenadas padrão de Caldas Novas quando `enterprise_id` não existe.

### 3. Error in syncAllConnections job: relação "ota_connections" não existe
**Solução:** Verificação de existência da tabela antes de executar os jobs OTA.

### 4. Polling excessivo /api/v1/auctions/active
**Solução:** `refetchOnWindowFocus: false` e `refetchInterval: false` no `useAuctions`.

### 5. BillingNotEnabledMapError
**Solução:** Callback `gm_authFailure` + mensagem amigável (já implementado anteriormente).

---

## Arquivos Modificados

| Arquivo | Alterações |
|---------|------------|
| `apps/site-publico/hooks/use-google-maps.ts` | Uso de `@googlemaps/js-api-loader` |
| `apps/site-publico/package.json` | Dependência `@googlemaps/js-api-loader` |
| `apps/site-publico/hooks/useAuctions.ts` | Desativação de refetch automático |
| `backend/src/api/v1/auctions/service.js` | Fallback em `getMapData()` para schema antigo |
| `backend/src/jobs/ota-sync.js` | Verificação de existência de `ota_connections` |

---

## Warnings que permanecem (externos)

- **touchmove/touchstart passive** – vêm do Google Maps; não há como corrigir no nosso código.
- **BillingNotEnabledMapError** – exige ativar faturamento no Google Cloud Console.
- **Tabela auctions com schema antigo** – executar `npx knex migrate:latest` no backend para atualizar o schema.

---

**Status:** ✅ Correções aplicadas

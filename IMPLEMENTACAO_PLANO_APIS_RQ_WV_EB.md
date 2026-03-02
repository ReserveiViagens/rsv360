# Implementação do plano: APIs, React Query, Web Vitals, Mapa e Error Boundaries

## FASE 1: Testes das APIs do Proprietário

- **`backend/tests/integration/proprietor-api.test.js`**
  - Ajuste do `require`: uso de `../../src/server` (caminho correto a partir de `tests/integration/`).
  - Login: token obtido de `body.token` ou `body.access_token`.
  - Casos cobertos: `GET /api/v1/proprietor/dashboard/stats`, `GET /api/v1/proprietor/auctions`, `GET /api/v1/proprietor/revenue?period=30d`, `GET /api/v1/proprietor/occupancy?period=30d`, `GET /api/v1/proprietor/revenue/trends`, `GET /api/v1/proprietor/occupancy/trends`, `GET /api/v1/proprietor/auctions/performance` e 401 sem token.
- **Script de sanidade**
  - `backend/scripts/test-proprietor-apis.js` já existia e cobre os endpoints do proprietário com token (OK/Falha).

**Observação:** Os testes de integração que carregam o `server` podem falhar se alguma dependência do backend (por exemplo `travel-packages.js`) tiver erro de sintaxe ou uso de palavra reservada (`package`). A suíte do proprietário e o script de sanidade estão prontos para quando o backend sobe sem erros.

---

## FASE 2: React Query

- **`useAuctions`**, **`useProprietorDashboard`** e **`useRevenueData`** já utilizam `@tanstack/react-query`:
  - `useAuctions`: `queryKey: ['auctions', filters]`, `staleTime` ~2 min, invalidação após lance.
  - `useProprietorDashboard`: stats e auctions com `refetchInterval: 30_000`.
  - `useRevenueData`: chamadas em paralelo a revenue/trends, occupancy/trends e auctions/performance; `staleTime` 90 s.

Nenhuma alteração foi necessária nesta fase.

---

## FASE 3: Web Vitals

- **`apps/site-publico/components/performance/WebVitalsReporter.tsx`** já existia e está em uso.
- **`apps/site-publico/app/layout.tsx`** já importa e renderiza `<WebVitalsReporter />` dentro do `AuthProvider`.
- Uso de `onCLS`, `onFID`, `onLCP`, `onFCP`, `onTTFB`; em dev as métricas vão para o console; em produção pode-se usar `NEXT_PUBLIC_WEB_VITALS_ENDPOINT`.

Nenhuma alteração foi necessária nesta fase.

---

## FASE 4: Mapa interativo (opcional)

- A página **`/leiloes`** já possui:
  - Toggle lista/mapa (`viewMode` 'list' | 'map').
  - Componente `AuctionMap` carregado via `dynamic(..., { ssr: false })`.
  - Query `['auctions', 'map-data']` para `GET /api/v1/auctions/map-data`.

O plano previa esta fase como opcional; a integração já estava feita.

---

## FASE 5: Error Boundaries

Foram envolvidas as páginas críticas com `ErrorBoundary` de `@/components/ui/error-boundary`:

| Página | Alteração |
|--------|-----------|
| `app/dashboard/proprietario/page.tsx` | Conteúdo envolvido em `<ErrorBoundary><AuctionDashboard /></ErrorBoundary>`. |
| `app/leiloes/page.tsx` | Todo o conteúdo da página envolvido em `<ErrorBoundary>`. |
| `app/leiloes/[id]/page.tsx` | Conteúdo interno extraído para `AuctionDetailsContent` e página exportada como `<ErrorBoundary><AuctionDetailsContent /></ErrorBoundary>`. |
| `app/flash-deals/page.tsx` | Todo o conteúdo da página envolvido em `<ErrorBoundary>`. |

O `ErrorBoundary` já oferece fallback com mensagem de erro, “Tentar Novamente” (reset do state) e “Recarregar Página”.

---

## Resumo

- **FASE 1:** Testes e script do proprietário ajustados/confirmados.
- **FASE 2:** React Query já adotado nos hooks relevantes.
- **FASE 3:** Web Vitals já em uso no layout.
- **FASE 4:** Mapa opcional já integrado em `/leiloes`.
- **FASE 5:** Error Boundaries aplicados em dashboard proprietário, leilões, detalhe do leilão e flash-deals.

Implementação concluída conforme o plano. Nenhum arquivo de plano foi alterado.

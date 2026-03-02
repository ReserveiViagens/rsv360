# Configuração: Provedor de Mapas (Google Maps / OpenStreetMap)

## Funcionalidade Implementada

O sistema RSV 360 agora permite **escolher qual provedor de mapas** será usado no site público (leilões, hotéis, atrações):

- **Google Maps** – Requer API Key e faturamento no Google Cloud. Street View, rotas em tempo real.
- **OpenStreetMap + Leaflet** – Gratuito, sem API Key. Ideal para localização básica.

## Onde Configurar

1. Acesse o **Dashboard Turismo**: http://localhost:3005
2. No menu lateral, clique em **Configurações** → **APIs e Mapas**
3. Ou acesse diretamente: http://localhost:3005/integracoes-apis
4. Na seção **"Provedor de Mapas"** (card azul no topo), escolha:
   - **Google Maps** – Para usar a API do Google (requer API Key configurada)
   - **OpenStreetMap + Leaflet** – Para usar mapas gratuitos

A alteração é salva automaticamente e aplicada imediatamente no site público.

## Arquivos Modificados/Criados

### Backend
- `backend/src/routes/website-real.js`
  - `GET /api/website/settings` – Inclui `map_provider` na resposta
  - `GET /api/website/settings/map-provider` – Endpoint leve para componentes de mapa
  - `PUT /api/website/settings/map-provider` – Atualiza o provedor (chamado pelo Dashboard)

### Dashboard Turismo (porta 3005)
- `apps/turismo/src/pages/integracoes-apis.tsx` – Seção "Provedor de Mapas" com radio buttons
- `apps/turismo/src/pages/settings.tsx` – Hub de configurações com link para APIs e Mapas
- `apps/turismo/src/components/layout/Sidebar.tsx` – Submenu em Configurações com "APIs e Mapas"

### Site Público (porta 3000)
- `apps/site-publico/hooks/use-map-provider.ts` – Hook para obter o provedor configurado
- `apps/site-publico/components/auctions/AuctionMap.tsx` – Usa o provedor configurado

## Fluxo de Funcionamento

1. O Dashboard Turismo chama `PUT /api/website/settings/map-provider` ao alterar a opção.
2. O valor é salvo em memória e, se existir, na tabela `website_settings` do banco.
3. O site público, ao carregar a página de leilões, chama `GET /api/website/settings/map-provider`.
4. O componente `AuctionMap` renderiza:
   - **OpenStreetMap** – Se o provedor for `openstreetmap` (iframe com mapa gratuito)
   - **Google Maps** – Se o provedor for `google` (usa API Key e fallback para OSM em caso de erro)

## Persistência

- O provedor é armazenado na tabela `website_settings` (chave `map_provider`).
- Se a tabela não existir ou houver erro, o valor é mantido em memória até o reinício do backend.
- Valor padrão: `google`.

## Data da Implementação

28 de Janeiro de 2026

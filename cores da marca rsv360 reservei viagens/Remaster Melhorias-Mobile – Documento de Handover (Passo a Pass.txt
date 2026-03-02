# Remaster Melhorias-Mobile – Documento de Handover (Passo a Passo)

**Versão:** 1.0 Remaster  
**Data:** 2025-02-11  
**Alvo:** `http://localhost:3000/melhorias-mobile` (mobile e desktop)

---

## Índice

1. [Fase 0: Documento de handover e checkpoint inicial](#fase-0-documento-de-handover-e-checkpoint-inicial)
2. [Fase 1: Sistema de cores e design system](#fase-1-sistema-de-cores-e-design-system)
3. [Fase 2: Filtro Inteligente de Busca (SmartSearchFilter)](#fase-2-filtro-inteligente-de-busca-smartsearchfilter)
4. [Fase 3: Cards de produto (TicketProductCard)](#fase-3-cards-de-produto-ticketproductcard)
5. [Fase 4: Checkout Expresso Mobile (MobileExpressCheckoutV2)](#fase-4-checkout-expresso-mobile-mobileexpresscheckoutv2)
6. [Fase 5: Prova Social e Página de Sucesso](#fase-5-prova-social-e-página-de-sucesso)
7. [Fase 6: Skeletons de carregamento](#fase-6-skeletons-de-carregamento)
8. [Fase 7: Mapa com etiquetas de preço (Leaflet + OSM)](#fase-7-mapa-com-etiquetas-de-preço-leaflet--osm)
9. [Fase 8: Unificação na page e fluxo completo](#fase-8-unificação-na-page-e-fluxo-completo)
10. [Fase 9: Ajustes desktop e responsividade](#fase-9-ajustes-desktop-e-responsividade)
11. [Fase 10: Documento final e checklist de conformidade](#fase-10-documento-final-e-checklist-de-conformidade)
12. [Referências](#referências)

---

## Fase 0: Documento de handover e checkpoint inicial

**Objetivo:** Criar o documento passo a passo único e registrar o estado atual vs. o que falta.

**Arquivos impactados:** `apps/site-publico/REMESTER_MELHORIAS_MOBILE_HANDOVER.md` (este arquivo).

**Critérios de “feito”:**
- [x] Arquivo criado com índice e estrutura de todas as fases.
- [x] Checkpoint 0 executado (análise do que já existe e do que falta).

### Checkpoint 0 – Análise do estado atual

**Reler:** Primeiras ~500 linhas do Plano completo Layout Inteligente RSV 360 + documento OSM na íntegra.

**O que já existe em `app/melhorias-mobile/page.tsx`:**

| Item | Situação atual |
|------|----------------|
| Header / Hero | Header com logo, Entrar/Cadastrar, gradiente blue-600→blue-800; hero com imagem ou fallback gradiente. |
| Busca | Campo de busca no header (link para /buscar), placeholder "Buscar Hotéis, Parques..."; botão de voz (Web Speech API) que redireciona para /buscar?q=. |
| Categorias | Carrossel mobile (Buscar, Hotéis, Ingressos, Atrações) + card "Ver Promoções" (yellow-400→orange-400); grid no desktop. |
| Side rails | LeftSideRail e RightSideRail (desktop); dados de getHomeSideRailsData/fallback. |
| MobileCrossSellCard | Vários usos (cross-sell após categorias, após PROMOFÉRIAS, entre trust badges e quick access, etc.). |
| CTA “Monte suas férias” | Card azul com link para /cotacao, texto e botão "Montar meu roteiro". |
| Card PROMOFÉRIAS | Gradiente yellow-400→orange-400, badge red-500 animate-pulse, preço, botão "Quero Esta Super Oferta!". |
| Trust badges | 3 cards (Garantia Melhor Preço, Pagamento Seguro, +5000 Clientes). |
| Quick Access | 2 cards (Hotéis, Promoções) com links. |
| Depoimentos | Seção "Depoimentos de clientes" com DEPOIMENTOS_REAIS (cards simples, autor e source). |
| ReviewsSection | Componente "O que nossos clientes dizem". |
| Footer | Logo, tagline, endereços, copyright. |
| LGPD | LGPDPopup. |
| ChatAgent | Widget de chat (mobile). |
| CTA fixo mobile | Barra fixa inferior "Reservar Agora" (green-500) link para /cotacao. |
| FAB desktop | Botão "Realizar Cotação" (green-500) fixo. |
| Scroll to top | Botão seta para topo (blue-600). |

**O que falta (conforme Plano completo + OSM):**

| Item | Descrição |
|------|-----------|
| SmartSearchFilter | Componente com abas Tudo/Hotéis/Parques/Passeios, campo "Onde em Caldas Novas?" com MapPin e microfone, datas/hóspedes, botão "BUSCAR AGORA", linha "Popular: Hot Park, diRoma, Lagoa Quente, Náutico". |
| TicketProductCard | Card de ingresso/parque com imagem, overlay, badge "OFERTA RELÂMPAGO", estrelas, bloco de preço (ancoragem + parcelamento), CTA "GARANTIR MEU INGRESSO". |
| Seção "Mais Vendidos em Caldas" | Grid de TicketProductCard na ordem do fluxo. |
| MobileExpressCheckoutV2 | Barra fixa com economia, parcelamento em destaque, botão "RESERVAR AGORA", selo "Pagamento Seguro"; exibida quando há item selecionado. |
| SocialProofSection (formato Plano) | Título "Quem viaja com a Reservei, aprova!", cards com Quote, estrelas, avatar com inicial em blue-600, CheckCircle2, badge "Plataforma 100% Verificada". |
| SuccessReservationPage | Página/estado de reserva confirmada: header verde, voucher, botões Download/WhatsApp, "Dica de Caldas". |
| SmartSearchSkeleton | Skeleton do filtro de busca para estado de loading. |
| TicketCardSkeleton | Skeleton do card de produto. |
| Estado isLoading na page | Exibir skeletons e depois componentes reais. |
| Banner "Precisa de Ajuda?" | Card blue-600 com texto e botão "Falar no WhatsApp". |
| Mapa com etiquetas OSM | CSS .price-tag-bubble, .tag-regular/flash/auction; marcadores no mapa (Leaflet + OSM) com preço; opcional na própria página ou em /leiloes ou /mapa-caldas-novas. |

**Checkpoint 0:** [x] Relido Plano (início) e OSM; comparado com `melhorias-mobile/page.tsx`; anotações acima registradas.

---

## Fase 1: Sistema de cores e design system

**Objetivo:** Garantir que a paleta do Plano esteja documentada e aplicada.

**Arquivos impactados:** `REMESTER_MELHORIAS_MOBILE_HANDOVER.md`, opcionalmente `DESIGN_COLOR_SYSTEM_MELHORIAS_MOBILE.md`.

**Critérios de “feito”:**
- [x] Tabela “Aplicação estratégica” no handover.
- [x] Design system conferido; subseção “Remaster” adicionada.
- [x] Checkpoint 1 executado.

### Aplicação estratégica (Plano completo)

| Contexto | Cor Tailwind | Uso |
|----------|--------------|-----|
| Reserva / Confiança | `blue-600`, `blue-700`, `blue-800` | Header, CTAs secundários, links, selo “Pagamento Seguro” |
| Ingressos / Parques / Urgência | `yellow-400` → `orange-400` (gradiente) | Botão “Ver Promoções”, card PROMOFÉRIAS, CTA “GARANTIR MEU INGRESSO” no TicketProductCard |
| Botão compra / Conversão | `green-500`, `green-600` | “RESERVAR AGORA”, “RESERVAR AGORA” no checkout fixo, página de sucesso |
| Ofertas última hora / Flash | `red-500`, `red-600` | Badge “OFERTA RELÂMPAGO”, “PREÇO DE CALDAS”, “OFERTA LIMITADA” |
| Neutros / Hierarquia | `gray-50` a `gray-900` | Fundos, texto, bordas, skeletons |

### Checkpoint 1
- [x] Reler “Psicologia das Cores” e “Aplicação Estratégica da Paleta” do Plano; DESIGN_COLOR_SYSTEM_MELHORIAS_MOBILE.md já está alinhado; subseção “Remaster – alinhamento com Plano completo” adicionada no design system. Conformidade: **OK**.

---

## Fase 2: Filtro Inteligente de Busca (SmartSearchFilter)

**Objetivo:** Implementar SmartSearchFilter (abas, campo destino + voz, datas, hóspedes, BUSCAR AGORA, sugestões Popular).

**Arquivos impactados:** `components/search/smart-search-filter.tsx`, `app/melhorias-mobile/page.tsx`.

**Critérios de “feito”:**
- [x] Componente criado com abas, MapPin, Mic, botão BUSCAR AGORA, chips Popular.
- [x] Integrado na página após header/hero.
- [x] Checkpoint 2 executado.

### Checkpoint 2
- [x] SmartSearchFilter implementado com abas (Tudo/Hotéis/Parques/Passeios), campo “Onde em Caldas Novas?” com MapPin e microfone, datas/hóspedes, botão “BUSCAR AGORA” (blue-600, h-14, rounded-2xl), linha “Popular:” + chips. Integrado em melhorias-mobile após bloco principal do header. Conformidade: **OK**.

---

## Fase 3: Cards de produto (TicketProductCard)

**Objetivo:** TicketProductCard e seção “Mais Vendidos em Caldas” / “Ofertas de Hoje”.

**Arquivos impactados:** `components/cards/ticket-product-card.tsx`, `app/melhorias-mobile/page.tsx`.

**Critérios de “feito”:**
- [x] TicketProductCard com props e estilos do Plano (badge, preço, parcelamento, CTA).
- [x] Seção na página com grid de cards.
- [x] Checkpoint 3 executado.

### Checkpoint 3
- [x] TicketProductCard implementado com overlay, badge “OFERTA RELÂMPAGO”, estrelas, bloco orange-50, preço riscado + “Por apenas” + parcelamento, CTA “GARANTIR MEU INGRESSO” (gradiente yellow-400→orange-400). Seção “Mais Vendidos em Caldas” na page. Conformidade: **OK**.

---

## Fase 4: Checkout Expresso Mobile (MobileExpressCheckoutV2)

**Objetivo:** Barra fixa inferior com economia, parcelamento, RESERVAR AGORA, selo Pagamento Seguro.

**Arquivos impactados:** `components/checkout/mobile-express-checkout-v2.tsx`, `app/melhorias-mobile/page.tsx`.

**Critérios de “feito”:**
- [x] Componente criado; exibido quando há item selecionado; main com pb adequado.
- [x] Checkpoint 4 executado.

### Checkpoint 4
- [x] MobileExpressCheckoutV2 com barra laranja (orange-50), badge “PREÇO DE CALDAS”, parcelamento em destaque, botão “RESERVAR AGORA” (green-500/600), selo ShieldCheck. Exibido quando expressCheckoutItem está setado; main com pb-32/pb-36. Conformidade: **OK**.

---

## Fase 5: Prova Social e Página de Sucesso

**Objetivo:** SocialProofSection (formato Plano) e SuccessReservationPage; fluxo até “reserva confirmada”.

**Arquivos impactados:** `components/social/social-proof-section.tsx`, componente/rota de sucesso, `app/melhorias-mobile/page.tsx`.

**Critérios de “feito”:**
- [x] SocialProofSection com título, cards, badge “Plataforma 100% Verificada”.
- [x] Página/estado de sucesso com voucher, botões, “Dica de Caldas”.
- [x] Checkout “RESERVAR AGORA” leva à sucesso.
- [x] Checkpoint 5 executado.

### Checkpoint 5
- [x] SocialProofSection e rota /reserva-confirmada implementados. “RESERVAR AGORA” do checkout navega para /reserva-confirmada. Conformidade: **OK**.

---

## Fase 6: Skeletons de carregamento

**Objetivo:** SmartSearchSkeleton e TicketCardSkeleton; estado isLoading na page.

**Arquivos impactados:** `components/skeletons/smart-search-skeleton.tsx`, `components/skeletons/ticket-card-skeleton.tsx`, `app/melhorias-mobile/page.tsx`.

**Critérios de “feito”:**
- [x] Skeletons criados; página exibe skeletons quando isLoading, depois conteúdo real.
- [x] Checkpoint 6 executado.

### Checkpoint 6
- [x] SmartSearchSkeleton e TicketCardSkeleton criados; page com estado isLoading (600ms) exibe skeletons e depois componentes reais. Conformidade: **OK**.

---

## Fase 7: Mapa com etiquetas de preço (Leaflet + OSM)

**Objetivo:** CSS das etiquetas (price-tag-bubble, tag-regular/flash/auction); marcadores no mapa com L.divIcon; TileLayer OSM.

**Arquivos impactados:** `app/globals.css`, componente de mapa (AuctionMapLeaflet ou novo), opcionalmente `app/melhorias-mobile/page.tsx`.

**Critérios de “feito”:**
- [x] CSS em globals.css; mapa com marcadores de preço (AuctionMapLeaflet + usePriceTagMarkers); decisão registrada.
- [x] Checkpoint 7 executado.

### Checkpoint 7
- [x] CSS `.price-tag-marker`, `.price-tag-bubble`, `.tag-regular`, `.tag-flash`, `.tag-auction` e hover adicionados em `app/globals.css`. Em `AuctionMapLeaflet` foi adicionada a opção `usePriceTagMarkers`: quando `true`, os marcadores usam `L.divIcon` com as classes acima e preço formatado. TileLayer OSM já existia. A página melhorias-mobile **não** inclui mapa; as etiquetas ficam disponíveis para uso em `/leiloes` e `/mapa-caldas-novas`. Conformidade: **OK**.

---

## Fase 8: Unificação na page e fluxo completo (mobile)

**Objetivo:** Ordem final: Header → SmartSearchFilter → Mais Vendidos → SocialProofSection → Banner Ajuda → Checkout fixo; padding e links.

**Arquivos impactados:** `app/melhorias-mobile/page.tsx`.

**Critérios de “feito”:**
- [x] Ordem conforme “Protótipo da Página Principal”; padding-bottom para checkout; links e navegação ok.
- [x] Checkpoint 8 executado.

### Checkpoint 8
- [x] Ordem na page: Header/Hero → SmartSearchFilter → Mais Vendidos (com link “Ver todos” blue-600) → SocialProofSection → Banner “Precisa de Ajuda?” (WhatsApp) → resto do conteúdo. Checkout fixo exibido quando há item selecionado; main com pb-32/pb-36 quando checkout visível. Botão “RESERVAR AGORA” navega para /reserva-confirmada. Conformidade: **OK**.

---

## Fase 9: Ajustes desktop e responsividade

**Objetivo:** Layout desktop correto (filtro em linha, grid de produtos, prova social, checkout, side rails).

**Arquivos impactados:** `app/melhorias-mobile/page.tsx`, componentes envolvidos.

**Critérios de “feito”:**
- [x] SmartSearchFilter em grid md; produtos em 2 colunas; prova social em 2 col; checkout não cobre conteúdo; side rails ok.
- [x] Checkpoint 9 executado.

### Checkpoint 9
- [x] SmartSearchFilter usa `md:grid-cols-12` e em lg os campos + botão ficam em uma linha. Grid de produtos usa `md:grid-cols-2`. SocialProofSection usa `md:grid-cols-2`. MobileExpressCheckoutV2 tem `md:max-w-[1320px] md:left-1/2 md:-translate-x-1/2` e main tem `pb-32 md:pb-36` quando visível. LeftSideRail e RightSideRail mantidos no layout desktop. Conformidade: **OK**.

---

## Fase 10: Documento final e checklist de conformidade

**Objetivo:** Fechar handover com checklist único e referências.

**Arquivos impactados:** `REMESTER_MELHORIAS_MOBILE_HANDOVER.md`.

**Critérios de “feito”:**
- [x] Lista de verificação final (Implementado/Parcial/Não aplicado) para cada componente.
- [x] Seções “Conformidade com Plano completo” e “Conformidade com OSM”.
- [x] Referências e “Notas do Gemini” (se houver).
- [x] Checkpoint 10 executado; documento marcado v1.0 Remaster.

### Lista de verificação final

| Componente / Item | Status | Observação |
|-------------------|--------|------------|
| SmartSearchFilter | Implementado | Abas, destino+MapPin+Mic, datas/hóspedes, BUSCAR AGORA, chips Popular. |
| TicketProductCard | Implementado | Badge OFERTA RELÂMPAGO, preço, parcelamento, CTA “GARANTIR MEU INGRESSO”, onAddToCart. |
| MobileExpressCheckoutV2 | Implementado | Barra fixa, economia, parcelamento, RESERVAR AGORA, selo Pagamento Seguro. |
| SocialProofSection | Implementado | Título “Quem viaja com a Reservei, aprova!”, cards com Quote/estrelas/avatar/CheckCircle2, badge “Plataforma 100% Verificada”. |
| SuccessReservationPage | Implementado | Rota `/reserva-confirmada`: header verde, voucher, Download/WhatsApp, “Dica de Caldas”. |
| SmartSearchSkeleton | Implementado | Tabs + campos + botão + Popular em skeleton. |
| TicketCardSkeleton | Implementado | Imagem + blocos + bloco preço orange-50/50 + botão. |
| Mapa com etiquetas OSM | Implementado | CSS em globals.css; AuctionMapLeaflet com `usePriceTagMarkers`; uso em /leiloes ou /mapa-caldas-novas. |
| Ordem e fluxo na page | Implementado | Header → Filtro → Mais Vendidos → Prova Social → Banner Ajuda → checkout fixo quando há seleção. |
| Desktop / responsividade | Implementado | Grid md no filtro e produtos; prova social 2 col; side rails mantidos. |

### Conformidade com Plano completo

- **Atendido:** Sistema de cores, SmartSearchFilter, TicketProductCard, MobileExpressCheckoutV2, SocialProofSection, SuccessReservationPage, Skeletons, mapa com tags OSM, ordem da página, responsividade, handover com checkpoints.
- **Fora do escopo (fase futura):** Backend de IA (RAG, agentes, webhooks, Vector DB, Evals) – referenciado no Plano como não escopo deste remaster.

### Conformidade com OSM

- **CSS:** `.price-tag-marker`, `.price-tag-bubble`, `.price-tag-bubble::after`, `.tag-regular`, `.tag-flash`, `.tag-auction` e hover aplicados em `app/globals.css`.
- **Uso:** `AuctionMapLeaflet` com prop `usePriceTagMarkers={true}` usa `L.divIcon` com HTML das classes acima e Popup existente. TileLayer OSM já utilizada.

### Checkpoint 10
- [x] Handover e documentos fonte relidos. Documento marcado como v1.0 Remaster (2025-02-11).

---

## Referências

- **Plano completo Layout Inteligente RSV 360:**  
  `RSV360 Versao Oficial definitivo/cores da marca rsv360 reservei viagens/Plano completo Layout Inteligente RSV 360.txt`

- **OpenStreetMap (OSM) – etiquetas de preço:**  
  `RSV360 Versao Oficial definitivo/cores da marca rsv360 reservei viagens/OpenStreetMap (OSM).txt`

- **Link Gemini (conteúdo não acessível aqui):**  
  https://gemini.google.com/share/6f50bff5b123

### Notas do Gemini
_(Colar aqui trechos relevantes da conversa do Gemini, se houver requisitos ou telas adicionais.)_

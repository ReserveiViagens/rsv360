# Análise: Imagens de Referência RSV360 vs. Desenvolvido

**Data:** 2025-02-11  
**Fonte:** Imagens/mockups enviados (telas RSV360, Reservei Viagens, CaldasAI, Leilão, mapa, dashboards).

Este documento compara as **telas das imagens de referência** com o que está **implementado** no projeto (site-publico, melhorias-mobile, leilões, etc.).

---

## 1. Mapeamento das imagens por tipo de tela

| Tipo de tela (nas imagens) | O que mostra | Rota / componente no projeto |
|----------------------------|--------------|-----------------------------|
| **Página principal mobile (Reservei / melhorias-mobile)** | Header, abas Tudo/Parques/Passeios, BUSCAR AGORA, chips Popular, Mais Vendidos (cards OFERTA RELÂMPAGO), “Quem viaja com a Reservei, aprova!”, PREÇO CALDAS, RESERVAR AGORA, Pagamento Seguro, ChatAgent | `melhorias-mobile/page.tsx` + SmartSearchFilter, TicketProductCard, SocialProofSection, MobileExpressCheckoutV2 |
| **Hotel Details (desktop)** | Nav azul, hero resort, widget Reservar (datas, hóspedes, preço), Sobre o Hotel, Comodidades, Mapa (pin simples), bolha Chat “Dúvidas sobre este hotel?” | Página de detalhe de hotel (ex.: `/hoteis/[id]`); mapa sem etiquetas de preço |
| **Flash Deals / Card de oferta** | RSV360 Flash Deals, -70% OFF, countdown “ENDING SOON”, 90% Sold Out, “Only 2 rooms left”, botão DAR LANCE R$ 760 (verde) | TicketProductCard + possível tela de leilão/flash; cronômetro e “X vendidos” parcialmente no card |
| **Leilão Ao Vivo** | RSV360 Leilão Ao Vivo, Resort Termas Paradise, countdown, Lance Atual R$ 750, Últimos Lances (Ana, Carlos), “Only 2 rooms left”, DAR LANCE R$ 760, ícone ChatAgent | `/leiloes`, AuctionMapLeaflet; checkout expresso de lance |
| **Mapa com etiquetas de preço** | Mapa Caldas Novas, bolhas com preço: regulares (cinza/azul), Flash Deal (laranja), Leilão (roxo “Leilaçõn”), card “Hotel Hotel” no canto | CSS em `globals.css` (price-tag-bubble, tag-regular/flash/auction); `AuctionMapLeaflet` com `usePriceTagMarkers`; uso em /leiloes ou /mapa-caldas-novas |
| **CaldasAI / Chat (mobile)** | Header CaldasAI, “Reserva Segura”, bolhas de chat, card de hotel (imagem, preço riscado + final em verde, “Ver Detalhes”) | ChatAgent; card dentro do chat pode inspirar TicketProductCard em contexto de conversa |
| **RSV360 BRAIN (chat Alex)** | Alex - Seu Especialista RSV360, pergunta “hotel Caldas 5 pessoas março piscina”, resposta com “Últimas 3 unidades!”, 10x de R$490, VER DETALHES E RESERVAR | Assistente IA; fora do escopo do remaster site público |
| **Perfil (Minhas Reservas, Meus Pontos)** | Header roxo RSV360, Gold Tier, Minhas Reservas (card Resort Termas Paradise), Meus Pontos 1500, Configurações, bottom nav Home/Busca/Reservas/Perfil | `/perfil`, `/minhas-reservas`; já existem no projeto |
| **Em Grupo com Amigos** | Chat em grupo, card “Resort Termas Paradise”, Convidar Amigo, Documentos Compartilhados, tabs Vouchers/Ingressos/Programação | Viagens em grupo / grupo de amigos; verificar se existe rota equivalente |
| **Contact Us / Quem Somos** | Fale Conosco (WhatsApp), E-mail, Nossas Unidades, formulário; Quem Somos com timeline, texto, imagens, rodapé Site Seguro, LGPD Compliant, Parceiro Oficial Caldas Novas | Contato institucional, Quem Somos; ver `PAGE_DOC_CONTATO_INSTITUCIONAL_PERFIL.md` |
| **Dashboard B2B / Financial** | Sidebar escura, Receita Mensal (gráfico), Origem das Reservas (donut), Ticket Médio (barras), Últimas Transações | Dashboard parceiro / admin; fora do escopo melhorias-mobile |
| **RSV360 BRAIN (treinamento)** | Upload documentos, Documentos Processados, Log “AI Agent updated” | IA / RAG; fora do escopo remaster site público |

---

## 2. O que ESTÁ alinhado às imagens (implementado)

| Elemento das imagens | No projeto | Observação |
|----------------------|------------|------------|
| Header azul com logo, Entrar, Cadastrar | ✅ | `melhorias-mobile/page.tsx` e outras páginas |
| Abas Tudo / Parques / Passeios + campo busca + BUSCAR AGORA + chips Popular (Hot Park, diRoma, Lagoa Quente) | ✅ | `SmartSearchFilter` |
| Seção “Mais Vendidos em Caldas” com cards (imagem, badge OFERTA RELÂMPAGO, estrelas, bloco de preço laranja/amarelo) | ✅ | `TicketProductCard` em grid |
| “Quem viaja com a Reservei, aprova!” + depoimentos com avatar/inicial + badge verificado | ✅ | `SocialProofSection` |
| Bloco com economia, PREÇO CALDAS, RESERVAR AGORA (verde) + selo “Pagamento Seguro” | ✅ | `MobileExpressCheckoutV2` (barra fixa quando há item) |
| ChatAgent (bolha/ícone de chat) | ✅ | Componente ChatAgent na página |
| Mapa com bolhas de preço (regular, flash, leilão) | ✅ | CSS `.price-tag-bubble`, `.tag-regular/flash/auction`; `AuctionMapLeaflet` com `usePriceTagMarkers` |
| Página de sucesso (voucher, Download, WhatsApp, Dica de Caldas) | ✅ | `/reserva-confirmada` |
| Banner “Precisa de Ajuda?” (WhatsApp) | ✅ | Na página melhorias-mobile |
| Cores: azul (confiança), laranja/amarelo (ofertas), verde (CTA), vermelho (urgência) | ✅ | Design system e componentes |

---

## 3. O que FALTA ou está DIFERENTE em relação às imagens

| Elemento nas imagens | Status no projeto | Ação sugerida |
|----------------------|-------------------|----------------|
| **Cronômetro de oferta** (“00:04:32 - ENDING SOON”) em cards | ❌ Não implementado | Adicionar opcional em `TicketProductCard` (ex.: prop `countdownEnd`) ou em página de flash/leilão |
| **“90% Sold Out” / barra de progresso** no card | ❌ Não implementado | Opcional: prop `soldPercent` ou `remaining` em TicketProductCard |
| **Bolha de escassez** (“Only 2 rooms left at this price!”) ao lado do card | Parcial | Prova social numérica (“X pessoas compraram hoje”) existe; mensagem de “quartos restantes” pode ser acrescentada em contexto de hotel |
| **Botão “DAR LANCE”** (leilão) em vez de “GARANTIR MEU INGRESSO” | Contexto diferente | Leilão usa fluxo próprio; em `/leiloes` já existe BidForm / lances; manter CTA por contexto (ingresso vs. leilão) |
| **Widget de reserva sobre o hero** (datas, hóspedes, preço, Reservar Agora) na página de detalhe do hotel | ✅ Implementado (2025-02-11) | `HotelBookingWidget` em `app/hoteis/[id]/page.tsx` e `components/hotel/HotelBookingWidget.tsx`. |
| **Mapa na página de detalhe do hotel** com apenas 1 pin (sem etiquetas de preço) | Diferente do mapa “etiquetas” | Página de hotel pode usar mapa simples; etiquetas de preço ficam em /leiloes ou /mapa-caldas-novas |
| **Card dentro do chat** (CaldasAI) com preço em verde e “Ver Detalhes” | Verificar ChatAgent | Se o chat exibir ofertas, alinhar card às cores do plano (ex.: preço em destaque laranja/verde conforme contexto) |
| **Perfil com “Gold Tier” e “Meus Pontos”** | Rotas existem | Confirmar se UI de perfil/minhas-reservas está igual ao mockup (layout, cores, badges) |
| **Contact Us / Quem Somos** (timeline, Site Seguro, LGPD, Parceiro Oficial) | ✅ Implementado (2025-02-11) | Contato: Fale Conosco, Envie um E-mail, Nossas Unidades, form Enviar Mensagem. `app/quem-somos/page.tsx` com timeline e selos. |
| **Tabs “Vouchers / Ingressos / Programação”** (pós-reserva) | Verificar | Se existir rota ou drawer pós-reserva, alinhar labels e fluxo ao mockup |

---

## 4. Resumo por tela de referência

- **Melhorias-mobile (Reservei):** A maior parte do que aparece na imagem (filtro, abas, chips, Mais Vendidos, cards, prova social, checkout fixo, selo, ChatAgent) **está implementada**. Faltam cronômetro e “Sold Out”/progresso nos cards, opcionais.
- **Hotel Details:** Comparar com `/hoteis/[id]` (widget de reserva, mapa, chat).
- **Flash Deals / Leilão:** Cards e CTAs verdes/laranja/vermelho alinhados; cronômetro e “Últimos Lances” são específicos de leilão e em parte já existem em `/leiloes`.
- **Mapa com etiquetas:** CSS e `AuctionMapLeaflet` com `usePriceTagMarkers` atendem ao desenho (regular, flash, leilão); falta usar em uma rota de “mapa de ofertas” em Caldas se desejado.
- **Chat (CaldasAI/BRAIN):** ChatAgent existe; cards de oferta dentro do chat podem ser refinados (cores, texto “Ver Detalhes”).
- **Perfil, Contato, Quem Somos, Dashboards:** Rotas ou docs existem; conferir layout e textos contra as imagens.

---

## 5. Localização das imagens de referência

As imagens de referência do usuário (mockups/telas RSV360) estão em:

- **`assets/...`** (path do workspace Cursor, ex.: `assets/c__Users_RSV_AppData_Roaming_Cursor_User_workspaceStorage_.../images/`).

Podem ser copiadas para **`docs/referencia-ui`** (opcional) para uso da equipe.

**Imagens locais de parques (Hot Park / diRoma):** Foi criada a pasta **`apps/site-publico/public/images`** (ou `public/images/parques`). Se existirem arquivos `hot-park.jpg` e `diroma.jpg` nessa pasta, a página **melhorias-mobile** (`app/melhorias-mobile/page.tsx`) usará essas imagens nos cards correspondentes; caso contrário, é usado fallback para URLs Unsplash. Path base utilizado: `/images` (ex.: `/images/hot-park.jpg`).

---

## 6. Atualização pós-remaster (2025-02-11)

Os itens da seção 3 e 4 foram implementados conforme plano: cronômetro/Sold Out/escassez em TicketProductCard; widget de reserva e mapa no hotel (`HotelBookingWidget`, `HotelMapPin`); card de oferta no ChatAgent (preço verde, "Ver Detalhes"); perfil com Gold Tier, Minhas Reservas, Meus Pontos e bottom nav; Contato (Fale Conosco, Envie um E-mail, Nossas Unidades, form); página Quem Somos com timeline e selos (Site Seguro, LGPD, Parceiro Oficial). Arquivos alterados: `ticket-product-card.tsx`, `app/hoteis/[id]/page.tsx`, `components/hotel/*`, `chat-agent.tsx`, `app/perfil/page.tsx`, `app/contato/page.tsx`, `app/quem-somos/page.tsx`.

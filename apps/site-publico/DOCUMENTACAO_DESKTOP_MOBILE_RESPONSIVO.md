# Documentação Completa: Web Desktop, Mobile e Responsivo

## RSV360 (Reservei Viagens) × Airbnb.com.br

Documentação passo a passo das versões **Web Desktop**, **Mobile** e do comportamento **Responsivo**, com comparação entre os dois sites.

---

# PARTE 1 – BREAKPOINTS E CONVENÇÕES

## 1.1 Breakpoints do RSV360 (Tailwind CSS)

| Prefixo | Largura mínima | Uso típico |
|---------|----------------|------------|
| *(default)* | 0px | Mobile first |
| `xs` | 475px | Mobile grande / phablet |
| `sm` | 640px | Tablet portrait |
| `md` | 768px | Tablet landscape / desktop pequeno |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande / monitor |

**Arquivo:** `apps/site-publico/tailwind.config.ts` (seção `theme.extend.screens`).

## 1.2 Convenção de larguras máximas (RSV360)

| Contexto | Classe | Largura |
|----------|--------|---------|
| Container geral da home | `max-w-md` (mobile) | ~448px |
| Container desktop | `md:max-w-[1320px]` | 1320px |
| Container xl | `xl:max-w-[1440px]` | 1440px |
| Container 2xl | `2xl:max-w-[1600px]` | 1600px |
| Conteúdo central (desktop) | `minmax(0, 1fr)` | Flexível entre colunas |

## 1.3 Referência de breakpoints (Airbnb / mercado)

- **Mobile:** até ~744px (layout em coluna, barra inferior)
- **Tablet:** ~745px–1127px (grid intermediário)
- **Desktop:** ~1128px+ (grid 12 colunas, header completo)

---

# PARTE 2 – VERSÃO WEB DESKTOP (RSV360)

## 2.1 Quando ativa

- Largura da viewport **≥ 768px** (`md`).

## 2.2 Estrutura do layout (passo a passo)

### Passo 1 – Container principal
- Classe: `max-w-md mx-auto` (mobile) → `md:max-w-[1320px]` → `xl:max-w-[1440px]` → `2xl:max-w-[1600px]`.
- Padding horizontal: `md:px-4` → `xl:px-8` → `2xl:px-10`.

### Passo 2 – Grid de 3 colunas
- Classe: `md:grid md:grid-cols-[18rem_minmax(0,1fr)_18rem]`.
- Em `lg`: colunas mantidas, `lg:gap-6`.
- Em `xl`: `xl:grid-cols-[20rem_minmax(0,1fr)_20rem]`, `xl:gap-8`.
- Em `2xl`: `2xl:grid-cols-[20.5rem_minmax(0,1fr)_20.5rem]`, `2xl:gap-10`.

### Passo 3 – Coluna esquerda (Side Rail Esquerdo)
- Componente: `LeftSideRail`.
- Exibição: `hidden md:block`.
- Largura: `w-72` (18rem) → `xl:w-80` → `2xl:w-[20.5rem]`.
- Conteúdo: cards “Descubra experiências” (Aluguel temporada, Hotéis, Parques, Atrações, Leilões).
- Comportamento: `sticky top-6` (`xl:top-8`, `2xl:top-10`).

### Passo 4 – Coluna central
- Área principal da home.
- Largura: `md:max-w-none` (ocupa o `1fr` do grid).
- Margens: `md:mt-4`, `xl:mt-6`, `md:mb-6`, `xl:mb-8`.
- Estilo: `md:rounded-3xl md:border md:border-gray-200 xl:shadow-sm`.
- Conteúdo: header, busca, banner, categorias, promoção, trust badges, cards, avaliações, footer.

### Passo 5 – Coluna direita (Side Rail Direito)
- Componente: `RightSideRail`.
- Exibição: `hidden md:block`.
- Largura: igual à esquerda.
- Conteúdo: “Oportunidades do dia” (Flash Deals, Viagens em grupo, Excursões, Oferta da semana).
- Sticky: mesmo padrão da coluna esquerda.

### Passo 6 – Elementos fixos (desktop)
- **Realizar Cotação:** `fixed md:bottom-6 md:right-8` (FAB verde).
- **Scroll to top:** `fixed md:bottom-24 md:right-8`.
- **Circular Nav:** sempre visível, centralizado na parte inferior.

### Passo 7 – O que NÃO aparece no desktop
- Chat Agent: `md:hidden` (apenas mobile).

## 2.4 Desktop – Resumo visual

```
[ Side Rail Esquerdo ] [ Conteúdo central (header, busca, banner, categorias, promo, cards, reviews, footer) ] [ Side Rail Direito ]
        (18–20.5rem)                                    (1fr)                                                    (18–20.5rem)
```

---

# PARTE 3 – VERSÃO MOBILE (RSV360)

## 3.1 Quando ativa

- Largura da viewport **< 768px** (antes do breakpoint `md`).

## 3.2 Estrutura do layout (passo a passo)

### Passo 1 – Container
- `max-w-md mx-auto`: conteúdo centralizado, largura máxima ~448px.
- Sem grid de colunas: uma única coluna.

### Passo 2 – Side Rails
- `LeftSideRail` e `RightSideRail`: `hidden md:block` → **não são renderizados** no mobile.

### Passo 3 – Conteúdo central (única coluna)
- Header azul com logo, “Entrar”, “Cadastrar”.
- Barra de busca (toque leva a `/buscar`).
- Banner/imagem.
- Grid de 4 categorias (Buscar, Hotéis, Ingressos, Atrações).
- Botão “Ver Promoções Especiais”.
- Card de promoção (PROMOFÉRIAS).
- Trust badges (3 colunas).
- Cards de acesso rápido (2 colunas: Hotéis, Promoções).
- Seção de avaliações.
- Footer (endereços, e-mail, telefone, WhatsApp, redes).

### Passo 4 – Navegação (Circular Nav)
- Menu circular fixo na parte inferior (botão “Menu” que abre semicírculo).
- Itens: Início, Buscar, Hotéis, Promoções, Ingressos, Atrações, Perfil, Contato.
- Dois anéis (externo/interno), rotação por gesto ou botões “Ext”/“Int”.

### Passo 5 – FABs no mobile
- **Realizar Cotação:** `fixed bottom-20 right-4` (acima do circular nav).
- **Scroll to top:** `fixed bottom-32 right-4`.

### Passo 6 – Chat Agent
- `md:hidden`: **somente no mobile**.
- Componente: `ChatAgent` (suporte/chat).

### Passo 7 – Viewport e PWA
- `viewport`: `width: device-width`, `initialScale: 1`, `maximumScale: 5`.
- `themeColor: #2563eb`.
- `apple-touch-icon`, `mobile-web-app-capable` para comportamento de app.

## 3.3 Mobile – Resumo visual

```
[ Header: logo, Entrar, Cadastrar ]
[ Busca ]
[ Banner ]
[ 4 categorias ]
[ Ver Promoções ]
[ Conteúdo: promo, badges, cards, reviews ]
[ Footer ]
[ FAB Cotação ] [ FAB Scroll ]
[ Circular Nav (Menu) ]
```

---

# PARTE 4 – COMPORTAMENTO RESPONSIVO (RSV360)

## 4.1 Transição principal: mobile → desktop

| Largura | Comportamento |
|---------|----------------|
| 0 – 767px | 1 coluna, sem side rails, Chat Agent visível, FABs em `bottom-20` / `bottom-32`. |
| 768px (md) | Grid 3 colunas ativado, Side Rails visíveis, Chat Agent oculto, FABs em `bottom-6` / `bottom-24`. |

## 4.2 Ajustes por breakpoint no conteúdo central

| Elemento | Mobile | md (768px+) | lg | xl | 2xl |
|----------|--------|-------------|-----|-----|-----|
| Container max-width | max-w-md | 1320px | 1320px | 1440px | 1600px |
| Colunas side rail | 0 | 18rem | 18rem | 20rem | 20.5rem |
| Gap do grid | - | 4 | 6 | 8 | 10 |
| Conteúdo central | full | 1fr | 1fr | 1fr | 1fr |

## 4.3 Grids internos (exemplos em outras páginas)

- **Cards:** `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3` ou `lg:grid-cols-4`.
- **Títulos:** `text-2xl` → `sm:text-3xl`.
- **Botões:** `w-full` → `sm:w-auto`.
- **Padding:** `p-4` → `sm:p-6` ou `p-6` → `xl:p-8`.

## 4.4 Circular Nav (todas as larguras)

- Fixo: `position: fixed; bottom: 0; left: 50%; width: 340px`.
- Não muda de estrutura entre mobile e desktop; sempre o mesmo menu circular.

---

# PARTE 5 – AIRBNB: DESKTOP, MOBILE E RESPONSIVO

## 5.1 Desktop (Airbnb)

- **Header:** logo, busca expandível (destino, datas, hóspedes), “Hospedar”, “Criar experiência”, ícone de notificações, perfil/entrar.
- **Conteúdo:** grid de listagens (“Homes on Airbnb”), filtros laterais ou em barra.
- **Footer:** links em colunas (Suporte, Comunidade, Hospedagem, etc.).
- **Sem** side rails no mesmo sentido do RSV360; layout mais “full-width” com grid de cards.

## 5.2 Mobile (Airbnb)

- **Header:** logo, ícones (busca, favoritos, perfil).
- **Busca:** muitas vezes um único campo ou barra que abre tela/modal de busca.
- **Conteúdo:** lista ou grid de acomodações em 1–2 colunas.
- **Barra inferior:** Explorar | Favoritos | Entrar (3 itens).
- **Modal de cookies:** “Aceitar todos”, “Somente o necessário”, “Gerenciar”.

## 5.3 Responsivo (Airbnb)

- Transição em torno de **744px** e **1128px** (valores típicos).
- Mobile: barra inferior, header compacto.
- Desktop: header completo com busca inline, grid maior de listagens.

---

# PARTE 6 – COMPARATIVO DETALHADO POR CONTEXTO

## 6.1 Desktop: RSV360 × Airbnb

| Aspecto | RSV360 | Airbnb |
|---------|--------|--------|
| Layout | 3 colunas (rail | conteúdo | rail) | Conteúdo principal + eventual sidebar de filtros |
| Side rails | Sim (esquerdo e direito) | Não |
| Header | Azul, busca + Entrar/Cadastrar | Neutro, busca expandível + múltiplos links |
| Busca | Redireciona para `/buscar` | Inline com modal e filtros |
| Navegação global | Circular Nav (sempre) | Menu superior + links |
| FABs | Cotação + Scroll to top | Não no mesmo padrão |

## 6.2 Mobile: RSV360 × Airbnb

| Aspecto | RSV360 | Airbnb |
|---------|--------|--------|
| Navegação inferior | Circular Nav (8 itens em anel) | Barra fixa (3 itens: Explorar, Favoritos, Entrar) |
| Side rails | Ocultos | N/A |
| Chat/suporte | Chat Agent visível | Não no mesmo destaque |
| Busca | Toque → `/buscar` | Campo ou modal de busca |
| FABs | Cotação + Scroll | Não no mesmo padrão |

## 6.3 Responsivo: RSV360 × Airbnb

| Aspecto | RSV360 | Airbnb |
|---------|--------|--------|
| Breakpoint principal | 768px (md) | ~744px / ~1128px |
| Colunas no desktop | 3 (rail + centro + rail) | 1 conteúdo + filtros |
| Colunas no mobile | 1 | 1 |
| Menu em mobile | Circular (abre ao toque) | Barra inferior linear |
| Elementos que somem no mobile | Side rails, (e Chat no desktop) | Header completo (simplificado) |

---

# PARTE 7 – CHECKLIST DE TESTES (PASSO A PASSO)

## 7.1 Desktop (≥ 768px)

1. [ ] Abrir http://localhost:3000 em viewport ≥ 768px.
2. [ ] Verificar 3 colunas: rail esquerdo, centro, rail direito.
3. [ ] Verificar header com logo, busca, Entrar, Cadastrar.
4. [ ] Clicar na busca e confirmar redirecionamento para `/buscar`.
5. [ ] Verificar sticky dos side rails ao rolar.
6. [ ] Verificar FAB “Realizar Cotação” em `bottom-6 right-8`.
7. [ ] Verificar botão “Scroll to top” em `bottom-24 right-8`.
8. [ ] Abrir Circular Nav e testar todos os links.
9. [ ] Confirmar que Chat Agent **não** aparece.

## 7.2 Mobile (< 768px)

1. [ ] Redimensionar para < 768px ou usar dispositivo/emulação.
2. [ ] Verificar uma única coluna, sem side rails.
3. [ ] Verificar header e busca.
4. [ ] Verificar FAB Cotação em `bottom-20 right-4`.
5. [ ] Verificar Scroll to top em `bottom-32 right-4`.
6. [ ] Abrir Circular Nav (botão Menu) e testar anéis e links.
7. [ ] Confirmar que Chat Agent **aparece**.

## 7.3 Transição responsiva

1. [ ] Aumentar largura de 320px até 1600px.
2. [ ] Em 768px: side rails devem aparecer e layout passar a 3 colunas.
3. [ ] Em 768px: Chat Agent deve sumir.
4. [ ] Posições dos FABs devem mudar conforme as classes `md:bottom-*` e `md:right-*`.

---

# PARTE 8 – REFERÊNCIAS DE CÓDIGO (RSV360)

| Funcionalidade | Arquivo | Trecho / Classe relevante |
|----------------|---------|----------------------------|
| Breakpoints | `tailwind.config.ts` | `screens: { xs, sm, md, lg, xl, 2xl }` |
| Layout 3 colunas | `app/page.tsx` | `md:grid md:grid-cols-[18rem_minmax(0,1fr)_18rem]` |
| Side rail esquerdo | `components/home/left-side-rail.tsx` | `hidden md:block` |
| Side rail direito | `components/home/right-side-rail.tsx` | `hidden md:block` |
| Chat só mobile | `app/page.tsx` | `md:hidden` em volta de `ChatAgent` |
| FAB Cotação | `app/page.tsx` | `bottom-20 right-4 md:bottom-6 md:right-8` |
| Scroll to top | `app/page.tsx` | `bottom-32 right-4 md:bottom-24 md:right-8` |
| Viewport | `app/layout.tsx` | `viewport: { width, initialScale, maximumScale }` |
| Dados dos rails | `lib/home-side-rails.ts` | `getHomeSideRailsFallback`, `getHomeSideRailsData` |
| Circular Nav | `components/circular-nav.tsx` | Fixo, sem breakpoint (sempre igual) |

---

# PARTE 9 – SEÇÃO DE SCREENSHOTS / FIGURAS

Esta seção define **quais capturas de tela fazer**, **onde salvar** e **o que cada figura deve mostrar**. Use-a como guia para gerar e manter um álbum de imagens da documentação.

## 9.1 Pasta sugerida para imagens

```
apps/site-publico/docs/screenshots/
├── desktop/
│   ├── 01-layout-3-colunas.png
│   ├── 02-side-rail-esquerdo.png
│   ├── 03-side-rail-direito.png
│   ├── 04-header-busca.png
│   ├── 05-conteudo-central.png
│   ├── 06-fabs-circular-nav.png
│   └── 07-full-page.png
├── mobile/
│   ├── 01-layout-1-coluna.png
│   ├── 02-header-busca.png
│   ├── 03-categorias-promo.png
│   ├── 04-chat-agent.png
│   ├── 05-circular-nav-fechado.png
│   ├── 06-circular-nav-aberto.png
│   ├── 07-fabs.png
│   └── 08-full-page.png
└── responsivo/
    ├── transicao-768-antes.png
    └── transicao-768-depois.png
```

## 9.2 Screenshots DESKTOP (viewport ≥ 768px)

| # | Nome do arquivo | O que capturar | Descrição breve |
|---|-----------------|----------------|-----------------|
| 1 | `01-layout-3-colunas.png` | Tela inteira da home | Mostrar as 3 colunas: rail esquerdo, centro, rail direito. Incluir um pouco do topo e do rodapé. |
| 2 | `02-side-rail-esquerdo.png` | Apenas a coluna esquerda | Cards “Descubra experiências”: Aluguel temporada, Hotéis, Parques, Atrações, Leilões. |
| 3 | `03-side-rail-direito.png` | Apenas a coluna direita | “Oportunidades do dia”: Flash Deals, Viagens em grupo, Excursões, Oferta da semana. |
| 4 | `04-header-busca.png` | Header + barra de busca | Logo, links Entrar/Cadastrar, campo de busca (sem side rails no foco). |
| 5 | `05-conteudo-central.png` | Coluna do meio | Banner, categorias, botão “Ver Promoções”, card PROMOFÉRIAS, trust badges, cards Hotéis/Promoções. |
| 6 | `06-fabs-circular-nav.png` | Região inferior direita + centro | FAB “Realizar Cotação”, botão “Scroll to top” e Circular Nav (aberto ou fechado). |
| 7 | `07-full-page.png` | Scroll completo (composite ou long screenshot) | Da header até o footer, com side rails visíveis nas laterais. |

## 9.3 Screenshots MOBILE (viewport < 768px, ex.: 375×667 ou 390×844)

| # | Nome do arquivo | O que capturar | Descrição breve |
|---|-----------------|----------------|-----------------|
| 1 | `01-layout-1-coluna.png` | Home em uma coluna | Sem side rails; conteúdo central único. |
| 2 | `02-header-busca.png` | Header + busca | Logo, Entrar, Cadastrar, barra de busca. |
| 3 | `03-categorias-promo.png` | Grid 4 categorias + “Ver Promoções” | Buscar, Hotéis, Ingressos, Atrações + card/botão de promoção. |
| 4 | `04-chat-agent.png` | Widget de Chat Agent | Onde ele aparece na tela (canto, barra, etc.) — **elemento só mobile**. |
| 5 | `05-circular-nav-fechado.png` | Botão “Menu” fechado | Apenas o botão verde “Menu” no centro inferior. |
| 6 | `06-circular-nav-aberto.png` | Circular Nav aberto | Semicírculo com itens (Início, Buscar, Hotéis, etc.) e botões Ext/Int. |
| 7 | `07-fabs.png` | FABs no mobile | “Realizar Cotação” (bottom-20) e “Scroll to top” (bottom-32) no canto direito. |
| 8 | `08-full-page.png` | Página inteira (scroll) | Do topo ao footer em uma coluna; incluir área do Circular Nav. |

## 9.4 Screenshots RESPONSIVO (transição)

| # | Nome do arquivo | O que capturar | Descrição breve |
|---|-----------------|----------------|-----------------|
| 1 | `transicao-768-antes.png` | Viewport 767px (ou 760px) | Layout ainda em 1 coluna, sem rails, Chat visível. |
| 2 | `transicao-768-depois.png` | Viewport 768px (ou 770px) | Mesma página com 3 colunas e side rails; Chat sumiu. |

## 9.5 Como inserir as figuras neste documento

Depois de gerar as imagens, você pode referenciá-las no Markdown assim:

```markdown
### Desktop – Layout de 3 colunas
![Layout desktop 3 colunas](docs/screenshots/desktop/01-layout-3-colunas.png)

### Mobile – Uma coluna
![Layout mobile 1 coluna](docs/screenshots/mobile/01-layout-1-coluna.png)
```

Ajuste os caminhos se a pasta do documento for diferente (ex.: raiz do repo vs. `apps/site-publico`).

---

# PARTE 10 – DIFERENCIAIS APENAS DESKTOP (RSV360)

Tudo o que existe **somente** quando a viewport é **≥ 768px** (`md`). Em mobile esses elementos não existem ou não são exibidos.

## 10.1 Layout

| Diferencial | Descrição |
|-------------|-----------|
| **Grid de 3 colunas** | Layout `grid` com `grid-cols-[18rem_minmax(0,1fr)_18rem]` (e variantes em `xl`/`2xl`). No mobile não há grid de colunas. |
| **Largura máxima do container** | `md:max-w-[1320px]`, `xl:max-w-[1440px]`, `2xl:max-w-[1600px]`. No mobile é `max-w-md` (~448px). |
| **Padding horizontal** | `md:px-4`, `xl:px-8`, `2xl:px-10`. No mobile o padding é o padrão da página. |

## 10.2 Side Rail Esquerdo (apenas desktop)

| Diferencial | Descrição |
|-------------|-----------|
| **Visibilidade** | `hidden md:block` — só aparece a partir de 768px. |
| **Largura** | `w-72` (18rem) → `xl:w-80` → `2xl:w-[20.5rem]`. |
| **Conteúdo** | Cards “Descubra experiências”: Aluguel temporada, Hotéis, Parques, Atrações, Leilões (links e imagens). |
| **Comportamento** | `sticky top-6` (xl: top-8, 2xl: top-10) — acompanha o scroll. |
| **Arquivo** | `components/home/left-side-rail.tsx`. |

## 10.3 Side Rail Direito (apenas desktop)

| Diferencial | Descrição |
|-------------|-----------|
| **Visibilidade** | `hidden md:block` — só a partir de 768px. |
| **Largura** | Mesma progressão do rail esquerdo. |
| **Conteúdo** | “Oportunidades do dia”: Flash Deals, Viagens em grupo, Excursões, Oferta da semana. |
| **Comportamento** | Sticky igual ao esquerdo. |
| **Arquivo** | `components/home/right-side-rail.tsx`. |

## 10.4 Coluna central (estilo desktop)

| Diferencial | Descrição |
|-------------|-----------|
| **Margens** | `md:mt-4`, `xl:mt-6`, `md:mb-6`, `xl:mb-8`. |
| **Estilo de “card”** | `md:rounded-3xl md:border md:border-gray-200 xl:shadow-sm` — a área central ganha borda e sombra só no desktop. |
| **Largura** | Ocupa o `1fr` do grid (entre os dois rails). No mobile ocupa 100% da largura do container. |

## 10.5 Posição dos FABs (apenas desktop)

| Diferencial | Descrição |
|-------------|-----------|
| **Realizar Cotação** | `md:bottom-6 md:right-8` — mais próximo do canto. No mobile: `bottom-20 right-4`. |
| **Scroll to top** | `md:bottom-24 md:right-8`. No mobile: `bottom-32 right-4`. |

## 10.6 O que NÃO aparece no desktop

| Diferencial | Descrição |
|-------------|-----------|
| **Chat Agent** | Envolvido em `<div className="md:hidden">` — **nunca** é exibido no desktop. É exclusivo do mobile. |

## 10.7 Resumo: só desktop

- Grid 3 colunas.
- Side Rail Esquerdo e Side Rail Direito (sticky).
- Container com max-width 1320/1440/1600px e paddings maiores.
- Coluna central com borda arredondada e sombra.
- FABs em `bottom-6` / `bottom-24` e `right-8`.
- Sem Chat Agent.

---

# PARTE 11 – DIFERENCIAIS APENAS MOBILE (RSV360)

Tudo o que existe **somente** quando a viewport é **< 768px**. No desktop esses elementos não aparecem ou têm outro comportamento.

## 11.1 Layout

| Diferencial | Descrição |
|-------------|-----------|
| **Uma única coluna** | Sem grid de 3 colunas; fluxo vertical único. |
| **Largura máxima** | `max-w-md` (~448px) com `mx-auto` — conteúdo centralizado e limitado. |
| **Sem side rails** | Nenhum conteúdo nas laterais; apenas a coluna central. |

## 11.2 Chat Agent (apenas mobile)

| Diferencial | Descrição |
|-------------|-----------|
| **Visibilidade** | Envolvido em `<div className="md:hidden">` — **só** é exibido quando a largura é &lt; 768px. |
| **Função** | Widget de chat/suporte para o usuário no celular. |
| **Posição** | Definida no componente `ChatAgent` (geralmente canto inferior ou barra). |

## 11.3 Posição dos FABs (apenas mobile)

| Diferencial | Descrição |
|-------------|-----------|
| **Realizar Cotação** | `bottom-20 right-4` — mais alto para não sobrepor o Circular Nav. No desktop: `bottom-6 right-8`. |
| **Scroll to top** | `bottom-32 right-4` — ainda mais alto. No desktop: `bottom-24 right-8`. |

## 11.4 Experiência de navegação (mobile)

| Diferencial | Descrição |
|-------------|-----------|
| **Circular Nav** | Mesmo componente que no desktop, mas no mobile é a **principal** navegação inferior (não há barra inferior alternativa ativa; a barra linear está com `{false && ...}`). |
| **Toque na busca** | Leva a `/buscar`; em telas pequenas o gesto de toque é o principal. |
| **Viewport / PWA** | `viewport`: device-width, initialScale: 1, maximumScale: 5; `themeColor`; `apple-touch-icon`; `mobile-web-app-capable` — otimizado para uso como app em dispositivo móvel. |

## 11.5 Conteúdo central (comportamento mobile)

| Diferencial | Descrição |
|-------------|-----------|
| **Sem borda/sombra de “card”** | A coluna central não tem `rounded-3xl`, `border` nem `shadow-sm` no mobile. |
| **Grid de categorias** | 4 itens (Buscar, Hotéis, Ingressos, Atrações) em grid compacto. |
| **Trust badges** | 3 colunas; pode quebrar linha em telas muito estreitas. |
| **Cards de acesso** | 2 colunas (Hotéis, Promoções). |

## 11.6 Barra inferior desativada (diferencial indireto)

| Diferencial | Descrição |
|-------------|-----------|
| **Bottom nav linear** | O código da barra inferior clássica (Início, Buscar, Hotéis, Perfil) está com `{false && (...)}` — **nunca** é renderizada. No mobile a navegação é 100% pelo Circular Nav. |

## 11.7 Resumo: só mobile

- Uma coluna; `max-w-md`; sem side rails.
- Chat Agent visível.
- FABs em `bottom-20` e `bottom-32`, `right-4`.
- Circular Nav como principal navegação inferior.
- Sem “card” com borda/sombra na área central.
- Viewport e meta tags PWA para uso em celular.
- Barra inferior linear não utilizada (só Circular Nav).

---

*Documento gerado em: 11/02/2025. Projeto: RSV360 – Site Público.*

# Documentação Completa RSV360: Desktop, Mobile, Responsivo e Comparativo

**Projeto:** RSV360 (Reservei Viagens) – Site Público  
**Escopo:** Versão Web Desktop, versão Mobile, comportamento responsivo, comparativo com Airbnb, screenshots com legendas e diferenciais (só desktop / só mobile).

---

## Índice

1. [Comparativo RSV360 vs Airbnb](#1-comparativo-rsv360-vs-airbnb)
2. [Breakpoints e convenções](#2-breakpoints-e-convenções)
3. [Versão Web Desktop – passo a passo](#3-versão-web-desktop-rsv360)
4. [Versão Mobile – passo a passo](#4-versão-mobile-rsv360)
5. [Comportamento responsivo](#5-comportamento-responsivo-rsv360)
6. [Airbnb: desktop, mobile e responsivo](#6-airbnb-desktop-mobile-e-responsivo)
7. [Comparativo detalhado por contexto](#7-comparativo-detalhado-por-contexto)
8. [Screenshots / figuras – lista e legendas](#8-screenshots--figuras-lista-e-legendas)
9. [Diferenciais apenas desktop](#9-diferenciais-apenas-desktop-rsv360)
10. [Diferenciais apenas mobile](#10-diferenciais-apenas-mobile-rsv360)
11. [Checklist de testes](#11-checklist-de-testes)
12. [Referências de código](#12-referências-de-código-rsv360)

---

# 1. COMPARATIVO RSV360 VS AIRBNB

Análise detalhada das diferenças entre os dois sites: layout, menus, lógica, estrutura e funcionalidades.

## 1.1 Identidade e propósito

| Aspecto | RSV360 (Reservei Viagens) | Airbnb |
|---------|---------------------------|--------|
| **Foco** | Hotéis, parques, atrações (principalmente Caldas Novas e região) | Locações por temporada, chalés, casas, experiências (global) |
| **Marca** | "Reservei Viagens" – "Parques, Hotéis & Atrações" | "Airbnb" – aluguéis e experiências |
| **Escopo geográfico** | Regional (Brasil – Caldas Novas, Cuiabá) | Global |
| **Modelo de negócio** | Agência/operadora de turismo | Marketplace P2P (hóspede x anfitrião) |

## 1.2 Header / topo da página

| Elemento | RSV360 | Airbnb |
|----------|--------|--------|
| **Logo** | Ícone circular + "Reservei Viagens" | Ícone "Airbnb" |
| **Posição do header** | Fundo azul gradiente (blue-600 a blue-800) | Header branco/neutro |
| **Busca** | Barra de busca única: "Buscar Hotéis, Parques..." (link para /buscar) | Barra de busca expandível com filtros (local, datas, hóspedes) |
| **CTA de login** | Botões "Entrar" e "Cadastrar" no header | "Entrar" ou avatar do usuário |
| **Layout do header** | Tudo dentro de um bloco azul | Minimalista, elementos separados |

**Lógica:** RSV360 redireciona a busca para `/buscar`; Airbnb usa busca inline com modal e filtros.

## 1.3 Menu de navegação principal

**RSV360 – Circular Nav (fixo na parte inferior)**  
Início, Buscar, Hotéis, Promoções, Ingressos, Atrações, Perfil, Contato.

**Airbnb – Barra inferior (mobile)**  
Explorar (lupa), Favoritos (coração), Entrar/Conta.

| RSV360 | Airbnb |
|--------|--------|
| 8 itens no circular nav | 3 itens principais na barra inferior |
| Menu circular/móvel | Menu linear simples |
| Sem "Favoritos" explícito | "Favoritos" em destaque |
| Categorias claras (Hotéis, Ingressos, Atrações) | Foco em "Explorar" e conta |

## 1.4 Layout da página inicial

- **RSV360 desktop:** 3 colunas – Side Rail Esquerdo | Conteúdo central | Side Rail Direito. **Mobile:** coluna única.
- **RSV360 side rails (só desktop):** Esquerdo = "Descubra experiências" (Aluguel temporada, Hotéis, Parques, Atrações, Leilões); Direito = "Oportunidades do dia" (Flash Deals, Viagens em grupo, Excursões, Oferta da semana).
- **Airbnb:** Conteúdo central em largura total; sem side rails; grid de cards de acomodações.

## 1.5 Conteúdo do hero / destaque

| RSV360 | Airbnb |
|--------|--------|
| Banner/imagem (Reservei Viagens – Hotéis em Caldas Novas) | Imagem/carrossel de destinos |
| Grid de categorias: Buscar, Hotéis, Ingressos, Atrações | Busca em destaque |
| Botão "Ver Promoções Especiais" | Sem botão equivalente direto |

## 1.6 Categorias / ações rápidas

- **RSV360:** Buscar, Hotéis, Ingressos, Atrações; Promoções; cards Hotéis e Promoções; trust badges (Garantia de Melhor Preço, Pagamento 100% Seguro, +5000 Clientes Satisfeitos).
- **Airbnb:** Casas, Chalés, Casas de praia, Acomodações únicas; Experiências; sem trust badges na mesma posição.

## 1.7 Modal / popup de consentimento

| RSV360 | Airbnb |
|--------|--------|
| LGPD popup (cookies/privacidade) | Modal: "Aceitar todos", "Somente o necessário", "Gerenciar" |

## 1.8 Elementos flutuantes (FABs)

- **RSV360:** Botão verde telefone (Realizar Cotação), botão azul scroll para o topo, Circular Nav.
- **Airbnb:** Sem FABs equivalentes na home.

## 1.9 Rodapé (footer)

- **RSV360:** Logo, slogan, endereços (Caldas Novas, Cuiabá), e-mail, telefone, WhatsApp, redes.
- **Airbnb:** Links institucionais, legais, redes; layout em colunas.

## 1.10 Lógica de busca

| Aspecto | RSV360 | Airbnb |
|---------|--------|--------|
| Onde | Link para `/buscar` | Busca inline no header com modal |
| Campos | Destino, datas, hóspedes (em página) | Destino, check-in, check-out, hóspedes |
| Filtros | Página separada | Modal ou página de resultados |

## 1.11 Tipos de produto

| RSV360 | Airbnb |
|--------|--------|
| Hotéis, parques, ingressos, atrações, promoções, Flash Deals, leilões, viagens em grupo, aluguel temporada | Casas inteiras, quartos, chalés, casas de praia, experiências; hospedar |

## 1.12 Páginas e rotas principais

**RSV360:** `/`, `/buscar`, `/hoteis`, `/promocoes`, `/ingressos`, `/atracoes`, `/perfil`, `/contato`, `/login`, `/minhas-reservas`, `/leiloes`, `/flash-deals`, `/viagens-grupo`, `/marketplace`.  
**Airbnb:** `/`, busca (modal), Favoritos, Perfil, listagens, Experiências, Hospedar.

## 1.13 Responsividade

| RSV360 | Airbnb |
|--------|--------|
| Mobile-first, max-width central; side rails ocultos em mobile; Circular Nav no mobile | Mobile-first; barra inferior fixa; layout adaptativo |

## 1.14 Identidade visual

| RSV360 | Airbnb |
|--------|--------|
| Azul (blue-600 a blue-800), gradientes amarelo/laranja em promoções, cards arredondados | Vermelho/coral (#FF5A5F), neutros e branco, cards clean |

## 1.15 Resumo das principais diferenças

1. Modelo: RSV360 = agência/operadora; Airbnb = marketplace P2P.  
2. Produto: RSV360 = hotéis + parques + atrações; Airbnb = casas + experiências.  
3. Busca: RSV360 redireciona; Airbnb inline com modal.  
4. Menu: RSV360 circular nav 8 itens; Airbnb 3 itens na barra inferior.  
5. Layout: RSV360 side rails no desktop; Airbnb full-width.  
6. Favoritos: Airbnb em destaque; RSV360 sem equivalente.  
7. FABs: RSV360 tem (cotação, scroll); Airbnb não.  
8. Cookie/LGPD: ambos com modal, textos diferentes.

---

# 2. BREAKPOINTS E CONVENÇÕES

## 2.1 Breakpoints do RSV360 (Tailwind CSS)

| Prefixo | Largura mínima | Uso típico |
|---------|----------------|------------|
| *(default)* | 0px | Mobile first |
| `xs` | 475px | Mobile grande / phablet |
| `sm` | 640px | Tablet portrait |
| `md` | 768px | Tablet landscape / desktop pequeno |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande / monitor |

**Arquivo:** `tailwind.config.ts` → `theme.extend.screens`.

## 2.2 Larguras máximas (RSV360)

| Contexto | Classe | Largura |
|----------|--------|---------|
| Mobile | `max-w-md` | ~448px |
| Desktop | `md:max-w-[1320px]` | 1320px |
| xl | `xl:max-w-[1440px]` | 1440px |
| 2xl | `2xl:max-w-[1600px]` | 1600px |

## 2.3 Referência Airbnb / mercado

- Mobile até ~744px; tablet ~745–1127px; desktop ~1128px+.

---

# 3. VERSÃO WEB DESKTOP (RSV360)

**Ativa quando:** viewport **≥ 768px** (`md`).

## 3.1 Passo a passo

1. **Container:** `md:max-w-[1320px]` → `xl:max-w-[1440px]` → `2xl:max-w-[1600px]`; `md:px-4` → `xl:px-8` → `2xl:px-10`.
2. **Grid:** `md:grid md:grid-cols-[18rem_minmax(0,1fr)_18rem]`; em xl/2xl colunas 20rem / 20.5rem.
3. **Side Rail Esquerdo:** `hidden md:block`; cards “Descubra experiências”; sticky.
4. **Coluna central:** header, busca, banner, categorias, promo, trust badges, cards, avaliações, footer; `md:rounded-3xl md:border xl:shadow-sm`.
5. **Side Rail Direito:** “Oportunidades do dia”; sticky.
6. **FABs:** Realizar Cotação `md:bottom-6 md:right-8`; Scroll to top `md:bottom-24 md:right-8`; Circular Nav sempre visível.
7. **Não aparece no desktop:** Chat Agent (`md:hidden`).

## 3.2 Resumo visual desktop

```
[ Side Rail Esquerdo ] [ Conteúdo central ] [ Side Rail Direito ]
     (18–20.5rem)            (1fr)              (18–20.5rem)
```

---

# 4. VERSÃO MOBILE (RSV360)

**Ativa quando:** viewport **< 768px**.

## 4.1 Passo a passo

1. **Container:** `max-w-md mx-auto`; uma coluna.
2. **Side Rails:** não renderizados (`hidden md:block`).
3. **Conteúdo:** header, busca, banner, 4 categorias, “Ver Promoções”, PROMOFÉRIAS, trust badges, cards, avaliações, footer.
4. **Circular Nav:** botão “Menu” → semicírculo com 8 itens; anéis Ext/Int.
5. **FABs:** Cotação `bottom-20 right-4`; Scroll `bottom-32 right-4`.
6. **Chat Agent:** visível só no mobile.
7. **Viewport/PWA:** device-width, themeColor, apple-touch-icon, mobile-web-app-capable.

## 4.2 Resumo visual mobile

```
[ Header ] [ Busca ] [ Banner ] [ 4 categorias ] [ Conteúdo ] [ Footer ]
[ FAB Cotação ] [ FAB Scroll ] [ Circular Nav ]
```

---

# 5. COMPORTAMENTO RESPONSIVO (RSV360)

- **0–767px:** 1 coluna, sem side rails, Chat visível, FABs em bottom-20 / bottom-32.
- **768px+:** grid 3 colunas, side rails visíveis, Chat oculto, FABs em bottom-6 / bottom-24.

Ajustes por breakpoint: container max-width, largura dos rails, gap do grid (4 → 6 → 8 → 10). Circular Nav igual em todas as larguras.

---

# 6. AIRBNB: DESKTOP, MOBILE E RESPONSIVO

- **Desktop:** header com busca expandível, “Hospedar”, “Criar experiência”, grid de listagens; sem side rails.
- **Mobile:** header compacto, barra inferior Explorar | Favoritos | Entrar, modal de busca/cookies.
- **Responsivo:** transição ~744px e ~1128px.

---

# 7. COMPARATIVO DETALHADO POR CONTEXTO

## 7.1 Desktop: RSV360 × Airbnb

| Aspecto | RSV360 | Airbnb |
|---------|--------|--------|
| Layout | 3 colunas (rail | centro | rail) | Conteúdo + eventual sidebar filtros |
| Side rails | Sim (esq. e dir.) | Não |
| Header | Azul, busca + Entrar/Cadastrar | Neutro, busca expandível |
| Busca | Redireciona para `/buscar` | Inline com modal |
| Navegação | Circular Nav | Menu superior |
| FABs | Cotação + Scroll | Não no mesmo padrão |

## 7.2 Mobile: RSV360 × Airbnb

| Aspecto | RSV360 | Airbnb |
|---------|--------|--------|
| Navegação inferior | Circular Nav (8 itens) | Barra (3 itens) |
| Chat/suporte | Chat Agent visível | Não em destaque |
| FABs | Cotação + Scroll | Não no mesmo padrão |

## 7.3 Responsivo: RSV360 × Airbnb

| Aspecto | RSV360 | Airbnb |
|---------|--------|--------|
| Breakpoint principal | 768px | ~744px / ~1128px |
| Desktop | 3 colunas | 1 conteúdo + filtros |
| Mobile | 1 coluna, Circular Nav | 1 coluna, barra linear |

---

# 8. SCREENSHOTS / FIGURAS – LISTA E LEGENDAS

Pasta sugerida: `apps/site-publico/docs/screenshots/` com subpastas `desktop/`, `mobile/`, `responsivo/`.

## 8.1 Lista ajustada de screenshots

### Desktop (viewport ≥ 768px)

| # | Arquivo | O que capturar | Legenda sugerida |
|---|---------|----------------|------------------|
| D1 | `desktop/01-layout-3-colunas.png` | Tela inteira da home com as 3 colunas | *Figura D1 – RSV360 home em desktop: layout de 3 colunas (side rail esquerdo, conteúdo central, side rail direito).* |
| D2 | `desktop/02-side-rail-esquerdo.png` | Só a coluna esquerda | *Figura D2 – Side rail esquerdo (apenas desktop): cards “Descubra experiências” – Aluguel temporada, Hotéis, Parques, Atrações, Leilões.* |
| D3 | `desktop/03-side-rail-direito.png` | Só a coluna direita | *Figura D3 – Side rail direito (apenas desktop): “Oportunidades do dia” – Flash Deals, Viagens em grupo, Excursões, Oferta da semana.* |
| D4 | `desktop/04-header-busca.png` | Header + barra de busca | *Figura D4 – Header desktop: logo Reservei Viagens, barra de busca e botões Entrar e Cadastrar.* |
| D5 | `desktop/05-conteudo-central.png` | Coluna do meio (banner até cards) | *Figura D5 – Conteúdo central em desktop: banner, categorias, “Ver Promoções”, PROMOFÉRIAS, trust badges e cards de acesso.* |
| D6 | `desktop/06-fabs-circular-nav.png` | Região inferior (FABs + Circular Nav) | *Figura D6 – Elementos fixos no desktop: FAB “Realizar Cotação”, botão “Scroll to top” e Circular Nav.* |
| D7 | `desktop/07-full-page.png` | Página inteira (long/composite) | *Figura D7 – Home desktop – visão completa da página com side rails visíveis.* |
| D8 | `desktop/08-footer.png` | Rodapé | *Figura D8 – Footer: endereços, contato, WhatsApp e redes sociais (desktop).* |

### Mobile (viewport < 768px, ex.: 375×667)

| # | Arquivo | O que capturar | Legenda sugerida |
|---|---------|----------------|------------------|
| M1 | `mobile/01-layout-1-coluna.png` | Home em uma coluna | *Figura M1 – RSV360 home em mobile: uma coluna, sem side rails.* |
| M2 | `mobile/02-header-busca.png` | Header + busca | *Figura M2 – Header mobile: logo, Entrar, Cadastrar e barra de busca.* |
| M3 | `mobile/03-categorias-promo.png` | Grid 4 categorias + “Ver Promoções” | *Figura M3 – Categorias e promo no mobile: Buscar, Hotéis, Ingressos, Atrações e botão Ver Promoções Especiais.* |
| M4 | `mobile/04-chat-agent.png` | Widget Chat Agent | *Figura M4 – Chat Agent (apenas mobile): widget de suporte/chat.* |
| M5 | `mobile/05-circular-nav-fechado.png` | Botão “Menu” fechado | *Figura M5 – Circular Nav fechado: botão “Menu” verde no centro inferior.* |
| M6 | `mobile/06-circular-nav-aberto.png` | Circular Nav aberto | *Figura M6 – Circular Nav aberto: semicírculo com itens (Início, Buscar, Hotéis, etc.) e controles Ext/Int.* |
| M7 | `mobile/07-fabs.png` | FABs no mobile | *Figura M7 – FABs no mobile: “Realizar Cotação” e “Scroll to top” posicionados acima do Circular Nav.* |
| M8 | `mobile/08-full-page.png` | Página inteira em scroll | *Figura M8 – Home mobile – visão completa em uma coluna.* |
| M9 | `mobile/09-popup-lgpd.png` | Modal LGPD (se visível) | *Figura M9 – Popup LGPD/cookies no mobile (quando exibido).* |

### Responsivo (transição em 768px)

| # | Arquivo | O que capturar | Legenda sugerida |
|---|---------|----------------|------------------|
| R1 | `responsivo/transicao-768-antes.png` | Viewport 767px (ou 760px) | *Figura R1 – Antes do breakpoint (767px): layout em 1 coluna, sem side rails, Chat Agent visível.* |
| R2 | `responsivo/transicao-768-depois.png` | Viewport 768px (ou 770px) | *Figura R2 – Depois do breakpoint (768px): layout em 3 colunas, side rails visíveis, Chat Agent oculto.* |

## 8.2 Estrutura de pastas

```
docs/screenshots/
├── desktop/
│   ├── 01-layout-3-colunas.png
│   ├── 02-side-rail-esquerdo.png
│   ├── 03-side-rail-direito.png
│   ├── 04-header-busca.png
│   ├── 05-conteudo-central.png
│   ├── 06-fabs-circular-nav.png
│   ├── 07-full-page.png
│   └── 08-footer.png
├── mobile/
│   ├── 01-layout-1-coluna.png
│   ├── 02-header-busca.png
│   ├── 03-categorias-promo.png
│   ├── 04-chat-agent.png
│   ├── 05-circular-nav-fechado.png
│   ├── 06-circular-nav-aberto.png
│   ├── 07-fabs.png
│   ├── 08-full-page.png
│   └── 09-popup-lgpd.png
└── responsivo/
    ├── transicao-768-antes.png
    └── transicao-768-depois.png
```

## 8.3 Como inserir no documento (com legenda)

```markdown
### Desktop – Layout de 3 colunas
![RSV360 home desktop: layout de 3 colunas (side rail esquerdo, conteúdo central, side rail direito)](docs/screenshots/desktop/01-layout-3-colunas.png)
*Figura D1 – RSV360 home em desktop: layout de 3 colunas (side rail esquerdo, conteúdo central, side rail direito).*

### Mobile – Uma coluna
![RSV360 home mobile: uma coluna, sem side rails](docs/screenshots/mobile/01-layout-1-coluna.png)
*Figura M1 – RSV360 home em mobile: uma coluna, sem side rails.*
```

Ajuste o caminho conforme a raiz do projeto (ex.: `apps/site-publico/docs/...`).

---

# 9. DIFERENCIAIS APENAS DESKTOP (RSV360)

Tudo que existe **somente** com viewport **≥ 768px**.

| Área | Diferencial | Descrição |
|------|-------------|-----------|
| Layout | Grid 3 colunas | `grid-cols-[18rem_minmax(0,1fr)_18rem]` (e xl/2xl). |
| Layout | Max-width container | 1320 / 1440 / 1600px; no mobile é max-w-md. |
| Side Rail Esq. | Visibilidade | `hidden md:block`; conteúdo “Descubra experiências”; sticky. |
| Side Rail Dir. | Visibilidade | “Oportunidades do dia”; sticky. |
| Coluna central | Estilo | `md:rounded-3xl md:border xl:shadow-sm` só no desktop. |
| FABs | Posição | Cotação `md:bottom-6 md:right-8`; Scroll `md:bottom-24 md:right-8`. |
| O que não aparece | Chat Agent | `md:hidden` — nunca no desktop. |

**Resumo:** 3 colunas, dois side rails sticky, container largo, coluna central com borda/sombra, FABs mais próximos do canto, sem Chat Agent.

---

# 10. DIFERENCIAIS APENAS MOBILE (RSV360)

Tudo que existe **somente** com viewport **< 768px**.

| Área | Diferencial | Descrição |
|------|-------------|-----------|
| Layout | Uma coluna | Sem grid de 3 colunas; max-w-md. |
| Layout | Sem side rails | Nenhum rail lateral. |
| Chat Agent | Visibilidade | `md:hidden` — só no mobile. |
| FABs | Posição | Cotação `bottom-20 right-4`; Scroll `bottom-32 right-4`. |
| Navegação | Circular Nav | Principal navegação inferior; barra linear desativada no código. |
| Conteúdo | Estilo | Coluna central sem borda/sombra de “card”. |
| PWA | Meta/viewport | device-width, themeColor, apple-touch-icon, mobile-web-app-capable. |

**Resumo:** Uma coluna, max-w-md, sem rails, Chat Agent visível, FABs mais altos, Circular Nav principal, viewport/PWA para celular.

---

# 11. CHECKLIST DE TESTES

**Desktop (≥ 768px):** 3 colunas; header com busca e Entrar/Cadastrar; busca → `/buscar`; side rails sticky; FABs em bottom-6/24 e right-8; Circular Nav; Chat Agent não aparece.

**Mobile (< 768px):** Uma coluna; sem side rails; FABs em bottom-20/32 e right-4; Circular Nav e Chat Agent visíveis.

**Transição:** Em 768px aparecem side rails e 3 colunas; Chat some; posições dos FABs mudam.

---

# 12. REFERÊNCIAS DE CÓDIGO (RSV360)

| Funcionalidade | Arquivo | Trecho / classe |
|----------------|---------|------------------|
| Breakpoints | `tailwind.config.ts` | `screens: { xs, sm, md, lg, xl, 2xl }` |
| Layout 3 colunas | `app/page.tsx` | `md:grid md:grid-cols-[18rem_minmax(0,1fr)_18rem]` |
| Side rail esquerdo | `components/home/left-side-rail.tsx` | `hidden md:block` |
| Side rail direito | `components/home/right-side-rail.tsx` | `hidden md:block` |
| Chat só mobile | `app/page.tsx` | `md:hidden` em volta de `ChatAgent` |
| FAB Cotação | `app/page.tsx` | `bottom-20 right-4 md:bottom-6 md:right-8` |
| Scroll to top | `app/page.tsx` | `bottom-32 right-4 md:bottom-24 md:right-8` |
| Viewport | `app/layout.tsx` | `viewport: { width, initialScale, maximumScale }` |
| Dados dos rails | `lib/home-side-rails.ts` | `getHomeSideRailsFallback`, `getHomeSideRailsData` |
| Circular Nav | `components/circular-nav.tsx` | Fixo, mesmo em todas as larguras |

---

*Documento unificado gerado em 11/02/2025. Projeto RSV360 – Site Público. Reúne: comparativo RSV360 vs Airbnb, documentação desktop/mobile/responsivo, screenshots com legendas e diferenciais só desktop / só mobile.*

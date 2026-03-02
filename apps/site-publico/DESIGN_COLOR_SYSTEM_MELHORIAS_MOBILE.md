# Sistema de Cores - Página `/melhorias-mobile`

**Data de criação:** 2025-02-11  
**Versão:** 1.0

---

## Sumário

1. [Visão Geral do Sistema de Cores](#1-visão-geral-do-sistema-de-cores)
2. [Cores Primárias - Azul (Marca Principal)](#2-cores-primárias---azul-marca-principal)
3. [Cores Secundárias - Laranja/Amarelo (Urgência/Ofertas)](#3-cores-secundárias---laranjaamarelo-urgênciaofertas)
4. [Cores de Ação - Verde e Vermelho](#4-cores-de-ação---verde-e-vermelho)
5. [Cores Neutras - Cinzas](#5-cores-neutras---cinzas)
6. [Cores de Texto](#6-cores-de-texto)
7. [Gradientes](#7-gradientes)
8. [Overlays e Transparências](#8-overlays-e-transparências)
9. [Estados Interativos (Hover, Active, Focus)](#9-estados-interativos-hover-active-focus)
10. [Psicologia das Cores e Decisões de Design](#10-psicologia-das-cores-e-decisões-de-design)

---

## 1. Visão Geral do Sistema de Cores

O sistema de cores da página `/melhorias-mobile` foi projetado para:

- **Transmitir confiança e profissionalismo** (azul primário)
- **Criar urgência e destacar ofertas** (laranja/amarelo)
- **Facilitar conversão** (verde para CTAs principais)
- **Manter legibilidade e hierarquia visual** (escala de cinzas)
- **Garantir acessibilidade** (contraste adequado entre texto e fundo)

**Base:** Tailwind CSS com paleta padrão expandida

### Remaster – alinhamento com Plano completo (Layout Inteligente RSV 360)

Para o remaster da página melhorias-mobile, as regras de aplicação estratégica do Plano são:

- **Reserva / Confiança:** `blue-600` (e tons adjacentes) para header, links, selo “Pagamento Seguro”, abas ativas do SmartSearchFilter.
- **Ingressos / Parques / Urgência:** gradiente `from-yellow-400 to-orange-400` para CTAs de ingresso (ex.: “GARANTIR MEU INGRESSO”), card PROMOFÉRIAS, botão “Ver Promoções”.
- **Botão compra / Conversão:** `green-500` / `green-600` para “RESERVAR AGORA” (checkout fixo) e página de sucesso.
- **Ofertas última hora / Flash:** `red-500` (e hover `red-600`) para badges “OFERTA RELÂMPAGO”, “PREÇO DE CALDAS”, “OFERTA LIMITADA”.
- **Neutros:** escala de cinzas para fundos, texto e skeletons, garantindo contraste (ex.: `gray-900` em fundos claros, `focus:ring-blue-500` para acessibilidade).

Os novos componentes (SmartSearchFilter, TicketProductCard, MobileExpressCheckoutV2, SocialProofSection, etiquetas OSM) devem seguir essas regras.

---

## 2. Cores Primárias - Azul (Marca Principal)

### 2.1. Azul Escuro (`blue-600` a `blue-800`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `bg-blue-600` | `#2563EB` | Header principal, CTA "Monte suas férias" | Cor primária da marca - transmite confiança, profissionalismo, estabilidade. Azul é associado a confiabilidade em turismo. |
| `bg-blue-700` | `#1D4ED8` | Hover de botões azuis, gradiente header | Tom mais escuro para profundidade e hierarquia visual. |
| `bg-blue-800` | `#1E40AF` | Gradiente header (`to-blue-800`), footer tagline | Tom ainda mais escuro para criar contraste e profundidade em gradientes. |
| `text-blue-600` | `#2563EB` | Links, CTAs secundários, nome da marca no footer | Cor de destaque para elementos clicáveis, mantém consistência com marca. |
| `text-blue-700` | `#1D4ED8` | Botão "Cadastrar" no header, CTA "Montar meu roteiro" | Tom mais escuro para melhor contraste em fundos claros. |
| `text-blue-800` | `#1E40AF` | Hover de links azuis | Feedback visual em interações. |
| `border-blue-200` | `#BFDBFE` | Bordas de cards em hover (side rails) | Borda sutil que não compete com conteúdo. |
| `border-blue-500` | `#3B82F6` | Ring de foco (`focus-visible:ring-blue-500`) | Cor vibrante para indicar foco em navegação por teclado (acessibilidade). |
| `bg-blue-50` | `#EFF6FF` | Hover de botões brancos com texto azul | Fundo suave para feedback visual sem ser intrusivo. |
| `bg-blue-100` | `#DBEAFE` | Background de cards de seção (side rails) | Fundo muito claro para criar hierarquia sem competir com conteúdo. |
| `text-blue-100` | `#DBEAFE` | Texto secundário em cards azuis escuros | Texto legível em fundos azuis escuros, mantém hierarquia. |

**Psicologia:** Azul transmite confiança, segurança e profissionalismo - essencial para uma empresa de turismo. Cria sensação de estabilidade e confiabilidade.

---

### 2.2. Azul Médio (`blue-500`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `from-blue-500` | `#3B82F6` | Gradiente de fundo do hero (fallback) | Tom médio que funciona bem em gradientes, não muito escuro nem muito claro. |
| `to-blue-700` | `#1D4ED8` | Gradiente do hero (`bg-gradient-to-br from-blue-500 to-blue-700`) | Transição suave de claro para escuro cria profundidade visual. |

**Uso no Hero:** O gradiente `from-blue-500 to-blue-700` cria um fundo elegante quando a imagem não carrega, mantendo identidade visual mesmo em fallback.

---

## 3. Cores Secundárias - Laranja/Amarelo (Urgência/Ofertas)

### 3.1. Amarelo (`yellow-400`, `yellow-500`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `from-yellow-400` | `#FACC15` | Gradiente card PROMOFÉRIAS, botão "Ver Promoções" | Amarelo vibrante chama atenção, cria urgência. Associado a ofertas e economia. |
| `to-yellow-500` | `#EAB308` | Hover do botão "Ver Promoções" (`hover:from-yellow-500`) | Tom mais saturado no hover aumenta sensação de urgência. |
| `bg-yellow-50` | `#FEF9C3` | Banner de erro/aviso | Fundo suave para mensagens informativas sem alarmar excessivamente. |
| `border-yellow-200` | `#FDE047` | Borda do banner de erro | Borda sutil que complementa fundo amarelo claro. |
| `text-yellow-400` | `#FACC15` | Ícones ou elementos decorativos (se usado) | Cor vibrante para elementos que precisam destacar. |
| `bg-yellow-500` | `#EAB308` | Badge "Destaque" em side rails (se `highlight: true`) | Cor forte para destacar itens especiais. |

**Psicologia:** Amarelo é a cor da atenção e urgência. Em e-commerce/turismo, amarelo sinaliza ofertas e cria senso de oportunidade limitada.

---

### 3.2. Laranja (`orange-400`, `orange-500`, `orange-600`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `to-orange-400` | `#FB923C` | Gradiente card PROMOFÉRIAS (`from-yellow-400 to-orange-400`) | Laranja complementa amarelo, cria transição quente e energética. |
| `to-orange-500` | `#F97316` | Hover do botão "Ver Promoções" (`hover:to-orange-500`) | Tom mais intenso no hover aumenta energia visual. |
| `bg-orange-500` | `#F97316` | Botão "Ver Ofertas" (Quick Access), badges side rail direita | Cor quente que destaca ações secundárias importantes. |
| `bg-orange-600` | `#EA580C` | Hover do botão "Ver Ofertas" (`hover:bg-orange-600`) | Feedback visual mais escuro no hover. |
| `text-orange-700` | `#C2410C` | Links em side rail direita ("Abrir agora") | Cor escura para legibilidade, mantém identidade laranja. |
| `text-orange-800` | `#9A3412` | Hover de links laranja (`group-hover:text-orange-800`) | Tom mais escuro para feedback visual. |
| `border-orange-200` | `#FED7AA` | Bordas de hover em side rail direita | Borda suave que complementa tema laranja. |
| `bg-orange-50` | `#FFF7ED` | Background de cards de seção (side rail direita) | Fundo muito claro para criar hierarquia visual. |
| `border-orange-100` | `#FFEDD5` | Borda de card de seção (side rail direita) | Borda extremamente sutil para definição sem competir. |
| `text-orange-700` | `#C2410C` | Título de seção "Oportunidades do dia" | Cor escura para legibilidade, mantém identidade laranja. |

**Psicologia:** Laranja combina energia do vermelho com otimismo do amarelo. Cria urgência sem agressividade, perfeito para ofertas e oportunidades.

---

### 3.3. Âmbar (`amber-100`, `amber-300`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `bg-amber-100` | `#FEF3C7` | Banner de teste mobile (`bg-amber-100`) | Cor suave que chama atenção sem ser intrusiva. Ideal para avisos informativos. |
| `border-amber-300` | `#FCD34D` | Borda do banner de teste (`border-amber-300`) | Borda que complementa fundo âmbar claro. |
| `text-amber-900` | `#78350F` | Texto do banner de teste (`text-amber-900`) | Texto escuro para alto contraste e legibilidade em fundo claro. |
| `ring-amber-300` | `#FCD34D` | Ring de destaque em cards (`ring-2 ring-amber-300/60`) | Anel sutil para destacar itens especiais sem ser agressivo. |

**Uso Específico:** Banner de teste usa âmbar para diferenciar-se do conteúdo principal, mantendo tom informativo e não alarmante.

---

## 4. Cores de Ação - Verde e Vermelho

### 4.1. Verde (`green-500`, `green-600`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `bg-green-500` | `#22C55E` | CTA sticky mobile "Reservar Agora", FAB desktop "Realizar Cotação" | Verde é universalmente associado a "ir", "confirmar", "comprar". Cria senso de ação positiva e conversão. |
| `bg-green-600` | `#16A34A` | Hover dos CTAs verdes (`hover:bg-green-600`) | Tom mais escuro no hover cria feedback visual claro. |
| `text-green-600` | `#16A34A` | Preços em cards (se usado) | Verde para valores positivos, economia, sucesso. |

**Psicologia:** Verde é a cor da ação positiva, confirmação e sucesso. Em CTAs principais, verde aumenta taxa de conversão por associação psicológica com "avançar" e "comprar".

**Decisão de Design:** Verde foi escolhido para CTAs principais (`/cotacao`) porque:
- Diferencia-se do azul da marca (não compete)
- Cria hierarquia clara (verde = ação principal)
- É universalmente reconhecido como "go" ou "confirmar"

---

### 4.2. Vermelho (`red-500`, `red-600`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `bg-red-500` | `#EF4444` | Badge "🔥 PROMOFÉRIAS CALDAS NOVAS!", botão "Quero Esta Super Oferta!" | Vermelho cria máxima urgência e atenção. Associado a ofertas especiais e ações imediatas. |
| `bg-red-600` | `#DC2626` | Hover do botão vermelho (`hover:bg-red-600`) | Tom mais escuro para feedback visual. |
| `text-red-600` | `#DC2626` | Preços de economia (se usado) | Vermelho para destacar valores de desconto/economia. |

**Psicologia:** Vermelho é a cor da urgência, paixão e ação imediata. Em badges de ofertas, vermelho cria senso de oportunidade limitada e desperta desejo de agir rapidamente.

**Uso Estratégico:** Vermelho é usado **esparsamente** apenas em:
- Badge principal de promoção (máxima visibilidade)
- Botão de ação dentro do card PROMOFÉRIAS (contexto de urgência)

Isso evita "vermelho fatigue" e mantém impacto quando usado.

---

## 5. Cores Neutras - Cinzas

### 5.1. Cinza Escuro (`gray-800`, `gray-900`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `text-gray-800` | `#1F2937` | Títulos principais (h2, h3), texto importante | Cor escura para máxima legibilidade e hierarquia visual. |
| `text-gray-900` | `#111827` | Títulos de cards, texto primário | Tom mais escuro para elementos de maior importância. |
| `bg-gray-900` | `#111827` | Fundos escuros (se usado) | Fundo escuro para criar contraste dramático. |

---

### 5.2. Cinza Médio (`gray-600`, `gray-700`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `text-gray-600` | `#4B5563` | Subtítulos, descrições, texto secundário | Tom médio que mantém legibilidade sem competir com texto primário. |
| `text-gray-700` | `#374151` | Texto em cards PROMOFÉRIAS (`text-gray-700`) | Tom escuro para legibilidade em fundos claros/coloridos. |
| `border-gray-200` | `#E5E7EB` | Bordas de cards, divisores (`border-gray-200`) | Borda muito sutil que define elementos sem ser intrusiva. |
| `border-gray-300` | `#D1D5DB` | Bordas mais visíveis (se usado) | Borda um pouco mais definida quando necessário. |

---

### 5.3. Cinza Claro (`gray-50`, `gray-100`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `bg-gray-50` | `#F9FAFB` | Fundo do conteúdo central (`bg-gray-50`) | Fundo muito claro que cria contraste sutil com fundo da página. |
| `bg-gray-100` | `#F3F4F6` | Fundo da página (`bg-gray-100`) | Fundo neutro que não compete com conteúdo, cria profundidade visual. |
| `bg-gray-200` | `#E5E7EB` | Skeleton loading (`bg-gray-200/80`) | Cor para estados de loading que imita conteúdo real. |
| `text-gray-400` | `#9CA3AF` | Ícones secundários, placeholders | Cor muito clara para elementos não essenciais. |
| `text-gray-500` | `#6B7280` | Texto terciário, fonte de depoimentos | Tom médio-claro para hierarquia visual inferior. |

---

### 5.4. Cinza com Opacidade (`gray-200/90`, `gray-200/80`)

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `border-gray-200/90` | `#E5E7EB` (90% opacidade) | Bordas de cards principais | Borda sutil com leve transparência para integração visual suave. |
| `bg-gray-200/80` | `#E5E7EB` (80% opacidade) | Skeleton loading | Transparência cria efeito de "fantasma" durante carregamento. |
| `bg-gray-100` | `#F3F4F6` | Skeleton loading secundário | Fundo ainda mais claro para elementos menos importantes. |

**Decisão de Design:** Uso de opacidade (`/90`, `/80`) permite criar camadas visuais sem adicionar novas cores ao sistema, mantendo paleta enxuta.

---

## 6. Cores de Texto

### 6.1. Texto em Fundos Escuros

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `text-white` | `#FFFFFF` | Texto no header azul, CTAs verdes/vermelhos | Máximo contraste para legibilidade em fundos escuros/coloridos. |
| `text-white/80` | `#FFFFFF` (80% opacidade) | Texto auxiliar em header (`text-white/80`) | Texto secundário que não compete com primário, mantém hierarquia. |
| `text-white/20` | `#FFFFFF` (20% opacidade) | Overlays sutis (se usado) | Transparência muito baixa para elementos decorativos. |

---

### 6.2. Texto em Fundos Claros

| Classe Tailwind | Hex Aproximado | Uso | Razão |
|----------------|----------------|-----|-------|
| `text-gray-900` | `#111827` | Títulos principais | Máximo contraste para legibilidade. |
| `text-gray-800` | `#1F2937` | Subtítulos importantes | Alto contraste mantendo hierarquia. |
| `text-gray-700` | `#374151` | Texto em cards coloridos (PROMOFÉRIAS) | Contraste adequado em fundos amarelos/laranjas. |
| `text-gray-600` | `#4B5563` | Descrições, texto secundário | Contraste suficiente sem competir com primário. |
| `text-gray-500` | `#6B7280` | Texto terciário, fontes | Contraste mínimo mas legível para elementos menos importantes. |

---

## 7. Gradientes

### 7.1. Gradientes Azuis (Marca)

| Classe Tailwind | Cores | Uso | Razão |
|----------------|-------|-----|-------|
| `bg-gradient-to-br from-blue-600 to-blue-800` | `#2563EB` → `#1E40AF` | Header principal | Gradiente diagonal cria profundidade e modernidade. Transição suave mantém identidade azul. |
| `bg-gradient-to-br from-blue-500 to-blue-700` | `#3B82F6` → `#1D4ED8` | Hero (fallback) | Gradiente mais claro para não competir com imagem quando carregada. |
| `bg-gradient-to-br from-blue-600 to-blue-800` | `#2563EB` → `#1E40AF` | Card "Monte suas férias" | Mesmo gradiente do header cria consistência visual e reforça marca. |

**Direção `to-br` (top-left to bottom-right):** Cria sensação de movimento e progresso, ideal para CTAs e elementos principais.

---

### 7.2. Gradientes Amarelo/Laranja (Ofertas)

| Classe Tailwind | Cores | Uso | Razão |
|----------------|-------|-----|-------|
| `bg-gradient-to-br from-yellow-400 to-orange-400` | `#FACC15` → `#FB923C` | Card PROMOFÉRIAS | Gradiente quente cria energia e urgência. Transição amarelo→laranja é natural e vibrante. |
| `bg-gradient-to-r from-yellow-400 to-orange-400` | `#FACC15` → `#FB923C` | Botão "Ver Promoções" | Gradiente horizontal cria sensação de movimento e ação. |
| `hover:from-yellow-500 hover:to-orange-500` | `#EAB308` → `#F97316` | Hover do botão | Tons mais saturados no hover aumentam energia visual. |

**Psicologia:** Gradientes quentes (amarelo→laranja) são associados a energia, calor e urgência. Perfeitos para destacar ofertas e criar desejo de ação imediata.

---

### 7.3. Gradientes Suaves (Backgrounds)

| Classe Tailwind | Cores | Uso | Razão |
|----------------|-------|-----|-------|
| `bg-gradient-to-br from-blue-50/95 to-white` | `#EFF6FF` (95%) → `#FFFFFF` | Card de seção side rail esquerda | Gradiente muito sutil cria profundidade sem competir com conteúdo. |
| `bg-gradient-to-br from-orange-50/95 to-white` | `#FFF7ED` (95%) → `#FFFFFF` | Card de seção side rail direita | Mesmo princípio, mantém identidade laranja. |
| `bg-gradient-to-r from-transparent to-white/10` | Transparente → `#FFFFFF` (10%) | Overlay no card "Monte suas férias" | Overlay extremamente sutil para adicionar textura sem obscurecer conteúdo. |
| `bg-gradient-to-r from-transparent to-white/20` | Transparente → `#FFFFFF` (20%) | Overlay no card PROMOFÉRIAS | Overlay um pouco mais visível para criar contraste em fundo colorido. |

**Decisão de Design:** Gradientes muito sutis (`/95`, `/10`, `/20`) criam sofisticação visual sem adicionar "ruído" visual. Mantêm foco no conteúdo.

---

## 8. Overlays e Transparências

### 8.1. Overlays Escuros (Sobre Imagens)

| Classe Tailwind | Cores | Uso | Razão |
|----------------|-------|-----|-------|
| `bg-gradient-to-t from-black/60 via-black/20 to-transparent` | `#000000` (60%) → `#000000` (20%) → Transparente | Overlay em `MobileCrossSellCard` | Gradiente escuro no topo garante legibilidade de texto branco sobre imagens variadas. |
| `bg-gradient-to-t from-black/50 to-transparent` | `#000000` (50%) → Transparente | Overlay em side rail cards | Overlay mais claro para cards menores, mantém legibilidade sem obscurecer imagem. |

**Decisão Técnica:** Overlays com gradiente (`from-black/X via-black/Y to-transparent`) são superiores a overlays sólidos porque:
- Preservam mais da imagem original
- Criam transição suave e natural
- Garantem legibilidade apenas onde necessário (topo, onde fica texto)

---

### 8.2. Overlays Claros (Sobre Fundos Coloridos)

| Classe Tailwind | Cores | Uso | Razão |
|----------------|-------|-----|-------|
| `bg-white/20` | `#FFFFFF` (20% opacidade) | Overlay em cards de categorias (carrossel) | Overlay claro cria profundidade e textura sem obscurecer fundo colorido. |
| `bg-white/30` | `#FFFFFF` (30% opacidade) | Hover de cards de categorias (`hover:bg-white/30`) | Overlay mais opaco no hover cria feedback visual claro. |
| `bg-white/10` | `#FFFFFF` (10% opacidade) | Overlay no card "Monte suas férias" | Overlay muito sutil para adicionar textura sem competir. |
| `bg-white/95` | `#FFFFFF` (95% opacidade) | Input de busca (`bg-white/95`) | Fundo quase opaco mantém legibilidade sobre header azul, cria leve transparência visual. |

---

### 8.3. Transparências em Bordas e Elementos

| Classe Tailwind | Cores | Uso | Razão |
|----------------|-------|-----|-------|
| `border-white/30` | `#FFFFFF` (30% opacidade) | Borda do botão "Entrar" no header | Borda sutil que define elemento sem ser intrusiva em fundo escuro. |
| `border-white/20` | `#FFFFFF` (20% opacidade) | Bordas sutis (se usado) | Transparência muito baixa para elementos decorativos. |
| `opacity-95` | 95% opacidade | Texto secundário em cards | Leve transparência cria hierarquia visual sem perder legibilidade. |
| `opacity-90` | 90% opacidade | Texto terciário | Mais transparência para elementos menos importantes. |

---

## 9. Estados Interativos (Hover, Active, Focus)

### 9.1. Estados Hover

| Elemento | Cor Normal | Cor Hover | Razão |
|----------|------------|-----------|-------|
| Botão azul | `bg-blue-600` | `hover:bg-blue-700` | Escurecimento sutil indica interatividade sem ser agressivo. |
| Botão verde | `bg-green-500` | `hover:bg-green-600` | Mesmo princípio - feedback visual claro mas suave. |
| Botão vermelho | `bg-red-500` | `hover:bg-red-600` | Escurecimento mantém urgência enquanto indica interação. |
| Botão laranja | `bg-orange-500` | `hover:bg-orange-600` | Consistência com outros botões de ação. |
| Cards | `border-gray-200/90` | `hover:border-blue-200/80` ou `hover:border-orange-200/80` | Mudança de cor de borda indica área clicável, mantém identidade (azul/laranja). |
| Cards | Sem sombra | `hover:shadow-lg` ou `hover:shadow-xl` | Sombra cresce cria elevação visual, indica interatividade. |
| Cards | Sem escala | `hover:scale-105` ou `hover:-translate-y-0.5` | Leve movimento cria feedback tátil visual, aumenta percepção de interatividade. |
| Links azuis | `text-blue-700` | `group-hover:text-blue-800` | Escurecimento sutil indica interatividade. |
| Links laranja | `text-orange-700` | `group-hover:text-orange-800` | Mesmo princípio, mantém identidade laranja. |

---

### 9.2. Estados Active

| Elemento | Cor Normal | Cor Active | Razão |
|----------|------------|-------------|-------|
| Cards clicáveis | Sem escala | `active:scale-[0.98]` | Escala para baixo simula "pressionar", feedback tátil imediato. |

**Decisão de Design:** `scale-[0.98]` (redução de 2%) é sutil o suficiente para não causar "salto" visual, mas perceptível para feedback tátil.

---

### 9.3. Estados Focus (Acessibilidade)

| Elemento | Cor Focus | Razão |
|----------|----------|-------|
| Links e cards | `focus-visible:ring-2 focus-visible:ring-blue-500` | Anel azul vibrante indica foco em navegação por teclado. Essencial para acessibilidade. |
| Side rail esquerda | `focus-visible:ring-blue-500` | Mantém identidade azul. |
| Side rail direita | `focus-visible:ring-orange-500` | Mantém identidade laranja, diferencia das outras áreas. |
| Offset | `focus-visible:ring-offset-2` | Espaçamento entre elemento e ring cria separação visual clara. |

**Importância de Acessibilidade:** Estados de foco são **obrigatórios** para usuários que navegam por teclado. Cores vibrantes (`blue-500`, `orange-500`) garantem visibilidade mesmo em fundos coloridos.

---

### 9.4. Estados de Loading

| Elemento | Cor | Razão |
|----------|-----|-------|
| Skeleton | `bg-gray-200/80` | Cor neutra que imita conteúdo real sem competir. |
| Skeleton secundário | `bg-gray-100` | Tom mais claro para elementos menos importantes. |
| Animação | `animate-pulse` | Animação suave indica carregamento sem distrair. |

---

## 10. Psicologia das Cores e Decisões de Design

### 10.1. Hierarquia de Cores por Importância

**Nível 1 - Máxima Urgência/Ação:**
- **Vermelho** (`red-500`) - Badges de promoção, ações imediatas
- **Verde** (`green-500`) - CTAs principais de conversão

**Nível 2 - Destaque/Ofertas:**
- **Amarelo/Laranja** (`yellow-400`, `orange-400`) - Ofertas, promoções, oportunidades

**Nível 3 - Marca/Confiança:**
- **Azul** (`blue-600` a `blue-800`) - Identidade da marca, elementos principais

**Nível 4 - Neutro/Conteúdo:**
- **Cinzas** (`gray-50` a `gray-900`) - Texto, fundos, elementos estruturais

---

### 10.2. Princípios de Uso

#### **Sparsidade de Cores Quentes**

Vermelho e amarelo/laranja são usados **esparsamente** apenas em:
- Badges de promoção (máxima visibilidade)
- Botões de ação dentro de contexto de oferta
- CTAs secundários importantes

**Razão:** Cores quentes perdem impacto se usadas excessivamente. Sparsidade mantém hierarquia visual e impacto quando necessário.

---

#### **Consistência de Identidade**

- **Azul** = Marca, confiança, elementos principais
- **Laranja** = Ofertas, oportunidades, urgência (mas não alarmante)
- **Verde** = Ação positiva, conversão, "avançar"
- **Vermelho** = Urgência máxima, ofertas especiais

**Razão:** Consistência cria aprendizado do usuário. Quando usuário vê verde, sabe que é ação principal. Quando vê vermelho, sabe que é oferta especial.

---

#### **Contraste e Legibilidade**

Todas as combinações de texto/fundo seguem **WCAG AA** mínimo:
- Texto escuro (`gray-900`, `gray-800`) em fundos claros (`white`, `gray-50`)
- Texto claro (`white`) em fundos escuros (`blue-600`, `green-500`)
- Overlays escuros garantem legibilidade sobre imagens variadas

**Razão:** Acessibilidade não é negociável. Contraste adequado beneficia todos os usuários, especialmente aqueles com deficiência visual.

---

#### **Gradientes para Profundidade**

Gradientes são usados para:
- Criar profundidade visual sem adicionar elementos
- Transições suaves entre cores relacionadas
- Overlays que preservam imagem original

**Razão:** Gradientes modernizam visual sem adicionar complexidade. Criam sensação de qualidade e atenção ao detalhe.

---

### 10.3. Decisões Específicas por Elemento

#### **Header Azul Escuro (`blue-600` a `blue-800`)**

**Razão:** 
- Azul transmite confiança e profissionalismo
- Tom escuro cria contraste com conteúdo branco
- Gradiente adiciona profundidade e modernidade

**Alternativa Considerada:** Azul mais claro (`blue-400`) foi rejeitado por falta de contraste suficiente com texto branco.

---

#### **Card PROMOFÉRIAS Amarelo/Laranja**

**Razão:**
- Amarelo/laranja cria urgência sem agressividade
- Gradiente quente chama atenção naturalmente
- Diferencia-se do azul da marca, criando hierarquia

**Alternativa Considerada:** Vermelho sólido foi rejeitado por ser muito agressivo e competir com badge vermelho.

---

#### **CTAs Verdes (`green-500`)**

**Razão:**
- Verde é universalmente associado a "avançar" e "confirmar"
- Diferencia-se do azul da marca (não compete)
- Cria hierarquia clara: verde = ação principal

**Alternativa Considerada:** Azul (`blue-600`) foi rejeitado por competir com identidade da marca e não criar hierarquia suficiente.

---

#### **Badge Vermelho (`red-500`)**

**Razão:**
- Vermelho cria máxima urgência e atenção
- Usado esparsamente mantém impacto
- Associado a ofertas especiais e ações imediatas

**Uso Restrito:** Apenas em badge principal de promoção para evitar "vermelho fatigue".

---

#### **Side Rails com Identidade de Cor**

**Esquerda (Azul):**
- `border-blue-100/80`, `bg-blue-50/95`, `text-blue-700`
- Identidade azul reforça marca e confiança

**Direita (Laranja):**
- `border-orange-100/80`, `bg-orange-50/95`, `text-orange-700`
- Identidade laranja reforça urgência e oportunidades

**Razão:** Diferenciação visual ajuda usuário a categorizar mentalmente:
- Esquerda = Produtos principais (confiança)
- Direita = Ofertas/oportunidades (urgência)

---

### 10.4. Paleta Completa de Referência

#### Cores Primárias (Marca)

```
Azul Escuro:    #2563EB (blue-600) - Principal
Azul Médio:     #3B82F6 (blue-500) - Secundário
Azul Muito Escuro: #1E40AF (blue-800) - Gradientes
```

#### Cores Secundárias (Ofertas)

```
Amarelo:        #FACC15 (yellow-400) - Ofertas
Laranja:        #FB923C (orange-400) - Urgência
Laranja Escuro: #F97316 (orange-500) - Hover
```

#### Cores de Ação

```
Verde:          #22C55E (green-500) - CTAs principais
Verde Escuro:   #16A34A (green-600) - Hover
Vermelho:       #EF4444 (red-500) - Urgência máxima
Vermelho Escuro: #DC2626 (red-600) - Hover
```

#### Cores Neutras

```
Cinza Muito Escuro: #111827 (gray-900) - Texto primário
Cinza Escuro:       #1F2937 (gray-800) - Texto importante
Cinza Médio:        #4B5563 (gray-600) - Texto secundário
Cinza Claro:        #F3F4F6 (gray-100) - Fundos
Cinza Muito Claro:  #F9FAFB (gray-50) - Fundos sutis
```

---

## Conclusão

O sistema de cores da página `/melhorias-mobile` foi projetado com base em:

1. **Psicologia das cores** - Cada cor foi escolhida por seu significado psicológico e impacto emocional
2. **Hierarquia visual** - Cores criam hierarquia clara de importância e ação
3. **Consistência de marca** - Azul como identidade principal, outras cores como suporte estratégico
4. **Acessibilidade** - Todas as combinações garantem contraste adequado
5. **Sparsidade estratégica** - Cores quentes usadas esparsamente para manter impacto

Este documento serve como **guia de referência** para manter consistência visual em futuras implementações e extensões da página.

---

**Última atualização:** 2025-02-11  
**Versão:** 1.0  
**Baseado em:** `apps/site-publico/app/melhorias-mobile/page.tsx` e componentes relacionados

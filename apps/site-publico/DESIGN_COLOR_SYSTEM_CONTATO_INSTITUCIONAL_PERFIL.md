# Sistema de Cores e Design - Contato, Institucionais e Perfil

**Data de criação:** 2025-02-11  
**Versão:** 1.0

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Página Contato (`/contato`)](#2-página-contato-contato)
3. [Páginas Institucionais](#3-páginas-institucionais)
4. [Página Perfil de Usuário (`/perfil`)](#4-página-perfil-de-usuário-perfil)
5. [Elementos Comuns e Consistência](#5-elementos-comuns-e-consistência)
6. [Referência Cruzada com Melhorias Mobile](#6-referência-cruzada-com-melhorias-mobile)

---

## 1. Visão Geral

Este documento descreve o **sistema de cores e decisões de design** das páginas:

- **Contato** (`/contato`) – Canais de atendimento, WhatsApp, unidades e redes sociais
- **Institucionais** – Termos de Uso (`/termos`), Política de Privacidade (`/politica-privacidade`), Qualidade (`/quality`)
- **Perfil de usuário** (`/perfil`) – Dados pessoais, biografia, contato, negócio, serviços e redes

**Base:** Tailwind CSS. Algumas páginas (Contato, Política de Privacidade) usam paleta mais ampla (roxo, verde, laranja); Perfil e Termos alinham-se ao azul da marca e cinzas neutros.

---

## 2. Página Contato (`/contato`)

### 2.1. Objetivo da página

Centralizar canais de atendimento (consultoria, catálogos, WhatsApp, agendamentos), endereços e redes sociais, com foco em conversão via WhatsApp e identidade visual marcante.

### 2.2. Paleta principal – Roxo e Azul

| Classe Tailwind | Hex Aproximado | Onde é usado | Razão |
|-----------------|----------------|--------------|--------|
| `from-purple-600` | `#9333EA` | Gradiente de loading e fundo da página | Roxo transmite criatividade e diferenciação; associação a “contato” e modernidade. |
| `to-blue-600` | `#2563EB` | Gradiente `from-purple-600 to-blue-600` (loading e container) | Transição roxo→azul une identidade “contato” com confiança da marca. |
| `from-purple-500` | `#A855F7` | Fundo principal `from-purple-500 to-blue-600` | Tom um pouco mais claro no corpo da página para não competir com o header. |
| `from-purple-600` / `to-purple-700` | `#9333EA` → `#7E22CE` | Header: `bg-gradient-to-r from-purple-600 to-purple-700` | Header escuro com hierarquia clara. |
| `from-purple-600/80` / `to-blue-600/80` | 80% opacidade | Overlay do header | Profundidade sem perder legibilidade do texto branco. |
| `bg-purple-500` | `#A855F7` | Badge “Reservei Viagens” no header | Destaque do nome da marca no topo. |
| `text-purple-100` | `#F3E8FF` | Subtítulo “Especialistas em Caldas Novas”, loading “Conectando...” | Texto secundário legível sobre fundo roxo/azul. |
| `text-white` | `#FFFFFF` | Títulos, botão voltar, ícones no header | Máximo contraste e clareza. |
| `bg-white/20` | `rgba(255,255,255,0.2)` | Círculo loading, logo, botão ghost header | Elementos “flutuantes” sem dominar. |
| `hover:bg-white/20` | — | Botão voltar no header | Feedback sutil. |

**Psicologia:** Roxo + azul na Contato cria uma “área de contato” distinta da home, mantendo profissionalismo e confiança (azul) com um toque mais acolhedor e atual (roxo).

### 2.3. Cards por tipo de serviço

Cada card de ação usa um gradiente próprio para identificação rápida:

| Serviço | Gradiente | Classes principais | Uso de cor |
|---------|-----------|--------------------|------------|
| **Consultoria de Viagens** | Azul → ciano | `from-blue-500 to-cyan-500`, `text-blue-100`, botão `bg-white text-blue-600 hover:bg-blue-50` | Confiança e clareza; CTA em branco para contraste. |
| **Catálogos de Pacotes** | Laranja → vermelho | `from-orange-500 to-red-500`, `text-orange-100`, botão `bg-white text-orange-600 hover:bg-orange-50` | Urgência e oferta; destaque para “Receber Catálogo”. |
| **Contato e WhatsApp** | Verde → esmeralda | `from-green-500 to-emerald-500`, `text-green-100`, botões `bg-white text-green-600 hover:bg-green-50` | Associação direta ao WhatsApp e disponibilidade. |
| **Agendamentos e Reservas** | Cinza | `from-gray-500 to-gray-600`, `text-gray-100`, botão `bg-white text-gray-600 hover:bg-gray-50` | Neutro, organizacional; ícone Calendar em `text-gray-600`. |

Padrão comum nos cards: fundo gradiente + texto claro (xxx-100) + botão branco com texto na cor do bloco e hover suave (xxx-50).

### 2.4. Blocos informativos (Unidades e Redes)

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-white/95 backdrop-blur-sm` | Cards “Nossas Unidades” e “Siga-nos nas Redes” | Leve transparência e blur para integrar ao fundo roxo/azul sem perder legibilidade. |
| `text-gray-800` | Títulos dos cards (📍 Nossas Unidades, 🌐 Siga-nos) | Hierarquia forte em fundo claro. |
| `text-gray-700` | Texto de endereços, e-mail, telefone, horário | Leitura confortável. |
| `text-blue-600` | Ícones MapPin, Mail, Phone, Clock; links e-mail e telefone | Consistência com “informação/contato” e links clicáveis. |
| `hover:underline` | Links de e-mail e telefone | Feedback claro. |

### 2.5. Redes sociais (botões)

| Rede | Classe | Razão |
|------|--------|--------|
| Facebook | `bg-blue-600 hover:bg-blue-700 text-white` | Identidade da rede. |
| Instagram | `bg-pink-500 hover:bg-pink-600 text-white` | Identidade da rede. |
| Site | `bg-gray-600 hover:bg-gray-700 text-white` | Neutro, “portal geral”. |

### 2.6. Botão “Voltar ao Início” e float WhatsApp

| Elemento | Classes | Razão |
|----------|---------|--------|
| Voltar | `variant="outline"` + `text-white border-white hover:text-purple-600 hover:border-purple-300 hover:bg-white` | Integrado ao tema claro do header; no hover, passa a “branco” para destaque. |
| Float WhatsApp | `bg-green-500 hover:bg-green-600` + `animate-pulse` + `hover:scale-110` | Verde WhatsApp; pulso e escala chamam atenção sem ser invasivos. |

### 2.7. Loading da página

Tela cheia com mesmo gradiente da página (`from-purple-600 to-blue-600`), texto branco e `text-purple-100`, barra de progresso `bg-white/20` + faixa `bg-white` animada. Mantém identidade visual durante o carregamento.

---

## 3. Páginas Institucionais

### 3.1. Termos de Uso (`/termos`)

Página simples, foco em leitura e links.

| Classe | Uso | Razão |
|--------|-----|--------|
| `max-w-3xl mx-auto` | Container central | Leitura confortável em texto longo. |
| `text-3xl font-bold` | Título principal | Hierarquia clara. |
| `text-muted-foreground` | Parágrafo introdutório | Texto secundário (usa variável do tema). |
| `Card` padrão | Bloco de conteúdo | Agrupamento visual. |
| `text-gray-700` | Texto do card | Legibilidade. |
| `bg-blue-50 border border-blue-200` | Caixa de aviso (conteúdo temporário) | Aviso suave, não alarmante. |
| `text-blue-600` / `text-blue-800` | Ícone ShieldCheck e texto do aviso | Consistência com “informação/oficial”. |
| `Button variant="outline"` | Link “Política de Privacidade” | Ação secundária. |
| `Button` (default) | “Entrar em contato” → `/contato` | Ação principal. |

Não há header com gradiente; layout minimalista para documento institucional.

### 3.2. Política de Privacidade (`/politica-privacidade`)

Página com header azul (alinhado à marca) e seções temáticas com cores semânticas.

#### Header e container

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-gray-50 min-h-screen` | Fundo da página | Contraste com header e cards. |
| `bg-gradient-to-br from-blue-600 to-blue-800` | Header | Mesmo padrão da marca (confiança, oficial). |
| `text-white` | Título e controles do header | Legibilidade. |
| `bg-white/20 backdrop-blur-sm` | Bloco LGPD no header | Destaque leve para conformidade. |
| `Badge bg-green-500 text-white` | “🇧🇷 Conforme LGPD” | Verde = conformidade/segurança. |

#### Cores por seção (ícones e blocos)

| Seção | Ícone / Destaque | Classes | Razão |
|-------|-------------------|--------|--------|
| Compromisso com sua Privacidade | Shield | `text-blue-600` | Confiança e proteção. |
| Dados que Coletamos | Eye | `text-green-600` | “Coleta” e transparência. |
| Como Usamos seus Dados | Lock | `text-purple-600` | Controle e uso. |
| Seus Direitos LGPD | Shield | `text-orange-600` | Direitos e ação. |
| Segurança dos Dados | Lock | `text-red-600` | Alerta e proteção. |
| Cookies e Tecnologias | Eye | `text-indigo-600` | Diferenciação de “dados” (verde). |
| Contato - Privacidade | Phone/Mail | `text-blue-600`, `text-green-600` (WhatsApp) | Contato oficial + canal verde. |
| Atualizações | — | `bg-gray-100` | Neutro, informativo. |

#### Blocos de fundo suave (listas e avisos)

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-blue-50` | Finalidades principais, card Contato | Informação estruturada. |
| `bg-green-50` | Marketing e comunicação | Positivo, opt-in. |
| `bg-orange-50` | Direitos LGPD | Atenção e direitos. |
| `bg-red-50` | Segurança dos Dados | Segurança e seriedade. |
| `bg-indigo-50` | Cookies | Diferenciação visual. |
| `text-blue-700`, `text-green-700`, `text-orange-700`, `text-indigo-700` | Títulos internos | Contraste em fundo claro. |
| `border border-blue-200` | Card de endereço (Contato) | Delimitação sutil. |

#### Botão e float

| Elemento | Classes | Razão |
|----------|---------|--------|
| Voltar ao Início | `text-gray-600 hover:text-blue-600 border-gray-300 hover:border-blue-300` | Neutro no estado normal; azul no hover (ação). |
| Float WhatsApp | `bg-green-500 hover:bg-green-600` | Mesmo padrão de contato rápido. |

### 3.3. Qualidade (`/quality`)

Página de entrada para Dashboard e Leaderboard; quase sem cores temáticas.

| Classe | Uso | Razão |
|--------|-----|--------|
| `container mx-auto max-w-4xl` | Layout | Conteúdo centralizado. |
| `text-4xl font-bold` | Título “Qualidade” | Hierarquia. |
| `text-muted-foreground` | Descrição | Texto secundário do tema. |
| `Card` padrão + `hover:shadow-lg` | Cards de navegação | Interatividade leve. |
| `Button` (default) / `variant="outline"` | Acessar Dashboard / Ver Ranking | Primária vs secundária. |

Cores vêm do tema global (ex.: botão primário azul); não há paleta específica documentada além do padrão do site.

### 3.4. Privacidade (`/privacidade`)

Redireciona para `/politica-privacidade`. Sem layout próprio.

---

## 4. Página Perfil de Usuário (`/perfil`)

### 4.1. Objetivo da página

Área logada para o usuário ver e editar dados pessoais, biografia, contato, negócio, serviços e redes. Prioriza clareza, confiança e estados de feedback (erro, verificado, loading).

### 4.2. Fundo e container

| Classe | Uso | Razão |
|--------|-----|--------|
| `max-w-4xl mx-auto bg-gray-50 min-h-screen` | Container principal | Largura limitada para formulários; cinza suave reduz cansaço visual. |

### 4.3. Header

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-gradient-to-br from-blue-600 to-blue-800` | Header | Alinhado à marca e à área “minha conta”. |
| `text-white` | Título “Perfil” / “Meu Perfil”, botões e ícones | Contraste e hierarquia. |
| `rounded-b-3xl shadow-lg` | Forma e sombra | Separação clara do conteúdo. |
| `Button variant="ghost"` | Voltar / Configurações / Sair | `text-white hover:bg-white/20` – integrados ao header. |
| `bg-white/20 border-white/30 hover:bg-white/30` | Botões secundários no header | Consistência com outros headers do app. |
| `Badge bg-green-500 text-white` | “Verificado” ao lado do título | Conta verificada = confiança. |
| `rounded-full bg-white/20` | Avatar/logo no header | Destaque sem competir com o título. |
| `rounded-full border-4 border-white` | Foto de perfil (com imagem) | Enquadramento da foto. |
| `bg-white/20 border-4 border-white` | Placeholder quando não há foto | Mesmo enquadramento. |

### 4.4. Conteúdo abaixo do header

| Elemento | Classes | Razão |
|----------|---------|--------|
| Nome do usuário | `text-xl font-bold` | Hierarquia. |
| Tagline | `text-blue-100` | Texto secundário em contexto azul (quando em card escuro) ou cinza. |
| Localização | `text-sm` (cor de contexto) | Informação secundária. |
| Rating | `Star fill-yellow-400 text-yellow-400` + `text-sm` | Estrela e número de avaliações. |
| Botão Editar (primário) | `bg-white text-blue-600 hover:bg-gray-100` | CTA principal em contexto de header azul. |

### 4.5. Estados de erro e aviso

| Classe | Uso | Razão |
|--------|-----|--------|
| `border-red-200 bg-red-50` | Card de erro (mensagem de validação/save) | Erro visível sem ser agressivo. |
| `text-red-700` | Texto do erro | Legibilidade e semântica. |
| `hover:text-red-600` | Botão remover (ex.: categorias/serviços) | Ação destrutiva. |

### 4.6. Formulários e abas

| Classe | Uso | Razão |
|--------|-----|--------|
| `TabsList` / `TabsTrigger` | Abas Básico, Biografia, Contato, Negócio, Serviços, Redes | Navegação por seção. |
| `p-2 bg-gray-50 rounded` | Campos em modo somente leitura (valor exibido) | Agrupa valor + ícone; fundo neutro. |
| `text-gray-400` | Ícones ao lado dos campos | Secundário. |
| `text-gray-500` | Texto de ajuda (ex.: “E-mail não pode ser alterado”) | Ajuda discreta. |
| `p-2 bg-gray-50 rounded` | Parágrafos de texto longo (tagline, descrições, bio) | Mesmo padrão de “campo somente leitura”. |

### 4.7. Links e ações contextuais

| Contexto | Classes | Razão |
|----------|---------|--------|
| Links genéricos (site, booking) | `text-blue-600 hover:underline` | Links padrão do app. |
| WhatsApp | `text-green-600 hover:underline` | Associação ao canal. |
| Mapa / endereço | `text-blue-600 hover:underline` | Ação externa (ex.: Google Maps). |
| Conta verificada | `bg-green-50 border border-green-200` + `text-green-600` / `text-green-800` | Positivo e confiável. |
| Ícones de rede (Facebook, etc.) | `text-blue-600` (ex.: Facebook) | Identidade da rede quando aplicável. |

### 4.8. Loading e estados vazios

| Estado | Tratamento | Razão |
|--------|------------|--------|
| Carregando | `LoadingSpinner` + “Carregando perfil...” | Feedback claro. |
| Não logado / erro de carga | Card com ícone (👤 ou ⚠️), `text-gray-800`, `text-gray-600`, botão “Fazer login” `bg-blue-600 hover:bg-blue-700` | Mensagem clara e CTA único. |

---

## 5. Elementos Comuns e Consistência

### 5.1. Headers com gradiente azul

- **Perfil:** `from-blue-600 to-blue-800`
- **Política de Privacidade:** `from-blue-600 to-blue-800`
- **Contato:** exceção – usa `from-purple-600 to-purple-700` (+ overlay) para diferenciar a página.

### 5.2. Botão “Voltar”

- **Contato:** outline branco, hover para fundo branco e texto roxo.
- **Política de Privacidade / Perfil:** outline cinza, hover para azul (texto e borda).

### 5.3. Float WhatsApp

- **Contato e Política de Privacidade:** `bg-green-500 hover:bg-green-600`, ícone branco, posição fixa inferior direita. Reforça canal único de contato rápido.

### 5.4. Cards

- **Contato:** Cards coloridos com gradiente por tipo de serviço + cards brancos semitransparentes para unidades/redes.
- **Institucionais:** Cards brancos com bordas padrão e blocos `bg-*-50` para listas/avisos.
- **Perfil:** Cards brancos com conteúdo em `bg-gray-50` para campos somente leitura.

### 5.5. Acessibilidade

- Contraste de texto em fundo escuro: `text-white` ou `text-*-100`.
- Links e botões com hover explícito.
- Foco: usar `focus-visible:ring-*` quando houver anel de foco (ex.: componentes UI compartilhados).

---

## 6. Referência Cruzada com Melhorias Mobile

- **Azul (blue-600, blue-700, blue-800):** mesma função de marca e confiança que em `/melhorias-mobile`; usado em Perfil e Política de Privacidade.
- **Verde (green-500, green-600):** WhatsApp e sucesso/verificado; mesmo uso semântico.
- **Laranja/vermelho (ofertas e urgência):** em Contato apenas no card “Catálogos de Pacotes”; em institucionais, laranja para “Direitos LGPD”.
- **Cinzas (gray-50, gray-100, gray-500, gray-700, gray-800):** fundos de página, textos secundários e campos somente leitura, alinhados ao doc de melhorias-mobile.
- **Roxo:** específico da página Contato para diferenciá-la; não usado na home/melhorias-mobile.

Para tabelas de hex e detalhes de gradientes/overlays da marca principal, ver **DESIGN_COLOR_SYSTEM_MELHORIAS_MOBILE.md**.

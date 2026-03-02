# Sistema de Cores – Login, Recuperar Senha, Leilões, Flash Deals e Demais Páginas

**Data:** 2025-02-11  
**Versão:** 1.0

Este documento detalha o **sistema de cores** das páginas: Login (Entrar/Cadastrar), Recuperar senha, Leilões (listagem e detalhe), Flash Deals, Viagens em Grupo, Dashboard, Dashboard RSV, Booking, Cupons, Insurance, Onboarding, CRM, Analytics, Loyalty, Fidelidade, Notificações, e das páginas dinâmicas Hotel (`/hoteis/[id]`) e Leilão (`/leiloes/[id]`).  
Para Contato, Institucionais e Perfil, ver **DESIGN_COLOR_SYSTEM_CONTATO_INSTITUCIONAL_PERFIL.md**.

---

## Sumário

1. [Login e Recuperar Senha](#1-login-e-recuperar-senha)
2. [Leilões e Flash Deals](#2-leilões-e-flash-deals)
3. [Viagens em Grupo e Group Travel](#3-viagens-em-grupo-e-group-travel)
4. [Dashboard e Dashboard RSV](#4-dashboard-e-dashboard-rsv)
5. [Booking, Cupons, Insurance](#5-booking-cupons-insurance)
6. [Onboarding, CRM, Analytics](#6-onboarding-crm-analytics)
7. [Loyalty, Fidelidade, Notificações](#7-loyalty-fidelidade-notificações)
8. [Páginas Dinâmicas: Hotel e Leilão](#8-páginas-dinâmicas-hotel-e-leilão)
9. [Referência Cruzada](#9-referência-cruzada)

---

## 1. Login e Recuperar Senha

### 1.1. Painel esquerdo (branding – desktop)

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800` | Fundo do painel | Marca e confiança; transição azul → índigo para profundidade. |
| `bg-[url('...')] opacity-50` | Padrão SVG sutil | Textura leve sem competir com o conteúdo. |
| `text-white` | Título principal (“Sua próxima viagem” / “Recupere o acesso”) | Máximo contraste. |
| `text-blue-200` | Destaque da segunda linha (“começa aqui” / “à sua conta”) | Hierarquia e leve variação. |
| `text-blue-100/90` | Parágrafo descritivo | Legibilidade em fundo escuro. |
| `text-blue-200/70` | Copyright no rodapé do painel | Discreto. |
| `text-white/90` | Logo e ícones de benefício | Consistência. |
| `bg-white/10` | Logo (rounded), caixas de ícone (Shield, Sparkles) | Elementos “flutuantes” no painel. |
| `hover:text-white` | Link da logo | Feedback. |

**Psicologia:** Azul e índigo transmitem confiança e segurança, adequados para login e recuperação de conta.

### 1.2. Painel direito (formulário)

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-gray-50/50` | Fundo do painel (login/recuperar) | Neutro, não compete com o card. |
| `dark:bg-gray-900/50` | Modo escuro | Consistência. |
| `bg-white` / `dark:bg-gray-800` | Card do formulário | Destaque e agrupamento. |
| `rounded-2xl shadow-xl shadow-gray-200/50` | Card | Elevação e suavidade. |
| `border border-gray-100` / `dark:border-gray-700` | Borda do card | Definição sutil. |
| `bg-gray-100` / `dark:bg-gray-700` | TabsList (Entrar | Cadastrar) | Fundo da barra de abas. |
| `data-[state=active]:bg-white` | Tab ativa | Destaque da aba selecionada. |
| `text-gray-900` / `dark:text-white` | Título “Bem-vindo de volta” | Hierarquia. |
| `text-gray-600` / `dark:text-gray-400` | Subtítulo e labels | Secundário. |
| `text-gray-400` | Ícones dentro de inputs (Lock, Mail) | Discreto. |

### 1.3. Erro e estados especiais

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-red-50` / `dark:bg-red-900/20` | Caixa de mensagem de erro | Erro visível sem ser agressivo. |
| `border-red-200` / `dark:border-red-800` | Borda da caixa de erro | Delimitação. |
| `text-red-700` / `dark:text-red-300` | Texto do erro | Legibilidade. |
| `text-amber-700 border-amber-300 hover:bg-amber-50` | Botão “Desbloquear” (dev) | Aviso/desbloqueio. |

### 1.4. Botões e links

| Elemento | Classe | Razão |
|----------|--------|--------|
| Botão Entrar | `bg-blue-600 hover:bg-blue-700` | Ação principal de login. |
| Botão Cadastrar | `bg-green-600 hover:bg-green-700` | Ação de criação de conta (positiva). |
| Link “Esqueci senha” / Termos / Privacidade | `text-blue-600 hover:text-blue-700 hover:underline` | Links secundários. |
| Divisor “ou continue com” | `text-gray-500` | Neutro. |

---

## 2. Leilões e Flash Deals

### 2.1. Leilões (listagem e detalhe)

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-gray-50` | Fundo da página | Contraste com cards e header. |
| `bg-white shadow-sm` | Header e cards de conteúdo | Conteúdo em destaque. |
| `text-gray-900` | Títulos | Hierarquia. |
| `text-gray-600` | Descrições e textos secundários | Legibilidade. |
| `text-blue-600 hover:text-blue-700` | “Voltar para Leilões”, links | Navegação e CTAs. |
| `bg-blue-600` / `hover:bg-blue-700` | Botão “Voltar para Leilões” (erro), CTAs | Ação principal. |
| `border-blue-600` | Spinner de loading | Consistência com marca. |
| `bg-gray-200 animate-pulse` | Placeholder do mapa (loading) | Estado de carregamento. |

### 2.2. Flash Deals

- Cards de oferta seguem o padrão de cross-sell/ofertas (azul, laranja, conforme `FlashDealCard` e tema do site).
- Filtros e busca: inputs e botões padrão; fundo da página neutro (`gray-50` ou branco).

---

## 3. Viagens em Grupo e Group Travel

| Classe | Uso | Razão |
|--------|-----|--------|
| `container mx-auto max-w-7xl` | Layout | Largura controlada. |
| `text-4xl font-bold` | Título “Viagens em Grupo” | Hierarquia. |
| `text-muted-foreground` | Descrição | Texto secundário do tema. |
| `hover:shadow-lg transition-shadow` | Cards de funcionalidade | Interatividade leve. |
| Botões | Primário e `variant="outline"` | Ações principais e secundárias (tema global). |

Cores vêm do tema global (ex.: botão primário azul); não há paleta específica além do padrão.

---

## 4. Dashboard e Dashboard RSV

| Classe | Uso | Razão |
|--------|-----|--------|
| `min-h-screen bg-gray-50` | Fundo do Dashboard | Área de trabalho neutra. |
| `text-3xl font-bold text-gray-900` | Título “Dashboard do Proprietário” | Hierarquia. |
| `text-gray-600 mt-1` | Subtítulo | Secundário. |
| `Card` (padrão) | Módulos (Meus Hotéis, Dashboard RSV, Precificação) | Agrupamento. |
| `Button` (default) | “Abrir módulo” | Ação principal. |

Dashboard RSV: sidebar, cards de estatísticas, tabela de reservas; cinzas e azul para links e botões (tema padrão).

---

## 5. Booking, Cupons, Insurance

- **Booking:** Container, `text-muted-foreground`, cards com `hover:shadow-lg`; botão primário e `variant="outline"` / `variant="secondary"`.
- **Cupons:** Tabs, tabelas, badges (ativo/inativo), diálogos; cores de status (verde/vermelho) para uso e estado do cupom.
- **Insurance:** Cards, badges para status de apólice (active/expired) e sinistro (pending/approved/rejected); botões primários e formulários padrão.

---

## 6. Onboarding, CRM, Analytics

### 6.1. Onboarding

| Classe | Uso | Razão |
|--------|-----|--------|
| `bg-gradient-to-br from-blue-50 via-white to-emerald-50` | Fundo da página | Suave, acolhedor; azul e verde (crescimento/sucesso). |
| `border-blue-200 border-t-blue-600` | Spinner de loading | Consistência com marca. |
| `text-gray-900`, `text-gray-600` | Títulos e descrições | Hierarquia. |
| `bg-white rounded-lg shadow-sm border` | Cards de benefícios (treinamento, integração, suporte) | Conteúdo destacado. |

### 6.2. CRM e Analytics

- Títulos em `text-3xl font-bold`; descrições em `text-gray-500` ou `text-gray-600`.
- Tabs, tabelas e filtros com componentes padrão; botões outline e primário; sem paleta específica além do tema.

---

## 7. Loyalty, Fidelidade, Notificações

### 7.1. Fidelidade – Tiers

| Tier | Classe (exemplo) | Uso |
|------|-------------------|-----|
| Bronze | `bg-amber-600` | Badge/nível |
| Prata | `bg-gray-400` | Badge/nível |
| Ouro | `bg-yellow-500` | Badge/nível |
| Platina | `bg-blue-500` | Badge/nível |
| Diamante | `bg-purple-500` | Badge/nível |

Outros elementos: cards, progress bars, botões de resgate; tema padrão.

### 7.2. Notificações

| Classe | Uso | Razão |
|--------|-----|--------|
| `min-h-screen bg-gray-50` | Fundo | Consistência com perfil e minhas-reservas. |
| `text-2xl font-bold` | Título com ícone Bell | Hierarquia. |
| `text-gray-500` | “N não lidas” | Secundário. |
| Cards por notificação | Fundo branco, borda sutil | Leitura clara. |

---

## 8. Páginas Dinâmicas: Hotel e Leilão

### 8.1. Hotel (`/hoteis/[id]`)

| Classe | Uso | Razão |
|--------|-----|--------|
| `min-h-screen bg-gray-50` | Fundo geral | Contraste com hero. |
| `h-96 bg-gray-900` | Hero (galeria) | Área escura para imagens. |
| `bg-black bg-opacity-40` | Overlay sobre a imagem | Legibilidade de indicadores. |
| `bg-white` / `bg-white bg-opacity-50` | Indicadores da galeria (ativo / inativo) | Navegação clara. |
| `text-blue-600 hover:underline` | “Voltar para lista” (erro) | Navegação. |
| `border-blue-600` | Spinner de loading | Marca. |

### 8.2. Leilão (`/leiloes/[id]`)

- Mesmo padrão de fundo `gray-50`, header e cards brancos, links e CTAs em `blue-600` (ver seção 2.1).

---

## 9. Referência Cruzada

- **Documentação de páginas (arquitetura, estados, APIs):** **PAGE_DOC_SITE_PUBLICO_COMPLETO.md**
- **Cores de Contato, Institucionais e Perfil:** **DESIGN_COLOR_SYSTEM_CONTATO_INSTITUCIONAL_PERFIL.md**
- **Cores da página Melhorias Mobile:** **DESIGN_COLOR_SYSTEM_MELHORIAS_MOBILE.md**

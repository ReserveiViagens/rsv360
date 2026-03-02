# Sistema de Cores – Todas as Páginas do Site Público (Aprofundado)

**Data:** 2025-02-11  
**Versão:** 1.0

Este documento consolida e **aprofunda o sistema de cores** de **todas as rotas** do site público (`apps/site-publico`), com tabelas por página/grupo, classes Tailwind, hex aproximado, onde cada cor é usada e a razão de design.

**Rotas completas:** Ver **ROTAS_COMPLETAS.md** (94 rotas).

---

## Sumário

1. [Visão geral e convenções](#1-visão-geral-e-convenções)
2. [Login e Recuperar senha (detalhado)](#2-login-e-recuperar-senha-detalhado)
3. [Minhas Reservas](#3-minhas-reservas)
4. [Leilões (listagem e detalhe)](#4-leilões-listagem-e-detalhe)
5. [Flash Deals](#5-flash-deals)
6. [Dashboard e Dashboard RSV](#6-dashboard-e-dashboard-rsv)
7. [Contato, Institucionais e Perfil](#7-contato-institucionais-e-perfil)
8. [Booking, Cupons, Insurance](#8-booking-cupons-insurance)
9. [Onboarding, CRM, Analytics, Quality](#9-onboarding-crm-analytics-quality)
10. [Loyalty e Fidelidade (tiers e estados)](#10-loyalty-e-fidelidade-tiers-e-estados)
11. [Notificações e Mensagens](#11-notificações-e-mensagens)
12. [Páginas dinâmicas: Hotel e Leilão](#12-páginas-dinâmicas-hotel-e-leilão)
13. [Viagens em Grupo, Group Travel](#13-viagens-em-grupo-group-travel)
14. [Home, Busca, Promoções, Cotação](#14-home-busca-promoções-cotação)
15. [Admin e demais rotas](#15-admin-e-demais-rotas)
16. [Tabela resumo por cor (Tailwind → páginas)](#16-tabela-resumo-por-cor-tailwind--páginas)

---

## 1. Visão geral e convenções

- **Base:** Tailwind CSS. Hex é aproximado (paleta padrão Tailwind).
- **Marca principal:** Azul (`blue-600` ≈ #2563EB, `blue-700`, `blue-800`) para confiança, headers e CTAs.
- **Sucesso/positivo:** Verde (`green-500`, `green-600`, `green-50/100`).
- **Erro/alerta:** Vermelho (`red-50`, `red-200`, `red-600`, `red-700`).
- **Aviso/pendente:** Amarelo/âmbar (`yellow-500`, `amber-50`, `amber-600`).
- **Neutros:** Escala de cinzas (`gray-50` a `gray-900`).
- **Transparências:** `white/10`, `white/20`, `blue-100`, etc., para overlays e hierarquia.

Documentos já existentes com cores detalhadas:
- **DESIGN_COLOR_SYSTEM_MELHORIAS_MOBILE.md** – página `/melhorias-mobile` (completo).
- **DESIGN_COLOR_SYSTEM_CONTATO_INSTITUCIONAL_PERFIL.md** – Contato, Termos, Política de Privacidade, Qualidade, Perfil.

Abaixo estão as demais páginas com cores **aprofundadas** e referência aos docs acima quando aplicável.

---

## 2. Login e Recuperar senha (detalhado)

### 2.1. Painel esquerdo (branding – desktop)

| Classe Tailwind | Hex aprox. | Onde é usado | Razão |
|-----------------|------------|--------------|--------|
| `bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800` | #2563EB → #4338CA | Fundo do painel (login e recuperar-senha) | Marca + confiança; índigo aprofunda e diferencia de outras telas. |
| `bg-[url('...')] opacity-50` | — | Padrão SVG sobre o gradiente | Textura sutil sem competir com texto. |
| `text-white` | #FFFFFF | Título principal, logo, ícones | Máximo contraste. |
| `text-blue-200` | #BFDBFE | Segunda linha do título (“começa aqui” / “à sua conta”) | Hierarquia e leve variação. |
| `text-blue-100/90` | #DBEAFE 90% | Parágrafo descritivo | Legibilidade em fundo escuro. |
| `text-blue-200/80` | #BFDBFE 80% | “Link válido por tempo limitado” (recuperar) | Secundário. |
| `text-blue-200/70` | #BFDBFE 70% | Copyright no rodapé do painel | Discreto. |
| `text-white/90` | rgba(255,255,255,0.9) | Logo, ícones de benefício | Consistência. |
| `bg-white/10` | rgba(255,255,255,0.1) | Logo (rounded), caixas de ícone (Shield, Sparkles, KeyRound) | Elementos flutuantes. |
| `hover:text-white` | — | Link da logo | Feedback. |

### 2.2. Painel direito (formulário)

| Classe Tailwind | Hex aprox. | Uso | Razão |
|-----------------|------------|-----|--------|
| `bg-gray-50/50` | #F9FAFB 50% | Fundo do painel | Neutro, não compete com card. |
| `dark:bg-gray-900/50` | — | Modo escuro | Consistência. |
| `bg-white` | #FFFFFF | Card do formulário | Destaque. |
| `dark:bg-gray-800` | #1F2937 | Card no dark | Contraste. |
| `rounded-2xl shadow-xl shadow-gray-200/50` | — | Card | Elevação. |
| `border border-gray-100` | #F3F4F6 | Borda do card | Definição sutil. |
| `dark:border-gray-700` | #374151 | Borda no dark | Definição. |
| `bg-gray-100` | #F3F4F6 | TabsList (Entrar \| Cadastrar) | Fundo da barra de abas. |
| `data-[state=active]:bg-white` | — | Tab ativa | Destaque. |
| `text-gray-900` | #111827 | Título “Bem-vindo de volta” / “Recuperar senha” | Hierarquia. |
| `text-gray-600` | #4B5563 | Subtítulo, labels | Secundário. |
| `text-gray-400` | #9CA3AF | Ícones em inputs (Lock, Mail) | Discreto. |
| `text-gray-500` | #6B7280 | “Lembrou sua senha?”, divisor “ou continue com” | Neutro. |

### 2.3. Erro e sucesso

| Classe | Hex / efeito | Uso | Razão |
|--------|--------------|-----|--------|
| `bg-red-50` | #FEF2F2 | Caixa de erro | Erro visível sem agressivo. |
| `dark:bg-red-900/20` | — | Erro no dark | Consistência. |
| `border-red-200` | #FECACA | Borda da caixa de erro | Delimitação. |
| `text-red-700` | #B91C1C | Texto do erro | Legibilidade. |
| `dark:text-red-300` | — | Erro no dark | Contraste. |
| `bg-green-100` | #DCFCE7 | Caixa de sucesso (recuperar) | Positivo. |
| `dark:bg-green-900/30` | — | Sucesso no dark | Consistência. |
| `text-green-600` | #16A34A | Ícone CheckCircle2 (sucesso) | Positivo. |
| `dark:text-green-400` | — | Ícone no dark | Contraste. |
| `border-t border-gray-200` | #E5E7EB | Divisor acima do link “Fazer login” | Separação. |

### 2.4. Botões e links (Login / Recuperar)

| Elemento | Classe | Razão |
|----------|--------|--------|
| Botão Entrar | `bg-blue-600 hover:bg-blue-700` | Ação principal de login. |
| Botão Cadastrar | `bg-green-600 hover:bg-green-700` | Criação de conta (positivo). |
| Botão Enviar instruções (recuperar) | `bg-blue-600 hover:bg-blue-700` | Ação principal. |
| Link “Fazer login”, “Esqueci senha”, Termos, Privacidade | `text-blue-600 hover:text-blue-700 hover:underline` | Links secundários. |
| Spinner (loading) | `border-2 border-white/30 border-t-white` | Feedback de carregamento no botão. |

---

## 3. Minhas Reservas

| Classe Tailwind | Hex aprox. | Onde é usado | Razão |
|-----------------|------------|--------------|--------|
| `bg-gray-50` | #F9FAFB | Fundo da página, loading | Área de conta neutra. |
| `min-h-screen` | — | Container principal | Altura mínima. |
| `bg-gradient-to-br from-blue-600 to-blue-800` | #2563EB → #1E40AF | Header | Marca e hierarquia. |
| `text-white` | #FFFFFF | Título, botão voltar | Contraste. |
| `hover:bg-white/20` | — | Botão voltar | Feedback. |
| `rounded-full bg-white/20 p-1` | — | Logo no header | Destaque. |
| `bg-white/20 backdrop-blur-sm border-0` | — | Cards de estatísticas (Total, Confirmadas, Pendentes) | Integração ao header. |
| `text-blue-100` | #DBEAFE | Labels “Total”, “Confirmadas”, “Pendentes” | Legibilidade no header. |
| `border-4 border-blue-600 border-t-transparent` | #2563EB | Spinner de loading | Marca. |
| `text-gray-600` | #4B5563 | “Carregando suas reservas...”, textos secundários | Secundário. |
| **Badges de status** | | | |
| `bg-green-500 text-white` | #22C55E | Confirmada | Sucesso. |
| `bg-yellow-500 text-white` | #EAB308 | Pendente | Aviso. |
| `bg-red-500 text-white` | #EF4444 | Cancelada | Erro. |
| `bg-blue-500 text-white` | #3B82F6 | Concluída | Informação. |
| `text-gray-400` | #9CA3AF | Ícone Search, placeholder imagem | Discreto. |
| `text-gray-800` | #1F2937 | Título do card vazio | Hierarquia. |
| `bg-blue-600 hover:bg-blue-700` | — | CTA “Fazer login” (quando não logado) | Ação principal. |
| `bg-gray-200` | #E5E7EB | Placeholder da imagem do hotel | Neutro. |
| `text-gray-500` | #6B7280 | Código da reserva (#) | Secundário. |
| `text-green-600` | #16A34A | Valor total (destaque) | Positivo. |
| `text-yellow-600 border-yellow-200 hover:bg-yellow-50` | — | Botão “Avaliar” | Ação de avaliação. |
| `text-red-600 border-red-200 hover:bg-red-50` | — | Botão “Cancelar” (ação destrutiva) | Alerta. |
| `bg-blue-50 border-blue-200` | #EFF6FF, #BFDBFE | Card de contato (telefone/e-mail) | Destaque informativo. |
| `bg-green-50 hover:bg-green-100` | #F0FDF4 | Link WhatsApp | Associação ao canal. |
| `bg-blue-50 hover:bg-blue-100` | #EFF6FF | Link e-mail | Contato. |
| `text-green-600` | #16A34A | Ícone Phone (WhatsApp) | Canal. |
| `text-blue-600` | #2563EB | Ícone Mail | Contato. |

---

## 4. Leilões (listagem e detalhe)

### 4.1. Listagem (`/leiloes`)

| Classe Tailwind | Hex aprox. | Uso | Razão |
|-----------------|------------|-----|--------|
| `min-h-screen bg-gray-50` | #F9FAFB | Fundo | Neutro. |
| `bg-white shadow-sm border-b border-gray-200` | #FFFFFF, #E5E7EB | Barra de filtros sticky | Separação. |
| `text-gray-700` | #374151 | Labels (Localização, Entrada, Hóspedes) | Legibilidade. |
| `text-gray-400` | #9CA3AF | Ícones Search, Calendar, Users | Secundário. |
| `border border-gray-300` | #D1D5DB | Inputs | Definição. |
| `focus:ring-2 focus:ring-blue-500 focus:border-blue-500` | #3B82F6 | Foco em inputs | Acessibilidade. |
| `text-gray-900` | #111827 | Valores de input, títulos de bloco | Hierarquia. |
| `bg-blue-100 text-blue-700 border border-blue-300` | #DBEAFE, #1D4ED8 | Botão “Mapa” ativo | Seleção. |
| `bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200` | — | Botão “Lista” inativo | Estado inativo. |
| `bg-white rounded-lg shadow-sm p-4` | — | Blocos (Tipo de Propriedade, Período, Faixa de Preço) | Agrupamento. |
| `bg-blue-600 text-white shadow-md` | #2563EB | Tipo de propriedade selecionado | Seleção. |
| `bg-gray-100 text-gray-700 hover:bg-gray-200` | — | Tipo não selecionado | Inativo. |
| `text-gray-600` | #4B5563 | Labels “Entrada”/“Saída”, texto da faixa de preço | Secundário. |
| `text-gray-500` | #6B7280 | Separador “-”, placeholder | Discreto. |
| `bg-gradient-to-r from-green-500 to-green-600` | #22C55E → #16A34A | Card “Leilões Ativos” (destaque) | Urgência/ativo. |
| `text-white` | — | Texto no card verde | Contraste. |
| `bg-blue-600 text-white` | #2563EB | Botões “Mapa”/“Lista” ativos | Ação ativa. |
| `text-gray-700 hover:bg-gray-100` | — | Botões inativos | Inativo. |
| `border-b-2 border-blue-600` | #2563EB | Spinner de loading | Marca. |
| `bg-amber-50 border border-amber-200 rounded-lg text-amber-800` | #FFFBEB, #FDE047 | Aviso “Backend não está rodando” | Aviso. |
| `bg-amber-100 px-1 rounded` | #FEF3C7 | Código no aviso | Destaque. |
| `bg-amber-600 hover:bg-amber-700` | #D97706, #B45309 | Botão “Iniciar backend” | Ação de aviso. |
| `bg-gray-200 animate-pulse` | #E5E7EB | Loading do mapa | Estado de carregamento. |
| `text-gray-500` | #6B7280 | “Carregando mapa...” | Secundário. |
| `bg-white rounded-lg shadow-sm` | — | Card “Nenhum leilão ativo” | Conteúdo. |
| `bg-gray-50 border-t` | #F9FAFB | Rodapé da lista de exemplos | Separação. |

### 4.2. Detalhe (`/leiloes/[id]`)

| Classe | Uso | Razão |
|--------|-----|--------|
| `min-h-screen bg-gray-50` | Fundo | Consistência com listagem. |
| `bg-white shadow-sm` | Header da página | Conteúdo em destaque. |
| `text-blue-600 hover:text-blue-700` | “Voltar para Leilões” | Navegação. |
| `text-3xl font-bold text-gray-900` | Título do leilão | Hierarquia. |
| `text-gray-600` | Descrição | Secundário. |
| `bg-white rounded-lg shadow-sm p-6` | Timer, informações, formulário de lance | Cards. |
| `inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700` | Botão “Voltar” (estado erro) | CTA. |

---

## 5. Flash Deals

| Classe Tailwind | Hex aprox. | Uso | Razão |
|-----------------|------------|-----|--------|
| `min-h-screen bg-gray-50` | #F9FAFB | Fundo | Neutro. |
| `bg-gradient-to-r from-red-500 to-orange-500` | #EF4444 → #F97316 | Header | Urgência e oferta relâmpago. |
| `text-white` | #FFFFFF | Título, ícones | Contraste. |
| `text-red-50` | #FEF2F2 | Subtítulo no header | Leve variação. |
| `bg-white/20 hover:bg-white/30 border-white/30` | — | Botão voltar (mobile) | Integrado ao header. |
| `text-white/80` | — | Ícone Search no input | Legibilidade. |
| `bg-white/90 backdrop-blur-sm border border-white/20` | — | Input de busca | Destaque sobre o header. |
| `text-gray-900 placeholder-gray-500` | — | Texto e placeholder do input | Legibilidade. |
| `focus:ring-2 focus:ring-white focus:border-white` | — | Foco no input | Acessibilidade. |
| `border-b-2 border-red-600` | #DC2626 | Spinner de loading | Consistência com tema da página. |
| `text-gray-600` | #4B5563 | “Carregando ofertas relâmpago...” | Secundário. |
| `bg-red-50 border border-red-200 rounded-lg text-red-700` | #FEF2F2, #FECACA | Caixa de erro | Erro. |
| `bg-white rounded-lg shadow-sm` | — | Estado vazio “Nenhuma oferta relâmpago” | Conteúdo. |
| `text-gray-400` | #9CA3AF | Ícone Zap (vazio) | Discreto. |
| `text-xl font-semibold text-gray-900` | — | Título do estado vazio | Hierarquia. |
| `text-gray-600` | #4B5563 | Descrição | Secundário. |
| `text-sm text-gray-600` | — | Textos auxiliares na listagem | Secundário. |

---

## 6. Dashboard e Dashboard RSV

### 6.1. Dashboard (`/dashboard`)

| Classe | Uso | Razão |
|--------|-----|--------|
| `min-h-screen bg-gray-50` | Fundo | Área de trabalho. |
| `text-3xl font-bold text-gray-900` | Título “Dashboard do Proprietário” | Hierarquia. |
| `text-gray-600 mt-1` | Subtítulo | Secundário. |
| `Card` (padrão) | Módulos (Meus Hotéis, Dashboard RSV, Precificação) | Agrupamento. |
| `Button` (default) | “Abrir módulo” | Ação principal (tema). |

### 6.2. Dashboard RSV (`/dashboard-rsv`)

| Classe Tailwind | Hex aprox. | Uso | Razão |
|-----------------|------------|-----|--------|
| `min-h-screen bg-gray-50` | #F9FAFB | Fundo | Neutro. |
| `bg-white shadow-sm border-b border-gray-200` | #FFFFFF, #E5E7EB | Header | Separação. |
| `text-gray-400 hover:text-gray-500 hover:bg-gray-100` | — | Botão menu (mobile), ícones | Interação. |
| `text-2xl font-bold text-gray-900` | #111827 | “Reservei Viagens” | Marca. |
| `text-sm text-gray-500` | #6B7280 | “Dashboard de Gestão” | Secundário. |
| `bg-red-400` | #F87171 | Indicador de notificação (bolinha) | Alerta. |
| `text-sm font-medium text-gray-900` | — | “Usuário Admin” | Hierarquia. |
| `text-xs text-gray-500` | — | “Administrador” | Secundário. |
| `bg-white shadow-lg` | — | Sidebar | Elevação. |
| `border-b border-gray-200` | #E5E7EB | Separação do título do menu | Delimitação. |
| `text-lg font-semibold text-gray-900` | — | “Menu” | Hierarquia. |
| `text-blue-600 bg-blue-50 rounded-md` | #2563EB, #EFF6FF | Item ativo (Dashboard RSV) | Seleção. |
| `text-gray-600 hover:text-gray-900 hover:bg-gray-50` | — | Itens do menu (Minhas reservas, CRM, etc.) | Navegação. |
| `text-3xl font-bold text-gray-900` | — | “Dashboard” | Título da área. |
| `text-gray-600` | — | “Visão geral do seu negócio” | Secundário. |
| `bg-white rounded-lg shadow p-6` | — | Cards de estatísticas | Conteúdo. |
| `p-2 bg-blue-100 rounded-lg` | #DBEAFE | Ícone Calendar (Total de Reservas) | Categoria. |
| `text-blue-600` | #2563EB | Ícone | Consistência. |
| `text-sm font-medium text-gray-600` | — | Label da métrica | Secundário. |
| `text-2xl font-bold text-gray-900` | — | Valor da métrica | Destaque. |
| `text-sm text-green-600` | #16A34A | Tendência (ex.: “vs mês anterior”) | Positivo. |
| `p-2 bg-green-100 rounded-lg` | #DCFCE7 | Ícone DollarSign (Receita) | Categoria. |
| `p-2 bg-purple-100 rounded-lg` | #F3E8FF | Ícone Users (Clientes) | Categoria. |
| `text-purple-600` | #9333EA | Ícone | Consistência. |
| `p-2 bg-yellow-100 rounded-lg` | #FEF9C3 | Ícone Star (Destino popular) | Categoria. |
| `text-yellow-600` | #CA8A04 | Ícone | Consistência. |
| `text-sm text-blue-600` | #2563EB | Link “Ver todos” (destino) | Ação. |
| **Ações rápidas (cores por tipo)** | | | |
| `bg-blue-500 hover:bg-blue-600` | #3B82F6 | Ação 1 | Primária. |
| `bg-green-500 hover:bg-green-600` | #22C55E | Ação 2 | Sucesso. |
| `bg-orange-500 hover:bg-orange-600` | #F97316 | Ação 3 | Destaque. |
| `bg-purple-500 hover:bg-purple-600` | #A855F7 | Ação 4 | Secundária. |
| `bg-gray-500 hover:bg-gray-600` | #6B7280 | Ação 5 | Neutro. |
| **Badges de status (reserva)** | | | |
| `bg-green-100 text-green-800` | #DCFCE7, #166534 | Confirmada | Sucesso. |
| `bg-yellow-100 text-yellow-800` | #FEF9C3, #854D0E | Pendente | Aviso. |
| `bg-red-100 text-red-800` | #FEE2E2, #991B1B | Cancelada | Erro. |
| `bg-gray-100 text-gray-800` | — | Default | Neutro. |
| **Badges de pagamento** | | | |
| `bg-green-100 text-green-800` | — | Pago | Sucesso. |
| `bg-yellow-100 text-yellow-800` | — | Pendente | Aviso. |
| `bg-red-100 text-red-800` | — | Falha | Erro. |
| `bg-gray-50` | #F9FAFB | Cabeçalho da tabela | Separação. |
| `text-xs font-medium text-gray-500 uppercase` | — | Labels da tabela | Hierarquia. |
| `bg-white divide-y divide-gray-200` | — | Corpo da tabela | Linhas. |
| `hover:bg-gray-50` | #F9FAFB | Linha da tabela (hover) | Feedback. |
| `text-sm font-medium text-gray-900` | — | Nome do cliente, destino | Destaque. |
| `text-sm text-gray-900` | — | Datas, valor | Conteúdo. |
| `text-blue-600 hover:text-blue-900` | — | Botão “Visualizar” | Ação. |
| `text-green-600 hover:text-green-900` | — | Botão “Editar” | Ação positiva. |

---

## 7. Contato, Institucionais e Perfil

Para **cores detalhadas** de Contato, Termos, Política de Privacidade, Qualidade e Perfil, ver **DESIGN_COLOR_SYSTEM_CONTATO_INSTITUCIONAL_PERFIL.md**.

Resumo:
- **Contato:** Roxo/azul (gradiente), cards por serviço (azul, laranja, verde, cinza), branco semitransparente, float WhatsApp verde.
- **Termos:** Cinzas, azul em avisos e links.
- **Política de Privacidade:** Header azul, seções com ícones coloridos (azul, verde, roxo, laranja, vermelho, indigo), blocos `bg-*-50`, float WhatsApp.
- **Perfil:** Header azul, fundo `gray-50`, verde (verificado), vermelho (erro), cinzas em campos, links azul/verde.

---

## 8. Booking, Cupons, Insurance

### 8.1. Booking (`/booking`)

| Classe | Uso | Razão |
|--------|-----|--------|
| `container mx-auto max-w-4xl` | Layout | Largura controlada. |
| `text-4xl font-bold mb-2` | Título | Hierarquia. |
| `text-muted-foreground` | Descrição | Tema (secundário). |
| `hover:shadow-lg transition-shadow` | Cards | Interatividade. |
| `Button` default / `variant="outline"` / `variant="secondary"` | CTAs | Primária e secundárias. |

### 8.2. Cupons (`/cupons`)

Cores vêm dos componentes UI (Card, Table, Badge, Tabs, Dialog). Badges para ativo/inativo (verde/vermelho ou equivalente). Botões primários azul; erros em vermelho. Sem paleta específica além do tema.

### 8.3. Insurance (`/insurance`)

| Classe | Uso | Razão |
|--------|-----|--------|
| `container mx-auto py-8 px-4` | Layout | Container. |
| `text-3xl font-bold mb-2` | “Seguro de Viagem” | Hierarquia. |
| `text-muted-foreground` | Descrição | Secundário. |
| `Badge bg-green-600` | Status “Ativo” | Positivo. |
| `Badge variant="secondary"` | “Expirado” | Neutro. |
| `Badge variant="destructive"` | “Cancelado” | Erro. |
| `Button` default / outline | Nova Apólice, Registrar Sinistro | Ações. |

---

## 9. Onboarding, CRM, Analytics, Quality

### 9.1. Onboarding (`/onboarding`)

| Classe | Hex aprox. | Uso | Razão |
|--------|------------|-----|--------|
| `bg-gradient-to-br from-blue-50 via-white to-emerald-50` | #EFF6FF → #ECFDF5 | Fundo da página | Suave; azul e verde (crescimento). |
| `border-4 border-blue-200 border-t-blue-600` | #BFDBFE, #2563EB | Spinner de loading | Marca. |
| `text-gray-600` | #4B5563 | “Verificando autenticação...”, “Carregando integração...” | Secundário. |
| `text-4xl font-bold text-gray-900` | #111827 | “RSV Integração 360” | Hierarquia. |
| `text-xl text-gray-600 max-w-2xl` | #4B5563 | Descrição | Secundário. |
| `bg-white rounded-lg shadow-sm border` | — | Cards de benefícios (treinamento, integração, suporte) | Conteúdo. |
| `text-3xl mb-3` | — | Emoji dos cards | Destaque. |
| `font-semibold text-gray-900` | — | Título do card | Hierarquia. |
| `text-gray-600 text-sm` | — | Descrição do card | Secundário. |

### 9.2. CRM, Analytics, Quality

- **CRM:** Título `text-3xl font-bold`, descrição `text-gray-500`; Tabs, tabelas e botões do tema; link ativo pode usar azul.
- **Analytics:** Mesmo padrão; filtros com Input e Button outline; abas para Dashboard, Previsão, Heatmap, Benchmark, Insights.
- **Quality:** Container, título e `text-muted-foreground`; cards com hover; botão primário e outline (ver **DESIGN_COLOR_SYSTEM_CONTATO_INSTITUCIONAL_PERFIL.md**).

---

## 10. Loyalty e Fidelidade (tiers e estados)

### 10.1. Tiers (Fidelidade – `tierConfig`)

| Tier | Classe (background) | Hex aprox. | Uso |
|------|---------------------|------------|-----|
| Bronze | `bg-amber-600` | #D97706 | Badge/nível |
| Prata | `bg-gray-400` | #9CA3AF | Badge/nível |
| Ouro | `bg-yellow-500` | #EAB308 | Badge/nível |
| Platina | `bg-blue-500` | #3B82F6 | Badge/nível |
| Diamante | `bg-purple-500` | #A855F7 | Badge/nível |

**Razão:** Hierarquia visual clara (bronze → diamante); cores metálicas e preciosas associadas a valor e recompensa.

### 10.2. Demais elementos (Loyalty / Fidelidade)

- Cards de pontos, progress bars (Progress), tabelas de transações e resgates.
- Botões de resgate: primário (azul) ou destaque (verde).
- Estados de resgate: pending/approved/rejected com badges (amarelo/verde/vermelho).
- Textos: `text-gray-900`, `text-gray-600`, `text-gray-500` para hierarquia.

---

## 11. Notificações e Mensagens

### 11.1. Notificações (`/notificacoes`)

| Classe | Uso | Razão |
|--------|-----|--------|
| `min-h-screen bg-gray-50` | Fundo | Consistência com perfil. |
| `max-w-4xl mx-auto p-6` | Container | Largura. |
| `Button variant="outline" size="sm"` | “Voltar” (para /perfil) | Navegação. |
| `text-2xl font-bold` | “Notificações” | Hierarquia. |
| `text-sm text-gray-500` | “N não lidas” | Secundário. |
| Cards por notificação | Fundo branco, borda sutil | Leitura. |
| `text-gray-400` (ícone Bell vazio) | Estado vazio | Discreto. |
| `text-gray-500` | “Nenhuma notificação” | Secundário. |

### 11.2. Mensagens (`/mensagens`)

Cores seguem o tema (fundo claro, cards, links azul). Ver arquivo da página se precisar de detalhe por componente.

---

## 12. Páginas dinâmicas: Hotel e Leilão

### 12.1. Hotel (`/hoteis/[id]`)

| Classe | Hex aprox. | Uso | Razão |
|--------|------------|-----|--------|
| `min-h-screen bg-gray-50` | #F9FAFB | Fundo | Contraste com hero. |
| `h-96 bg-gray-900` | #111827 | Hero (galeria) | Área escura para fotos. |
| `bg-black bg-opacity-40` | rgba(0,0,0,0.4) | Overlay sobre a imagem | Legibilidade dos indicadores. |
| `bg-white` / `bg-white bg-opacity-50` | — | Indicadores da galeria (ativo / inativo) | Navegação. |
| `border-b-2 border-blue-600` | #2563EB | Spinner de loading | Marca. |
| `text-gray-600` | #4B5563 | “Empreendimento não encontrado” | Secundário. |
| `text-blue-600 hover:underline` | #2563EB | “Voltar para lista” | Navegação. |
| Demais blocos (info, propriedades, cross-sell) | — | Cards brancos, textos gray-900/gray-600, links blue-600 | Consistência. |

### 12.2. Leilão (`/leiloes/[id]`)

Ver [4.2](#42-detalhe-leiloesid). Mesmo padrão: `gray-50`, branco, azul para links e CTAs.

---

## 13. Viagens em Grupo, Group Travel

| Classe | Uso | Razão |
|--------|-----|--------|
| `container mx-auto max-w-7xl` | Layout | Largura. |
| `text-4xl font-bold mb-2` | “Viagens em Grupo” | Hierarquia. |
| `text-muted-foreground text-lg` | Descrição | Secundário. |
| `hover:shadow-lg transition-shadow` | Cards | Interatividade. |
| Tabs (viagens-grupo) | Listas, Divisão, Convites, Chat | Navegação por abas (tema). |
| `Button variant="outline"` | Links para shared-wishlist, trip-planning, etc. | Ações secundárias. |

Cores vêm do tema global (primário azul, cinzas).

---

## 14. Home, Busca, Promoções, Cotação

- **Home (`/`):** Ver documentação da home e side rails; azul primário, laranja/amarelo para ofertas, verde para CTAs (alinhado a **DESIGN_COLOR_SYSTEM_MELHORIAS_MOBILE.md** se a home compartilhar o mesmo sistema).
- **Busca (`/buscar`):** Inputs, botões e resultados com tema padrão (cinzas, azul para CTAs).
- **Promoções (`/promocoes`):** Cards de oferta; amarelo/laranja para promoção; azul para links.
- **Cotação (`/cotacao`):** Formulário e confirmação; azul para envio e links.

---

## 15. Admin e demais rotas

- **Admin** (`/admin/*`): Headers e sidebars geralmente escuros ou brancos com bordas cinza; links e botões primários azul; estados de erro/sucesso em vermelho/verde. Cada subpágina pode ter badges e tabelas com o mesmo padrão de status.
- **Demais rotas** (checkin, verification, tickets, api-docs, ui-demo, redefinir-senha, etc.): Seguem o tema do projeto (cinzas, azul primário, verde/vermelho para estados). Para detalhe fino, consultar o arquivo `page.tsx` correspondente em `app/`.

---

## 16. Tabela resumo por cor (Tailwind → páginas)

| Cor (Tailwind) | Onde aparece (principais) |
|----------------|---------------------------|
| **blue-600 / blue-700 / blue-800** | Login, Recuperar, Perfil, Minhas reservas, Contato (parcial), Política, Dashboard RSV (menu ativo), Leilões (CTAs, foco), Hotel [id], Leilão [id], Fidelidade (platina), Insurance (badge ativo), Onboarding (spinner) |
| **indigo-800** | Login, Recuperar (gradiente painel esquerdo) |
| **green-500 / green-600 / green-50 / green-100** | Login (botão Cadastrar), Recuperar (sucesso), Minhas reservas (confirmada, WhatsApp), Dashboard RSV (receita, badges, ações), Leilões (card “Ativos”), Fidelidade (resgates), Contato (WhatsApp, card) |
| **red-50 / red-200 / red-600 / red-700** | Login, Recuperar (erro), Minhas reservas (cancelada, botão cancelar), Flash deals (erro), Dashboard RSV (cancelada, falha), Insurance (cancelado) |
| **yellow-500 / yellow-100 / yellow-600** | Minhas reservas (pendente, avaliar), Dashboard RSV (destino popular, pendente), Fidelidade (ouro), Leilões (aviso backend) |
| **amber-50 / amber-100 / amber-600 / amber-800** | Leilões (aviso backend), Fidelidade (bronze), Login (desbloquear dev) |
| **purple-500 / purple-600 / purple-100** | Contato (header, gradiente), Dashboard RSV (clientes, ações), Fidelidade (diamante) |
| **orange-500 / orange-100** | Contato (catálogos), Flash deals (header), Dashboard RSV (ações) |
| **gray-50 a gray-900** | Quase todas as páginas: fundos (50), textos (400–900), bordas (200–300), inputs, cards |
| **white / white/10 a white/95** | Login, Recuperar, Contato, Minhas reservas, headers (overlay, logos, botões ghost) |

---

**Referências:**  
- **ROTAS_COMPLETAS.md** – lista das 94 rotas.  
- **DESIGN_COLOR_SYSTEM_MELHORIAS_MOBILE.md** – cores completas da página melhorias-mobile.  
- **DESIGN_COLOR_SYSTEM_CONTATO_INSTITUCIONAL_PERFIL.md** – Contato, Institucionais, Perfil.  
- **PAGE_DOC_SITE_PUBLICO_COMPLETO.md** – documentação de arquitetura e UI das páginas.

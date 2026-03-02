# 🗺️ Mapa Completo de Links e Estrutura de Navegação - RSV 360°

**Data:** 07/12/2025  
**Projeto:** Hotel-com-melhor-preco-main  
**Status:** Mapeamento Completo

---

## 📊 ESTRUTURA GERAL DO MENU

### 🏠 **MENU PRINCIPAL (Navegação Inferior - Mobile)**

Localização: `app/page.tsx` (linhas 512-533)

```typescript
[
  { icon: "🏠", label: "Início", href: "/" },
  { icon: "🔍", label: "Buscar", href: "/buscar" },
  { icon: "🏨", label: "Hotéis", href: "/hoteis" },
  { icon: "👤", label: "Perfil", href: "/perfil" },
]
```

---

## 🎯 MENU DE CATEGORIAS (Página Principal)

Localização: `app/page.tsx` (linhas 260-274)

### ✅ **Categorias Rápidas**

1. **🔍 Buscar** → `/buscar`
2. **🏨 Hotéis** → `/hoteis`
3. **🎟️ Ingressos** → `/ingressos`
4. **🏞️ Atrações** → `/atracoes`
5. **🏷️ Promoções** → `/promocoes` (botão destacado)

---

## 🔗 MAPEAMENTO COMPLETO DE LINKS POR PÁGINA

### 📄 **PÁGINA PRINCIPAL** (`/`)

**Arquivo:** `app/page.tsx`

**Links Encontrados:**
- `/buscar` - Busca de propriedades
- `/hoteis` - Lista de hotéis
- `/ingressos` - Ingressos para parques
- `/atracoes` - Atrações turísticas
- `/promocoes` - Promoções especiais (múltiplos links)
- `/hoteis/${hotel.id}` - Detalhes de hotel específico
- Links externos:
  - WhatsApp: `https://wa.me/5564993197555`
  - Email: `mailto:reservas@reserveiviagens.com.br`
  - Telefone: `tel:+556521270415`
  - Facebook: `https://www.facebook.com/comercialreservei`
  - Instagram: `https://www.instagram.com/reserveiviagens`
  - Website: `https://www.reserveiviagens.com.br`

---

### 🏨 **PÁGINA DE HOTÉIS** (`/hoteis`)

**Arquivo:** `app/hoteis/page.tsx`

**Links Encontrados:**
- `/` - Voltar ao início
- `/hoteis/${hotel.id}` - Detalhes de hotel específico
- Links externos:
  - WhatsApp: `https://wa.me/5564993197555`

---

### 🔍 **PÁGINA DE BUSCA** (`/buscar`)

**Arquivo:** `app/buscar/page.tsx`

**Links Encontrados:**
- `/` - Voltar ao início
- `/hoteis/${property.id}` - Detalhes da propriedade

---

### 👤 **PÁGINA DE PERFIL** (`/perfil`)

**Arquivo:** `app/perfil/page.tsx`

**Links Encontrados:**
- `/` - Voltar ao início
- `/login` - Login (se não autenticado)
- `/minhas-reservas` - Minhas reservas
- `/buscar` - Buscar propriedades
- Links externos (se configurados):
  - Website do host
  - Booking URL
  - WhatsApp
  - Google Maps
  - Redes sociais (Facebook, Instagram, Twitter, LinkedIn, YouTube)

---

### 📅 **PÁGINA DE RESERVAS** (`/reservar/[id]`)

**Arquivo:** `app/reservar/[id]/page.tsx`

**Links Encontrados:**
- `/hoteis/${hotelId}` - Voltar para detalhes do hotel
- `/login?redirect=...` - Login com redirect
- `/politica-privacidade` - Política de privacidade (múltiplos links)

---

### ✅ **CONFIRMAÇÃO DE RESERVA** (`/reservar/[id]/confirmacao`)

**Arquivo:** `app/reservar/[id]/confirmacao/page.tsx`

**Links Encontrados:**
- `/minhas-reservas` - Ver minhas reservas
- `/` - Voltar ao início
- Links externos:
  - WhatsApp: `https://wa.me/5564993197555`
  - Email: `mailto:reservas@reserveiviagens.com.br`

---

### 📋 **MINHAS RESERVAS** (`/minhas-reservas`)

**Arquivo:** `app/minhas-reservas/page.tsx`

**Links Encontrados:**
- `/` - Voltar ao início
- `/buscar` - Buscar novas propriedades
- Links externos:
  - WhatsApp: `https://wa.me/5564993197555`
  - Email: `mailto:reservas@reserveiviagens.com.br`

---

### 🔐 **AUTENTICAÇÃO**

#### **Login** (`/login`)
**Arquivo:** `app/login/page.tsx`
**Links:**
- `/` - Voltar ao início

#### **Recuperar Senha** (`/recuperar-senha`)
**Arquivo:** `app/recuperar-senha/page.tsx`
**Links:**
- `/login` - Voltar para login

#### **Redefinir Senha** (`/redefinir-senha`)
**Arquivo:** `app/redefinir-senha/page.tsx`
**Links:**
- `/login` - Voltar para login
- `/recuperar-senha` - Recuperar senha novamente

---

### 🎁 **VIAGENS EM GRUPO** (`/viagens-grupo`)

**Arquivo:** `app/viagens-grupo/page.tsx`

**Estrutura:**
- Abas internas (Tabs):
  - Wishlists
  - Divisão de Pagamentos
  - Convites
  - Chat em Grupo

**Links Relacionados:**
- `/wishlists` - Gerenciar wishlists
- `/wishlists/[id]` - Detalhes da wishlist
- `/split-payment/[id]` - Divisão de pagamento
- `/group-chat/[id]` - Chat em grupo
- `/invite/[token]` - Aceitar convite

---

### 💝 **WISHLISTS**

#### **Lista de Wishlists** (`/wishlists`)
**Arquivo:** `app/wishlists/page.tsx`
**Links:**
- `/wishlists/[id]` - Detalhes da wishlist

#### **Detalhes da Wishlist** (`/wishlists/[id]`)
**Arquivo:** `app/wishlists/[id]/page.tsx`
**Links:**
- Links internos para votação e gerenciamento

---

### 💰 **SPLIT PAYMENT**

#### **Divisão de Pagamento** (`/split-payment/[id]`)
**Arquivo:** `app/split-payment/[id]/page.tsx`
**Links:**
- Links internos para gerenciamento de divisão

#### **Convite Split Payment** (`/split-payment/invite/[token]`)
**Arquivo:** `app/split-payment/invite/[token]/page.tsx`
**Links:**
- Aceitar/recusar convite

---

### 💬 **CHAT EM GRUPO**

#### **Lista de Chats** (`/group-chats`)
**Arquivo:** `app/group-chats/page.tsx`
**Links:**
- `/group-chat/[id]` - Abrir chat específico

#### **Chat Específico** (`/group-chat/[id]`)
**Arquivo:** `app/group-chat/[id]/page.tsx`
**Links:**
- Links internos para mensagens

---

### 🎫 **TICKETS**

#### **Lista de Tickets** (`/tickets`)
**Arquivo:** `app/tickets/page.tsx`
**Links:**
- `/tickets/[id]` - Detalhes do ticket

#### **Detalhes do Ticket** (`/tickets/[id]`)
**Arquivo:** `app/tickets/[id]/page.tsx`
**Links:**
- Links internos para comentários e atualizações

---

### 🚪 **CHECK-IN**

#### **Check-in Principal** (`/checkin`)
**Arquivo:** `app/checkin/page.tsx`
**Links:**
- `/checkin/[id]` - Check-in específico

#### **Check-in por ID** (`/checkin/[id]`)
**Arquivo:** `app/checkin/[id]/page.tsx`
**Links:**
- Links internos para documentos e QR code

#### **Escanear QR Code** (`/checkin/scan`)
**Arquivo:** `app/checkin/scan/page.tsx`
**Links:**
- Links internos para escaneamento

---

### 🛡️ **SEGUROS**

#### **Insurance** (`/insurance`)
**Arquivo:** `app/insurance/page.tsx`
**Links:**
- `/insurance/policies` - Políticas de seguro

#### **Políticas** (`/insurance/policies`)
**Arquivo:** `app/insurance/policies/page.tsx`
**Links:**
- Links internos para detalhes de políticas

---

### 🏆 **QUALIDADE**

#### **Quality Dashboard** (`/quality/dashboard`)
**Arquivo:** `app/quality/dashboard/page.tsx`
**Links:**
- Links internos para métricas

#### **Leaderboard** (`/quality/leaderboard`)
**Arquivo:** `app/quality/leaderboard/page.tsx`
**Links:**
- Links internos para ranking

---

### 📊 **ANALYTICS**

#### **Analytics** (`/analytics`)
**Arquivo:** `app/analytics/page.tsx`
**Links:**
- `/analytics/revenue-forecast` - Previsão de receita

#### **Revenue Forecast** (`/analytics/revenue-forecast`)
**Arquivo:** `app/analytics/revenue-forecast/page.tsx`
**Links:**
- Links internos para gráficos

---

### 💰 **PRICING**

#### **Smart Pricing** (`/pricing/smart`)
**Arquivo:** `app/pricing/smart/page.tsx`
**Links:**
- Links internos para configuração

#### **Competitors** (`/pricing/competitors`)
**Arquivo:** `app/pricing/competitors/page.tsx`
**Links:**
- Links internos para análise

---

### 🎟️ **CUPONS**

#### **Cupons** (`/cupons`)
**Arquivo:** `app/cupons/page.tsx`
**Links:**
- Links internos para validação

---

### ⭐ **AVALIAÇÕES**

#### **Avaliações** (`/avaliacoes`)
**Arquivo:** `app/avaliacoes/page.tsx`
**Links:**
- Links internos para reviews

---

### 🎯 **FIDELIDADE**

#### **Fidelidade** (`/fidelidade`)
**Arquivo:** `app/fidelidade/page.tsx`
**Links:**
- Links internos para pontos

#### **Loyalty** (`/loyalty`)
**Arquivo:** `app/loyalty/page.tsx`
**Links:**
- `/loyalty/rewards` - Catálogo de recompensas

#### **Rewards** (`/loyalty/rewards`)
**Arquivo:** `app/loyalty/rewards/page.tsx`
**Links:**
- Links internos para resgate

---

### 🗺️ **TRIPS**

#### **Trips** (`/trips`)
**Arquivo:** `app/trips/page.tsx`
**Links:**
- `/trips/[id]` - Detalhes da trip

#### **Detalhes da Trip** (`/trips/[id]`)
**Arquivo:** `app/trips/[id]/page.tsx`
**Links:**
- Links internos para planejamento

---

### 🏢 **CRM**

#### **CRM** (`/crm`)
**Arquivo:** `app/crm/page.tsx`
**Links:**
- `/crm/[id]` - Detalhes do cliente

#### **Detalhes do Cliente** (`/crm/[id]`)
**Arquivo:** `app/crm/[id]/page.tsx`
**Links:**
- Links internos para histórico e interações

---

### 📱 **OUTRAS PÁGINAS**

#### **Mensagens** (`/mensagens`)
**Arquivo:** `app/mensagens/page.tsx`
**Links:**
- `/perfil` - Voltar ao perfil

#### **Notificações** (`/notificacoes`)
**Arquivo:** `app/notificacoes/page.tsx`
**Links:**
- `/perfil` - Voltar ao perfil
- Links dinâmicos baseados em notificações

#### **Contato** (`/contato`)
**Arquivo:** `app/contato/page.tsx`
**Links:**
- Links de contato (email, telefone, WhatsApp)

#### **Buscar Hosts** (`/buscar-hosts`)
**Arquivo:** `app/buscar-hosts/page.tsx`
**Links:**
- `/perfil/${host.id}` - Perfil do host

#### **Perfil do Host** (`/hosts/[id]`)
**Arquivo:** `app/hosts/[id]/page.tsx`
**Links:**
- Links internos para propriedades do host

#### **Verification** (`/verification`)
**Arquivo:** `app/verification/page.tsx`
**Links:**
- Links internos para verificação

#### **Onboarding** (`/onboarding`)
**Arquivo:** `app/onboarding/page.tsx`
**Links:**
- Links internos para processo de onboarding

#### **Página Dinâmica** (`/[slug]`)
**Arquivo:** `app/[slug]/page.tsx`
**Links:**
- `/` - Voltar ao início
- Links dinâmicos baseados no CMS

#### **Política de Privacidade** (`/politica-privacidade`)
**Arquivo:** `app/politica-privacidade/page.tsx`
**Links:**
- Links internos para termos

---

## 🔧 **ÁREA ADMINISTRATIVA**

### 📊 **Admin Dashboard** (`/admin/dashboard`)
**Links:**
- Links para todas as áreas administrativas

### 📝 **Admin CMS** (`/admin/cms`)
**Links:**
- `/admin/uploads` - Gerenciar uploads
- `/admin/logs` - Logs estruturados
- `/admin/health` - Monitoramento de health
- `/admin/profile` - Perfil e atividades

### 🎫 **Admin Tickets** (`/admin/tickets`)
**Links:**
- Links internos para gerenciamento

### 💬 **Admin Chat** (`/admin/chat`)
**Links:**
- Links internos para chat administrativo

### 🔐 **Admin Login** (`/admin/login`)
**Links:**
- Links internos para autenticação

### Outras páginas admin:
- `/admin/crm`
- `/admin/analytics`
- `/admin/credenciais`
- `/admin/verification`
- `/admin/uploads`
- `/admin/pwa-demo`
- `/admin/ui-demo`

---

## 📊 **ESTRUTURA HIERÁRQUICA DO MENU**

```
🏠 INÍCIO (/)
├── 🔍 Buscar (/buscar)
├── 🏨 Hotéis (/hoteis)
│   └── Detalhes (/hoteis/[id])
├── 🎟️ Ingressos (/ingressos)
├── 🏞️ Atrações (/atracoes)
├── 🏷️ Promoções (/promocoes)
│
👤 PERFIL (/perfil)
├── Minhas Reservas (/minhas-reservas)
├── Buscar Hosts (/buscar-hosts)
│   └── Perfil do Host (/hosts/[id])
├── Mensagens (/mensagens)
├── Notificações (/notificacoes)
│
🔐 AUTENTICAÇÃO
├── Login (/login)
├── Recuperar Senha (/recuperar-senha)
├── Redefinir Senha (/redefinir-senha)
└── Onboarding (/onboarding)
│
🎁 VIAGENS EM GRUPO (/viagens-grupo)
├── Wishlists (/wishlists)
│   └── Detalhes (/wishlists/[id])
├── Split Payment (/split-payment/[id])
│   └── Convite (/split-payment/invite/[token])
├── Chat em Grupo (/group-chats)
│   └── Chat Específico (/group-chat/[id])
└── Convites (/invite/[token])
│
📅 RESERVAS
├── Reservar (/reservar/[id])
├── Confirmação (/reservar/[id]/confirmacao)
├── Minhas Reservas (/minhas-reservas)
└── Detalhes da Reserva (/bookings/[id])
│
🚪 CHECK-IN
├── Check-in (/checkin)
├── Check-in por ID (/checkin/[id])
└── Escanear QR (/checkin/scan)
│
🎫 TICKETS
├── Lista (/tickets)
└── Detalhes (/tickets/[id])
│
🛡️ SEGUROS
├── Insurance (/insurance)
└── Políticas (/insurance/policies)
│
🏆 QUALIDADE
├── Dashboard (/quality/dashboard)
└── Leaderboard (/quality/leaderboard)
│
📊 ANALYTICS
├── Analytics (/analytics)
└── Revenue Forecast (/analytics/revenue-forecast)
│
💰 PRICING
├── Smart Pricing (/pricing/smart)
└── Competitors (/pricing/competitors)
│
🎟️ CUPONS (/cupons)
│
⭐ AVALIAÇÕES (/avaliacoes)
│
🎯 FIDELIDADE
├── Fidelidade (/fidelidade)
├── Loyalty (/loyalty)
└── Rewards (/loyalty/rewards)
│
🗺️ TRIPS
├── Lista (/trips)
└── Detalhes (/trips/[id])
│
🏢 CRM
├── Dashboard (/crm)
└── Detalhes Cliente (/crm/[id])
│
📄 PÁGINAS ESTÁTICAS
├── Contato (/contato)
├── Política de Privacidade (/politica-privacidade)
└── Página Dinâmica (/[slug])
│
🔧 ADMIN
├── Dashboard (/admin/dashboard)
├── CMS (/admin/cms)
├── CRM (/admin/crm)
├── Tickets (/admin/tickets)
├── Chat (/admin/chat)
├── Analytics (/admin/analytics)
├── Credenciais (/admin/credenciais)
├── Verification (/admin/verification)
├── Uploads (/admin/uploads)
├── Logs (/admin/logs)
├── Health (/admin/health)
├── Profile (/admin/profile)
├── Login (/admin/login)
├── PWA Demo (/admin/pwa-demo)
└── UI Demo (/admin/ui-demo)
```

---

## 🔗 **LINKS EXTERNOS MAPEADOS**

### **Redes Sociais:**
- Facebook: `https://www.facebook.com/comercialreservei`
- Instagram: `https://www.instagram.com/reserveiviagens`
- Website: `https://www.reserveiviagens.com.br`

### **Contato:**
- WhatsApp: `https://wa.me/5564993197555` (múltiplas variações)
- Email: `mailto:reservas@reserveiviagens.com.br`
- Telefone: `tel:+556521270415`

### **Outros:**
- Google Maps (links dinâmicos baseados em coordenadas)
- Links de políticas e termos

---

## 📝 **OBSERVAÇÕES IMPORTANTES**

1. **Menu Mobile**: Implementado como navegação inferior fixa com 4 itens principais
2. **Menu Desktop**: Não há componente centralizado de menu desktop - navegação é feita por links diretos
3. **Navegação Interna**: Muitas páginas têm links de "voltar" para `/` ou página anterior
4. **Links Dinâmicos**: Vários links são dinâmicos baseados em IDs (ex: `/hoteis/[id]`, `/wishlists/[id]`)
5. **Tabs Internas**: Algumas páginas usam sistema de abas (Tabs) para navegação interna
6. **Links Externos**: WhatsApp, email e telefone são os links externos mais comuns

---

## ✅ **RECOMENDAÇÕES**

1. **Criar Componente de Menu Centralizado**: Para facilitar manutenção e consistência
2. **Padronizar Links de Voltar**: Criar componente de "Breadcrumb" ou "Voltar"
3. **Menu Desktop**: Implementar menu desktop visível e funcional
4. **Sitemap XML**: Gerar sitemap automático baseado neste mapeamento
5. **404 Handling**: Garantir que todos os links quebrados sejam tratados

---

**Última atualização:** 07/12/2025


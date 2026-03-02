# 🎨 REFORMULAÇÃO FRONTEND - PADRÃO VISUAL UNIFICADO

**Data:** 20/12/2025  
**Status:** ✅ DESIGN SYSTEM COMPLETO  
**Versão:** v3.0 - Padrão Visual Unificado  

---

## 📋 ÍNDICE

1. [Design System Visual](#1-design-system-visual)
2. [Estrutura de Páginas](#2-estrutura-de-páginas)
3. [Componentes Reutilizáveis](#3-componentes-reutilizáveis)
4. [Grid e Layout](#4-grid-e-layout)
5. [Paleta de Cores](#5-paleta-de-cores)
6. [Tipografia](#6-tipografia)
7. [Animações](#7-animações)
8. [Responsividade](#8-responsividade)

---

## 1. DESIGN SYSTEM VISUAL

### Baseado na Imagem: Filtros Avançados com Mapa Interativo

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PADRÃO VISUAL ADOTADO:                                        │
│                                                                 │
│  ✅ Header com Busca Central                                   │
│  ✅ Mapa Interativo (Esquerda/Topo)                           │
│  ✅ Filtros Avançados (Sidebar Esquerda)                      │
│  ✅ Cards de Propriedades (Grid 3 colunas)                    │
│  ✅ Status Badges (Verde para promoção)                        │
│  ✅ Botões Call-to-Action (Azul primário)                     │
│  ✅ Navegação por Breadcrumbs                                  │
│  ✅ Footer com Links Institucionais                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes Principais

```
HEADER (fixo, sticky)
├─ Logo + Branding
├─ Barra de Busca Central
├─ Ícones de Navegação (User, Notifications, Favorites)
└─ Menu Principal (Hotéis, Atrações, Parques, Promoções, Travel)

SIDEBAR ESQUERDO (responsivo)
├─ Filtros Avançados
├─ Faixas de Preço
├─ Amenidades (Piscina, Agua Termal)
├─ Avaliações
├─ Status Filtros (badges verde)
└─ Botão [Limpar Filtros]

MAPA INTERATIVO (Mapbox/Google Maps)
├─ Pins de Localização
├─ Zoom e Navegação
├─ Cálculo de Distâncias
└─ Clusters em Zoom Out

CONTEÚDO PRINCIPAL
├─ Grid 3 Colunas (Desktop)
├─ Cards de Propriedade
│  ├─ Imagem (com carousel)
│  ├─ Nome + Localização
│  ├─ Avaliação (⭐ 4.8/5)
│  ├─ Preço Original vs Leilão
│  ├─ Status (Promoção, Stock Baixo)
│  └─ Botão [Participar do Leilão]
└─ Paginação

FOOTER
├─ Links Úteis
├─ Redes Sociais
├─ Contatos
└─ Políticas

BREADCRUMBS (em toda página)
├─ Home > Destinos > Caldas Novas > Hotéis
└─ Clicável em todos os níveis
```

---

## 2. ESTRUTURA DE PÁGINAS

### Padrão de Página

```
┌─────────────────────────────────────────────────┐
│          HEADER (sticky)                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  BREADCRUMBS                                    │
│  Home > Seção > Página                         │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────┬──────────────────┐               │
│  │         │                  │               │
│  │SIDEBAR  │  CONTEÚDO MAIN   │               │
│  │Filtros  │                  │               │
│  │ou Menu  │                  │               │
│  │         │                  │               │
│  └─────────┴──────────────────┘               │
│                                                 │
├─────────────────────────────────────────────────┤
│          FOOTER                                 │
└─────────────────────────────────────────────────┘
```

### Páginas por Categoria

**PÚBLICAS (Sem Autenticação)**
```
1. HOME PAGE
   ├─ Hero Section (Busca Central)
   ├─ Destinos em Destaque
   ├─ Últimas Promoções
   ├─ Testemunhos
   └─ CTA (Explore Agora)

2. BUSCA (Resultado com Filtros + Mapa)
   ├─ Sidebar Filtros
   ├─ Mapa Interativo
   ├─ Grid de Cards
   └─ Paginação

3. DETALHES PROPRIEDADE
   ├─ Galeria de Imagens (Carousel)
   ├─ Descrição
   ├─ Avaliações
   ├─ Mapa de Localização
   ├─ Disponibilidade
   ├─ Preços (Base vs Leilão)
   ├─ Botão [Participar Leilão] - CTA
   └─ Propriedades Similares

4. HOTÉIS (Listagem)
5. ATRAÇÕES (Listagem)
6. PARQUES (Listagem)
7. PROMOÇÕES (Listagem com badges)
8. TRAVEL (Pacotes especiais)
9. SOBRE
10. CONTATO
```

**AUTENTICADAS (Dashboard)**
```
1. DASHBOARD PRINCIPAL
2. MINHAS RESERVAS
3. MINHAS VIAGENS
4. PERFIL
5. CONFIGURAÇÕES
6. WISHLISTS (Group Travel)
7. NOTIFICAÇÕES
8. MENSAGENS
```

**ESPECIALIZADAS**
```
1. GRUPO DE VIAGEM (wishlists, shared calendar)
2. SMART PRICING
3. TOP HOSTS
4. VERIFICAÇÃO
5. ONBOARDING
6. 404 (Personalizada)
```

---

## 3. COMPONENTES REUTILIZÁVEIS

### 3.1 Header Component

```typescript
// components/Header.tsx
export const Header = () => {
  return (
    <header className="sticky top-0 bg-white border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo />
            <h1>RSV360</h1>
          </div>

          {/* Search Bar (Central) */}
          <SearchBar />

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Favorites />
            <Notifications />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
```

### 3.2 Sidebar Filter Component

```typescript
// components/SidebarFilters.tsx
export const SidebarFilters = ({ filters, onFilterChange }) => {
  return (
    <aside className="w-64 bg-gray-50 p-4 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Filtros</h2>
      
      {/* Preço */}
      <FilterPrice />
      
      {/* Amenidades */}
      <FilterAmenities />
      
      {/* Avaliações */}
      <FilterRating />
      
      {/* Clear Button */}
      <button className="w-full btn-secondary mt-4">
        Limpar Filtros
      </button>
    </aside>
  );
};
```

### 3.3 Property Card Component

```typescript
// components/PropertyCard.tsx
export const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Image Carousel */}
      <div className="relative bg-gray-200 h-48">
        <ImageCarousel images={property.images} />
        {property.isPromotion && (
          <Badge className="absolute top-2 right-2 bg-green-500">
            PIX 5% OFF
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg">{property.name}</h3>
        <p className="text-gray-600 text-sm">{property.location}</p>
        
        {/* Rating */}
        <div className="flex items-center gap-1 my-2">
          <span>⭐ {property.rating}</span>
          <span className="text-gray-600">({property.reviews})</span>
        </div>

        {/* Pricing */}
        <div className="my-3">
          <p className="text-gray-600 line-through">R$ {property.basePrice}</p>
          <p className="text-lg font-bold text-blue-600">
            R$ {property.auctionPrice}
          </p>
        </div>

        {/* CTA Button */}
        <button className="w-full btn-primary">
          Participar do Leilão
        </button>
      </div>
    </div>
  );
};
```

### 3.4 Breadcrumbs Component

```typescript
// components/Breadcrumbs.tsx
export const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm py-3 px-4 bg-gray-50">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Link href={item.href} className="text-blue-600 hover:underline">
            {item.label}
          </Link>
          {idx < items.length - 1 && <span className="text-gray-400">›</span>}
        </div>
      ))}
    </nav>
  );
};
```

### 3.5 Footer Component

```typescript
// components/Footer.tsx
export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-4 gap-8 mb-8">
        
        {/* About */}
        <div>
          <h3 className="font-bold mb-4">Sobre RSV360</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/about">Sobre nós</Link></li>
            <li><Link href="/careers">Carreiras</Link></li>
            <li><Link href="/press">Press</Link></li>
          </ul>
        </div>

        {/* Serviços */}
        <div>
          <h3 className="font-bold mb-4">Serviços</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/hotels">Hotéis</Link></li>
            <li><Link href="/attractions">Atrações</Link></li>
            <li><Link href="/travel">Pacotes</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-bold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/terms">Termos de Uso</Link></li>
            <li><Link href="/privacy">Privacidade</Link></li>
            <li><Link href="/cookies">Cookies</Link></li>
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h3 className="font-bold mb-4">Contato</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📧 support@rsv360.com</li>
            <li>📱 +55 (XX) 99999-9999</li>
            <li>💬 Chat 24/7</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 pt-8">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <p>&copy; 2025 RSV360. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="https://facebook.com">F</Link>
            <Link href="https://instagram.com">I</Link>
            <Link href="https://twitter.com">T</Link>
            <Link href="https://whatsapp.com">W</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
```

---

## 4. GRID E LAYOUT

### Breakpoints (Tailwind)

```
Mobile:    <640px   (sm)
Tablet:    640-768  (md)
Desktop:   768-1024 (lg)
HD:        1024+    (xl)
```

### Grid de Cards

```
MOBILE (1 coluna)
├─ Card Full Width
├─ Card Full Width
└─ Card Full Width

TABLET (2 colunas)
├─ Card | Card
├─ Card | Card
└─ Card | Card

DESKTOP (3 colunas)
├─ Card | Card | Card
├─ Card | Card | Card
└─ Card | Card | Card

HD (4 colunas)
├─ Card | Card | Card | Card
├─ Card | Card | Card | Card
└─ Card | Card | Card | Card
```

---

## 5. PALETA DE CORES

### Cores Principais

```css
/* Primária */
--primary: #0066CC      /* Azul vibrante */
--primary-light: #E6F0FF
--primary-dark: #003D7A

/* Secundária */
--secondary: #00AA66    /* Verde (Promoção) */
--secondary-light: #E6F9F0
--secondary-dark: #006633

/* Neutras */
--gray-50: #F9F9F9
--gray-100: #F0F0F0
--gray-200: #E5E5E5
--gray-600: #666666
--gray-900: #1A1A1A

/* Status */
--success: #22C55E      /* Verde */
--warning: #F59E0B      /* Laranja */
--error: #EF4444        /* Vermelho */
--info: #3B82F6         /* Azul */
```

---

## 6. TIPOGRAFIA

### Fontes

```
Display: Poppins Bold (36px)
Heading: Poppins SemiBold (24px)
Subheading: Poppins Medium (18px)
Body: Inter Regular (16px)
Small: Inter Regular (14px)
```

---

## 7. ANIMAÇÕES

```css
/* Transições Rápidas */
.btn {
  transition: all 0.2s ease-in-out;
}

/* Hover Effects */
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

/* Card Hover */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

---

## 8. RESPONSIVIDADE

### Estratégia Mobile-First

```
1. Design para Mobile (< 640px)
2. Melhorar para Tablet (640-1024px)
3. Otimizar para Desktop (1024px+)

Classes Tailwind:
- Base (mobile)
- md:  (tablet)
- lg:  (desktop)
- xl:  (HD)
```

### Componentes Responsivos

```
Header
├─ Mobile: Menu hambúrguer
├─ Tablet: Menu normal
└─ Desktop: Menu expandido

Sidebar
├─ Mobile: Drawer/Collapse
├─ Tablet: Lado esquerdo (50%)
└─ Desktop: Lado esquerdo (25%)

Grid Cards
├─ Mobile: 1 coluna
├─ Tablet: 2 colunas
└─ Desktop: 3 colunas
```

---

## ✅ PRÓXIMAS ETAPAS

1. **Criar sitemap.xml** com todas as rotas
2. **Implementar breadcrumbs** em cada página
3. **Criar página 404** personalizada
4. **Gerar componentes** React finais
5. **Testar responsividade** em todos os devices
6. **Documentar componentes** no Storybook

---

**Status:** ✅ DESIGN SYSTEM COMPLETO  
**Próxima Entrega:** Sitemap + Páginas Faltantes


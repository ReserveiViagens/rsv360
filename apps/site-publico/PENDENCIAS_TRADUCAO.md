# Pendências de Tradução - Site Público RSV360

Lista gerada a partir da varredura em todas as páginas e componentes do site público.
Itens marcados como **prioridade alta** são textos visíveis ao usuário final.

---

## 1. Componentes Admin

### GoogleHotelAdsManagement.tsx
| Local | Texto Atual | Sugestão PT-BR | Prioridade |
|-------|-------------|----------------|------------|
| L.161 | `console.error('Error loading campaigns:'...)` | `console.error('Erro ao carregar campanhas:'...)` | Baixa (log) |
| L.179 | `console.error('Error loading properties:'...)` | `console.error('Erro ao carregar propriedades:'...)` | Baixa (log) |
| L.392 | `<TabsTrigger value="feeds">Feeds</TabsTrigger>` | Manter "Feeds" (termo técnico) ou "Listas de Feed" | Média |
| L.598 | `title="Upload para Google"` | Já em português ✓ | - |

### SideRailsManagement.tsx
| Local | Texto Atual | Sugestão PT-BR | Prioridade |
|-------|-------------|----------------|------------|
| L.255 | `placeholder="ex: hotels"` | `placeholder="ex.: hotéis"` | Baixa |
| L.264 | `placeholder="ex: Reservas de hotéis"` | Já em português ✓ | - |
| L.273 | `placeholder="ex: Hospedagem com melhor custo-benefício"` | Já em português ✓ | - |
| L.282 | `placeholder="ex: /hoteis"` | Já em português ✓ | - |
| L.291 | `placeholder="ex: Hotelaria"` | Já em português ✓ | - |
| L.344 | `placeholder="ex: Descubra experiencias"` | `placeholder="ex.: Descubra experiências"` (acento) | Média |
| L.352 | `placeholder="ex: Produtos para temporada e lazer"` | Já em português ✓ | - |

### CustomerPreferences.tsx (CRM)
| Local | Texto Atual | Sugestão PT-BR | Prioridade |
|-------|-------------|----------------|------------|
| L.247 | `placeholder="ex: preferred_room_type"` | `placeholder="ex.: tipo_quarto_preferido"` | Média |
| L.258 | `placeholder="ex: suite"` | Manter ou "ex.: suíte" | Média |

### PrivacySettings.tsx (GDPR)
| Local | Texto Atual | Sugestão PT-BR | Prioridade |
|-------|-------------|----------------|------------|
| L.289 | `(ex: transações financeiras)` | `(ex.: transações financeiras)` | Baixa |

---

## 2. APIs e Rotas (logs internos)

| Arquivo | Texto Atual | Sugestão PT-BR |
|---------|-------------|----------------|
| `app/api/caldas-novas-osm/route.ts` L.51 | `Error generating OSM CSV:` | `Erro ao gerar CSV OSM:` |
| `app/api/website/content/attractions/route.ts` L.68 | `Error fetching attractions:` | `Erro ao buscar atrações:` |

---

## 3. Mapas (títulos técnicos)

### AuctionMap.tsx
| Local | Texto Atual | Sugestão PT-BR | Prioridade |
|-------|-------------|----------------|------------|
| L.51 | `title="Mapa - OpenStreetMap"` | Manter (OpenStreetMap é nome próprio) | Baixa |
| L.240 | `title="Mapa de Caldas Novas - OpenStreetMap"` | Manter | Baixa |

---

## 4. Página Inicial (page.tsx)

| Local | Texto Atual | Status |
|-------|-------------|--------|
| L.464 | `title="Facebook"` | Nome próprio - manter |
| L.473 | `title="Instagram"` | Nome próprio - manter |
| L.482 | `title="Nosso Site"` | Já em português ✓ |

---

## 5. GoogleHotelAdsManagement - Títulos/Placeholders

| Local | Texto Atual | Sugestão PT-BR | Prioridade |
|-------|-------------|----------------|------------|
| L.436 | `placeholder="Ex: Feed Principal - Hotel X"` | Já adequado | - |
| L.512 | `placeholder="Buscar feeds..."` | Já em português ✓ | - |
| L.696 | `placeholder="Ex: Campanha Verão 2025"` | Já adequado | - |

---

## 6. Termos que podem permanecer em inglês

- **Feed** – termo técnico de marketing digital, amplamente usado em PT-BR
- **Upload** – comum em interfaces
- **OpenStreetMap** – nome próprio do serviço
- **Facebook, Instagram, WhatsApp** – nomes próprios
- **ex:** ou **ex.:** – abreviação de "exemplo" aceita em português

---

## 7. Resumo – Ações recomendadas

### Prioridade Alta (visível ao usuário)
- [x] SideRailsManagement: `placeholder="ex: Descubra experiencias"` → corrigir acentuação para "experiências" ✅

### Prioridade Média
- [x] GoogleHotelAdsManagement: `console.error` em inglês → traduzir ✅
- [x] SideRailsManagement: `ex: hotels` → `ex.: hotéis` ✅
- [x] CustomerPreferences: placeholders em inglês → traduzir ✅
- [x] PrivacySettings: `(ex:` → `(ex.:` (padronização) ✅

### Prioridade Baixa (logs/APIs)
- [x] API caldas-novas-osm ✅
- [x] API attractions ✅

---

## 8. Páginas e componentes já traduzidos ✓

- Dashboard (principal, split-config, tributação, deduções, incentivos, simulador, contabil, financeiro)
- Hotels, Flats, Routes, Slider, Documents, Proprietário, Radial
- Pricing Dashboard, Analytics
- Flash Deals, Marketplace
- Login, Admin (Login, Dashboard, CMS, CRM, Tickets)
- Onboarding, Verificação de Propriedade
- Viagens em Grupo, Shared Wishlist, Trip Planning
- Fidelidade, Loyalty, Qualidade
- Leilões (novo), Cotação (Add-ons/Extras)
- GoogleHotelAdsManagement (mensagens de erro)
- OTAManagement (mensagens de erro)
- PricingConfig
- Recuperar Senha, Booking, Insurance, Cupons, Notificações
- Minhas Reservas, Perfil, Buscar, Hoteis

---

*Documento gerado em: 11/02/2025*

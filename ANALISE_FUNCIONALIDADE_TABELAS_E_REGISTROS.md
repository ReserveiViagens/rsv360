# 📚 Análise de Funcionalidade: Tabelas e Registros Não Migrados

**Data:** 12/01/2026  
**Objetivo:** Explicar a funcionalidade de cada tabela e a importância dos 71 registros não migrados

---

## 📊 Resumo Executivo

| Tabela | Função no Sistema | Registros Não Migrados | Crítico? |
|--------|-------------------|------------------------|----------|
| `properties` | Sistema de reservas de propriedades/hotéis | 3 | ⚠️ **MÉDIO** - Dados de teste |
| `website_content` | CMS do site público (hotéis, promoções, atrações) | 64 | 🔴 **CRÍTICO** - Conteúdo do site |
| `website_settings` | Configurações globais do site | 4 | 🔴 **CRÍTICO** - Configurações essenciais |

---

## 1️⃣ TABELA: `properties`

### 🎯 Funcionalidade

A tabela `properties` armazena **propriedades imobiliárias e hotéis** disponíveis para reserva no sistema de hospedagem.

#### O que ela faz:
- **Armazena informações de propriedades** (apartamentos, casas, chalés, hotéis)
- **Gerencia disponibilidade** para reservas
- **Controla preços e políticas** de cancelamento
- **Relaciona com reservas** através de foreign keys
- **Usada pelo sistema de multipropriedade** (timeshare)

#### Onde é usada:
1. **Sistema de Reservas (RSV 360°)**
   - Listagem de propriedades disponíveis
   - Detalhes de cada propriedade
   - Cálculo de preços e disponibilidade
   - Relacionamento com `bookings_rsv360`

2. **API de Propriedades**
   - Endpoint: `/api/properties`
   - Busca e filtros de propriedades
   - Integração com sistema de reservas

3. **Relacionamentos:**
   - `bookings_rsv360.property_id` → `properties.id`
   - `property_availability.property_id` → `properties.id`
   - `property_shares.property_id` → `properties.id`
   - `owners.id` → `properties.owner_id`

### 📝 Registros Não Migrados (3 registros)

#### Registro 1: Apartamento Moderno no Centro
- **Localização:** São Paulo
- **Tipo:** Apartment
- **Status:** Active

#### Registro 2: Casa com Piscina e Jardim
- **Localização:** Rio de Janeiro
- **Tipo:** House
- **Status:** Active

#### Registro 3: Chalé Aconchegante na Montanha
- **Localização:** Campos do Jordão
- **Tipo:** Chalet
- **Status:** Active

### ⚠️ É Necessário Migrar?

**Nível de Importância: MÉDIO**

#### ✅ **SIM, mas não é crítico:**
- São apenas **3 registros de teste/demonstração**
- Não há reservas vinculadas (tabela `bookings_rsv360` já foi migrada com sucesso)
- O sistema pode funcionar sem eles
- **MAS:** Se você quiser ter dados de exemplo no sistema, precisa migrar

#### ⚠️ **Impacto se NÃO migrar:**
- ❌ Não terá propriedades de exemplo no sistema
- ❌ Páginas de listagem de propriedades ficarão vazias
- ✅ Sistema continua funcional (apenas sem dados de exemplo)

#### 💡 **Recomendação:**
- **Migrar se:** Você quer dados de exemplo para testes/demonstração
- **Não migrar se:** Você vai criar suas próprias propriedades do zero

---

## 2️⃣ TABELA: `website_content`

### 🎯 Funcionalidade

A tabela `website_content` é o **CMS (Content Management System)** do site público. Ela armazena todo o conteúdo dinâmico que aparece no site.

#### O que ela faz:
- **Armazena conteúdo do site público** (hotéis, promoções, atrações, tickets)
- **Gerencia conteúdo dinâmico** via CMS
- **Controla SEO** (meta tags, descrições)
- **Organiza conteúdo por tipo** (hotels, promotions, attractions, tickets)
- **Permite ordenação** através de `order_index`

#### Onde é usada:

1. **Site Público (localhost:3000)**
   - **Página de Hotéis** (`/hoteis`)
     - Endpoint: `/api/website/content/hotels`
     - Exibe todos os hotéis cadastrados
     - **64 registros não migrados = 64 hotéis não aparecem no site!**
   
   - **Página de Promoções**
     - Endpoint: `/api/website/content/promotions`
     - Exibe ofertas e pacotes promocionais
   
   - **Página de Atrações**
     - Endpoint: `/api/website/content/attractions`
     - Exibe pontos turísticos e atrações
   
   - **Página de Tickets**
     - Endpoint: `/api/website/content/tickets`
     - Exibe ingressos para parques e eventos

2. **API Routes (Next.js)**
   ```typescript
   // apps/site-publico/app/api/website/content/hotels/route.ts
   const hotels = await getWebsiteContent('hotels');
   ```

3. **Hooks React**
   ```typescript
   // hooks/useWebsiteData.ts
   export function useWebsiteContent(type: 'hotel' | 'promotion' | 'attraction' | 'ticket')
   ```

4. **Backend API**
   ```javascript
   // backend/src/routes/website.js
   router.get("/content/:pageType", async (req, res) => {
     const content = await db("website_content")
       .where("page_type", pageType)
       .where("status", "active")
   ```

### 📝 Registros Não Migrados (64 registros)

#### Distribuição por Categoria:

| Categoria | Quantidade | Percentual | Impacto |
|-----------|------------|------------|---------|
| **Hotéis** | 41 | 64.06% | 🔴 **CRÍTICO** - Site sem hotéis |
| **Promoções** | 11 | 17.19% | 🔴 **CRÍTICO** - Sem ofertas |
| **Tickets** | 5 | 7.81% | ⚠️ **MÉDIO** - Sem ingressos |
| **Atrações** | 7 | 10.94% | ⚠️ **MÉDIO** - Sem atrações |
| **TOTAL** | **64** | **100%** | 🔴 **CRÍTICO** |

#### Exemplos de Registros:

**Hotéis (41 registros):**
- Spazzio DiRoma
- Piazza DiRoma
- Lacqua DiRoma
- Lagoa Eco Towers
- Golden Dolphin Caldas Novas Gran Hotel
- E mais 36 hotéis...

**Promoções (11 registros):**
- 🔥 Ofertas Exclusivas de Verão!
- PROMOFÉRIAS Hotel + Parque Aquático
- Pacote Melhor Idade Caldas Novas
- E mais 8 promoções...

**Tickets (5 registros):**
- Ingresso Hot Park
- Ingresso diRoma Acqua Park
- Ingresso Lagoa Termas Parque
- E mais 2 ingressos...

**Atrações (7 registros):**
- Parque das Águas Quentes
- Jardim Japonês
- Lago Corumbá
- E mais 4 atrações...

### 🔴 É Necessário Migrar?

**Nível de Importância: CRÍTICO** ⚠️⚠️⚠️

#### ✅ **SIM, É ABSOLUTAMENTE NECESSÁRIO!**

**Por quê:**
1. **Site Público Depende Desses Dados**
   - A página `/hoteis` busca dados de `website_content` com `page_type = 'hotels'`
   - **Sem esses 64 registros, o site ficará vazio!**
   - Usuários verão "Nenhum hotel disponível"

2. **Conteúdo Real do Negócio**
   - São **41 hotéis reais** de Caldas Novas
   - **11 promoções ativas** para exibir
   - **7 atrações turísticas** da região
   - **5 tipos de ingressos** para parques

3. **SEO e Marketing**
   - Cada registro tem `seo_data` (meta tags, keywords)
   - Essencial para indexação no Google
   - Sem conteúdo = site invisível no Google

4. **Funcionalidade do CMS**
   - O sistema de CMS foi criado para gerenciar esses dados
   - Sem eles, o CMS não tem propósito

#### ⚠️ **Impacto se NÃO migrar:**
- 🔴 **Site público completamente vazio**
- 🔴 **Página `/hoteis` sem nenhum hotel**
- 🔴 **Página de promoções vazia**
- 🔴 **Página de atrações vazia**
- 🔴 **SEO comprometido**
- 🔴 **Experiência do usuário ruim**

#### 💡 **Recomendação:**
- **MIGRAR URGENTEMENTE!** 🔴
- Esses são os dados mais importantes do sistema
- Sem eles, o site público não funciona

---

## 3️⃣ TABELA: `website_settings`

### 🎯 Funcionalidade

A tabela `website_settings` armazena **configurações globais do site público**. São dados essenciais que aparecem em todas as páginas.

#### O que ela faz:
- **Armazena configurações do site** (nome, tagline, descrição)
- **Gerencia informações de contato** (telefones, email, endereço)
- **Controla redes sociais** (Facebook, Instagram, website)
- **Define SEO global** (meta tags padrão, keywords)
- **Configurações que aparecem no rodapé/header** do site

#### Onde é usada:

1. **Site Público (Todas as Páginas)**
   - **Header/Rodapé:** Informações de contato
   - **Meta Tags:** SEO global
   - **Redes Sociais:** Links no rodapé
   - **Configurações Gerais:** Nome do site, tagline

2. **API Routes**
   ```javascript
   // backend/src/routes/website.js
   router.get("/settings", async (req, res) => {
     const settings = await db("website_settings").select("*");
     // Retorna todas as configurações
   });
   
   router.get("/settings/:key", async (req, res) => {
     const setting = await db("website_settings")
       .where("setting_key", key)
       .first();
   });
   ```

3. **Frontend**
   - Componentes que exibem informações de contato
   - Rodapé com telefones e endereço
   - Links de redes sociais
   - Meta tags do HTML

### 📝 Registros Não Migrados (4 registros)

#### Registro 1: `site_info`
```json
{
  "title": "Reservei Viagens",
  "tagline": "Parques, Hotéis & Atrações em Caldas Novas",
  "description": "Especialistas em turismo em Caldas Novas. Os melhores hotéis, pacotes e atrações com desconto especial."
}
```
**Uso:** Nome do site, tagline, descrição principal

#### Registro 2: `contact_info`
```json
{
  "fixo": "(65) 2127-0415",
  "email": "reservas@reserveiviagens.com.br",
  "hours": "Seg-Sex 8h-18h, Sáb 8h-12h",
  "filial": "Av. Manoel José de Arruda, Porto, Cuiabá, MT",
  "phones": ["(64) 99319-7555", "(64) 99306-8752", "(65) 99235-1207", "(65) 99204-8814"],
  "address": "Rua RP5, Residencial Primavera 2, Caldas Novas, GO",
  "whatsapp": "5564993197555"
}
```
**Uso:** Informações de contato no rodapé, header, página de contato

#### Registro 3: `social_media`
```json
{
  "website": "reserveiviagens.com.br",
  "facebook": "facebook.com/comercialreservei",
  "instagram": "@reserveiviagens"
}
```
**Uso:** Links de redes sociais no rodapé, compartilhamento

#### Registro 4: `seo_global`
```json
{
  "title": "Reservei Viagens - Hotéis e Atrações em Caldas Novas",
  "keywords": ["caldas novas", "hotéis caldas novas", "piscinas termais", "reservei viagens", "turismo goiás"],
  "og_image": "/images/og-reservei-viagens.jpg",
  "description": "Especialista em turismo em Caldas Novas. Hotéis com desconto, pacotes promocionais e as melhores atrações."
}
```
**Uso:** Meta tags padrão, Open Graph, SEO global

### 🔴 É Necessário Migrar?

**Nível de Importância: CRÍTICO** ⚠️⚠️⚠️

#### ✅ **SIM, É ABSOLUTAMENTE NECESSÁRIO!**

**Por quê:**
1. **Informações Essenciais do Site**
   - **Nome do site:** "Reservei Viagens"
   - **Tagline:** Aparece no header
   - **Descrição:** Usada em meta tags

2. **Informações de Contato**
   - **Telefones:** Aparecem no rodapé e página de contato
   - **Email:** Para formulários de contato
   - **Endereço:** Localização física
   - **WhatsApp:** Link direto para WhatsApp
   - **Horário de atendimento:** Informação importante

3. **Redes Sociais**
   - Links no rodapé
   - Botões de compartilhamento
   - Integração social

4. **SEO Global**
   - Meta tags padrão de todas as páginas
   - Keywords principais
   - Open Graph image
   - Descrição padrão

#### ⚠️ **Impacto se NÃO migrar:**
- 🔴 **Site sem informações de contato**
- 🔴 **Rodapé vazio ou com dados incorretos**
- 🔴 **Sem links de redes sociais**
- 🔴 **SEO comprometido** (sem meta tags)
- 🔴 **Usuários não conseguem entrar em contato**
- 🔴 **Site parece incompleto/não profissional**

#### 💡 **Recomendação:**
- **MIGRAR URGENTEMENTE!** 🔴
- Essas são configurações essenciais
- Sem elas, o site não tem informações básicas

---

## 📊 Análise de Impacto Geral

### 🔴 Registros Críticos (68 registros)

| Tabela | Registros | Impacto | Prioridade |
|--------|-----------|---------|------------|
| `website_content` | 64 | Site público vazio | 🔴 **ALTA** |
| `website_settings` | 4 | Site sem configurações | 🔴 **ALTA** |
| **TOTAL CRÍTICO** | **68** | **Site não funcional** | 🔴 **URGENTE** |

### ⚠️ Registros Importantes (3 registros)

| Tabela | Registros | Impacto | Prioridade |
|--------|-----------|---------|------------|
| `properties` | 3 | Sem dados de exemplo | ⚠️ **MÉDIA** |

---

## 🎯 Conclusão e Recomendações

### ✅ **SIM, É NECESSÁRIO MIGRAR OS 71 REGISTROS!**

#### Prioridade de Migração:

1. **🔴 URGENTE - `website_settings` (4 registros)**
   - **Por quê:** Configurações essenciais do site
   - **Impacto:** Site sem informações básicas
   - **Tempo estimado:** 15 minutos

2. **🔴 URGENTE - `website_content` (64 registros)**
   - **Por quê:** Todo o conteúdo do site público
   - **Impacto:** Site completamente vazio
   - **Tempo estimado:** 30-45 minutos

3. **⚠️ IMPORTANTE - `properties` (3 registros)**
   - **Por quê:** Dados de exemplo para testes
   - **Impacto:** Sistema funcional, mas sem exemplos
   - **Tempo estimado:** 20 minutos

### 📋 Resumo de Funcionalidades

#### `website_content` = CMS do Site
- **Função:** Gerencia todo o conteúdo dinâmico
- **Usado em:** Páginas públicas (hotéis, promoções, atrações)
- **Crítico:** ✅ SIM - Site não funciona sem isso

#### `website_settings` = Configurações Globais
- **Função:** Informações essenciais do site
- **Usado em:** Todas as páginas (header, rodapé, SEO)
- **Crítico:** ✅ SIM - Site incompleto sem isso

#### `properties` = Sistema de Reservas
- **Função:** Propriedades para reserva
- **Usado em:** Sistema de hospedagem/reservas
- **Crítico:** ⚠️ NÃO - Apenas dados de exemplo

### 💡 Recomendação Final

**MIGRAR TODOS OS 71 REGISTROS!**

**Motivos:**
1. ✅ **68 registros são críticos** para o funcionamento do site público
2. ✅ **3 registros são importantes** para ter dados de exemplo
3. ✅ **Tempo total estimado:** 1-2 horas (com scripts automatizados)
4. ✅ **Benefício:** Site público completamente funcional

**Sem migração:**
- ❌ Site público vazio
- ❌ Sem informações de contato
- ❌ SEO comprometido
- ❌ Experiência do usuário ruim

**Com migração:**
- ✅ Site público completo
- ✅ 41 hotéis disponíveis
- ✅ 11 promoções ativas
- ✅ 7 atrações turísticas
- ✅ Configurações completas
- ✅ SEO otimizado

---

**Próximo Passo:** Criar scripts de migração customizados para migrar os 71 registros com conversão adequada de UUID → INTEGER e mapeamento de colunas.

---

**Documento gerado em:** 12/01/2026  
**Última atualização:** 12/01/2026

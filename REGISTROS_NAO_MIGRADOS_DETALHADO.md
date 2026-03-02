# 📋 Registros Não Migrados - Análise Detalhada

**Data:** 12/01/2026  
**Total de Registros:** 71  
**Tabelas Afetadas:** 3

---

## 📊 Resumo por Tabela

| Tabela | Registros Não Migrados | Motivo Principal |
|--------|------------------------|------------------|
| `properties` | 3 | Estrutura completamente diferente (UUID vs INTEGER, nomes de colunas diferentes) |
| `website_content` | 64 | Tipo de ID incompatível (UUID vs INTEGER), created_by/updated_by (UUID vs INTEGER) |
| `website_settings` | 4 | Tipo de ID incompatível (UUID vs INTEGER), updated_by (UUID vs INTEGER) |

---

## 1️⃣ TABELA: `properties` (3 registros)

### 🔴 Motivo da Falha na Migração

- **ID:** UUID no Docker vs INTEGER no Destino
- **owner_id:** UUID no Docker vs INTEGER no Destino
- **Coluna `type`:** Não existe no destino (existe `property_type`)
- **Coluna `title`:** Não existe no destino (existe `name`)
- **Coluna `base_price`:** Não existe no destino (existe `base_price_per_night`)

### 📝 Registros Detalhados

#### Registro 1
- **ID (Docker):** `709e21e2-5905-4350-a466-4f751eed56ee`
- **Tipo:** `apartment`
- **Título:** `Apartamento Moderno no Centro`
- **Cidade:** `São Paulo`
- **Status:** `active`
- **Owner ID:** `5d5eddd0-2c14-473c-9d5e-92a9c5509f26`
- **Data de Criação:** `2025-11-18 15:51:39.287122+00`

**Dados Completos (estimado):**
```json
{
  "id": "709e21e2-5905-4350-a466-4f751eed56ee",
  "owner_id": "5d5eddd0-2c14-473c-9d5e-92a9c5509f26",
  "type": "apartment",
  "title": "Apartamento Moderno no Centro",
  "address_city": "São Paulo",
  "status": "active"
}
```

**Mapeamento Necessário:**
- `id` (UUID) → `id` (INTEGER) - **NOVO ID SERIAL**
- `owner_id` (UUID) → `owner_id` (INTEGER) - **MAPEAR UUID → INTEGER**
- `type` → `property_type`
- `title` → `name`
- `base_price` → `base_price_per_night`

---

#### Registro 2
- **ID (Docker):** `087ccd99-28a5-4ea2-9e1d-8156f15e8f4b`
- **Tipo:** `house`
- **Título:** `Casa com Piscina e Jardim`
- **Cidade:** `Rio de Janeiro`
- **Status:** `active`
- **Owner ID:** `5d5eddd0-2c14-473c-9d5e-92a9c5509f26`
- **Data de Criação:** `2025-11-18 15:51:39.287122+00`

**Dados Completos (estimado):**
```json
{
  "id": "087ccd99-28a5-4ea2-9e1d-8156f15e8f4b",
  "owner_id": "5d5eddd0-2c14-473c-9d5e-92a9c5509f26",
  "type": "house",
  "title": "Casa com Piscina e Jardim",
  "address_city": "Rio de Janeiro",
  "status": "active"
}
```

**Mapeamento Necessário:**
- `id` (UUID) → `id` (INTEGER) - **NOVO ID SERIAL**
- `owner_id` (UUID) → `owner_id` (INTEGER) - **MAPEAR UUID → INTEGER**
- `type` → `property_type`
- `title` → `name`
- `base_price` → `base_price_per_night`

---

#### Registro 3
- **ID (Docker):** `2afc08a2-d476-49d6-91ae-b92f997a528f`
- **Tipo:** `chalet`
- **Título:** `Chalé Aconchegante na Montanha`
- **Cidade:** `Campos do Jordão`
- **Status:** `active`
- **Owner ID:** `5d5eddd0-2c14-473c-9d5e-92a9c5509f26`
- **Data de Criação:** `2025-11-18 15:51:39.287122+00`

**Dados Completos (estimado):**
```json
{
  "id": "2afc08a2-d476-49d6-91ae-b92f997a528f",
  "owner_id": "5d5eddd0-2c14-473c-9d5e-92a9c5509f26",
  "type": "chalet",
  "title": "Chalé Aconchegante na Montanha",
  "address_city": "Campos do Jordão",
  "status": "active"
}
```

**Mapeamento Necessário:**
- `id` (UUID) → `id` (INTEGER) - **NOVO ID SERIAL**
- `owner_id` (UUID) → `owner_id` (INTEGER) - **MAPEAR UUID → INTEGER**
- `type` → `property_type`
- `title` → `name`
- `base_price` → `base_price_per_night`

---

## 2️⃣ TABELA: `website_content` (64 registros)

### 🔴 Motivo da Falha na Migração

- **ID:** UUID no Docker vs INTEGER no Destino
- **created_by:** UUID no Docker vs INTEGER no Destino (NULL na maioria)
- **updated_by:** UUID no Docker vs INTEGER no Destino (NULL na maioria)

### 📝 Registros Detalhados

#### Categoria: Hotéis (47 registros)

| # | ID (Docker) | Content ID | Título | Descrição (Preview) | Status | Criado em |
|---|-------------|------------|--------|---------------------|--------|-----------|
| 1 | `8213ce42-eaa5-4868-8e91-877d64b7746e` | `spazzio-diroma` | Spazzio DiRoma | Conforto e lazer completo com a qualidade diRoma. | active | 2025-11-19 22:51:55 |
| 2 | `9f2351d8-aad7-498e-8389-8cc3bbe08528` | `piazza-diroma` | Piazza DiRoma | Sofisticação e acesso privilegiado aos parques diR | active | 2025-11-19 22:51:55 |
| 3 | `8cc137ef-0702-4390-98b0-cf73c5fdfef1` | `lacqua-diroma` | Lacqua DiRoma | Parque aquático exclusivo e diversão para toda a f | active | 2025-11-19 22:51:55 |
| 4 | `9ca90034-fa69-4aca-98ad-c4d95845e6be` | `diroma-fiori` | DiRoma Fiori | Hotel aconchegante com piscinas termais e tranquil | active | 2025-11-19 22:51:55 |
| 5 | `1665c02f-20e3-4bf1-ae74-9672d82ac1d6` | `lagoa-eco-towers` | Lagoa Eco Towers | Luxo e sustentabilidade em Caldas Novas. Torres ec | active | 2025-11-19 22:51:55 |
| 6 | `c44938c8-33cd-4517-b22b-dcda604affaf` | `praias-do-lago-eco-resort` | Praias do Lago Eco Resort | Resort ecológico com praias artificiais e lagoas t | active | 2025-11-20 02:20:13 |
| 7 | `91739461-6b96-41f8-969f-256000cc93ef` | `resort-do-lago` | Resort do Lago | Resort completo às margens do lago com atividades  | active | 2025-11-20 02:20:13 |
| 8 | `451cefca-db1a-4598-94e1-5f4515b4aed1` | `hotel-parque-das-primaveras` | Hotel Parque das Primaveras | Hotel com ampla área verde e piscinas termais. Ide | active | 2025-11-20 02:20:14 |
| 9 | `27e0138e-66b4-4a47-b47d-b13079120b77` | `hotel-ctc` | Hotel CTC | Hotel confortável com piscinas termais e boa local | active | 2025-11-20 02:20:14 |
| 10 | `2d7988f5-8bad-4cf2-8274-d813b1419e46` | `hotel-marina-flat` | Hotel Marina Flat | Hotel com apartamentos amplos e piscinas termais.  | active | 2025-11-20 02:20:14 |
| 11 | `7842df74-5d3d-41eb-b715-bf07e03177a6` | `golden-dolphin-gran-hotel` | Golden Dolphin Caldas Novas Gran Hotel | Hotel tradicional com piscinas termais e estrutura | active | 2025-11-20 02:20:14 |
| 12 | `d64c0f8e-9aaa-45de-80ca-e207ed7251ea` | `golden-dolphin-express` | Golden Dolphin Express | Hotel econômico com piscinas termais e boa localiz | active | 2025-11-20 02:20:14 |
| 13 | `cce0a425-35c9-4dd5-9857-92ac2b7b718e` | `hotsprings-b3-hoteis` | HotSprings B3 Hotéis | Rede de hotéis com piscinas termais e estrutura mo | active | 2025-11-20 02:20:15 |
| 14 | `9a918b01-ca56-46f8-99f8-7dec46784442` | `imperio-romano` | Império Romano | Hotel temático com piscinas termais e decoração ro | active | 2025-11-20 02:20:15 |
| 15 | `ca028f3b-68a6-4d1d-bac0-35e855d9270e` | `lagoa-quente-hotel` | Lagoa Quente Hotel | Hotel com lagoas termais naturais e estrutura comp | active | 2025-11-20 02:20:15 |
| 16 | `df2e4236-2ea7-4632-ae46-e77a706e94bb` | `rio-das-pedras-thermas` | Rio das Pedras Thermas Hotel | Hotel com piscinas termais e ambiente natural. Per | active | 2025-11-20 02:20:15 |
| 17 | `d82a9f85-01df-4c1d-ac6d-e4eb9dc322d5` | `thermas-do-bandeirante` | Thermas do Bandeirante | Hotel histórico com piscinas termais e tradição em | active | 2025-11-20 02:20:16 |
| 18 | `dd2111af-4431-426b-a7ef-b9d3aa2c71f8` | `thermas-place` | Thermas Place | Hotel moderno com piscinas termais e boa localizaç | active | 2025-11-20 02:20:16 |
| 19 | `32920ee7-3aaa-447d-b8ef-b953cc932d27` | `aquarius-residence` | Aquarius Residence | Apartamentos de luxo com piscinas termais e vista  | active | 2025-11-20 02:20:16 |
| 20 | `f38353d9-6d37-45b8-a0f0-03111d0753b7` | `araras-apart-service` | ARARAS Apart Service | Apartamentos com serviço completo e piscinas terma | active | 2025-11-20 02:20:16 |
| 21 | `d3ce3230-8b10-45a6-a217-9e3d3ee9b478` | `boulevard-prive-suite` | Boulevard Prive Suite Hotel | Suítes privativas com piscinas termais e serviços  | active | 2025-11-20 02:20:16 |
| 22 | `55589946-cd2c-4d69-8642-8ef8b59591a1` | `casa-da-madeira` | Casa da Madeira | Apartamentos rústicos com piscinas termais e ambie | active | 2025-11-20 02:20:17 |
| 23 | `99e739f8-f10f-484d-bc62-a0fc96d1e438` | `diroma-exclusive` | DiRoma Exclusive | Apartamentos exclusivos com piscinas termais e ser | active | 2025-11-20 02:20:17 |
| 24 | `ea7e65df-4f94-49c5-b1fa-0e33262391e4` | `eldorado-flat` | Eldorado Flat | Flats modernos com piscinas termais e boa localiza | active | 2025-11-20 02:20:17 |
| 25 | `f40b7b46-8d53-43c4-94d2-fbdab4bf60e9` | `everest-flat-service` | Everest Flat Service | Flats com serviço completo e piscinas termais. Ide | active | 2025-11-20 02:20:17 |
| 26 | `82bb0899-c36e-49ea-9316-06ac64aa95b6` | `fiore-prime-flat` | Fiore Prime Flat | Flats premium com piscinas termais e serviços excl | active | 2025-11-20 02:20:18 |
| 27 | `7bc4aa45-e65e-4d51-b5ad-3a89cb1f4ffb` | `le-jardin-suites` | Le Jardin Suítes | Suítes com jardins privativos e piscinas termais.  | active | 2025-11-20 02:20:18 |
| 28 | `666e93af-69eb-4b12-931a-3d506fd53fb8` | `paradise-flat-residence` | Paradise Flat Residence | Residência com flats e piscinas termais. Ambiente  | active | 2025-11-20 02:20:18 |
| 29 | `fc0d43c9-4e46-4211-89bb-64675233ce32` | `recanto-do-bosque-flat` | Recanto do Bosque - Flat Service | Flats em ambiente natural com piscinas termais. Tr | active | 2025-11-20 02:20:18 |
| 30 | `b88c6298-7117-430d-9232-930c4d6cd4df` | `the-villeneuve-residence` | The Villeneuve Residence | Residência de luxo com apartamentos e piscinas ter | active | 2025-11-20 02:20:18 |
| 31 | `a8aae36a-f392-4c48-bd44-12205f46824c` | `aldeia-do-lago` | Aldeia do Lago | Pousada rústica às margens do lago com piscinas te | active | 2025-11-20 02:20:19 |
| 32 | `1a0860f6-f0b1-4042-885c-b87a99c0de71` | `alta-vista-thermas` | Alta Vista Thermas | Pousada com vista panorâmica e piscinas termais. T | active | 2025-11-20 02:20:19 |
| 33 | `7c25a995-fbd2-48c5-b7d4-090f97cd52da` | `ecologic-park` | Ecologic Park | Parque ecológico com piscinas termais e atividades | active | 2025-11-20 02:20:19 |
| 34 | `d5e86850-66c9-470f-b54d-6a6714c06352` | `ecologic-ville-resort` | Ecologic Ville Resort | Resort ecológico com piscinas termais e estrutura  | active | 2025-11-20 02:20:19 |
| 35 | `0cce2984-88ca-486a-8bfa-90be5d5a7152` | `ilhas-do-lago` | Ilhas do Lago | Pousada em ilhas artificiais com piscinas termais. | active | 2025-11-20 02:20:19 |
| 36 | `fad353ea-1f40-4639-a149-2e449cfb803c` | `parque-veredas` | Parque Veredas | Parque com piscinas termais e trilhas ecológicas.  | active | 2025-11-20 02:20:20 |
| 37 | `fa765839-be70-48a9-a3f5-bdbea10ec8d7` | `prive-das-thermas` | Prive das Thermas | Resort privativo com piscinas termais exclusivas.  | active | 2025-11-20 02:20:20 |
| 38 | `87c08d79-f12e-41c2-a50e-ee957915dbe6` | `recanto-do-bosque` | Recanto do Bosque | Pousada em meio à natureza com piscinas termais. T | active | 2025-11-20 02:20:20 |
| 39 | `2478b74a-3e2c-4cc5-9051-f851a7f5f461` | `riviera-sem-ruidos` | Riviera sem Ruídos | Pousada tranquila com piscinas termais e ambiente  | active | 2025-11-20 02:20:20 |
| 40 | `9f69a767-0c86-449e-8a84-5937cfe30507` | `t-bandeirantes` | T. Bandeirantes | Pousada histórica com piscinas termais e tradição. | active | 2025-11-20 02:20:21 |
| 41 | `3b6b462a-e223-476e-a481-fc293c079e0f` | `aguas-da-fonte` | Águas da Fonte | Hotel com águas termais naturais da fonte. Proprie | active | 2025-11-20 02:20:21 |

#### Categoria: Promoções (8 registros)

| # | ID (Docker) | Content ID | Título | Descrição (Preview) | Status | Criado em |
|---|-------------|------------|--------|---------------------|--------|-----------|
| 42 | `d1be1b02-0577-497f-ae9c-133005622975` | `promocao-especial-verao` | 🔥 Ofertas Exclusivas de Verão! | Até 20% OFF + Estacionamento GRÁTIS em todos os ho | active | 2025-11-19 22:51:55 |
| 43 | `0756f5eb-3d4d-49af-8b48-c1696090a2db` | `hot-park` | Ingresso Hot Park | Aventura e relaxamento no maior parque de águas qu | active | 2025-11-20 02:28:01 |
| 44 | `b3019b11-86ab-46b1-b8f7-ffdfd8e6b6c4` | `diroma-acqua-park` | Ingresso diRoma Acqua Park | Diversão aquática para todas as idades com toboágu | active | 2025-11-20 02:28:01 |
| 45 | `f059e9d0-d13c-4dab-95fb-08162720655c` | `lagoa-termas` | Ingresso Lagoa Termas Parque | Relaxe nas águas termais da Lagoa Quente e aprovei | active | 2025-11-20 02:28:01 |
| 46 | `2e263d72-efe7-4bf1-bb24-657b4f0d676d` | `water-park` | Ingresso Water Park | Parque aquático moderno com as mais novas atrações | active | 2025-11-20 02:28:01 |
| 47 | `a05ddaa3-5a76-4496-bcde-3c09d6bbef03` | `kawana-park` | Ingresso Kawana Park | Parque aquático familiar com piscinas termais natu | active | 2025-11-20 02:28:01 |
| 48 | `880be57c-3ef8-4a01-9e78-f4217d558ade` | `promoferias-20off` | PROMOFÉRIAS Hotel + Parque Aquático | Sinta a magia de Caldas Novas! Pacote completo com | active | 2025-11-20 02:32:22 |
| 49 | `05982547-551e-4cc0-aa53-b56e500669c6` | `ilhas-lago-package` | Ilhas do Lago Resort + Parque Aquático | Hospedagem sofisticada no Ilhas do Lago com acesso | active | 2025-11-20 02:32:22 |
| 50 | `9b38ab79-9e97-4165-868e-8c1b8bd1b0ea` | `melhor-idade` | Pacote Melhor Idade Caldas Novas | Condições especiais para grupos da melhor idade co | active | 2025-11-20 02:32:22 |
| 51 | `b1c224d5-42de-40fa-a1ae-dc4f0cb7d94e` | `fim-semana-dourado` | Pacote Fim de Semana Dourado | Hotel + Parque com condições imperdíveis para sua  | active | 2025-11-20 02:32:22 |
| 52 | `d9f8631e-3a13-49b5-a692-1b35f46e75fc` | `familia-completa` | Pacote Família Completa | Diversão garantida para toda família com crianças  | active | 2025-11-20 02:32:22 |

#### Categoria: Tickets (5 registros)

| # | ID (Docker) | Content ID | Título | Descrição (Preview) | Status | Criado em |
|---|-------------|------------|--------|---------------------|--------|-----------|
| 53 | `07a68458-85ac-4e60-9f5d-d840c476622a` | `hot-park` | Ingresso Hot Park | Aventura e relaxamento no maior parque de águas qu | active | 2025-11-20 02:29:21 |
| 54 | `df1035b4-709d-4232-8a31-8167e6ba67d3` | `diroma-acqua-park` | Ingresso diRoma Acqua Park | Diversão aquática para todas as idades com toboágu | active | 2025-11-20 02:29:21 |
| 55 | `29cd7001-963c-4c74-95ec-dc0d8ab760c6` | `lagoa-termas` | Ingresso Lagoa Termas Parque | Relaxe nas águas termais da Lagoa Quente e aprovei | active | 2025-11-20 02:29:21 |
| 56 | `ac301076-3c81-450f-8df3-4bef84788493` | `water-park` | Ingresso Water Park | Parque aquático moderno com as mais novas atrações | active | 2025-11-20 02:29:21 |
| 57 | `86e29a55-b9fb-48df-a2f8-542819b69b16` | `kawana-park` | Ingresso Kawana Park | Parque aquático familiar com piscinas termais natu | active | 2025-11-20 02:29:21 |

#### Categoria: Atrações (7 registros)

| # | ID (Docker) | Content ID | Título | Descrição (Preview) | Status | Criado em |
|---|-------------|------------|--------|---------------------|--------|-----------|
| 58 | `d7b79585-07bc-42de-a8a8-aebcc95326f6` | `parque-das-aguas` | Parque das Águas Quentes | O maior complexo de piscinas termais de Caldas Nov | active | 2025-11-19 22:51:55 |
| 59 | `d4dc0156-52ca-4018-b278-dc3d8ca0b035` | `jardim-japones` | Jardim Japonês | Um refúgio de paz e beleza oriental, ideal para co | active | 2025-11-20 02:30:37 |
| 60 | `fce6280e-c76f-449a-b49a-b69a1d256ea1` | `lago-corumba` | Lago Corumbá | Passeios de barco, jet ski e uma bela vista para r | active | 2025-11-20 02:30:37 |
| 61 | `97e6c877-9e0f-4b01-854b-8bc666fabdf5` | `monumento-aguas` | Monumento das Águas | Visite o cartão postal de Caldas Novas, símbolo da | active | 2025-11-20 02:30:37 |
| 62 | `04daccea-a28b-49c0-805d-8d35cd19dfa7` | `feira-hippie` | Feira do Luar | Feira noturna com artesanato local, gastronomia tí | active | 2025-11-20 02:30:37 |
| 63 | `2bf4a771-1d5d-4af0-a495-369f86123b45` | `parque-estadual` | Parque Estadual da Serra de Caldas | Trilhas ecológicas, cachoeiras naturais e vista pa | active | 2025-11-20 02:30:37 |
| 64 | `784c5d8c-47e8-4e09-b7c8-158ca1456073` | `centro-historico` | Centro Histórico | Passeio pela história de Caldas Novas, com arquite | active | 2025-11-20 02:30:37 |

### 📊 Resumo por Categoria

| Categoria | Quantidade | Percentual |
|-----------|------------|------------|
| Hotéis | 41 | 64.06% |
| Promoções | 11 | 17.19% |
| Tickets | 5 | 7.81% |
| Atrações | 7 | 10.94% |
| **TOTAL** | **64** | **100%** |

### 🔴 Problema Comum

Todos os 64 registros têm:
- **ID:** UUID (precisa converter para INTEGER)
- **created_by:** NULL na maioria (não é problema)
- **updated_by:** NULL na maioria (não é problema)

**Solução:** Criar script que gera novos IDs INTEGER sequenciais e mantém o UUID original em uma coluna de mapeamento (se necessário).

---

## 3️⃣ TABELA: `website_settings` (4 registros)

### 🔴 Motivo da Falha na Migração

- **ID:** UUID no Docker vs INTEGER no Destino
- **updated_by:** UUID no Docker vs INTEGER no Destino (NULL em todos)

### 📝 Registros Detalhados

#### Registro 1: `site_info`
- **ID (Docker):** `7ca5b97a-583b-4c1d-bb6f-5f59f112dade`
- **Setting Key:** `site_info`
- **Setting Value:**
```json
{
  "title": "Reservei Viagens",
  "tagline": "Parques, Hotéis & Atrações em Caldas Novas",
  "description": "Especialistas em turismo em Caldas Novas. Os melhores hotéis, pacotes e atrações com desconto especial."
}
```
- **Updated By:** NULL
- **Updated At:** `2025-11-19 22:51:55.126+00`

---

#### Registro 2: `contact_info`
- **ID (Docker):** `5f526587-7ab2-4206-8279-826df4513e7b`
- **Setting Key:** `contact_info`
- **Setting Value:**
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
- **Updated By:** NULL
- **Updated At:** `2025-11-19 22:51:55.134+00`

---

#### Registro 3: `social_media`
- **ID (Docker):** `3e9e2989-15f2-418d-96e1-0fd63e86969f`
- **Setting Key:** `social_media`
- **Setting Value:**
```json
{
  "website": "reserveiviagens.com.br",
  "facebook": "facebook.com/comercialreservei",
  "instagram": "@reserveiviagens"
}
```
- **Updated By:** NULL
- **Updated At:** `2025-11-19 22:51:55.136+00`

---

#### Registro 4: `seo_global`
- **ID (Docker):** `2e9215b1-8279-446d-a112-ec4c1a165484`
- **Setting Key:** `seo_global`
- **Setting Value:**
```json
{
  "title": "Reservei Viagens - Hotéis e Atrações em Caldas Novas",
  "keywords": ["caldas novas", "hotéis caldas novas", "piscinas termais", "reservei viagens", "turismo goiás"],
  "og_image": "/images/og-reservei-viagens.jpg",
  "description": "Especialista em turismo em Caldas Novas. Hotéis com desconto, pacotes promocionais e as melhores atrações."
}
```
- **Updated By:** NULL
- **Updated At:** `2025-11-19 22:51:55.14+00`

### 🔴 Problema Comum

Todos os 4 registros têm:
- **ID:** UUID (precisa converter para INTEGER)
- **updated_by:** NULL (não é problema)

**Solução:** Criar script que gera novos IDs INTEGER sequenciais mantendo o `setting_key` como identificador único.

---

## 📊 Resumo Geral

### Estatísticas Finais

| Métrica | Valor |
|---------|-------|
| **Total de Registros Não Migrados** | **71** |
| **Tabelas Afetadas** | **3** |
| **Registros de Properties** | **3** |
| **Registros de Website Content** | **64** |
| **Registros de Website Settings** | **4** |

### Principais Problemas

1. **UUID vs INTEGER (100% dos registros)**
   - Todas as tabelas usam UUID no Docker e INTEGER no destino
   - Solução: Gerar novos IDs INTEGER sequenciais

2. **Nomes de Colunas Diferentes (tabela `properties`)**
   - `type` → `property_type`
   - `title` → `name`
   - `base_price` → `base_price_per_night`
   - Solução: Mapear colunas durante migração

3. **Foreign Keys UUID vs INTEGER (tabela `properties`)**
   - `owner_id` é UUID no Docker e INTEGER no destino
   - Solução: Criar tabela de mapeamento UUID → INTEGER

### Impacto por Categoria

- **Hotéis:** 41 registros (57.75% do total)
- **Promoções:** 11 registros (15.49% do total)
- **Tickets:** 5 registros (7.04% do total)
- **Atrações:** 7 registros (9.86% do total)
- **Properties:** 3 registros (4.23% do total)
- **Settings:** 4 registros (5.63% do total)

---

## 🔧 Próximos Passos Recomendados

1. **Criar scripts de migração customizados** para cada tabela
2. **Criar tabela de mapeamento UUID → INTEGER** para referências
3. **Validar dados migrados** após execução
4. **Documentar mapeamentos** para referência futura

---

**Documento gerado em:** 12/01/2026  
**Última atualização:** 12/01/2026

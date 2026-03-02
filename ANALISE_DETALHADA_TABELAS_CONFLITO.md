# 🔍 Análise Detalada: Tabelas com Conflito de Estrutura

**Data:** 12/01/2026  
**Objetivo:** Documentar as diferenças estruturais entre as tabelas no Docker (porta 5432) e no PostgreSQL nativo (porta 5433)

---

## 📊 Resumo Executivo

| Tabela | Registros no Docker | Status Migração | Principais Diferenças |
|--------|---------------------|-----------------|----------------------|
| `properties` | 3 | ❌ Falhou | ID (UUID vs INTEGER), estrutura completamente diferente |
| `website_content` | 64 | ❌ Falhou | ID (UUID vs INTEGER), created_by/updated_by (UUID vs INTEGER) |
| `website_settings` | 4 | ❌ Falhou | ID (UUID vs INTEGER), updated_by (UUID vs INTEGER) |

---

## 1️⃣ TABELA: `properties`

### 📋 Resumo das Diferenças

| Aspecto | Docker (Porta 5432) | Destino (Porta 5433) | Impacto |
|---------|---------------------|----------------------|---------|
| **Total de Colunas** | 27 | 37 | ⚠️ Destino tem 10 colunas a mais |
| **Tipo de ID** | UUID | INTEGER (SERIAL) | 🔴 **CRÍTICO** - Incompatível |
| **Tipo de owner_id** | UUID | INTEGER | 🔴 **CRÍTICO** - Incompatível |
| **Nome da coluna tipo** | `type` | `property_type` | 🔴 **CRÍTICO** - Nome diferente |
| **Nome da coluna título** | `title` | `name` | 🔴 **CRÍTICO** - Nome diferente |
| **Nome da coluna preço** | `base_price` | `base_price_per_night` | 🔴 **CRÍTICO** - Nome diferente |

### 🔴 Diferenças Críticas

#### 1.1. Coluna `id`
- **Docker:** `uuid` (gen_random_uuid())
- **Destino:** `integer` (SERIAL - nextval('properties_id_seq'))
- **Impacto:** Impossível migrar dados diretamente

#### 1.2. Coluna `owner_id`
- **Docker:** `uuid`
- **Destino:** `integer`
- **Impacto:** Referências externas incompatíveis

#### 1.3. Coluna `type` vs `property_type`
- **Docker:** `type` (TEXT, NOT NULL)
- **Destino:** `property_type` (VARCHAR(50), NOT NULL)
- **Impacto:** Nome diferente, tipo diferente

#### 1.4. Coluna `title` vs `name`
- **Docker:** `title` (VARCHAR(255), NOT NULL)
- **Destino:** `name` (VARCHAR(255), NOT NULL)
- **Impacto:** Nome diferente

#### 1.5. Coluna `base_price` vs `base_price_per_night`
- **Docker:** `base_price` (NUMERIC(10,2), NOT NULL)
- **Destino:** `base_price_per_night` (NUMERIC(10,2), NOT NULL)
- **Impacto:** Nome diferente

### 📝 Colunas Existentes Apenas no Docker

Nenhuma - todas as colunas do Docker existem no destino (com nomes diferentes)

### 📝 Colunas Existentes Apenas no Destino

1. **`name`** (VARCHAR(255), NOT NULL) - Equivalente a `title` no Docker
2. **`address_number`** (VARCHAR(50))
3. **`address_complement`** (VARCHAR(255))
4. **`address_neighborhood`** (VARCHAR(100))
5. **`beds`** (INTEGER, NOT NULL, DEFAULT 0)
6. **`base_price_per_night`** (NUMERIC(10,2), NOT NULL) - Equivalente a `base_price` no Docker
7. **`currency`** (VARCHAR(3), DEFAULT 'BRL')
8. **`service_fee_percentage`** (NUMERIC(5,2), DEFAULT 0)
9. **`min_stay_nights`** (INTEGER, DEFAULT 1) - Equivalente a `min_stay` no Docker
10. **`max_stay_nights`** (INTEGER)
11. **`is_featured`** (BOOLEAN, DEFAULT false)
12. **`is_instant_book`** (BOOLEAN, DEFAULT false)
13. **`metadata`** (JSONB, DEFAULT '{}')

### 🔄 Mapeamento de Colunas

| Docker (Porta 5432) | Destino (Porta 5433) | Observações |
|---------------------|----------------------|-------------|
| `id` (UUID) | `id` (INTEGER) | ⚠️ Tipo incompatível |
| `owner_id` (UUID) | `owner_id` (INTEGER) | ⚠️ Tipo incompatível |
| `type` (TEXT) | `property_type` (VARCHAR(50)) | ⚠️ Nome diferente |
| `title` (VARCHAR(255)) | `name` (VARCHAR(255)) | ⚠️ Nome diferente |
| `description` | `description` | ✅ Compatível |
| `address_street` | `address_street` | ✅ Compatível |
| `address_city` | `address_city` | ✅ Compatível |
| `address_state` | `address_state` | ✅ Compatível |
| `address_zip_code` | `address_zip_code` | ✅ Compatível |
| `address_country` | `address_country` | ✅ Compatível |
| `latitude` | `latitude` | ✅ Compatível |
| `longitude` | `longitude` | ✅ Compatível |
| `bedrooms` | `bedrooms` | ⚠️ Nullable diferente (Docker: YES, Destino: NO DEFAULT 0) |
| `bathrooms` | `bathrooms` | ⚠️ Nullable diferente (Docker: YES, Destino: NO DEFAULT 0) |
| - | `beds` | ❌ Não existe no Docker |
| `max_guests` | `max_guests` | ✅ Compatível |
| `area_sqm` | `area_sqm` | ✅ Compatível |
| `base_price` | `base_price_per_night` | ⚠️ Nome diferente |
| - | `currency` | ❌ Não existe no Docker |
| `cleaning_fee` | `cleaning_fee` | ✅ Compatível |
| - | `service_fee_percentage` | ❌ Não existe no Docker |
| `min_stay` | `min_stay_nights` | ⚠️ Nome diferente |
| - | `max_stay_nights` | ❌ Não existe no Docker |
| `check_in_time` | `check_in_time` | ⚠️ Tamanho diferente (Docker: 255, Destino: 10) |
| `check_out_time` | `check_out_time` | ⚠️ Tamanho diferente (Docker: 255, Destino: 10) |
| `cancellation_policy` | `cancellation_policy` | ⚠️ Tipo diferente (Docker: TEXT, Destino: VARCHAR(50)) |
| `status` | `status` | ⚠️ Tipo diferente (Docker: TEXT, Destino: VARCHAR(20)) |
| - | `is_featured` | ❌ Não existe no Docker |
| - | `is_instant_book` | ❌ Não existe no Docker |
| `amenities` | `amenities` | ⚠️ Default diferente (Docker: '[]', Destino: '{}') |
| `images` | `images` | ✅ Compatível |
| - | `metadata` | ❌ Não existe no Docker |
| `created_at` | `created_at` | ⚠️ Tipo diferente (Docker: TIMESTAMPTZ, Destino: TIMESTAMP) |
| `updated_at` | `updated_at` | ⚠️ Tipo diferente (Docker: TIMESTAMPTZ, Destino: TIMESTAMP) |

### 🔒 Constraints e Índices

#### Docker (Porta 5432)
- **Primary Key:** `properties_pkey` (id)
- **Foreign Key:** `properties_owner_id_foreign` → `owners(id)`
- **Check Constraints:**
  - `properties_status_check`: status IN ('active', 'inactive', 'maintenance')
  - `properties_type_check`: type IN ('apartment', 'house', 'chalet', 'flat', 'bungalow')
- **Índices:**
  - `properties_pkey` (PRIMARY KEY)
  - `properties_address_city_index`
  - `properties_latitude_longitude_index`
  - `properties_owner_id_index`
  - `properties_status_index`
  - `properties_type_index`

#### Destino (Porta 5433)
- **Primary Key:** `properties_pkey` (id)
- **Índices:**
  - `properties_pkey` (PRIMARY KEY)
  - `idx_properties_city`
  - `idx_properties_featured`
  - `idx_properties_owner_id`
  - `idx_properties_state`
  - `idx_properties_status`
  - `idx_properties_type`

### 💡 Solução Recomendada

1. **Criar script de migração customizado** que:
   - Converte UUIDs para INTEGERs sequenciais
   - Mapeia `type` → `property_type`
   - Mapeia `title` → `name`
   - Mapeia `base_price` → `base_price_per_night`
   - Mapeia `min_stay` → `min_stay_nights`
   - Trunca `check_in_time` e `check_out_time` para 10 caracteres
   - Converte `cancellation_policy` e `status` para VARCHAR
   - Preenche valores padrão para colunas que não existem no Docker

---

## 2️⃣ TABELA: `website_content`

### 📋 Resumo das Diferenças

| Aspecto | Docker (Porta 5432) | Destino (Porta 5433) | Impacto |
|---------|---------------------|----------------------|---------|
| **Total de Colunas** | 14 | 14 | ✅ Mesmo número |
| **Tipo de ID** | UUID | INTEGER (SERIAL) | 🔴 **CRÍTICO** - Incompatível |
| **Tipo de created_by** | UUID | INTEGER | 🔴 **CRÍTICO** - Incompatível |
| **Tipo de updated_by** | UUID | INTEGER | 🔴 **CRÍTICO** - Incompatível |
| **Tipo de status** | TEXT | VARCHAR(20) | ⚠️ Compatível com conversão |
| **Tipo de timestamps** | TIMESTAMPTZ | TIMESTAMP | ⚠️ Compatível com conversão |

### 🔴 Diferenças Críticas

#### 2.1. Coluna `id`
- **Docker:** `uuid` (gen_random_uuid())
- **Destino:** `integer` (SERIAL - nextval('website_content_id_seq'))
- **Impacto:** Impossível migrar dados diretamente
- **Registros afetados:** 64

#### 2.2. Coluna `created_by`
- **Docker:** `uuid`
- **Destino:** `integer`
- **Impacto:** Referências externas incompatíveis

#### 2.3. Coluna `updated_by`
- **Docker:** `uuid`
- **Destino:** `integer`
- **Impacto:** Referências externas incompatíveis

### 📝 Comparação Detalhada de Colunas

| Coluna | Docker | Destino | Compatível? |
|--------|--------|---------|-------------|
| `id` | UUID, NOT NULL, gen_random_uuid() | INTEGER, NOT NULL, SERIAL | ❌ Não |
| `page_type` | VARCHAR(50), NOT NULL | VARCHAR(50), NOT NULL | ✅ Sim |
| `content_id` | VARCHAR(100), NOT NULL | VARCHAR(100), NOT NULL | ✅ Sim |
| `title` | VARCHAR(255), NOT NULL | VARCHAR(255), NOT NULL | ✅ Sim |
| `description` | TEXT | TEXT | ✅ Sim |
| `images` | JSONB | JSONB | ✅ Sim |
| `metadata` | JSONB | JSONB | ✅ Sim |
| `seo_data` | JSONB | JSONB | ✅ Sim |
| `status` | TEXT, DEFAULT 'active' | VARCHAR(20), DEFAULT 'active' | ⚠️ Compatível |
| `order_index` | INTEGER, DEFAULT 0 | INTEGER, DEFAULT 0 | ✅ Sim |
| `created_at` | TIMESTAMPTZ, NOT NULL, CURRENT_TIMESTAMP | TIMESTAMP, CURRENT_TIMESTAMP | ⚠️ Compatível |
| `updated_at` | TIMESTAMPTZ, NOT NULL, CURRENT_TIMESTAMP | TIMESTAMP, CURRENT_TIMESTAMP | ⚠️ Compatível |
| `created_by` | UUID | INTEGER | ❌ Não |
| `updated_by` | UUID | INTEGER | ❌ Não |

### 🔒 Constraints e Índices

#### Docker (Porta 5432)
- **Primary Key:** `website_content_pkey` (id)
- **Unique Constraint:** `unq_website_content_page_content` (page_type, content_id)

#### Destino (Porta 5433)
- **Primary Key:** `website_content_pkey` (id)
- **Unique Constraint:** Provavelmente existe (não verificado)

### 💡 Solução Recomendada

1. **Criar script de migração customizado** que:
   - Converte UUIDs para INTEGERs sequenciais
   - Mapeia `created_by` e `updated_by` UUIDs para INTEGERs (criar tabela de mapeamento)
   - Converte `status` de TEXT para VARCHAR(20)
   - Converte timestamps de TIMESTAMPTZ para TIMESTAMP

---

## 3️⃣ TABELA: `website_settings`

### 📋 Resumo das Diferenças

| Aspecto | Docker (Porta 5432) | Destino (Porta 5433) | Impacto |
|---------|---------------------|----------------------|---------|
| **Total de Colunas** | 6 | 6 | ✅ Mesmo número |
| **Tipo de ID** | UUID | INTEGER (SERIAL) | 🔴 **CRÍTICO** - Incompatível |
| **Tipo de updated_by** | UUID | INTEGER | 🔴 **CRÍTICO** - Incompatível |
| **Tipo de timestamp** | TIMESTAMPTZ | TIMESTAMP | ⚠️ Compatível com conversão |

### 🔴 Diferenças Críticas

#### 3.1. Coluna `id`
- **Docker:** `uuid` (gen_random_uuid())
- **Destino:** `integer` (SERIAL - nextval('website_settings_id_seq'))
- **Impacto:** Impossível migrar dados diretamente
- **Registros afetados:** 4

#### 3.2. Coluna `updated_by`
- **Docker:** `uuid`
- **Destino:** `integer`
- **Impacto:** Referências externas incompatíveis

### 📝 Comparação Detalhada de Colunas

| Coluna | Docker | Destino | Compatível? |
|--------|--------|---------|-------------|
| `id` | UUID, NOT NULL, gen_random_uuid() | INTEGER, NOT NULL, SERIAL | ❌ Não |
| `setting_key` | VARCHAR(100), NOT NULL | VARCHAR(100), NOT NULL | ✅ Sim |
| `setting_value` | JSONB, NOT NULL | JSONB, NOT NULL | ✅ Sim |
| `description` | TEXT | TEXT | ✅ Sim |
| `updated_at` | TIMESTAMPTZ, CURRENT_TIMESTAMP | TIMESTAMP, CURRENT_TIMESTAMP | ⚠️ Compatível |
| `updated_by` | UUID | INTEGER | ❌ Não |

### 🔒 Constraints e Índices

#### Docker (Porta 5432)
- **Primary Key:** `website_settings_pkey` (id)
- **Unique Constraint:** `website_settings_setting_key_key` (setting_key)

#### Destino (Porta 5433)
- **Primary Key:** `website_settings_pkey` (id)
- **Unique Constraint:** Provavelmente existe (não verificado)

### 💡 Solução Recomendada

1. **Criar script de migração customizado** que:
   - Converte UUIDs para INTEGERs sequenciais
   - Mapeia `updated_by` UUIDs para INTEGERs (criar tabela de mapeamento)
   - Converte timestamps de TIMESTAMPTZ para TIMESTAMP

---

## 📊 Resumo Geral

### Estatísticas

- **Total de registros não migrados:** 71 (3 + 64 + 4)
- **Tabelas com conflito:** 3
- **Principais causas:**
  1. Diferença de tipo de ID (UUID vs INTEGER) - **100% das tabelas**
  2. Diferença de tipo de foreign keys (UUID vs INTEGER) - **100% das tabelas**
  3. Diferença de estrutura (tabela `properties`) - **1 tabela**

### Impacto

- **Alto:** Tabela `properties` - estrutura completamente diferente
- **Médio:** Tabelas `website_content` e `website_settings` - apenas tipo de ID diferente

### Recomendações

1. **Para `properties`:**
   - Criar script de migração completo com mapeamento de todas as colunas
   - Considerar manter ambas as estruturas se necessário

2. **Para `website_content` e `website_settings`:**
   - Criar script simples que converte UUIDs para INTEGERs
   - Criar tabela de mapeamento UUID → INTEGER para referências

3. **Alternativa:**
   - Manter dados no Docker e criar views ou funções que acessem ambos os bancos
   - Unificar estruturas no futuro

---

## 🔧 Scripts de Migração Necessários

### Script 1: Migração de `properties`
- Converter UUID → INTEGER
- Mapear colunas com nomes diferentes
- Preencher colunas adicionais com valores padrão

### Script 2: Migração de `website_content`
- Converter UUID → INTEGER
- Mapear `created_by` e `updated_by` UUIDs → INTEGERs

### Script 3: Migração de `website_settings`
- Converter UUID → INTEGER
- Mapear `updated_by` UUID → INTEGER

---

**Documento gerado em:** 12/01/2026  
**Última atualização:** 12/01/2026

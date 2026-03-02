# 📊 ANÁLISE: Perfil de Usuário para Aluguel por Temporada

## 🔍 COMPARAÇÃO: O que existe vs. O que é necessário

### ✅ CAMPOS EXISTENTES na tabela `users`

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,              -- ✅ Nome
    email VARCHAR(255) UNIQUE NOT NULL,        -- ✅ E-mail
    phone VARCHAR(50),                         -- ✅ Telefone
    document VARCHAR(50),                      -- ✅ CPF/Documento
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer',
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB,                            -- ⚠️ Pode armazenar dados extras
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

---

## ❌ CAMPOS FALTANDO para Perfil Completo

### 1. **Nome e Foto**
- ✅ `name` - Existe
- ❌ `username` - Nome de usuário único
- ❌ `avatar_url` ou `profile_picture` - Foto de perfil
- ❌ `company_logo` - Logo da empresa (para hosts)

### 2. **Biografia e Descrição**
- ❌ `bio` - Biografia do usuário/host
- ❌ `description` - Descrição completa do negócio
- ❌ `short_description` - Descrição curta para cards
- ❌ `tagline` - Slogan ou frase de destaque

### 3. **Informações de Contato**
- ✅ `email` - Existe
- ✅ `phone` - Existe
- ❌ `website_url` - Link para site
- ❌ `booking_url` - Link para página de reservas
- ❌ `whatsapp` - Número WhatsApp
- ❌ `location` - Localização (cidade, estado)
- ❌ `address` - Endereço completo
- ❌ `city` - Cidade
- ❌ `state` - Estado
- ❌ `zip_code` - CEP
- ❌ `country` - País
- ❌ `latitude` - Coordenada latitude
- ❌ `longitude` - Coordenada longitude

### 4. **Informações Adicionais**
- ❌ `amenities` - Comodidades oferecidas (JSONB)
- ❌ `property_features` - Características dos imóveis (JSONB)
- ❌ `property_types` - Tipos de imóveis (JSONB)
- ❌ `max_guests` - Capacidade máxima
- ❌ `bedrooms` - Número de quartos
- ❌ `bathrooms` - Número de banheiros
- ❌ `property_count` - Quantidade de imóveis

### 5. **Fotos e Vídeos**
- ❌ `profile_photos` - Fotos do perfil (JSONB array)
- ❌ `property_photos` - Fotos dos imóveis (JSONB array)
- ❌ `video_urls` - URLs de vídeos (JSONB array)
- ❌ `gallery` - Galeria de mídia (JSONB)

### 6. **Categorias e Serviços**
- ❌ `categories` - Categorias do negócio (JSONB array)
- ❌ `services` - Serviços extras oferecidos (JSONB array)
- ❌ `specialties` - Especialidades (JSONB array)

### 7. **Informações de Negócio**
- ❌ `business_name` - Nome da empresa
- ❌ `business_type` - Tipo de negócio
- ❌ `tax_id` - CNPJ
- ❌ `business_registration` - Registro comercial
- ❌ `years_experience` - Anos de experiência
- ❌ `verified` - Conta verificada (boolean)
- ❌ `verification_date` - Data de verificação

### 8. **Estatísticas e Reputação**
- ❌ `rating` - Avaliação média
- ❌ `review_count` - Número de avaliações
- ❌ `response_rate` - Taxa de resposta
- ❌ `response_time` - Tempo médio de resposta
- ❌ `total_bookings` - Total de reservas
- ❌ `cancellation_rate` - Taxa de cancelamento

### 9. **Preferências e Configurações**
- ❌ `language` - Idioma preferido
- ❌ `timezone` - Fuso horário
- ❌ `currency` - Moeda preferida
- ❌ `notification_preferences` - Preferências de notificação (JSONB)

### 10. **Redes Sociais**
- ❌ `social_media` - Links de redes sociais (JSONB)
  - `facebook`
  - `instagram`
  - `twitter`
  - `linkedin`
  - `youtube`

---

## 📋 PROPOSTA: Script SQL Completo

### Tabela `users` Expandida

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    
    -- Informações Básicas
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    document VARCHAR(50),
    password_hash VARCHAR(255),
    
    -- Foto e Avatar
    avatar_url TEXT,
    profile_picture TEXT,
    company_logo TEXT,
    
    -- Biografia
    bio TEXT,
    description TEXT,
    short_description VARCHAR(500),
    tagline VARCHAR(200),
    
    -- Contato
    website_url TEXT,
    booking_url TEXT,
    whatsapp VARCHAR(50),
    
    -- Localização
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Brasil',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Informações de Negócio
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    tax_id VARCHAR(50), -- CNPJ
    business_registration VARCHAR(100),
    years_experience INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    
    -- Propriedades
    property_count INTEGER DEFAULT 0,
    max_guests INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    
    -- Mídia
    profile_photos JSONB DEFAULT '[]',
    property_photos JSONB DEFAULT '[]',
    video_urls JSONB DEFAULT '[]',
    gallery JSONB DEFAULT '[]',
    
    -- Categorias e Serviços
    categories JSONB DEFAULT '[]',
    services JSONB DEFAULT '[]',
    specialties JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    property_features JSONB DEFAULT '[]',
    property_types JSONB DEFAULT '[]',
    
    -- Redes Sociais
    social_media JSONB DEFAULT '{}',
    
    -- Estatísticas
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 0,
    response_time INTEGER, -- em minutos
    total_bookings INTEGER DEFAULT 0,
    cancellation_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Preferências
    language VARCHAR(10) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    currency VARCHAR(3) DEFAULT 'BRL',
    notification_preferences JSONB DEFAULT '{}',
    
    -- Sistema
    role VARCHAR(20) DEFAULT 'customer',
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    verified_at TIMESTAMP
);
```

### Índices Recomendados

```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(city, state);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC);
```

---

## 🎯 RECOMENDAÇÃO

### Opção 1: Usar campo `metadata` (JSONB) - Rápido
Armazenar campos extras no `metadata` existente:

```json
{
  "username": "meu_usuario",
  "bio": "Descrição...",
  "website": "https://...",
  "location": {...},
  "social_media": {...},
  "categories": [...],
  "services": [...]
}
```

### Opção 2: Criar tabela `user_profiles` separada - Recomendado
Tabela dedicada para informações de perfil:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    -- Todos os campos extras aqui
    ...
);
```

### Opção 3: Expandir tabela `users` - Completo
Adicionar todos os campos diretamente na tabela `users`.

---

## ✅ PRÓXIMOS PASSOS

1. **Decidir qual abordagem usar** (metadata, tabela separada, ou expandir)
2. **Criar script SQL de migração**
3. **Atualizar APIs** para suportar novos campos
4. **Atualizar interface** de perfil do usuário
5. **Criar formulário** de edição de perfil completo

---

## 📝 NOTA

O campo `metadata` JSONB já existe e pode ser usado imediatamente para armazenar informações extras sem alterar o schema. Porém, para melhor performance e consultas, recomenda-se criar campos específicos ou uma tabela separada.


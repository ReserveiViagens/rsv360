# 📊 RELATÓRIO COMPLETO DE TABELAS POSTGRESQL

**Data de Análise:** 12/01/2026 20:33:15  
**Container Docker:** postgres-rsv360  
**Porta:** 5432  
**Usuário:** postgres

---

## 🔍 SUMÁRIO

- **Total de Bancos:** 2
- **Total de Schemas:** 2
- **Total de Tabelas:** 22

---

## 📋 BANCOS DE DADOS E TABELAS

### 🗄️ Banco: **postgres**

#### 📁 Schema: **public**
*Nenhuma tabela encontrada neste schema.*


### 🗄️ Banco: **rsv_360_ecosystem**

#### 📁 Schema: **public**
| Tabela | Colunas | Descrição |
|--------|---------|-----------|
| `audit_logs` | 12 colunas | - |
| `bookings` | 35 colunas | - |
| `bookings_rsv360` | 17 colunas | - |
| `customers` | 33 colunas | - |
| `customers_rsv360` | 15 colunas | - |
| `files` | 10 colunas | - |
| `knex_migrations` | 4 colunas | - |
| `knex_migrations_lock` | 2 colunas | - |
| `notifications` | 13 colunas | - |
| `owners` | 16 colunas | - |
| `payments` | 26 colunas | - |
| `payments_rsv360` | 19 colunas | - |
| `properties` | 27 colunas | - |
| `property_availability` | 9 colunas | - |
| `property_shares` | 11 colunas | - |
| `share_calendar` | 9 colunas | - |
| `travel_packages` | 57 colunas | - |
| `user_fcm_tokens` | 9 colunas | - |
| `users` | 30 colunas | - |
| `website_content` | 14 colunas | - |
| `website_content_history` | 8 colunas | - |
| `website_settings` | 6 colunas | - |


<details>
<summary><strong>audit_logs</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `user_id` | uuid | YES |
| `action` | character varying | NO |
| `entity_type` | character varying | YES |
| `entity_id` | integer | YES |
| `ip_address` | character varying | YES |
| `user_agent` | character varying | YES |
| `metadata` | json | YES |
| `severity` | text | YES |
| `success` | boolean | YES |
| `failure_reason` | text | YES |
| `created_at` | timestamp with time zone | YES |

</details>


<details>
<summary><strong>bookings</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `user_id` | uuid | NO |
| `booking_number` | character varying | NO |
| `title` | character varying | NO |
| `description` | text | YES |
| `type` | text | NO |
| `status` | text | YES |
| `start_date` | date | NO |
| `end_date` | date | NO |
| `start_time` | time without time zone | YES |
| `end_time` | time without time zone | YES |
| `total_amount` | numeric | YES |
| `currency` | character varying | YES |
| `paid_amount` | numeric | YES |
| `pending_amount` | numeric | YES |
| `payment_status` | text | YES |
| `guests_count` | integer | YES |
| `adults_count` | integer | YES |
| `children_count` | integer | YES |
| `guest_details` | json | YES |
| `special_requests` | json | YES |
| `confirmation_code` | character varying | YES |
| `external_booking_id` | character varying | YES |
| `provider_name` | character varying | YES |
| `provider_data` | json | YES |
| `cancellation_policy` | text | YES |
| `cancellation_deadline` | timestamp with time zone | YES |
| `cancellation_fee` | numeric | YES |
| `notes` | text | YES |
| `metadata` | json | YES |
| `created_by` | character varying | YES |
| `updated_by` | character varying | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `version` | integer | NO |

</details>


<details>
<summary><strong>bookings_rsv360</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `booking_number` | character varying | NO |
| `property_id` | uuid | YES |
| `customer_id` | uuid | YES |
| `check_in` | date | NO |
| `check_out` | date | NO |
| `guests_count` | integer | NO |
| `base_price` | numeric | NO |
| `cleaning_fee` | numeric | YES |
| `service_fee` | numeric | YES |
| `total_amount` | numeric | NO |
| `status` | text | YES |
| `payment_status` | text | YES |
| `special_requests` | text | YES |
| `version` | integer | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>customers</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | integer | NO |
| `name` | character varying | NO |
| `email` | character varying | NO |
| `phone` | character varying | YES |
| `document` | character varying | YES |
| `document_type` | character varying | YES |
| `birth_date` | date | YES |
| `gender` | text | YES |
| `address` | character varying | YES |
| `city` | character varying | YES |
| `state` | character varying | YES |
| `zip_code` | character varying | YES |
| `country` | character varying | YES |
| `status` | text | YES |
| `type` | text | YES |
| `company_name` | character varying | YES |
| `notes` | text | YES |
| `preferred_contact` | character varying | YES |
| `marketing_consent` | boolean | YES |
| `total_bookings` | integer | YES |
| `total_spent` | numeric | YES |
| `average_booking_value` | numeric | YES |
| `last_booking_date` | date | YES |
| `first_booking_date` | date | YES |
| `vip_level` | text | YES |
| `travel_preferences` | text | YES |
| `emergency_contact` | text | YES |
| `avatar_url` | character varying | YES |
| `referral_source_id` | integer | YES |
| `referral_code` | character varying | YES |
| `created_by` | uuid | YES |
| `created_at` | timestamp with time zone | YES |
| `updated_at` | timestamp with time zone | YES |

</details>


<details>
<summary><strong>customers_rsv360</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `user_id` | uuid | YES |
| `name` | character varying | NO |
| `email` | character varying | NO |
| `phone` | character varying | YES |
| `document_type` | character varying | YES |
| `document_number` | character varying | YES |
| `birth_date` | date | YES |
| `address` | text | YES |
| `preferences` | jsonb | YES |
| `tags` | jsonb | YES |
| `total_bookings` | integer | YES |
| `total_spent` | numeric | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>files</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | integer | NO |
| `filename` | character varying | NO |
| `original_name` | character varying | NO |
| `mime_type` | character varying | NO |
| `size` | integer | NO |
| `type` | text | NO |
| `path` | character varying | NO |
| `url` | character varying | NO |
| `uploaded_by` | integer | YES |
| `created_at` | timestamp with time zone | YES |

</details>


<details>
<summary><strong>knex_migrations</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | integer | NO |
| `name` | character varying | YES |
| `batch` | integer | YES |
| `migration_time` | timestamp with time zone | YES |

</details>


<details>
<summary><strong>knex_migrations_lock</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `index` | integer | NO |
| `is_locked` | integer | YES |

</details>


<details>
<summary><strong>notifications</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `user_id` | uuid | YES |
| `type` | text | NO |
| `title` | character varying | NO |
| `message` | text | NO |
| `category` | text | YES |
| `data` | jsonb | YES |
| `status` | text | YES |
| `error_message` | text | YES |
| `sent_at` | timestamp with time zone | YES |
| `read_at` | timestamp with time zone | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>owners</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `user_id` | uuid | YES |
| `name` | character varying | NO |
| `email` | character varying | NO |
| `phone` | character varying | YES |
| `document_type` | character varying | YES |
| `document_number` | character varying | YES |
| `address` | text | YES |
| `bank_name` | character varying | YES |
| `bank_account` | character varying | YES |
| `bank_agency` | character varying | YES |
| `pix_key` | character varying | YES |
| `commission_rate` | numeric | YES |
| `status` | text | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>payments</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `booking_id` | uuid | YES |
| `user_id` | uuid | NO |
| `transaction_id` | character varying | NO |
| `external_transaction_id` | character varying | YES |
| `type` | text | YES |
| `method` | text | NO |
| `status` | text | YES |
| `amount` | numeric | NO |
| `currency` | character varying | YES |
| `fee_amount` | numeric | YES |
| `net_amount` | numeric | NO |
| `gateway_provider` | character varying | YES |
| `gateway_transaction_id` | character varying | YES |
| `gateway_response` | json | YES |
| `card_last_four` | character varying | YES |
| `card_brand` | character varying | YES |
| `installments` | integer | YES |
| `description` | text | YES |
| `processed_at` | timestamp with time zone | YES |
| `failed_at` | timestamp with time zone | YES |
| `failure_reason` | text | YES |
| `receipt_url` | character varying | YES |
| `metadata` | json | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>payments_rsv360</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `booking_id` | uuid | YES |
| `transaction_id` | character varying | YES |
| `external_transaction_id` | character varying | YES |
| `gateway` | text | NO |
| `method` | text | NO |
| `status` | text | YES |
| `amount` | numeric | NO |
| `fee_amount` | numeric | YES |
| `net_amount` | numeric | NO |
| `currency` | character varying | YES |
| `installments` | integer | YES |
| `card_data` | jsonb | YES |
| `gateway_response` | jsonb | YES |
| `failure_reason` | text | YES |
| `processed_at` | timestamp with time zone | YES |
| `failed_at` | timestamp with time zone | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>properties</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `owner_id` | uuid | YES |
| `type` | text | NO |
| `title` | character varying | NO |
| `description` | text | YES |
| `address_street` | character varying | NO |
| `address_city` | character varying | NO |
| `address_state` | character varying | NO |
| `address_zip_code` | character varying | YES |
| `address_country` | character varying | YES |
| `latitude` | numeric | YES |
| `longitude` | numeric | YES |
| `bedrooms` | integer | YES |
| `bathrooms` | integer | YES |
| `max_guests` | integer | NO |
| `area_sqm` | numeric | YES |
| `base_price` | numeric | NO |
| `cleaning_fee` | numeric | YES |
| `amenities` | jsonb | YES |
| `images` | jsonb | YES |
| `min_stay` | integer | YES |
| `check_in_time` | character varying | YES |
| `check_out_time` | character varying | YES |
| `cancellation_policy` | text | YES |
| `status` | text | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>property_availability</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `property_id` | uuid | YES |
| `date` | date | NO |
| `available` | boolean | YES |
| `price` | numeric | YES |
| `min_stay` | integer | YES |
| `block_reason` | text | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>property_shares</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `property_id` | uuid | YES |
| `owner_id` | uuid | YES |
| `share_percentage` | numeric | NO |
| `weeks_per_year` | integer | NO |
| `start_date` | date | NO |
| `end_date` | date | YES |
| `price` | numeric | NO |
| `status` | text | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>share_calendar</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | integer | NO |
| `share_id` | integer | NO |
| `week_number` | integer | NO |
| `year` | integer | NO |
| `available` | boolean | YES |
| `reserved_by` | integer | YES |
| `reserved_at` | timestamp with time zone | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>travel_packages</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | integer | NO |
| `name` | character varying | NO |
| `slug` | character varying | YES |
| `description` | text | YES |
| `short_description` | text | YES |
| `destination` | character varying | NO |
| `category` | character varying | YES |
| `duration_days` | integer | NO |
| `duration_nights` | integer | YES |
| `base_price` | numeric | NO |
| `adult_price` | numeric | YES |
| `child_price` | numeric | YES |
| `infant_price` | numeric | YES |
| `currency` | character varying | YES |
| `min_people` | integer | YES |
| `max_people` | integer | YES |
| `min_age` | integer | YES |
| `max_age` | integer | YES |
| `difficulty_level` | text | YES |
| `status` | text | YES |
| `is_featured` | boolean | YES |
| `is_weekend_special` | boolean | YES |
| `is_holiday_special` | boolean | YES |
| `included_services` | text | YES |
| `excluded_services` | text | YES |
| `itinerary` | text | YES |
| `requirements` | text | YES |
| `recommendations` | text | YES |
| `hotel_name` | character varying | YES |
| `hotel_stars` | integer | YES |
| `hotel_address` | character varying | YES |
| `hotel_amenities` | text | YES |
| `departure_location` | character varying | YES |
| `departure_time` | character varying | YES |
| `return_time` | character varying | YES |
| `transportation_included` | boolean | YES |
| `transportation_type` | character varying | YES |
| `meals_included` | boolean | YES |
| `meal_plan` | text | YES |
| `tour_guide_included` | boolean | YES |
| `guide_language` | character varying | YES |
| `cancellation_policy` | text | YES |
| `advance_booking_days` | integer | YES |
| `seasonal_pricing` | text | YES |
| `availability_calendar` | text | YES |
| `total_bookings` | integer | YES |
| `average_rating` | numeric | YES |
| `total_reviews` | integer | YES |
| `gallery_images` | text | YES |
| `gallery_videos` | text | YES |
| `tags` | text | YES |
| `seo_title` | text | YES |
| `seo_description` | text | YES |
| `seo_keywords` | text | YES |
| `created_by` | uuid | YES |
| `created_at` | timestamp with time zone | YES |
| `updated_at` | timestamp with time zone | YES |

</details>


<details>
<summary><strong>user_fcm_tokens</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `user_id` | uuid | YES |
| `token` | character varying | NO |
| `device_type` | text | YES |
| `device_id` | character varying | YES |
| `active` | boolean | YES |
| `last_used_at` | timestamp with time zone | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>users</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `email` | character varying | NO |
| `password_hash` | character varying | NO |
| `name` | character varying | NO |
| `phone` | character varying | YES |
| `avatar_url` | character varying | YES |
| `role` | text | YES |
| `status` | text | YES |
| `department` | character varying | YES |
| `position` | character varying | YES |
| `birth_date` | date | YES |
| `bio` | text | YES |
| `preferences` | json | YES |
| `permissions` | json | YES |
| `timezone` | character varying | YES |
| `language` | character varying | YES |
| `email_verified` | boolean | YES |
| `email_verification_token` | character varying | YES |
| `email_verified_at` | timestamp with time zone | YES |
| `password_reset_token` | character varying | YES |
| `password_reset_expires` | timestamp with time zone | YES |
| `last_login` | timestamp with time zone | YES |
| `last_login_ip` | character varying | YES |
| `login_attempts` | integer | YES |
| `locked_until` | timestamp with time zone | YES |
| `two_factor_enabled` | boolean | YES |
| `two_factor_secret` | character varying | YES |
| `recovery_codes` | json | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |

</details>


<details>
<summary><strong>website_content</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `page_type` | character varying | NO |
| `content_id` | character varying | NO |
| `title` | character varying | NO |
| `description` | text | YES |
| `images` | jsonb | YES |
| `metadata` | jsonb | YES |
| `seo_data` | jsonb | YES |
| `status` | text | YES |
| `order_index` | integer | YES |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | uuid | YES |
| `updated_by` | uuid | YES |

</details>


<details>
<summary><strong>website_content_history</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `content_id` | uuid | NO |
| `action` | text | NO |
| `old_data` | jsonb | YES |
| `new_data` | jsonb | YES |
| `change_summary` | text | YES |
| `created_at` | timestamp with time zone | YES |
| `created_by` | uuid | YES |

</details>


<details>
<summary><strong>website_settings</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|| `id` | uuid | NO |
| `setting_key` | character varying | NO |
| `setting_value` | jsonb | NO |
| `description` | text | YES |
| `updated_at` | timestamp with time zone | YES |
| `updated_by` | uuid | YES |

</details>


---

## 🔗 MAPEAMENTO COM SISTEMAS

### 🌐 RSV 360° - Sistema de Reservas
**URL:** http://localhost:3000  
**Descrição:** Sistema principal de reservas e gestão

#### Rotas Principais:
- / - Página inicial
- /admin/login - Login administrativo
- /admin/crm - CRM (Customer Relationship Management)
- /admin/cms - CMS (Content Management System)
- /admin/dashboard-estatisticas - Dashboard de estatísticas
- /minhas-reservas - Área do cliente

#### Tabelas Relacionadas:
- `users` - Usuários do sistema
- `customers` - Clientes do sistema
- `customers_rsv360` - Clientes específicos do RSV360
- `bookings` - Reservas gerais
- `bookings_rsv360` - Reservas específicas do RSV360
- `payments` - Pagamentos gerais
- `payments_rsv360` - Pagamentos específicos do RSV360
- `properties` - Propriedades/imóveis
- `property_availability` - Disponibilidade de propriedades
- `owners` - Proprietários
- `notifications` - Notificações do sistema
- `audit_logs` - Logs de auditoria
- `website_content` - Conteúdo do CMS
- `website_settings` - Configurações do site
- `user_fcm_tokens` - Tokens para notificações push

---

### 🏖️ Reservei Viagens - Sistema de Turismo
**URL:** http://localhost:3005  
**Descrição:** Dashboard de turismo e gestão de viagens

#### Rotas Principais:
- /dashboard - Dashboard principal
- /dashboard/turismo - Gestão de turismo
- /dashboard/pacotes - Gestão de pacotes

#### Tabelas Relacionadas:
- `travel_packages` - Pacotes de viagem/turismo
- `customers` - Clientes que compram pacotes
- `bookings` - Reservas de pacotes
- `payments` - Pagamentos de pacotes
- `notifications` - Notificações sobre pacotes

---

## 📊 CATEGORIAS DE TABELAS

### 👥 Usuários e Autenticação- `user_fcm_tokens`
- `users`

### 💰 Reservas e Pagamentos- `bookings`
- `bookings_rsv360`
- `payments`
- `payments_rsv360`

### 🏨 Propriedades e Hospedagem
- `properties` - Propriedades/imóveis disponíveis para reserva
- `property_availability` - Disponibilidade de propriedades por data
- `property_shares` - Compartilhamento de propriedades (timeshare)
- `share_calendar` - Calendário de compartilhamento
- `owners` - Proprietários das propriedades

### ✈️ Voos e Transporte*Nenhuma tabela encontrada.*

### 🎯 Turismo e Atrações- `travel_packages`

### 📝 CMS e Conteúdo
- `files` - Arquivos e mídia do sistema
- `website_content` - Conteúdo do site público
- `website_content_history` - Histórico de alterações do conteúdo
- `website_settings` - Configurações do site

### 📊 Analytics e Estatísticas- `audit_logs`

---

## 📝 NOTAS

- Este relatório foi gerado automaticamente pelo script `ANALISAR-TABELAS-DOCKER.ps1`
- Para atualizar, execute o script novamente
- Tabelas são mapeadas por padrões de nomenclatura; validação manual pode ser necessária
- Container Docker: `postgres-rsv360`

---

**Última Atualização:** 12/01/2026 20:33:16
